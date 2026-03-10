"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Registra a avaliação de satisfação de um morador.
 */
export async function createSatisfactionSurveyAction(data: {
    occurrenceId: string;
    rating: number;
    comment?: string;
}) {
    const { contractId } = await requireTenantContext()

    // 1. Validar se o chamado existe e está RESOLVED
    const occurrence = await prisma.occurrence.findUnique({
        where: { id: data.occurrenceId, contractId }
    })

    if (!occurrence || (occurrence as any).status !== "RESOLVED") {
        throw new Error("Apenas chamados finalizados podem ser avaliados.")
    }

    // 2. Criar a pesquisa (Unique constraint em occurrenceId garante 1x por chamado)
    const survey = await prisma.satisfactionSurvey.create({
        data: {
            contractId,
            occurrenceId: data.occurrenceId,
            rating: data.rating,
            comment: data.comment
        }
    })

    revalidatePath("/resident/dashboard")
    revalidatePath("/admin/occurrences")

    return survey
}
