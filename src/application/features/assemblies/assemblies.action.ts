"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Criação de uma Assembleia (Admin).
 */
export async function createAssemblyAction(formData: FormData) {
    const { contractId } = await requireTenantContext()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const scheduledFor = formData.get("scheduledFor") as string

    if (!title) throw new Error("Título é obrigatório.")

    const assembly = await prisma.assembly.create({
        data: {
            contractId,
            title,
            description,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
            status: "DRAFT",
        }
    })

    revalidatePath("/admin/assemblies")
    return assembly
}

/**
 * Adiciona um item de pauta (Poll) à Assembleia.
 */
export async function addPollToAssemblyAction(assemblyId: string, question: string, options: string[]) {
    const { contractId } = await requireTenantContext()

    // Garante que a assembleia pertence ao contrato
    const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId, contractId }
    })

    if (!assembly) throw new Error("Assembleia não encontrada.")

    const poll = await prisma.assemblyPoll.create({
        data: {
            assemblyId,
            question,
            status: "DRAFT",
            options: {
                create: options.map(opt => ({ text: opt }))
            }
        }
    })

    revalidatePath(`/admin/assemblies/${assemblyId}`)
    return poll
}

/**
 * Abre a votação de um item ou da assembleia inteira.
 */
export async function updateAssemblyStatusAction(assemblyId: string, status: any) {
    const { contractId } = await requireTenantContext()

    const assembly = await prisma.assembly.update({
        where: { id: assemblyId, contractId },
        data: { status }
    })

    revalidatePath("/admin/assemblies")
    revalidatePath("/resident/assemblies")
    return assembly
}
