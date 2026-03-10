"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext, requireFeature } from "@/core/tenant/tenant-context"

/**
 * Registro de Ponto (Clock In/Out).
 * Gated by: STAFF_TIME_CLOCK
 */
export async function clockEntryAction(employeeId: string, location?: string) {
    const { contractId } = await requireTenantContext()

    // 0. Gating
    await requireFeature("STAFF_TIME_CLOCK")

    // 1. Verificar se funcionário existe e está ativo no contrato
    const employee = await (prisma as any).employee.findUnique({
        where: { id: employeeId, contractId, status: "ACTIVE" }
    })
    if (!employee) throw new Error("Funcionário não encontrado ou inativo.")

    // 2. Tentar fechar último registro aberto (Clock Out)
    const openEntry = await (prisma as any).timeSheetEntry.findFirst({
        where: { employeeId, contractId, clockOut: null }
    })

    if (openEntry) {
        // Clock Out
        await (prisma as any).timeSheetEntry.update({
            where: { id: openEntry.id },
            data: { clockOut: new Date() }
        })
        revalidatePath("/admin/staff")
        return { type: "CLOCK_OUT", entry: openEntry }
    } else {
        // Clock In
        const entry = await (prisma as any).timeSheetEntry.create({
            data: {
                employeeId,
                contractId,
                clockIn: new Date(),
                location
            }
        })
        revalidatePath("/admin/staff")
        return { type: "CLOCK_IN", entry }
    }
}

/**
 * Busca histórico de ponto do funcionário.
 */
export async function getEmployeeTimeSheet(employeeId: string) {
    const { contractId } = await requireTenantContext()
    return (prisma as any).timeSheetEntry.findMany({
        where: { employeeId, contractId },
        orderBy: { clockIn: "desc" },
        take: 30
    })
}
