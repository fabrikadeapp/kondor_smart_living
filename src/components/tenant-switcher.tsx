"use client"

import * as React from "react"
import { ChevronsUpDown, Building, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCurrentTenant } from "@/hooks/use-current-tenant"
import { cn } from "@/lib/utils"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TenantSwitcher() {
    const { data: session, update } = useSession()
    const { contractId, isLoading } = useCurrentTenant()

    if (isLoading || !session?.memberships) {
        return (
            <div className="flex items-center gap-2 p-2 border rounded-md shadow-sm opacity-50 cursor-not-allowed">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted animate-pulse">
                    <Building className="h-4 w-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                </div>
            </div>
        )
    }

    const activeMembership = session.memberships.find(m => m.contractId === contractId)
    const activeContract = activeMembership?.contract

    // Executed when a user selects a new Condominium
    const handleTenantChange = async (targetContractId: string) => {
        if (targetContractId === contractId) return; // ignore if same

        // This invokes the "jwt" callback inside `authOptions.ts` with `trigger: "update"`
        await update({ activeContractId: targetContractId })
        // Refresh the router so all Server Components re-fetch data based on the new context
        window.location.reload()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="w-full focus:outline-none">
                <div className="flex items-center gap-2 p-2 border rounded-md shadow-sm hover:bg-accent transition-colors">
                    <Avatar className="h-8 w-8 rounded-lg border">
                        {/* If we had logos, we would put image here. For now just standard icon */}
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                            <Building className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                            {activeContract?.tradeName || "Selecione o Condomínio"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                            Perfil: {activeMembership?.role || "Indefinido"}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
            >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Meus Condomínios
                </DropdownMenuLabel>
                {session.memberships.map((membership) => (
                    <DropdownMenuItem
                        key={membership.contractId}
                        onClick={() => handleTenantChange(membership.contractId)}
                        className="gap-2 p-2 cursor-pointer"
                    >
                        <div className="flex h-6 w-6 items-center justify-center rounded-sm border bg-background">
                            <Building className="h-3 w-3 shrink-0" />
                        </div>
                        {membership.contract.tradeName}
                        {membership.contractId === contractId && (
                            <Check className="ml-auto h-4 w-4 opacity-50" />
                        )}
                    </DropdownMenuItem>
                ))}
                {session.memberships.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground">Nenhum vínculo.</div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
