import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MessageSquare, CheckCircle2, Clock, Filter, Search, ArrowUpRight } from "lucide-react"
import { updateOccurrenceStatusAction } from "@/application/features/occurrences/occurrences.action"
import { revalidatePath } from "next/cache"

export default async function AdminOccurrencesPage() {
    const { contractId } = await requireTenantContext()

    // Buscar Ocorrências do Banco filtradas por Tenancy
    const occurrences = await prisma.occurrence.findMany({
        where: { contractId },
        include: {
            unit: true,
            user: true
        },
        orderBy: { createdAt: "desc" },
        take: 100
    })

    const stats = {
        open: occurrences.filter(o => o.status === 'OPEN').length,
        inProgress: occurrences.filter(o => o.status === 'IN_PROGRESS').length,
        resolved: occurrences.filter(o => o.status === 'RESOLVED').length,
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Apple Style Header */}
            <div className="flex justify-between items-end border-b border-[#d2d2d7]/30 pb-10">
                <div className="space-y-1">
                    <Badge className="bg-[#e30000]/10 text-[#e30000] border-0 font-bold uppercase text-[9px] tracking-widest px-3 py-1 rounded-full">Sistema de Chamados</Badge>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1d1d1f] leading-tight text-balance">Atendimento & Incidentes</h2>
                    <p className="text-[#86868b] text-sm font-medium">Resolva pendências operacionais e comunique-se com os moradores.</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b] group-focus-within:text-[#0066cc] transition-colors" />
                        <input
                            placeholder="Buscar por UH ou Morador..."
                            className="pl-11 pr-6 py-3 bg-white border border-[#d2d2d7] rounded-full text-xs font-medium w-64 focus:outline-none focus:ring-4 focus:ring-[#0066cc]/10 focus:border-[#0066cc] transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-3 border border-[#d2d2d7] bg-white rounded-full text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all shadow-sm">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Em Aberto", value: stats.open, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
                    { label: "Em Análise", value: stats.inProgress, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Finalizados", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((stat) => (
                    <div key={stat.label} className="p-6 bg-white rounded-[28px] border border-[#d2d2d7] shadow-sm flex items-center gap-5">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-[#1d1d1f] tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Table Apple Style */}
            <div className="rounded-[32px] border border-[#d2d2d7] bg-white overflow-hidden shadow-apple">
                <Table>
                    <TableHeader className="bg-[#f5f5f7]/50 border-b border-[#d2d2d7]">
                        <TableRow className="hover:bg-transparent border-0">
                            <TableHead className="py-6 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Morador / Unidade</TableHead>
                            <TableHead className="py-6 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Ocorrência & Categoria</TableHead>
                            <TableHead className="py-6 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Status Atual</TableHead>
                            <TableHead className="py-6 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest text-right">Análise</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {occurrences.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center text-[#86868b] font-medium italic">
                                    Não há chamados ativos neste momento.
                                </TableCell>
                            </TableRow>
                        ) : occurrences.map((occ) => (
                            <TableRow key={occ.id} className="border-b border-[#f5f5f7] last:border-0 hover:bg-[#f5f5f7]/40 transition-colors group">
                                <TableCell className="py-7 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#1d1d1f] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-black/10">
                                            {occ.unit?.number || '—'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#1d1d1f] tracking-tight">{occ.user?.name || 'Inquilino Identificado'}</p>
                                            <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest">{occ.unit?.block ? `Bloco ${occ.unit.block}` : 'Área Comum'}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-7 px-8">
                                    <div className="space-y-1 max-w-sm">
                                        <Badge className="bg-transparent text-[#0066cc] border border-[#0066cc]/20 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-tighter">{occ.category}</Badge>
                                        <p className="text-sm font-medium text-[#1d1d1f] leading-snug">{occ.description}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="py-7 px-8">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${occ.status === 'OPEN' ? 'bg-rose-500 animate-pulse' : occ.status === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                                        <span className="text-[10px] font-black text-[#1d1d1f] uppercase tracking-widest">{occ.status}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-7 px-8 text-right">
                                    <form action={async () => {
                                        "use server"
                                        const nextStatus = occ.status === 'OPEN' ? 'IN_PROGRESS' : occ.status === 'IN_PROGRESS' ? 'RESOLVED' : 'OPEN'
                                        await updateOccurrenceStatusAction(occ.id, nextStatus)
                                        revalidatePath("/admin/occurrences")
                                    }}>
                                        <button className="px-5 py-2.5 bg-[#f5f5f7] rounded-full text-[10px] font-black text-[#1d1d1f] uppercase tracking-widest hover:bg-[#1d1d1f] hover:text-white transition-all flex items-center gap-2 ml-auto shadow-sm group-hover:scale-105 active:scale-95">
                                            {occ.status === 'RESOLVED' ? 'Reabrir' : 'Ver Detalhes'} <ArrowUpRight className="w-3 h-3" />
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
