"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Busca todos os parceiros e serviços disponíveis para o Morador.
 */
export async function getMarketplaceServices() {
    const { contractId } = await requireTenantContext()
    return prisma.partner.findMany({
        where: { contractId, status: "ACTIVE" },
        include: { services: true }
    })
}

/**
 * Cria um pedido no Marketplace.
 */
export async function createMarketplaceOrderAction(data: {
    serviceId: string;
    unitId: string;
    totalAmount: number;
    commissionValue: number;
}) {
    const { contractId } = await requireTenantContext()

    const order = await prisma.marketplaceOrder.create({
        data: {
            contractId,
            unitId: data.unitId,
            serviceId: data.serviceId,
            status: "PENDING",
            totalAmount: data.totalAmount,
            commissionValue: data.commissionValue
        }
    })

    revalidatePath("/resident/marketplace")
    return order
}

/**
 * Seed básico de parceiros para o demo.
 */
export async function seedMarketplaceDemoAction() {
    const { contractId } = await requireTenantContext()

    const partner = await prisma.partner.create({
        data: {
            contractId,
            name: "Limp & Clean Serviços",
            cnpj: "12.345.678/0001-90",
            category: "LIMPEZA",
            commissionRate: 10.00,
            status: "ACTIVE",
            services: {
                create: [
                    { name: "Limpeza Express (2h)", description: "Serviço rápido de faxina.", price: 80.00 },
                    { name: "Faxina Completa", description: "Faxina pesada com produtos inclusos.", price: 250.00 }
                ]
            }
        }
    })

    return partner
}
