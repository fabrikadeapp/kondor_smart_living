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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function AdminTransactionsPage() {
    const { contractId } = await requireTenantContext()

    // Buscar todos os registros do Ledger (Imutabilidade!)
    const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: { contractId },
        orderBy: { createdAt: "desc" },
        take: 50
    })

    // Calcula balanço total (MVP Simplified)
    const balance = ledgerEntries.reduce((acc, curr) => acc + Number(curr.amount), 0)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Livro Caixa (Ledger)</h2>
                    <p className="text-muted-foreground text-sm">Registro histórico imutável de transações financeiras.</p>
                </div>

                <div className="flex gap-2">
                    {/* Futuro Modal de Geração Bulk */}
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium text-sm">
                        Gerar Cobranças Mensais
                    </button>
                    <button className="bg-primary text-white px-4 py-2 rounded-md font-medium text-sm">
                        + Novo Lançamento Manual
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 text-white border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-400">Saldo Consolidado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[120px]">Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Correlation ID</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ledgerEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Nenhum lançamento financeiro registrado.
                                </TableCell>
                            </TableRow>
                        ) : ledgerEntries.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell className="text-sm">
                                    {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell className="font-medium">{entry.description}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={entry.type === 'DEBIT' ? 'destructive' : entry.type === 'CREDIT' ? 'default' : 'outline'}
                                        className="text-[10px] uppercase font-bold"
                                    >
                                        {entry.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-slate-400 font-mono">
                                    {entry.correlationId}
                                </TableCell>
                                <TableCell className={cn(
                                    "text-right font-bold tabular-nums",
                                    Number(entry.amount) < 0 ? "text-red-600" : "text-emerald-600"
                                )}>
                                    R$ {Math.abs(Number(entry.amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
