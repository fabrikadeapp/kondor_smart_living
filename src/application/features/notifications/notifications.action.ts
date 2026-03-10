"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Envio de notificação para o morador (Centralizador).
 * Em V1, logamos na tabela Notification e simulamos um disparo de WhatsApp.
 */
export async function sendNotificationAction(data: {
    unitId?: string;
    userId?: string;
    title: string;
    content: string;
    type: "WHATSAPP" | "PUSH" | "IN_APP";
}) {
    const { contractId } = await requireTenantContext()

    const notification = await prisma.notification.create({
        data: {
            contractId,
            unitId: data.unitId,
            userId: data.userId,
            title: data.title,
            content: data.content,
            type: data.type,
            status: "SENT"
        }
    })

    // Simular integração externa (Z-API, Firebase, etc)
    console.log(`[SIMULAÇÃO NOTIFICAÇÃO] ${data.type} enviada para user/unit ${data.unitId || data.userId}: ${data.content}`)

    revalidatePath("/resident/dashboard")
    return notification
}

/**
 * Buscar histórico de notificações do morador.
 */
export async function getResidentNotifications(userId: string) {
    const { contractId } = await requireTenantContext()
    return prisma.notification.findMany({
        where: {
            contractId,
            userId,
            status: "SENT"
        },
        orderBy: { createdAt: "desc" },
        take: 10
    })
}
