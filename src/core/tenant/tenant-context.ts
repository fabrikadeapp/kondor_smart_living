import { getServerSession } from "next-auth/next"
import { authOptions } from "@/core/auth/authOptions"
import prisma from "@/infrastructure/db/prisma"

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
/**
 * Verifica se o condomínio atual (Contract) tem acesso a uma funcionalidade
 * específica baseada no seu Plano (Subscription) ou Ad-Ons ativos.
 * 
 * @param {string} code O código curto da feature (Ex: STAFF_TIME_CLOCK)
 * @returns {Promise<boolean>}
 */
export async function checkFeatureAccess(code: string): Promise<boolean> {
    const { contractId } = await requireTenantContext()

    // 1. Verificar no Plano (Subscription -> Plan -> Features)
    const planAccess = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
            subscription: {
                include: {
                    plan: {
                        include: {
                            planFeatures: {
                                include: { feature: { select: { code: true } } }
                            }
                        }
                    }
                }
            }
        }
    })

    const hasInPlan = planAccess?.subscription?.plan.planFeatures.some(
        (pf: any) => pf.feature.code === code
    )


    if (hasInPlan) return true

    // 2. Verificar nos Add-Ons (TenantAddOn -> AddOn -> Features)
    const addOnAccess = await prisma.tenantAddOn.findFirst({
        where: {
            contractId,
            status: "ACTIVE",
            addOn: {
                features: {
                    some: {
                        feature: { code }
                    }
                }
            }
        }
    })

    return !!addOnAccess
}

/**
 * Lança erro se a feature não estiver ativada no Plano do cliente.
 */
export async function requireFeature(code: string) {
    const hasAccess = await checkFeatureAccess(code)
    if (!hasAccess) {
        throw new Error(`Acesso Negado: A funcionalidade '${code}' não está inclusa no seu plano atual. Ative agora para continuar.`)
    }
}
