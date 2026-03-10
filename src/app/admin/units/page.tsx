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
import { Building2, Users, MoreHorizontal, UserPlus, ArrowUpRight } from "lucide-react"
import { createUnitAction } from "@/application/features/units/units.action"
import { revalidatePath } from "next/cache"

export default async function AdminUnitsPage() {
    const { contractId } = await requireTenantContext()

    const units = await prisma.unit.findMany({
        where: { contractId },
        include: {
            userUnits: {
                where: { status: 'ACTIVE' },
                include: { user: true }
            }
        },
        orderBy: [{ block: 'asc' }, { number: 'asc' }]
    })

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header High-End */}
            <div className="flex justify-between items-end border-b border-[#d2d2d7]/30 pb-8">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1d1d1f] leading-tight">Unidades & Residentes</h2>
                    <p className="text-[#86868b] text-sm font-medium mt-1">Gestão demográfica e ocupacional do condomínio.</p>
                </div>

                <div className="flex gap-3">
                    <form action={async () => {
                        "use server"
                        // Demo: Auto-gerar uma unidade para teste rápido
                        const nextNum = (units.length + 101).toString()
                        await createUnitAction({ block: 'A', number: nextNum })
                        revalidatePath("/admin/units")
                    }}>
                        <button className="px-6 py-2.5 bg-[#0066cc] text-white rounded-full text-xs font-black shadow-lg shadow-[#0066cc]/20 hover:scale-105 transition-all flex items-center gap-2">
                            Adicionar Unidade <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-[24px] border border-[#d2d2d7] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-[#0066cc] rounded-2xl flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">Total UHs</p>
                        <p className="text-xl font-black text-[#1d1d1f] tracking-tight">{units.length}</p>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-[24px] border border-[#d2d2d7] shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">Residentes Ativos</p>
                        <p className="text-xl font-black text-[#1d1d1f] tracking-tight">
                            {units.reduce((acc, u) => acc + u.userUnits.length, 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Data Table Apple-Style */}
            <div className="rounded-[28px] border border-[#d2d2d7] bg-white overflow-hidden shadow-apple">
                <Table>
                    <TableHeader className="bg-[#f5f5f7]/50 border-b border-[#d2d2d7]">
                        <TableRow className="hover:bg-transparent border-0">
                            <TableHead className="py-5 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Localização (Bloco/UH)</TableHead>
                            <TableHead className="py-5 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Ocupação / Residentes</TableHead>
                            <TableHead className="py-5 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-40 text-center text-[#86868b] font-medium italic">
                                    Nenhuma unidade cadastrada. Comece adicionando sua primeira UH.
                                </TableCell>
                            </TableRow>
                        ) : units.map((unit) => (
                            <TableRow key={unit.id} className="border-b border-[#f5f5f7] last:border-0 hover:bg-[#f5f5f7]/30 transition-colors group">
                                <TableCell className="py-6 px-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#f5f5f7] rounded-xl flex items-center justify-center font-black text-[#1d1d1f] group-hover:bg-white transition-colors">
                                            {unit.block || '—'}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-[#1d1d1f] tracking-tight">{unit.number}</p>
                                            <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest">{unit.type}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 px-8">
                                    <div className="flex flex-wrap gap-2">
                                        {unit.userUnits.map(uu => (
                                            <Badge key={uu.id} className="bg-white border-[#d2d2d7] text-[#1d1d1f] rounded-full px-3 py-1 text-[11px] font-bold flex items-center gap-1.5 shadow-sm group-hover:border-[#0066cc] transition-colors">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[#86868b] uppercase text-[9px] font-black tracking-widest">{uu.relationshipType}</span>
                                                {uu.user.name || uu.user.email}
                                            </Badge>
                                        ))}
                                        {unit.userUnits.length === 0 && (
                                            <Badge className="bg-[#f5f5f7] text-[#86868b] border-dashed border-[#d2d2d7] rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none">
                                                Vago
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-6 px-8 text-right">
                                    <button className="p-2 hover:bg-white rounded-xl transition-all text-[#86868b] hover:text-[#0066cc] hover:shadow-sm">
                                        <UserPlus className="w-5 h-5" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
