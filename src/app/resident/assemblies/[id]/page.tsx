import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Gavel, CheckCircle2, Circle, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { castVoteAction } from "@/application/features/governance/assemblies.action"
import { revalidatePath } from "next/cache"

export default async function ResidentAssemblyDetailPage({ params }: { params: any }) {
    const { id } = await params
    const { contractId, user } = await requireTenantContext()

    const assembly = await prisma.assembly.findUnique({
        where: { id, contractId },
        include: {
            polls: {
                include: {
                    options: true,
                    votes: true
                }
            }
        }
    })

    if (!assembly) return <div className="p-10 text-center font-bold">Assembleia não encontrada.</div>

    // Buscar unidade primária do usuário para colher o voto
    const userUnit = await prisma.userUnit.findFirst({
        where: { userId: user.id, contractId },
        include: { unit: true }
    })

    const unitId = userUnit?.unitId

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Back Header */}
            <div className="flex items-center gap-4">
                <Link href="/resident/assemblies" className="w-10 h-10 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#1d1d1f]">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="space-y-0.5">
                    <h2 className="text-xl font-black tracking-tighter text-[#1d1d1f] truncate max-w-[200px]">{assembly.title}</h2>
                    <p className="text-[#86868b] text-[10px] font-black uppercase tracking-widest">{assembly.status === 'OPEN' ? 'Sessão em Andamento' : 'Sessão Encerrada'}</p>
                </div>
            </div>

            {/* Introduction Card */}
            <div className="bg-[#f5f5f7] rounded-[32px] p-8 space-y-3">
                <p className="text-sm font-medium text-[#1d1d1f] leading-relaxed">
                    {assembly.description || "Esta assembleia visa discutir pontos vitais para a valorização e convívio do nosso condomínio. Seu voto é fundamental."}
                </p>
                <div className="pt-4 flex items-center gap-4 border-t border-[#d2d2d7]">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-[#d2d2d7]" />)}
                    </div>
                    <span className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">+ {assembly.polls.reduce((acc, p) => acc + p.votes.length, 0)} votos já registrados</span>
                </div>
            </div>

            {/* Polls Feed */}
            <div className="space-y-6">
                <h3 className="text-[11px] font-black text-[#1d1d1f] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Gavel className="w-3.5 h-3.5" /> Pauta para Votação
                </h3>

                {assembly.polls.map((poll) => {
                    const hasVoted = poll.votes.some(v => v.unitId === unitId)
                    const userVote = poll.votes.find(v => v.unitId === unitId)

                    return (
                        <div key={poll.id} className="bg-white border border-[#d2d2d7] rounded-[32px] p-8 shadow-sm space-y-6">
                            <h4 className="text-lg font-black text-[#1d1d1f] tracking-tight leading-tight">{poll.question}</h4>

                            <div className="space-y-3">
                                {poll.options.map((option) => (
                                    <form key={option.id} action={async () => {
                                        "use server"
                                        if (!unitId) return
                                        await castVoteAction(poll.id, option.id, unitId)
                                        revalidatePath(`/resident/assemblies/${id}`)
                                    }}>
                                        <button
                                            disabled={hasVoted || assembly.status !== 'OPEN'}
                                            className={`w-full p-5 rounded-2xl flex items-center justify-between group transition-all border-2 ${userVote?.optionId === option.id
                                                    ? 'bg-[#0066cc] border-[#0066cc] text-white shadow-lg shadow-[#0066cc]/20'
                                                    : 'bg-white border-[#f5f5f7] text-[#1d1d1f] hover:border-[#0066cc]/20'
                                                } ${hasVoted && userVote?.optionId !== option.id ? 'opacity-40 grayscale' : ''}`}
                                        >
                                            <span className="text-sm font-black tracking-tight">{option.text}</span>
                                            {userVote?.optionId === option.id ? (
                                                <CheckCircle2 className="w-5 h-5 fill-white text-[#0066cc]" />
                                            ) : (
                                                <Circle className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </button>
                                    </form>
                                ))}
                            </div>

                            {hasVoted && (
                                <p className="text-[10px] text-center font-black text-[#86868b] uppercase tracking-widest pt-2">Voto confirmado pela Unidade {userUnit?.unit?.number}</p>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Protocol Support */}
            <div className="text-center py-6">
                <p className="text-[11px] font-medium text-[#86868b] mb-4">Problemas técnicos com a votação? Acione o suporte.</p>
                <button className="px-8 py-3 bg-[#f5f5f7] rounded-full text-[10px] font-black text-[#1d1d1f] uppercase tracking-widest hover:bg-[#1d1d1f] hover:text-white transition-all flex items-center gap-2 mx-auto">
                    <Send className="w-3.5 h-3.5" /> Enviar Mensagem
                </button>
            </div>
        </div>
    )
}
