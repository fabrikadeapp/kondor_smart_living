"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Criação da Ordem de Serviço (Marketplace)
 * Quando o morador contrata, o Ledger do Condomínio recebe a comissão.
 */
export async function purchaseServiceAction(data: {
    serviceId: string;
    unitId: string;
}) {
    const { contractId } = await requireTenantContext()

    // 1. Buscar detalhes do serviço e parceiro
    const service = await prisma.partnerService.findUnique({
        where: { id: data.serviceId },
        include: { partner: true }
    })

    if (!service) throw new Error("Serviço não encontrado.")

    // 2. Calcular comissão (Ex: 10% de 500,00 = 50,00)
    const totalAmount = service.price
    const commissionRate = service.partner.commissionRate
    const commissionValue = totalAmount.times(commissionRate).div(100)

    // 3. Executar Transação no Banco
    const order = await prisma.$transaction(async (tx) => {
        // a. Criar a Ordem no Marketplace
        const orderRecord = await tx.marketplaceOrder.create({
            data: {
                contractId,
                unitId: data.unitId,
                serviceId: data.serviceId,
                totalAmount,
                commissionValue,
                status: "COMPLETED"
            }
        })

        // b. Injetar comissão no Ledger do Condomínio (Receita do Prédio)
        await tx.ledgerEntry.create({
            data: {
                contractId,
                amount: commissionValue,
                description: `Comissão Marketplace: ${service.name} (${service.partner.name})`,
                type: "CREDIT",
                correlationId: `MKP-${orderRecord.id}`
            }
        })

        return orderRecord
    })

    revalidatePath("/admin/transactions")
    revalidatePath("/resident/dashboard")
    return order
}

/**
 * Cadastrar um novo Parceiro (Admin).
 */
export async function createPartnerAction(data: {
    name: string;
    category: string;
    commissionRate: number;
}) {
    const { contractId } = await requireTenantContext()

    const partner = await prisma.partner.create({
        data: {
            contractId,
            name: data.name,
            category: data.category,
            commissionRate: data.commissionRate,
            status: "ACTIVE"
        }
    })

    revalidatePath("/admin/partners")
    return partner
}
