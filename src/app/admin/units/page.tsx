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

export default async function AdminUnitsPage() {
    const { contractId } = await requireTenantContext()

    // Buscar unidades ativas do banco garantindo contractId
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Unidades e Moradores</h2>
                    <p className="text-muted-foreground text-sm">Gerencie o mapeamento estrutural e demográfico.</p>
                </div>
                {/* Futural Modal -> Client component invoking createUnitAction */}
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm">
                    + Criar Unidade
                </button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bloco / Torro</TableHead>
                            <TableHead>Número (UH)</TableHead>
                            <TableHead>Moradores Vinculados (Ativos)</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Nenhuma unidade cadastrada. Crie ou importe um CSV.
                                </TableCell>
                            </TableRow>
                        ) : units.map((unit) => (
                            <TableRow key={unit.id}>
                                <TableCell className="font-medium">{unit.block || '-'}</TableCell>
                                <TableCell className="font-bold">{unit.number}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        {unit.userUnits.map(uu => (
                                            <Badge key={uu.id} variant="secondary" className="text-xs">
                                                <span className="font-semibold mr-1">{uu.relationshipType}</span>
                                                {uu.user.name || uu.user.email}
                                            </Badge>
                                        ))}
                                        {unit.userUnits.length === 0 && (
                                            <span className="text-slate-400 text-xs italic">Dezessificada</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <button className="text-sm text-primary underline">Vincular Morador</button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
