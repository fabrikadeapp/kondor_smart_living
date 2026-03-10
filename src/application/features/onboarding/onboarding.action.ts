"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/core/auth/authOptions"

/**
 * Server Action para o Wizard de Onboarding (Epic 2).
 * Cria o Condomínio (Contract) e gera automaticamente as UNIDADES.
 */
export async function setupCondoAction(data: {
    tradeName: string;
    legalName: string;
    cnpj: string;
    cep: string;
    address: string;
    number: string;
    city: string;
    state: string;
    blocks: {
        name: string;
        floors: number;
        unitsPerFloor: number;
    }[];
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Não autorizado")

    const userId = session.user.id

    // 1. Criar o Contrato (Condomínio)
    const result = await prisma.$transaction(async (tx) => {
        const contract = await tx.contract.create({
            data: {
                tradeName: data.tradeName,
                legalName: data.legalName,
                cnpj: data.cnpj,
                status: "TRIAL",
            }
        })

        // 2. Criar a Membership do Usuário como ADMIN desse contrato
        await tx.membership.create({
            data: {
                userId,
                contractId: contract.id,
                role: "ADMIN",
                status: "ACTIVE"
            }
        })

        // 3. Macro-Geração de Peças (Units) baseada na estrutura do Wizard
        // Ex: Bloco A, 10 andares, 4 aptos por andar = 40 unidades
        const unitData = []
        for (const block of data.blocks) {
            for (let f = 1; f <= block.floors; f++) {
                for (let u = 1; u <= block.unitsPerFloor; u++) {
                    const unitNumber = `${f}${String(u).padStart(2, '0')}`
                    unitData.push({
                        contractId: contract.id,
                        block: block.name,
                        floor: String(f),
                        number: unitNumber,
                        status: "ACTIVE",
                        type: "APARTMENT"
                    })
                }
            }
        }

        // Bulk insert das unidades
        await tx.unit.createMany({
            data: unitData as any
        })

        return contract
    })

    revalidatePath("/admin/dashboard")
    return result
}
