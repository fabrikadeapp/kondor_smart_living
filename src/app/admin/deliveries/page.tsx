import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, CheckCircle2, MapPin, Box, ArrowUpRight, Search, Filter } from "lucide-react"
import { retrieveDeliveryAction, registerDeliveryAction } from "@/application/features/concierge/deliveries.action"
import { revalidatePath } from "next/cache"

export default async function AdminDeliveriesPage() {
    const { contractId } = await requireTenantContext()

    // Buscar entregas que não foram ainda retiradas
    const deliveries = await prisma.delivery.findMany({
        where: { contractId, status: { in: ['PENDING', 'NOTIFIED'] } },
        include: {
            unit: true
        },
        orderBy: { createdAt: "desc" }
    })

    const units = await prisma.unit.findMany({
        where: { contractId },
        orderBy: { number: 'asc' },
        take: 20 // Para o select simplificado no demo
    })

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Apple Style Header */}
            <div className="flex justify-between items-end border-b border-[#d2d2d7]/30 pb-10">
                <div className="space-y-1">
                    <Badge className="bg-[#0066cc]/10 text-[#0066cc] border-0 font-bold uppercase text-[9px] tracking-widest px-3 py-1 rounded-full">Portaria Digital</Badge>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1d1d1f] leading-tight text-balance">Encomendas & Volumes</h2>
                    <p className="text-[#86868b] text-sm font-medium">Gestão de recebimento e fluxo de entregas da portaria.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b] group-focus-within:text-[#0066cc] transition-colors" />
                        <input
                            placeholder="Buscar por código ou UH..."
                            className="pl-11 pr-6 py-3 bg-white border border-[#d2d2d7] rounded-full text-xs font-medium w-64 focus:outline-none focus:ring-4 focus:ring-[#0066cc]/10 focus:border-[#0066cc] transition-all shadow-sm"
                        />
                    </div>

                    <form action={async () => {
                        "use server"
                        // Demo Trigger: Registrar para a primeira unidade encontrada
                        if (units.length > 0) {
                            await registerDeliveryAction({
                                unitId: units[0].id,
                                description: "Encomenda Mercado Livre - Pacote Médio",
                                trackingCode: `ML-${Math.floor(Math.random() * 90000) + 10000}`
                            })
                            revalidatePath("/admin/deliveries")
                        }
                    }}>
                        <button className="px-6 py-3 bg-[#1d1d1f] text-white rounded-full text-xs font-black shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 fill-white" /> Registrar Volume
                        </button>
                    </form>
                </div>
            </div>

            {/* Metrics Mini-Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-8 bg-white border border-[#d2d2d7] rounded-[32px] shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-4">Aguardando Retirada</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-[#1d1d1f] tracking-tighter">{deliveries.length}</span>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Volumes</span>
                    </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-[#f5f5f7]/50 border border-[#d2d2d7]/50 rounded-[28px] flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-[#d2d2d7] text-[#1d1d1f]">
                            <Box className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-[#86868b] uppercase tracking-widest">Status Geral</p>
                            <p className="text-sm font-bold text-[#1d1d1f]">Portaria Limpa</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Table Apple Style */}
            <div className="rounded-[32px] border border-[#d2d2d7] bg-white overflow-hidden shadow-apple">
                <Table>
                    <TableHeader className="bg-[#f5f5f7]/50 border-b border-[#d2d2d7]">
                        <TableRow className="hover:bg-transparent border-0">
                            <TableHead className="py-6 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Localização (UH)</TableHead>
                            <TableHead className="py-6 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Detalhes do Volume</TableHead>
                            <TableHead className="py-6 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Chegada na Portaria</TableHead>
                            <TableHead className="py-6 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest text-right">Ação de Baixa</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deliveries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center text-[#86868b] font-medium italic">
                                    Nenhum pacote aguardando retirada.
                                </TableCell>
                            </TableRow>
                        ) : deliveries.map((delivery) => (
                            <TableRow key={delivery.id} className="border-b border-[#f5f5f7] last:border-0 hover:bg-[#f5f5f7]/40 transition-colors group">
                                <TableCell className="py-7 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#0066cc] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-[#0066cc]/10">
                                            {delivery.unit?.number || '—'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#1d1d1f] tracking-tight">Apartamento {delivery.unit?.number}</p>
                                            <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest">Bloco {delivery.unit?.block || 'Único'}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-7 px-8">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-[#1d1d1f] leading-snug">{delivery.description}</p>
                                        <Badge className="bg-transparent border border-[#d2d2d7] text-[#86868b] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                            Cod: {delivery.trackingCode || 'N/A'}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="py-7 px-8">
                                    <p className="text-xs font-black text-[#1d1d1f]">{new Date(delivery.createdAt).toLocaleDateString('pt-BR')}</p>
                                    <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest">{new Date(delivery.createdAt).toLocaleTimeString('pt-BR', { hour: '2-刻', minute: '2-刻' } as any)}</p>
                                </TableCell>
                                <TableCell className="py-7 px-8 text-right">
                                    <form action={async () => {
                                        "use server"
                                        await retrieveDeliveryAction(delivery.id)
                                        revalidatePath("/admin/deliveries")
                                    }}>
                                        <button className="px-5 py-2.5 bg-[#f5f5f7] rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 ml-auto shadow-sm group-hover:scale-105 active:scale-95">
                                            Baixar Entrega <CheckCircle2 className="w-3 h-3" />
                                        </button>
                                    </form>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
