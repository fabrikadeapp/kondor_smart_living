"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireGlobalContext } from "@/core/tenant/tenant-context"

/**
 * Cria ou atualiza um Plano de Venda.
 * Acesso exclusivo SuperAdmin.
 */
export async function upsertPlanAction(data: {
    id?: string;
    name: string;
    basePrice: number;
    billingCycle: string;
    featureIds: string[];
}) {
    await requireGlobalContext()

    if (data.id) {
        // Update
        const plan = await (prisma as any).plan.update({
            where: { id: data.id },
            data: {
                name: data.name,
                basePrice: data.basePrice,
                billingCycle: data.billingCycle,
                planFeatures: {
                    deleteMany: {}, // Simplificado: remove todos e recria
                    create: data.featureIds.map(fid => ({ featureId: fid }))
                }
            }
        })
        revalidatePath("/master/plans")
        return plan
    } else {
        // Create
        const plan = await (prisma as any).plan.create({
            data: {
                name: data.name,
                basePrice: data.basePrice,
                billingCycle: data.billingCycle,
                planFeatures: {
                    create: data.featureIds.map(fid => ({ featureId: fid }))
                }
            }
        })
        revalidatePath("/master/plans")
        return plan
    }
}

/**
 * Busca todos os planos e features disponíveis.
 */
export async function getCondoLabData() {
    await requireGlobalContext()

    const [plans, features] = await Promise.all([
        (prisma as any).plan.findMany({
            include: { planFeatures: { include: { feature: true } } },
            orderBy: { displayOrder: "asc" }
        }),
        (prisma as any).feature.findMany({
            orderBy: { name: "asc" }
        })
    ])

    return { plans, features }
}
