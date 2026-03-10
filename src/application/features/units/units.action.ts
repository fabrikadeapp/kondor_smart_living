"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Cria uma nova Unidade (UH) no condomínio.
 */
export async function createUnitAction(data: {
    block: string;
    number: string;
    type?: string;
    floor?: number;
}) {
    const { contractId } = await requireTenantContext()

    const unit = await (prisma as any).unit.create({
        data: {
            contractId,
            block: data.block,
            number: data.number,
            type: data.type || "APARTMENT",
            floor: data.floor || 0,
        }
    })

    revalidatePath("/admin/units")
    return unit
}

/**
 * Vincula um Morador a uma Unidade.
 */
export async function linkResidentAction(data: {
    unitId: string;
    email: string;
    relationshipType: string;
}) {
    const { contractId } = await requireTenantContext()

    // 1. Buscar ou Criar Usuário pelo Email
    let user = await prisma.user.findUnique({
        where: { email: data.email }
    })

    if (!user) {
        // Mock de senha para novos moradores convidados
        user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.email.split('@')[0],
                passwordHash: "CONVITE_PENDENTE",
            }
        })
    }

    // 2. Criar o Vínculo UserUnit
    const membership = await (prisma as any).userUnit.create({
        data: {
            userId: user.id,
            unitId: data.unitId,
            contractId,
            relationshipType: data.relationshipType,
            status: "ACTIVE"
        }
    })

    // 3. Criar log de auditoria (ledger não-financeiro ou simples registro)
    // Por enquanto apenas revalidamos
    revalidatePath("/admin/units")
    return membership
}
