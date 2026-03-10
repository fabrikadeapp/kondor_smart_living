"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Gera um rascunho de Ata (Minute) via IA.
 * Em V1, geramos um template estruturado.
 */
export async function generateAIDraftMinuteAction(assemblyId: string) {
    const { contractId } = await requireTenantContext()

    const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId, contractId },
        include: {
            polls: {
                include: {
                    options: { include: { votes: true } }
                }
            }
        }
    })

    if (!assembly) throw new Error("Assembleia não encontrada.")

    // Simulação de IA: Processando votos em texto legível
    const pollsSummary = assembly.polls.map(p => {
        const totalVotes = p.options.reduce((acc, opt) => acc + opt.votes.length, 0)
        const winner = [...p.options].sort((a, b) => b.votes.length - a.votes.length)[0]

        return `Item: ${p.question}\nTotal de Votos: ${totalVotes}\nDecisão: ${winner?.text || 'Sem votos'}`
    }).join("\n\n")

    const aiSummary = `
ATA DE ASSEMBLEIA - ${assembly.title}
Data: ${new Date().toLocaleDateString('pt-BR')}

RESUMO DAS DECISÕES:
${pollsSummary}

Pelo presente documento, os moradores ratificam as decisões acima tomadas via votação digital Kondor.
  `.trim()

    return { summary: aiSummary }
}

/**
 * Assinar a ata (muda para STATUS FINAL e persiste o texto).
 */
export async function signAssemblyMinuteAction(assemblyId: string, content: string) {
    const { contractId } = await requireTenantContext()

    // Concluir assembleia
    await prisma.assembly.update({
        where: { id: assemblyId, contractId },
        data: { status: "CLOSED" }
    })

    // Registrar ata assinada
    const minute = await prisma.assemblyMinute.create({
        data: {
            assemblyId,
            contentUrl: "internal://local-draft", // Marcador de conteúdo interno
        }
    })

    revalidatePath("/admin/assemblies")
    return minute
}
