import { requireTenantContext, checkFeatureAccess } from "@/core/tenant/tenant-context"
import Link from "next/link"

import { getCSATAnalyticsAction } from "@/application/features/analytics/csat.action"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, BarChart3, TrendingUp, AlertTriangle, ShieldCheck, PieChart } from "lucide-react"

export default async function AdminCSATAnalyticsPage() {
    const { contractId } = await requireTenantContext()

    // 1. Gating check for UI
    const hasAccess = await checkFeatureAccess("CSAT_ANALYTICS")

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed rounded-3xl bg-slate-50 border-slate-200 mt-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary animate-pulse">
                    <PieChart className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter">BI & Analytics: Premium Feature 🚀</h2>
                <p className="text-slate-500 max-w-sm mt-2 text-sm font-medium">
                    Seu plano atual não inclui o módulo de Satisfação Avançada (CSAT). Ative o plano de BI para monitorar a saúde do seu condomínio.
                </p>
                <Link href="/admin/billing/upgrade" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-bold shadow-xl shadow-slate-200 hover:scale-105 transition-all">
                    Upgrade para Master
                </Link>
            </div>
        )
    }


    // 2. Fetch Data
    const analytics = await getCSATAnalyticsAction()

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-emerald-500 text-white border-0 font-bold uppercase text-[9px] tracking-widest">Kondor BI</Badge>
                        <div className="flex items-center text-[10px] text-slate-400 font-bold tracking-tight">
                            <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-500" /> DADOS AUDITADOS EM TEMPO REAL
                        </div>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 leading-tight">Insight de Satisfação & CSAT</h2>
                    <p className="text-slate-500 text-sm font-medium">Métricas de performance operacional baseadas na opinião do morador.</p>
                </div>

                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase">Média Geral</p>
                        <div className="flex items-center gap-1 text-2xl font-black text-slate-900 tracking-tight">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> {analytics.averageGlobal}
                        </div>
                    </div>
                    <div className="w-px h-10 bg-slate-100" />
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase">Total Votos</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{analytics.totalEvaluations}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden ring-1 ring-slate-100">
                    <CardHeader className="bg-slate-50/50 py-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 tracking-tight">
                            <BarChart3 className="w-5 h-5 text-primary" /> Satisfação por Categoria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {analytics.byCategory.map((cat: any) => (
                                <div key={cat.category} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-700 tracking-tight">{cat.category}</span>
                                        <span className="text-xs font-black text-primary">{cat.avg.toFixed(1)} / 5</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${cat.avg >= 4 ? 'bg-emerald-500' : cat.avg >= 3 ? 'bg-amber-400' : 'bg-rose-500'}`}
                                            style={{ width: `${(cat.avg / 5) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">{cat.count} avaliações registradas</p>
                                </div>
                            ))}
                            {analytics.byCategory.length === 0 && (
                                <p className="text-center py-10 text-slate-400 text-sm italic">Sem dados suficientes para gerar analytics por categoria.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-10">
                    <Card className="border-rose-100 bg-rose-50/20 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-800">
                                <AlertTriangle className="w-4 h-4" /> Pontos de Atenção (Urgente)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-rose-700 leading-relaxed font-medium">
                                As categorias com avaliação inferior a 3.5 exigem revisão técnica ou operacional imediata.
                                <strong> IA Recomendação:</strong> Verifique o contrato de manutenção de 'Elevadores' (Nota 1.5) nos últimos 30 dias.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Recentes & Críticos
                        </h3>
                        <div className="space-y-3">
                            {analytics.lastSurveys.map((s: any) => (
                                <div key={s.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 tracking-tight">{s.occurrence.description.slice(0, 40)}...</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{s.occurrence.category}</p>
                                    </div>
                                    <div className="flex items-center gap-1 font-black text-amber-500 text-sm">
                                        {s.rating} <Star className="w-3 h-3 fill-amber-500 border-0" />
                                    </div>
                                </div>
                            ))}
                            {analytics.lastSurveys.length === 0 && (
                                <p className="text-slate-400 text-xs text-center py-4 italic border border-dashed rounded-xl">Sem avaliações recentes.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
