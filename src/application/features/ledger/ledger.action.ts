"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Cria um lançamento manual no Ledger.
 */
export async function createLedgerEntryAction(data: {
    description: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
}) {
    const { contractId } = await requireTenantContext()

    const entry = await (prisma as any).ledgerEntry.create({
        data: {
            contractId,
            description: data.description,
            amount: data.type === "DEBIT" ? Math.abs(data.amount) * -1 : Math.abs(data.amount),
            type: data.type,
            correlationId: `MANUAL-${Date.now()}`
        }
    })

    revalidatePath("/admin/transactions")
    return entry
}

/**
 * Geração Massiva de Cobranças (Quotas) com Idempotência.
 */
export async function generateMonthlyBillsAction(monthYear: string) {
    const { contractId } = await requireTenantContext()

    // 1. Buscar todas as Unidades do Condomínio
    const units = await (prisma as any).unit.findMany({
        where: { contractId }
    })

    const results = { created: 0, skipped: 0 }

    for (const unit of units) {
        // Idempotency Key: Mês/Ano + Contrato + Unidade
        const idempotencyKey = `${monthYear}-${contractId}-${unit.id}`

        try {
            // No modelo simplificado V1, criamos um Payment PENDING
            await (prisma as any).payment.create({
                data: {
                    subscriptionId: null, // Pagamento de Quota, não do SaaS Kondor
                    amount: 250.00, // Preço Fixo MVP ou base do contrato
                    status: "PENDING",
                    idempotencyKey,
                    dueDate: new Date(), // Simulação
                }
            })

            // Registramos no Ledger como uma Receita Futura (opcional, ou só no ato do pagamento)
            // Aqui registramos para mostrar no Dashboard como "A Receber"
            await (prisma as any).ledgerEntry.create({
                data: {
                    contractId,
                    description: `Quota Condominial - Ref: ${monthYear} - Unidade ${unit.number}`,
                    amount: 250.00,
                    type: "CREDIT",
                    correlationId: idempotencyKey
                }
            })
            results.created++
        } catch (error) {
            // Se falhar (ex: unique constraint na idempotencyKey), ignoramos (já gerado)
            results.skipped++
        }
    }

    revalidatePath("/admin/transactions")
    return results
}
