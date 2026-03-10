"use server"

import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

export async function seedGovernanceDemoAction() {
    const { contractId } = await requireTenantContext()

    // 1. Criar Assembleia
    const assembly = await prisma.assembly.create({
        data: {
            contractId,
            title: "Reunião Ordinária - Condomínio Smart Living",
            description: "Pauta: Eleição de síndico, Aprovação de contas e Reforma da fachada principal.",
            scheduledFor: new Date(),
            status: "OPEN",
            openedAt: new Date(),
            polls: {
                create: [
                    {
                        question: "Aprovação das Contas do Exercício de 2025?",
                        status: "OPEN",
                        options: {
                            create: [
                                { text: "Sim - Aprovar" },
                                { text: "Não - Rejeitar" },
                                { text: "Abster-se" }
                            ]
                        }
                    },
                    {
                        question: "Qual empresa contratar para a reforma da fachada?",
                        status: "OPEN",
                        options: {
                            create: [
                                { text: "Empresa A (Menor Preço)" },
                                { text: "Empresa B (Melhor Garantia)" },
                                { text: "Adiar Reforma" }
                            ]
                        }
                    }
                ]
            }
        }
    })

    return assembly
}
