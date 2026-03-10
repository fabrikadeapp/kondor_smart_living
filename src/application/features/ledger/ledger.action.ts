"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Cria um lançamento no Ledger (Livro Caixa) Imutável.
 * NUNCA permite Edição ou Deleção.
 */
export async function createLedgerEntryAction(formData: FormData) {
    const { contractId, user } = await requireTenantContext()

    const type = formData.get("type") as string // CREDIT, DEBIT
    const amount = parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const correlationId = formData.get("correlationId") as string || `MANUAL-${Date.now()}`

    if (isNaN(amount) || !description) {
        throw new Error("Valor e descrição são obrigatórios.")
    }

    // Se for DEBIT, forçamos o valor ser negativo para consistência do Ledger
    const finalAmount = type === "DEBIT" ? -Math.abs(amount) : Math.abs(amount)

    const entry = await prisma.ledgerEntry.create({
        data: {
            contractId,
            amount: finalAmount,
            description,
            type,
            correlationId,
        }
    })

    revalidatePath("/admin/transactions")
    return entry
}

/**
 * Geração de Boletos Mestre (Bulk Billing Engine).
 * Usa Idempotency Key para evitar cobranças duplicadas.
 */
export async function generateBulkMonthlyBillingAction() {
    const { contractId } = await requireTenantContext()

    // 1. Identifica Unidades Ativas
    const activeUnits = await prisma.unit.findMany({
        where: { contractId, status: "ACTIVE" }
    })

    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()

    const results = { created: 0, skipped: 0, errors: 0 }

    // 2. Transação por Unidade (Pode ser otimizado para CreateMany, mas mantemos isolado para auditoria individual)
    for (const unit of activeUnits) {
        const idempotencyKey = `${month}${year}-${contractId}-${unit.id}`

        try {
            // Verifica se já existe cobrança para este período (Idempotência Hard)
            const existing = await prisma.payment.findUnique({
                where: { idempotencyKey }
            })

            if (existing) {
                results.skipped++
                continue
            }

            // Mock de valor fixo p/ MVP (Futuro: Ler de Planos/Quota do Condomínio)
            const amount = 350.00

            await prisma.$transaction(async (tx) => {
                // Criar o pagamento (Mock Asaas na V1)
                const payment = await tx.payment.create({
                    data: {
                        amount,
                        status: "PENDING",
                        idempotencyKey,
                        dueDate: new Date(year, now.getMonth() + 1, 10), // Vence dia 10 do Prox Mês
                    }
                })

                // Lançar no Ledger como "Expectativa de Receita / Cobrança"
                await tx.ledgerEntry.create({
                    data: {
                        contractId,
                        paymentId: payment.id,
                        amount,
                        description: `Mensalidade Ref ${month}/${year} - Unit ${unit.number}`,
                        type: "CHARGE",
                        correlationId: idempotencyKey
                    }
                })
            })

            results.created++
        } catch (e) {
            console.error(`Erro processando Unit ${unit.id}:`, e)
            results.errors++
        }
    }

    revalidatePath("/admin/transactions")
    return results
}
