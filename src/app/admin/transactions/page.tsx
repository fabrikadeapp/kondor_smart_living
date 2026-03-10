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
import { Wallet, ArrowDownCircle, ArrowUpCircle, History, Zap, MoreVertical } from "lucide-react"
import { generateMonthlyBillsAction } from "@/application/features/ledger/ledger.action"
import { revalidatePath } from "next/cache"

export default async function AdminTransactionsPage() {
    const { contractId } = await requireTenantContext()

    // Buscar registros do Ledger (Imutabilidade)
    const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: { contractId },
        orderBy: { createdAt: "desc" },
        take: 50
    })

    const balance = ledgerEntries.reduce((acc, curr) => acc + Number(curr.amount), 0)
    const revenue = ledgerEntries.filter(e => Number(e.amount) > 0).reduce((acc, curr) => acc + Number(curr.amount), 0)
    const expenses = ledgerEntries.filter(e => Number(e.amount) < 0).reduce((acc, curr) => acc + Number(curr.amount), 0)

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Financeiro Apple Style */}
            <div className="flex justify-between items-end border-b border-[#d2d2d7]/30 pb-10">
                <div className="space-y-2">
                    <Badge className="bg-[#1d1d1f] text-white border-0 font-bold uppercase text-[9px] tracking-[0.2em] px-3 py-1 rounded-full">Ledger Imutável</Badge>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1d1d1f] leading-tight">Fluxo de Caixa & Faturamento</h2>
                    <p className="text-[#86868b] text-sm font-medium">Controle financeiro granular com transparência zero atrito.</p>
                </div>

                <div className="flex gap-4">
                    <form action={async () => {
                        "use server"
                        await generateMonthlyBillsAction("MAR/2026")
                        revalidatePath("/admin/transactions")
                    }}>
                        <button className="px-6 py-3 bg-[#0066cc] text-white rounded-full text-xs font-black shadow-lg shadow-[#0066cc]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group">
                            <Zap className="w-3.5 h-3.5 fill-white group-hover:animate-pulse" /> Gerar Quotas Mensais
                        </button>
                    </form>
                    <button className="px-6 py-3 border border-[#d2d2d7] bg-white text-[#1d1d1f] rounded-full text-xs font-black shadow-sm hover:bg-[#f5f5f7] transition-all">
                        + Lançamento Manual
                    </button>
                </div>
            </div>

            {/* Financial Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="rounded-[32px] border-0 bg-[#1d1d1f] text-white shadow-2xl p-2">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center mb-1">
                            <CardTitle className="text-[10px] font-black text-[#86868b] uppercase tracking-[0.2em]">Saldo Consolidado</CardTitle>
                            <Wallet className="w-4 h-4 text-[#0066cc]" />
                        </div>
                        <p className="text-4xl font-black tracking-tight tabular-nums">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-1 w-full bg-[#1d1d1f] rounded-full mt-4 overflow-hidden border border-[#d2d2d7]/10">
                            <div className="h-full bg-[#0066cc] w-3/4" />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 col-span-2 gap-6">
                    <div className="bg-white p-8 rounded-[32px] border border-[#d2d2d7] shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <ArrowUpCircle className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#86868b]">Receitas (Mês)</span>
                        </div>
                        <p className="text-2xl font-black text-[#1d1d1f] tracking-tight">R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border border-[#d2d2d7] shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-rose-600">
                            <ArrowDownCircle className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#86868b]">Despesas (Mês)</span>
                        </div>
                        <p className="text-2xl font-black text-[#1d1d1f] tracking-tight">R$ {Math.abs(expenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-[#86868b]" />
                    <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest">Atividade Recente (Append-Only)</h3>
                </div>

                <div className="rounded-[28px] border border-[#d2d2d7] bg-white overflow-hidden shadow-apple">
                    <Table>
                        <TableHeader className="bg-[#f5f5f7]/50 border-b border-[#d2d2d7]">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="py-5 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">ID / Data</TableHead>
                                <TableHead className="py-5 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Descrição do Lançamento</TableHead>
                                <TableHead className="py-5 px-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest text-right">Valor Líquido</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ledgerEntries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-40 text-center text-[#86868b] font-medium italic">
                                        Nenhuma transação registrada no livro caixa.
                                    </TableCell>
                                </TableRow>
                            ) : ledgerEntries.map((entry) => (
                                <TableRow key={entry.id} className="border-b border-[#f5f5f7] last:border-0 hover:bg-[#f5f5f7]/30 transition-colors group">
                                    <TableCell className="py-6 px-8">
                                        <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest font-mono truncate w-32 mb-1">{entry.correlationId}</p>
                                        <p className="text-xs font-bold text-[#1d1d1f]">{new Date(entry.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </TableCell>
                                    <TableCell className="py-6 px-8">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-8 rounded-full ${entry.type === 'DEBIT' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                            <div>
                                                <p className="text-sm font-bold text-[#1d1d1f]">{entry.description}</p>
                                                <Badge className={`bg-transparent border-0 p-0 text-[9px] font-black uppercase tracking-widest mt-1 ${entry.type === 'DEBIT' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {entry.type === 'DEBIT' ? 'Despesa / Retirada' : 'Receita / Depósito'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <span className={`text-lg font-black tracking-tight ${Number(entry.amount) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {Number(entry.amount) < 0 ? '-' : '+'} R$ {Math.abs(Number(entry.amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
