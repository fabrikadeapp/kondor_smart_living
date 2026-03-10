import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronRight, Gavel, Users, Info } from "lucide-react"
import Link from "next/link"

export default async function ResidentAssembliesPage() {
    const { contractId } = await requireTenantContext()

    const assemblies = await prisma.assembly.findMany({
        where: {
            contractId,
            status: { in: ['OPEN', 'CLOSED'] }
        },
        orderBy: { scheduledFor: "desc" }
    })

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-[#1d1d1f]">Assembleias Virtuais</h2>
                <p className="text-[#86868b] text-sm font-medium">Participe das decisões do seu condomínio com validade jurídica.</p>
            </div>

            {/* List */}
            <div className="space-y-4">
                {assemblies.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto">
                            <Gavel className="w-8 h-8 text-[#d2d2d7]" />
                        </div>
                        <p className="text-sm font-medium text-[#86868b]">Não há assembleias ativas ou <br /> concluídas recentemente.</p>
                    </div>
                ) : assemblies.map((assembly) => (
                    <Link key={assembly.id} href={`/resident/assemblies/${assembly.id}`} className="block bg-white border border-[#d2d2d7] rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {assembly.status === 'OPEN' && (
                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                                Aberta para Voto
                            </div>
                        )}

                        <div className="flex gap-4 mb-4">
                            <div className="w-12 h-12 bg-[#f5f5f7] rounded-2xl flex items-center justify-center text-[#1d1d1f] font-black shrink-0">
                                {new Date(assembly.scheduledFor!).getDate()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">
                                    {new Date(assembly.scheduledFor!).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                                </p>
                                <h4 className="text-lg font-black text-[#1d1d1f] tracking-tight truncate group-hover:text-[#0066cc] transition-colors">{assembly.title}</h4>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[#f5f5f7]">
                            <div className="flex items-center gap-3">
                                <Users className="w-3.5 h-3.5 text-[#86868b]" />
                                <span className="text-[10px] font-black text-[#1d1d1f] uppercase tracking-widest">Participar da Pauta</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#d2d2d7] group-hover:text-[#0066cc] transition-all" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Regulatory Note */}
            <div className="p-6 bg-[#1d1d1f] rounded-[32px] text-white space-y-3 shadow-xl">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#0066cc]" />
                    <p className="text-[11px] font-black uppercase tracking-widest">Aviso Legal</p>
                </div>
                <p className="text-[11px] text-[#86868b] font-medium leading-relaxed">
                    As votações digitais no Kondor Smart Living seguem as normas da Lei 14.309/22. Certifique-se de que sua unidade esteja em dia com as obrigações para garantir o direito a voto.
                </p>
            </div>
        </div>
    )
}
