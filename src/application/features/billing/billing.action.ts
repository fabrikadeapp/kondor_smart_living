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
 * Realiza o upgrade/troca de plano do condomínio com Checkout Simulado.
 */
export async function upgradePlanAction(planId: string) {
    const { contractId } = await requireTenantContext()

    // 1. Buscar detalhes do novo plano para o recibo/ledger
    const targetPlan = await (prisma as any).plan.findUnique({
        where: { id: planId }
    })

    if (!targetPlan) throw new Error("Plano não encontrado.")

    // 2. Atualizar o plano do contrato
    await (prisma as any).contract.update({
        where: { id: contractId },
        data: { planId: planId }
    })

    // 3. Gerar Ledger Entry Simulado (Checkout de Inscrição)
    // Usamos o ledger do condomínio para registrar o custo do SaaS como saída
    await (prisma as any).ledgerEntry.create({
        data: {
            contractId,
            amount: Number(targetPlan.basePrice),
            description: `Assinatura SaaS: Upgrade para o Plano ${targetPlan.name}`,
            type: "DEBIT", // É uma despesa para o condomínio
            correlationId: `UPGRADE-${Date.now()}`
        }
    })

    revalidatePath("/admin/billing/upgrade")
    revalidatePath("/admin/dashboard")
}

