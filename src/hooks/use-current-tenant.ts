"use client"

import { useSession } from "next-auth/react"

/**
 * Hook universal do Client (React Component).
 * Desembrulha a sessão Auth.js e retorna os atributos
 * essenciais que a UI precisa saber sobre o contexto
 * do condomínio atual selecionado sob a ótica "Hard Boundary".
 */
export function useCurrentTenant() {
    const { data: session, status } = useSession()

    const isLoading = status === "loading"

    if (isLoading || !session || !session.activeContractId) {
        return {
            isLoading,
            contractId: null,
            role: null,
            user: session?.user || null
        }
    }

    // Descobre a Role específica deste usuário para
    // ESTE condomínio setado no Switcher.
    const activeMembership = session.memberships?.find(
        (m: any) => m.contractId === session.activeContractId
    )

    return {
        isLoading,
        contractId: session.activeContractId as string,
        role: activeMembership?.role as string | null, // ex: ADMIN, RESIDENT
        user: session.user
    }
}
