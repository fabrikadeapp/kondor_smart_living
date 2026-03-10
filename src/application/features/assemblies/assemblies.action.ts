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

/**
 * Registra o voto do morador (Unidade) em um item de pauta.
 * Invariante: 1 voto por Unit por Poll.
 */
export async function castVoteAction(pollId: string, optionId: string, unitId: string) {
    const { contractId } = await requireTenantContext()

    // 1. Validar se a poll pertence a este contrato via Assembly
    const poll = await prisma.assemblyPoll.findUnique({
        where: { id: pollId },
        include: { assembly: true }
    })

    if (!poll || poll.assembly.contractId !== contractId) {
        throw new Error("Pauta não encontrada ou acesso negado.")
    }

    if (poll.status !== "OPEN" && poll.assembly.status !== "OPEN") {
        throw new Error("Votação fechada ou não iniciada.")
    }

    // 2. Criar o voto (o constraint 'pollId_unitId' no DB garante a unicidade)
    const vote = await prisma.assemblyVote.create({
        data: {
            pollId,
            optionId,
            unitId,
        }
    })

    revalidatePath(`/resident/assemblies/${poll.assemblyId}`)
    return vote
}
