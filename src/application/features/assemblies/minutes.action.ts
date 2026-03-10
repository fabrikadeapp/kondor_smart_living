"use server"

import { jsPDF } from "jspdf"
import "jspdf-autotable"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Gera a Ata da Assembleia em PDF (Server Side).
 * Em V1, devolvemos a Base64 ou guardamos um registro e o PDF seria gerado no client.
 * Como jsPDF em Node tem limitações de fontes, faremos uma estrutura que 
 * registra na tabela AssemblyMinute.
 */
export async function generateAssemblyMinuteAction(assemblyId: string) {
    const { contractId } = await requireTenantContext()

    // 1. Coletar dados da Assembleia
    const assembly = await prisma.assembly.findUnique({
        where: { id: assemblyId, contractId },
        include: {
            polls: {
                include: {
                    options: {
                        include: { votes: true }
                    }
                }
            },
            contract: true
        }
    })

    if (!assembly) throw new Error("Assembleia não encontrada.")

    // 2. Criar o registro da Ata
    const minute = await prisma.assemblyMinute.create({
        data: {
            assemblyId,
            contentUrl: `https://fake-storage.kondor.com/minutes/${assemblyId}.pdf` // Mock p/ V1
        }
    })

    return {
        id: minute.id,
        contentUrl: minute.contentUrl,
        summary: `Ata gerada para ${assembly.title}. ${assembly.polls.length} itens votados.`
    }
}
