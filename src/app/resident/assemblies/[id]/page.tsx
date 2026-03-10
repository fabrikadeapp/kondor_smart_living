import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Info } from "lucide-react"
import { castVoteAction } from "@/application/features/assemblies/assemblies.action"
import { redirect } from "next/navigation"

export default async function AssemblyVotingPage({ params }: { params: Promise<{ id: string }> }) {
    const { contractId, user } = await requireTenantContext()
    const { id } = await params

    // 1. Buscar a Assembleia e as Pautas (Polls)
    const assembly = await prisma.assembly.findUnique({
        where: { id, contractId },
        include: {
            polls: {
                include: {
                    options: true,
                    votes: {
                        where: {
                            unit: {
                                userUnits: {
                                    some: { userId: user.id }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!assembly) redirect("/resident/assemblies")

    // 2. Identificar a unidade do morador (Simplificado em V1: Pega a primeira ativa)
    const userUnits = await prisma.userUnit.findMany({
        where: { contractId, userId: user.id },
        include: { unit: true }
    })

    const activeUnit = userUnits[0]?.unit
    if (!activeUnit) throw new Error("Você não possui uma unidade vinculada para votar.")

    return (
        <div className="space-y-6 pb-24 p-4 max-w-2xl mx-auto">
            <div className="space-y-2">
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">{assembly.status}</Badge>
                <h1 className="text-2xl font-bold tracking-tight">{assembly.title}</h1>
                <p className="text-slate-500 text-sm">{assembly.description}</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                    Seu voto será registrado para a <strong>Unidade {activeUnit.block || ''}{activeUnit.number}</strong>.
                    Uma vez confirmado, ele não poderá ser alterado durante esta sessão.
                </p>
            </div>

            <div className="space-y-8 mt-10">
                {(assembly as any).polls.map((poll: any, index: number) => {
                    const hasVoted = poll.votes.length > 0
                    const selectedOptionId = poll.votes[0]?.optionId

                    return (
                        <div key={poll.id} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                                    {index + 1}
                                </div>
                                <h3 className="font-bold text-slate-800">{poll.question}</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-2 pl-11">
                                {poll.options.map((option: any) => {
                                    const isSelected = selectedOptionId === option.id

                                    return (
                                        <form key={option.id} action={async () => {
                                            "use server"
                                            await castVoteAction(poll.id, option.id, activeUnit.id)
                                        }}>
                                            <button
                                                disabled={hasVoted || assembly.status !== 'OPEN'}
                                                type="submit"
                                                className={cn(
                                                    "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center group",
                                                    isSelected ? "bg-primary border-primary text-white" :
                                                        hasVoted ? "bg-slate-50 border-slate-100 opacity-60 text-slate-400" :
                                                            "bg-white border-slate-100 hover:border-primary/40 text-slate-700 active:scale-[0.98]"
                                                )}
                                            >
                                                <span className="font-semibold text-sm">{option.text}</span>
                                                {isSelected && <CheckCircle2 className="w-5 h-5" />}
                                                {!hasVoted && <div className="w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-primary/50" />}
                                            </button>
                                        </form>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {assembly.status !== 'OPEN' && (
                <div className="text-center py-5 text-slate-500 italic text-sm border-t mt-12">
                    A votação desta assembleia está {assembly.status === 'CLOSED' ? 'ENCERRADA' : 'EM AGENDAMENTO'}.
                </div>
            )}
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
