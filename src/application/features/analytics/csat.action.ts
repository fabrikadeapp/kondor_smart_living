"use server"

import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext, requireFeature } from "@/core/tenant/tenant-context"

/**
 * Agregação de dados de Satisfação (CSAT).
 * Gated by: CSAT_ANALYTICS
 */
export async function getCSATAnalyticsAction() {
    const { contractId } = await requireTenantContext()

    // 0. Gating
    await requireFeature("CSAT_ANALYTICS")

    // 1. Média de Satisfação de Ocorrências
    const surveys = await (prisma as any).satisfactionSurvey.findMany({
        where: { contractId },
        include: { occurrence: true }
    })

    const total = surveys.length
    let totalRating = 0
    if (total > 0) {
        for (const s of (surveys as any[])) {
            totalRating += s.rating
        }
    }
    const avgRating = total > 0 ? totalRating / total : 0

    // 2. Agrupar por Categorias
    const categoryStats: Record<string, { total: number; sum: number }> = {}

    for (const s of (surveys as any[])) {
        const cat = s.occurrence.category || "GERAL"
        if (!categoryStats[cat]) categoryStats[cat] = { total: 0, sum: 0 }
        categoryStats[cat].total++
        categoryStats[cat].sum += s.rating
    }

    const formattedStats = Object.entries(categoryStats).map(([cat, stats]) => ({
        category: cat,
        avg: stats.sum / stats.total,
        count: stats.total
    })).sort((a, b) => b.avg - a.avg)

    return {
        totalEvaluations: total,
        averageGlobal: avgRating.toFixed(1),
        byCategory: formattedStats,
        lastSurveys: surveys.slice(0, 5) // Últimas 5
    }
}
