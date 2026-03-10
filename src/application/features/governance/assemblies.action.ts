"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Cria uma nova Assembleia.
 */
export async function createAssemblyAction(data: {
    title: string;
    description?: string;
    scheduledFor: Date;
}) {
    const { contractId } = await requireTenantContext()

    const assembly = await prisma.assembly.create({
        data: {
            contractId,
            title: data.title,
            description: data.description,
            scheduledFor: data.scheduledFor,
            status: "DRAFT"
        }
    })

    revalidatePath("/admin/assemblies")
    return assembly
}

/**
 * Adiciona uma Votação (Poll) a uma Assembleia.
 */
export async function addPollToAssemblyAction(assemblyId: string, question: string, options: string[]) {
    const assembly = await prisma.assembly.findUnique({ where: { id: assemblyId } })
    if (!assembly) throw new Error("Assembly not found")

    const poll = await prisma.assemblyPoll.create({
        data: {
            assemblyId,
            question,
            status: "DRAFT",
            options: {
                create: options.map(text => ({ text }))
            }
        }
    })

    revalidatePath(`/admin/assemblies`)
    return poll
}

/**
 * Abre uma Assembleia para votação.
 */
export async function openAssemblyAction(id: string) {
    const { contractId } = await requireTenantContext()
    await prisma.assembly.update({
        where: { id, contractId },
        data: { status: "OPEN", openedAt: new Date() }
    })
    revalidatePath("/admin/assemblies")
    revalidatePath("/resident/assemblies")
}

/**
 * Registra um voto de uma unidade.
 */
export async function castVoteAction(pollId: string, optionId: string, unitId: string) {
    const { contractId } = await requireTenantContext()

    // Verificar se já votou (One vote per unit per poll)
    const existingVote = await prisma.assemblyVote.findUnique({
        where: {
            pollId_unitId: { pollId, unitId }
        }
    })

    if (existingVote) {
        throw new Error("Sua unidade já registrou um voto para esta pauta.")
    }

    await prisma.assemblyVote.create({
        data: {
            pollId,
            optionId,
            unitId
        }
    })

    revalidatePath("/resident/assemblies")
}
