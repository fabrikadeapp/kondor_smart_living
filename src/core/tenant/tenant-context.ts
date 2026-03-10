import { getServerSession } from "next-auth/next"
import { authOptions } from "@/core/auth/authOptions"

/**
 * Helper de Backend para garantir o "Hard Boundary" Multi-Tenant.
 * Invocar sempre no inicio de um Server Action ou Server Component
 * que consulte dados do banco (Prisma).
 * 
 * @returns { contractId: string, role: string, user: any }
 * @throws { Error } se o usuário nao tiver escopo ou sessão válida
 */
export async function requireTenantContext() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        throw new Error("Acesso negado: Usuário não autenticado.")
    }

    const contractId = session.activeContractId
    if (!contractId) {
        throw new Error("Acesso negado: Nenhum condomínio ativo no contexto.")
    }

    // Validação de segurança dupla (impede adulteração de cookie):
    // Confere se o contractId da sessão logada REALMENTE existe no array
    // de Memberships que extraímos no ato do Login.
    const validMembership = session.memberships.find(
        (m: any) => m.contractId === contractId
    )

    if (!validMembership) {
        throw new Error(
            "Acesso restrito: Você não tem permissão para atuar neste Condomínio."
        )
    }

    return {
        contractId: contractId as string,
        role: validMembership.role as string,
        user: session.user,
    }
}

/**
 * Obtem o contexto global (SuperAdmin).
 * Somente o Superadmin tem passe livre para queries sem contractId.
 */
export async function requireGlobalContext() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        throw new Error("Acesso negado: Usuário não autenticado.")
    }

    const isSuperAdmin = session.memberships.some(
        (m: any) => m.role === "SUPERADMIN"
    )

    if (!isSuperAdmin) {
        throw new Error("Acesso restrito: Privilégios de Superadmin necessários.")
    }

    return {
        user: session.user,
        isSuperAdmin: true,
    }
}
