import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Box, ArrowLeft, Clock, Info } from "lucide-react"
import Link from "next/link"

export default async function ResidentDeliveriesPage() {
    const { contractId, user } = await requireTenantContext()

    // Buscar unidades as quais o morador pertence
    const activeUserUnits = await prisma.userUnit.findMany({
        where: { contractId, userId: user.id },
        select: { unitId: true }
    })
    const unitIds = activeUserUnits.map(uu => uu.unitId)

    // Buscar todas as encomendas (pendentes e recentes retiradas)
    const deliveries = await prisma.delivery.findMany({
        where: {
            unitId: { in: unitIds },
            contractId
        },
        include: { unit: true },
        orderBy: { createdAt: "desc" },
        take: 30
    })

    const pendingCount = deliveries.filter(d => d.status === 'PENDING' || d.status === 'NOTIFIED').length

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/resident/dashboard" className="w-10 h-10 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#1d1d1f]">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-black tracking-tighter text-[#1d1d1f]">Minhas Encomendas</h2>
                    <p className="text-[#86868b] text-[11px] font-black uppercase tracking-widest">Fluxo de Portaria</p>
                </div>
            </div>

            {/* Quick Summary Card */}
            {pendingCount > 0 ? (
                <div className="bg-[#1d1d1f] rounded-[32px] p-8 text-white shadow-2xl space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-[#0066cc] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0066cc]/20">
                            <Package className="w-6 h-6" />
                        </div>
                        <Badge className="bg-emerald-500 text-white border-0 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Chegou!</Badge>
                    </div>
                    <div>
                        <p className="text-5xl font-black tracking-tighter">{pendingCount}</p>
                        <p className="text-xs font-bold text-[#86868b] uppercase tracking-widest mt-1">Volume(s) na Portaria</p>
                    </div>
                    <p className="text-[11px] text-[#86868b] font-medium leading-tight pt-2 border-t border-white/10">
                        Por favor, retire seu volume com o porteiro apresentando identificação ou chave.
                    </p>
                </div>
            ) : (
                <div className="bg-[#f5f5f7] rounded-[32px] p-8 text-center space-y-4 border border-[#d2d2d7]/30">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Box className="w-8 h-8 text-[#d2d2d7]" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-black text-[#1d1d1f] tracking-tight">Portaria Limpa!</p>
                        <p className="text-xs text-[#86868b] font-medium">Não há volumes aguardando sua retirada no momento.</p>
                    </div>
                </div>
            )}

            {/* Recent Activity List */}
            <div className="space-y-5">
                <h3 className="text-[11px] font-black text-[#1d1d1f] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Histórico Recente
                </h3>

                <div className="space-y-4">
                    {deliveries.length === 0 ? (
                        <p className="text-center text-xs text-[#86868b] py-8 italic font-medium">Nenhum histórico de recebimento encontrado.</p>
                    ) : deliveries.map((delivery) => (
                        <div key={delivery.id} className="bg-white border border-[#d2d2d7] rounded-[24px] p-5 flex items-center gap-4 shadow-sm group">
                            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 ${delivery.status === 'RETRIEVED' ? 'bg-[#f5f5f7] text-[#86868b]' : 'bg-[#0066cc]/10 text-[#0066cc]'}`}>
                                <Package className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <p className="text-sm font-black text-[#1d1d1f] truncate leading-none tracking-tight">{delivery.description}</p>
                                    <span className="text-[9px] font-bold text-[#86868b] whitespace-nowrap ml-2">
                                        {new Date(delivery.createdAt).toLocaleDateString('pt-BR', { day: '2-刻', month: '2-刻' } as any)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-[#86868b]" />
                                    <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest">Unidade {delivery.unit.number}</p>
                                    <span className="text-[#d2d2d7]">•</span>
                                    <Badge className={`bg-transparent p-0 border-0 text-[9px] font-black uppercase tracking-widest ${delivery.status === 'RETRIEVED' ? 'text-[#86868b]' : 'text-emerald-500'}`}>
                                        {delivery.status === 'RETRIEVED' ? 'Retirado' : 'Aguardando'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="p-5 bg-blue-50/50 rounded-[28px] flex gap-4 border border-blue-100/50">
                <Info className="w-5 h-5 text-[#0066cc] shrink-0" />
                <p className="text-[10px] font-medium text-[#1d1d1f] leading-snug">
                    Sua encomenda será mantida na portaria por até 30 dias. Para volumes maiores (e-commerce móveis) favor combinar entrega direto na torre.
                </p>
            </div>
        </div>
    )
}
