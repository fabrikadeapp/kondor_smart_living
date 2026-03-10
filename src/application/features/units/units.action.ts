"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

export async function createUnitAction(formData: FormData) {
    const { contractId } = await requireTenantContext()

    const block = formData.get("block") as string || null
    const number = formData.get("number") as string
    const type = formData.get("type") as any || "APARTMENT"

    if (!number) throw new Error("Número da unidade é obrigatório")

    const unit = await prisma.unit.create({
        data: {
            contractId,
            number,
            block,
            type
        }
    })

    revalidatePath("/admin/units")
    return unit
}

export async function linkResidentAction(formData: FormData) {
    const { contractId } = await requireTenantContext()

    const unitId = formData.get("unitId") as string
    const email = formData.get("email") as string
    const relationshipType = formData.get("relationshipType") as any || "OWNER"

    if (!email || !unitId) throw new Error("Campos incompletos")

    // Find or create user placeholder (simplified for first sprint)
    let resident = await prisma.user.findUnique({ where: { email } })
    if (!resident) {
        resident = await prisma.user.create({
            data: {
                email,
                name: "Convite Pendente",
                passwordHash: "not_set", // Require proper invite flow 
            }
        })
    }

    // Grant the membership automatically if they don't have one in this contract
    const membershipExists = await prisma.membership.findUnique({
        where: { userId_contractId: { userId: resident.id, contractId } }
    })

    if (!membershipExists) {
        await prisma.membership.create({
            data: { userId: resident.id, contractId, role: "RESIDENT" }
        })
    }

    // Bind to Unit
    const userUnit = await prisma.userUnit.create({
        data: {
            contractId,
            unitId,
            userId: resident.id,
            relationshipType
        }
    })

    revalidatePath("/admin/units")
    return userUnit
}
