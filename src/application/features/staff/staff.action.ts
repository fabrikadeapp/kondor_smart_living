"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Criação de novo funcionário (Staff).
 */
export async function createEmployeeAction(data: {
    name: string;
    role: string;
    isInternal: boolean;
    salary: number;
}) {
    const { contractId } = await requireTenantContext()

    const employee = await prisma.employee.create({
        data: {
            contractId,
            name: data.name,
            role: data.role,
            isInternal: data.isInternal,
            salary: data.salary,
            status: "ACTIVE"
        }
    })

    revalidatePath("/admin/staff")
    return employee
}

/**
 * Rodar a Folha de Pagamento (Payroll).
 * Gera débitos no Ledger para todos os funcionários ativos.
 */
export async function executePayrollAction() {
    const { contractId } = await requireTenantContext()

    // Buscar funcionários ativos
    const employees = await prisma.employee.findMany({
        where: { contractId, status: "ACTIVE" }
    })

    if (employees.length === 0) return;


    // Executar transação Ledger em lote
    const payrollTotal = employees.reduce((acc, curr) => acc + Number(curr.salary), 0)

    await prisma.$transaction(async (tx) => {
        // 1. Criar um débito consolidado ou individual (Aqui fazemos consolidado para simplicidade)
        await tx.ledgerEntry.create({
            data: {
                contractId,
                amount: payrollTotal,
                description: `Pagamento de Folha (${employees.length} funcionários)`,
                type: "DEBIT",
                correlationId: `PAYROLL-${new Date().toISOString().slice(0, 7)}`
            }
        })
    })

    revalidatePath("/admin/transactions")
    revalidatePath("/admin/staff")
    revalidatePath("/admin/reports/transparency")
}
