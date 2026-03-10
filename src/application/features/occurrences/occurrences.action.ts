"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Criação de uma ocorrência (Resident ou Admin).
 */
export async function createOccurrenceAction(formData: FormData) {
    const { contractId, user } = await requireTenantContext()

    const unitId = formData.get("unitId") as string || null
    const description = formData.get("description") as string
    const category = formData.get("category") as string || "MANUTENÇÃO"
    const priority = formData.get("priority") as string || "MEDIUM"

    if (!description) throw new Error("Descrição é obrigatória.")

    const occurrence = await prisma.occurrence.create({
        data: {
            contractId,
            unitId,
            description,
            category,
            priority,
            status: "OPEN",
        }
    })

    revalidatePath("/admin/occurrences")
    revalidatePath("/resident/dashboard")
    return occurrence
}

import { sendNotificationAction } from "@/application/features/notifications/notifications.action"

/**
 * Atualiza o status de uma ocorrência (Admin).
 */
export async function updateOccurrenceStatusAction(occurrenceId: string, status: any) {
    const { contractId } = await requireTenantContext()

    // 1. Atualizar o Registro
    const occurrence = await prisma.occurrence.update({
        where: { id: occurrenceId, contractId },
        data: { status },
        include: { unit: { include: { userUnits: true } } }
    })

    // 2. Trigger CSAT Automático
    if (status === "RESOLVED") {
        const targetUserId = occurrence.unit?.userUnits[0]?.userId
        if (targetUserId) {
            await sendNotificationAction({
                userId: targetUserId,
                unitId: occurrence.unitId || undefined,
                title: "Chamado Finalizado ✅",
                content: `Sua ocorrência #${occurrence.id.slice(0, 5)} foi resolvida. O que achou do atendimento?`,
                type: "IN_APP"
            })
            // Nota: Em V2 poderíamos incluir o link direto: /resident/occurrences/${occurrence.id}/survey
        }
    }

    revalidatePath("/admin/occurrences")
    revalidatePath("/resident/dashboard")
    return occurrence
}

