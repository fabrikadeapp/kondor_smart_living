"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Busca info da assinatura atual do condomínio e planos disponíveis.
 */
export async function getSubscriptionDataAction() {
    const { contractId } = await requireTenantContext()

    const [currentContract, allPlans] = await Promise.all([
        (prisma as any).contract.findUnique({
            where: { id: contractId },
            include: { plan: { include: { planFeatures: { include: { feature: true } } } } }
        }),
        (prisma as any).plan.findMany({
            include: { planFeatures: { include: { feature: true } } },
            orderBy: { displayOrder: "asc" }
        })
    ])

    return {
        currentPlan: currentContract?.plan,
        allPlans
    }
}

/**
 * Realiza o upgrade/troca de plano do condomínio.
 */
export async function upgradePlanAction(planId: string) {
    const { contractId } = await requireTenantContext()

    await (prisma as any).contract.update({
        where: { id: contractId },
        data: { planId }
    })

    revalidatePath("/admin/billing/upgrade")
    revalidatePath("/admin/dashboard")
}
