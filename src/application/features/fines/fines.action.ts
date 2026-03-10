"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext, requireFeature } from "@/core/tenant/tenant-context"
import { sendNotificationAction } from "@/application/features/notifications/notifications.action"

/**
 * Emissão de Multa ou Advertência.
 * Gated by: FINES_AND_WARNINGS
 */
export async function issueFineWarningAction(data: {
    unitId: string;
    type: "FINE" | "WARNING";
    reason: string;
    amount?: number;
}) {
    const { contractId } = await requireTenantContext()

    // 0. Gating
    await requireFeature("FINES_AND_WARNINGS")

    // 1. Criar o registro
    const record = await (prisma as any).fineWarning.create({
        data: {
            contractId,
            unitId: data.unitId,
            type: data.type,
            reason: data.reason,
            amount: data.amount,
            status: "PENDING"
        },
        include: { unit: { include: { userUnits: true } } }
    })

    // 2. Se for MULTA, registra no Ledger do Condomínio como CRÉDITO (Receita extra)
    if (data.type === "FINE" && data.amount) {
        await (prisma as any).ledgerEntry.create({
            data: {
                contractId,
                amount: data.amount,
                type: "CREDIT",
                description: `Multa emitida: Unidade ${record.unitId} - ${data.reason}`,
                correlationId: `FINE-${record.id}`
            }
        })
    }

    // 3. Notificar o Morador
    const targetUserId = record.unit?.userUnits[0]?.userId
    if (targetUserId) {
        await sendNotificationAction({
            userId: targetUserId,
            unitId: data.unitId,
            title: data.type === "FINE" ? "Nova Multa Aplicada 🚨" : "Advertência Recebida ⚠️",
            content: `Foi registrada uma ${data.type === "FINE" ? 'multa' : 'advertência'} para sua unidade. Motivo: ${data.reason}`,
            type: "WHATSAPP"
        })
    }

    revalidatePath("/admin/units")
    return record
}
