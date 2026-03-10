"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Cria uma nova Ocorrência (Ticket).
 */
export async function createOccurrenceAction(data: {
    unitId?: string;
    category: string;
    description: string;
    priority?: string;
}) {
    const { contractId, user } = await requireTenantContext()

    const occurrence = await (prisma as any).occurrence.create({
        data: {
            contractId,
            unitId: data.unitId,
            userId: user.id,
            category: data.category,
            description: data.description,
            priority: data.priority || "NORMAL",
            status: "OPEN"
        }
    })

    revalidatePath("/admin/occurrences")
    revalidatePath("/resident/occurrences")
    return occurrence
}

/**
 * Atualiza o status de uma ocorrência (Admin).
 */
export async function updateOccurrenceStatusAction(id: string, status: string) {
    const { contractId } = await requireTenantContext()

    await (prisma as any).occurrence.update({
        where: { id, contractId },
        data: { status }
    })

    revalidatePath("/admin/occurrences")
    revalidatePath("/resident/occurrences")
}

/**
 * Responde uma ocorrência (Adiciona nota interna ou do síndico).
 */
export async function respondOccurrenceAction(id: string, response: string) {
    const { contractId } = await requireTenantContext()

    // O modelo simplificado pode salvar a nota diretamente no model ou numa tabela de logs/comments
    // V1: Vamos apenas atualizar o status para UNDER_ANALYSIS se estiver aberto
    await (prisma as any).occurrence.update({
        where: { id, contractId },
        data: {
            status: "IN_PROGRESS",
            // Se houver um campo de comments/internalNote:
            // internalNote: response 
        }
    })

    revalidatePath("/admin/occurrences")
}
