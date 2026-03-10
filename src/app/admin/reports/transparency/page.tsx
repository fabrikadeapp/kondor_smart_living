import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, TrendingDown, TrendingUp, Wallet, ShieldCheck } from "lucide-react"

export default async function TransparencyReportPage() {
    const { contractId, user } = await requireTenantContext()

    // 1. Buscar todas as entradas do Ledger
    const entries = await prisma.ledgerEntry.findMany({
        where: { contractId },
        orderBy: { createdAt: 'desc' }
    })

    // 2. Cálculos Agregados
    const totalCredit = entries
        .filter(e => e.type === 'CREDIT')
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

    const totalDebit = entries
        .filter(e => e.type === 'DEBIT')
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

    const currentBalance = totalCredit - totalDebit

    // 3. Agrupar por Categorias (Simulado via descrição em V1)
    const categories = entries.reduce((acc: any, curr) => {
        const desc = curr.description.toLowerCase()
        let category = "Geral"
        if (desc.includes("limpeza")) category = "Limpeza"
        if (desc.includes("manutenção")) category = "Manutenção"
        if (desc.includes("quota") || desc.includes("recebimento")) category = "Receita Ordinária"
        if (desc.includes("marketplace") || desc.includes("comissão")) category = "Marketplace (Extra)"

        if (!acc[category]) acc[category] = 0
        acc[category] += Math.abs(Number(curr.amount))
        return acc
    }, {})

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Relatório de Transparência</h2>
                    <p className="text-slate-500 text-sm">Demonstração financeira detalhada para auditoria de moradores.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Dados Auditados</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-l-4 border-l-emerald-500">
                    <CardHeader className="py-4">
                        <CardDescription className="text-xs font-bold uppercase">Total Receitas</CardDescription>
                        <CardTitle className="text-2xl text-emerald-600 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> R$ {totalCredit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-white border-l-4 border-l-red-500">
                    <CardHeader className="py-4">
                        <CardDescription className="text-xs font-bold uppercase">Total Despesas</CardDescription>
                        <CardTitle className="text-2xl text-red-600 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" /> R$ {totalDebit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className={cn(
                    "border-l-4",
                    currentBalance >= 0 ? "border-l-primary" : "border-l-amber-500"
                )}>
                    <CardHeader className="py-4">
                        <CardDescription className="text-xs font-bold uppercase">Saldo em Caixa</CardDescription>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Wallet className="w-5 h-5" /> R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-primary" /> Distribuição de Gastos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(categories).map(([cat, val]: any) => (
                            <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-600">{cat}</span>
                                    <span className="text-slate-900">R$ {val.toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${Math.min((val / (totalCredit || 1)) * 100, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold">Últimas Movimentações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {entries.slice(0, 5).map(entry => (
                                <div key={entry.id} className="flex justify-between items-center p-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-slate-700">{entry.description}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{new Date(entry.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <span className={cn(
                                        "text-xs font-black",
                                        entry.type === 'CREDIT' ? "text-emerald-600" : "text-red-500"
                                    )}>
                                        {entry.type === 'CREDIT' ? '+' : '-'} R$ {Number(entry.amount).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
