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
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarIcon, MessageSquare } from "lucide-react"

export default async function AdminAssembliesPage() {
    const { contractId } = await requireTenantContext()

    // Buscar todas as assembleias do contrato
    const assemblies = await prisma.assembly.findMany({
        where: { contractId },
        include: {
            polls: true,
            minutes: true
        },
        orderBy: { scheduledFor: "desc" },
        take: 50
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-inter">Governança & Assembleias</h2>
                    <p className="text-slate-500 text-sm">Agende reuniões e gerencie votações virtuais.</p>
                </div>

                <Button className="bg-primary text-white font-medium shadow-lg hover:shadow-primary/20 transition-all">
                    + Nova Assembleia
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assemblies.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
                        <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Nenhuma assembleia agendada.</p>
                        <p className="text-slate-400 text-sm mt-1">Clique no botão acima para começar.</p>
                    </div>
                ) : assemblies.map((assembly) => (
                    <Card key={assembly.id} className="overflow-hidden border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all group">
                        <div className={cn(
                            "h-2 w-full",
                            assembly.status === 'DRAFT' ? 'bg-slate-300' :
                                assembly.status === 'SCHEDULED' ? 'bg-blue-400' :
                                    assembly.status === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-900'
                        )} />
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                                    {assembly.status}
                                </Badge>
                                {assembly.scheduledFor && (
                                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                        <CalendarIcon className="w-3 h-3" />
                                        {new Date(assembly.scheduledFor).toLocaleDateString('pt-BR')}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                                    {assembly.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2.5rem]">
                                    {assembly.description || 'Sem descrição.'}
                                </p>
                            </div>

                            <div className="flex gap-4 pt-2 border-t border-slate-50 text-[11px] font-semibold text-slate-500">
                                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-slate-400" /> {assembly.polls.length} Itens de Pauta</span>
                            </div>

                            <Link href={`/admin/assemblies/${assembly.id}`} className="block">
                                <Button variant="secondary" className="w-full text-xs font-bold group-hover:bg-primary group-hover:text-white transition-all">
                                    Visualizar & Gerenciar
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("bg-white rounded-xl border shadow-sm", className)}>
            {children}
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
