"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/infrastructure/db/prisma"
import { requireTenantContext } from "@/core/tenant/tenant-context"

/**
 * Cria um novo aviso no Mural do condomínio.
 */
export async function createMuralPostAction(data: {
    title: string;
    content: string;
    category: string;
    priority?: string;
}) {
    const { contractId } = await requireTenantContext()

    const post = await prisma.muralPost.create({
        data: {
            contractId,
            title: data.title,
            content: data.content,
            category: data.category,
            priority: data.priority || "NORMAL",
            isActive: true
        }
    })

    revalidatePath("/admin/mural")
    revalidatePath("/resident/dashboard")
    return post
}

/**
 * Desativa um aviso do mural.
 */
export async function toggleMuralPostAction(id: string, isActive: boolean) {
    const { contractId } = await requireTenantContext()

    await prisma.muralPost.update({
        where: { id, contractId },
        data: { isActive }
    })

    revalidatePath("/admin/mural")
    revalidatePath("/resident/dashboard")
}

/**
 * Busca avisos ativos para o morador.
 */
export async function getActiveMuralPosts() {
    const { contractId } = await requireTenantContext()
    return prisma.muralPost.findMany({
        where: { contractId, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 5
    })
}
