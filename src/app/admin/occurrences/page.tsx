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

export default async function AdminOccurrencesPage() {
    const { contractId } = await requireTenantContext()

    // Buscar Ocorrências do Banco filtradas por Tenancy
    const occurrences = await prisma.occurrence.findMany({
        where: { contractId },
        include: {
            unit: true
        },
        orderBy: { createdAt: "desc" },
        take: 100
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Registro de Ocorrências</h2>
                    <p className="text-muted-foreground text-sm">Formalização de chamados e solicitações operacionais.</p>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>UH</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Descrição do Problema</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {occurrences.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                                    Nenhuma ocorrência em aberto. Condomínio tranquilo!
                                </TableCell>
                            </TableRow>
                        ) : occurrences.map((occ) => (
                            <TableRow key={occ.id}>
                                <TableCell>
                                    <Badge
                                        className={cn(
                                            "text-[10px] font-bold",
                                            occ.priority === 'HIGH' ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-400'
                                        )}
                                    >
                                        {occ.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{occ.unit?.number || 'GERAL'}</TableCell>
                                <TableCell className="text-sm font-medium">{occ.category}</TableCell>
                                <TableCell className="text-sm text-slate-600 max-w-sm truncate">
                                    {occ.description}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] font-bold">
                                        {occ.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <button className="text-sm text-primary font-medium">Analisar</button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
