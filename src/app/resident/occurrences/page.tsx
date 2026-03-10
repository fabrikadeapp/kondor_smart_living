import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, ChevronRight, MessageSquare, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { createOccurrenceAction } from "@/application/features/occurrences/occurrences.action"
import { revalidatePath } from "next/cache"

export default async function ResidentOccurrencesPage() {
    const { contractId, user } = await requireTenantContext()

    // Resident só vê as suas próprias ocorrências
    const occurrences = await prisma.occurrence.findMany({
        where: { contractId, userId: user.id },
        include: { unit: true },
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Resident Header */}
            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-[#1d1d1f]">Meus Chamados</h2>
                <p className="text-[#86868b] text-sm font-medium">Acompanhe a resolução das suas solicitações.</p>
            </div>

            {/* Nova Ocorrência Quick Trigger */}
            <form action={async () => {
                "use server"
                // Demo: Criação rápida para teste de Story 4.3
                await createOccurrenceAction({
                    category: "MANUTENÇÃO",
                    description: "Vazamento no banheiro social verificado pela manhã.",
                    priority: "NORMAL"
                })
                revalidatePath("/resident/occurrences")
            }}>
                <button className="w-full py-4 bg-[#0066cc] text-white rounded-[20px] font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-[#0066cc]/20 active:scale-[0.98] transition-all">
                    <Plus className="w-5 h-5" /> Abrir Nova Ocorrência
                </button>
            </form>

            {/* List of Occurrences */}
            <div className="space-y-4">
                {occurrences.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-[#86868b]" />
                        </div>
                        <p className="text-sm font-medium text-[#86868b]">Tudo certo! Você não tem <br /> chamados em aberto.</p>
                    </div>
                ) : occurrences.map((occ) => (
                    <Link key={occ.id} href={`/resident/occurrences/${occ.id}`} className="block border border-[#d2d2d7] bg-white rounded-[24px] p-5 shadow-sm hover:shadow-md hover:border-[#0066cc]/30 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <Badge className={`bg-transparent p-0 border-0 font-black text-[9px] uppercase tracking-widest ${occ.status === 'OPEN' ? 'text-rose-500' : occ.status === 'IN_PROGRESS' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {occ.status === 'OPEN' ? 'Pendente' : occ.status === 'IN_PROGRESS' ? 'Em Análise' : 'Resolvido'}
                            </Badge>
                            <span className="text-[10px] font-bold text-[#86868b]">{new Date(occ.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>

                        <h4 className="font-black text-[#1d1d1f] tracking-tight mb-1 group-hover:text-[#0066cc] transition-colors">{occ.category}</h4>
                        <p className="text-sm text-[#86868b] leading-tight line-clamp-2 mb-4 font-medium">{occ.description}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-[#f5f5f7]">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#f5f5f7] rounded-lg flex items-center justify-center">
                                    <MessageSquare className="w-3 h-3 text-[#1d1d1f]" />
                                </div>
                                <span className="text-[10px] font-black text-[#1d1d1f] uppercase tracking-widest">Interações (0)</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#d2d2d7] group-hover:text-[#0066cc] transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Info Hint */}
            <div className="p-5 bg-[#f5f5f7] rounded-[24px] flex gap-4">
                <AlertCircle className="w-5 h-5 text-[#0066cc] shrink-0" />
                <p className="text-[11px] font-medium text-[#1d1d1f] leading-snug">
                    Emergências de segurança ou incêndio? Entre em contato imediato via interfone ou telefone da portaria.
                </p>
            </div>
        </div>
    )
}
