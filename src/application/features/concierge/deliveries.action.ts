"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Registrar nova encomenda na Portaria (Concierge).
 */
export async function registerDeliveryAction(data: {
    unitId: string;
    trackingCode?: string;
    description: string;
}) {
    const { contractId } = await requireTenantContext()

    const delivery = await prisma.delivery.create({
        data: {
            contractId,
            unitId: data.unitId,
            trackingCode: data.trackingCode,
            description: data.description,
            status: "PENDING"
        }
    })

    // TODO: Em V2, notificar via Push/Wpp aqui.

    revalidatePath("/admin/deliveries")
    revalidatePath("/resident/dashboard")
    return delivery
}

/**
 * Dar baixa em uma entrega (Morador retirou).
 */
export async function retrieveDeliveryAction(deliveryId: string) {
    const { contractId } = await requireTenantContext()

    const delivery = await prisma.delivery.update({
        where: { id: deliveryId, contractId },
        data: { status: "RETRIEVED" }
    })

    revalidatePath("/admin/deliveries")
    revalidatePath("/resident/dashboard")
    return delivery
}

/**
 * Buscar entregas pendentes para o Dashboard do Administrador.
 */
export async function getPendingDeliveries() {
    const { contractId } = await requireTenantContext()
    return prisma.delivery.findMany({
        where: { contractId, status: { in: ["PENDING", "NOTIFIED"] } },
        include: { unit: true },
        orderBy: { createdAt: "desc" }
    })
}
