import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, Plus, ArrowUpRight, Play, CheckCircle } from "lucide-react"
import { createAssemblyAction, openAssemblyAction } from "@/application/features/governance/assemblies.action"
import { seedGovernanceDemoAction } from "@/application/features/governance/seed-demo.action"
import { revalidatePath } from "next/cache"

export default async function AdminAssembliesPage() {
    const { contractId } = await requireTenantContext()

    const assemblies = await prisma.assembly.findMany({
        where: { contractId },
        include: {
            polls: {
                include: {
                    votes: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-[#d2d2d7]/30 pb-10">
                <div className="space-y-1">
                    <Badge className="bg-[#0066cc]/10 text-[#0066cc] border-0 font-bold uppercase text-[9px] tracking-widest px-3 py-1 rounded-full">Governança Digital</Badge>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1d1d1f] leading-tight">Assembleias & Pautas</h2>
                    <p className="text-[#86868b] text-sm font-medium">Crie editais de convocação e acompanhe votações em tempo real.</p>
                </div>

                <div className="flex gap-4">
                    <form action={async () => {
                        "use server"
                        await seedGovernanceDemoAction()
                        revalidatePath("/admin/assemblies")
                    }}>
                        <button className="px-6 py-3 bg-white border border-[#d2d2d7] text-[#1d1d1f] rounded-full text-xs font-black shadow-sm hover:bg-[#f5f5f7] transition-all flex items-center gap-2">
                            Gerar Demo Completa
                        </button>
                    </form>

                    <form action={async () => {
                        "use server"
                        await createAssemblyAction({
                            title: "Assembleia Geral Ordinária - Março 2026",
                            description: "Prestação de contas 2025 e aprovação do novo fundo de reserva.",
                            scheduledFor: new Date(2026, 2, 25, 19, 0)
                        })
                        revalidatePath("/admin/assemblies")
                    }}>
                        <button className="px-6 py-3 bg-[#1d1d1f] text-white rounded-full text-xs font-black shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5" /> Convocar Assembleia
                        </button>
                    </form>
                </div>
            </div>

            {/* List Table Apple Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {assemblies.length === 0 ? (
                    <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-[#d2d2d7] rounded-[48px] space-y-4">
                        <Calendar className="w-12 h-12 text-[#86868b] mx-auto opacity-20" />
                        <p className="text-sm font-bold text-[#86868b]">Nenhuma assembleia convocada.</p>
                    </div>
                ) : assemblies.map((assembly) => (
                    <div key={assembly.id} className="bg-white border border-[#d2d2d7] rounded-[40px] p-8 shadow-apple-hover transition-all group overflow-hidden relative">
                        {assembly.status === 'OPEN' && (
                            <div className="absolute top-0 right-0 px-6 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl animate-pulse">
                                Sessão Aberta
                            </div>
                        )}

                        <div className="flex gap-4 items-center mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${assembly.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}>
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">{new Date(assembly.scheduledFor!).toLocaleDateString('pt-BR')}</p>
                                <h3 className="text-xl font-black text-[#1d1d1f] tracking-tight">{assembly.title}</h3>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-xs font-medium text-[#86868b]">
                                <span>Itens na Pauta</span>
                                <span className="text-[#1d1d1f] font-black">{assembly.polls.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-medium text-[#86868b]">
                                <span>Votos Coletados</span>
                                <span className="text-[#1d1d1f] font-black">
                                    {assembly.polls.reduce((acc, poll) => acc + poll.votes.length, 0)}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {assembly.status === 'DRAFT' ? (
                                <form action={async () => {
                                    "use server"
                                    await openAssemblyAction(assembly.id)
                                    revalidatePath("/admin/assemblies")
                                }} className="flex-1">
                                    <button className="w-full py-4 bg-[#0066cc] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#0066cc]/10 hover:bg-[#0071e3] transition-all">
                                        <Play className="w-3.5 h-3.5 fill-white" /> Iniciar Votação
                                    </button>
                                </form>
                            ) : (
                                <button className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-100">
                                    <CheckCircle className="w-3.5 h-3.5" /> Ativa para Moradores
                                </button>
                            )}
                            <button className="p-4 bg-[#f5f5f7] text-[#1d1d1f] rounded-2xl hover:bg-[#1d1d1f] hover:text-white transition-all">
                                <FileText className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
