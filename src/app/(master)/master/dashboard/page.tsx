import { requireGlobalContext } from "@/core/tenant/tenant-context"
import { Badge } from "@/components/ui/badge"
import { PieChart, Users, Building, Percent, TrendingUp } from "lucide-react"

export default async function MasterDashboardPage() {
    await requireGlobalContext()

    return (
        <div className="space-y-10">
            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter text-[#1d1d1f] leading-tight flex items-center gap-2">
                    <PieChart className="w-8 h-8 text-[#0066cc]" /> Condo Lab Overview
                </h2>
                <p className="text-[#86868b] text-sm font-medium">Analytics agregados de toda a rede Kondor Smart Living.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Vendas Totais", value: "R$ 14.280", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Condomínios", value: "12", icon: Building, color: "text-[#0066cc]", bg: "bg-blue-50" },
                    { label: "Unit Growth", value: "+14.2%", icon: Percent, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "SuperAdmins", value: "3", icon: Users, color: "text-slate-500", bg: "bg-slate-50" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[18px] border border-[#d2d2d7] shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-black text-[#1d1d1f] tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-10 rounded-[28px] border border-[#d2d2d7] shadow-apple flex flex-col items-center justify-center text-center space-y-4 h-[300px]">
                    <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#1d1d1f]">
                        <PieChart className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-[#86868b] text-sm font-medium italic">Gráficos de dispersão de receita por plano em breve no v1.1</p>
                </div>

                <div className="bg-white p-10 rounded-[28px] border border-[#d2d2d7] shadow-apple space-y-6">
                    <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest flex items-center gap-2">
                        Atividades Master Recentes
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-[#f5f5f7] last:border-0">
                                <div className="w-2 h-2 rounded-full bg-[#0066cc] mt-1.5" />
                                <div>
                                    <p className="text-xs font-bold text-[#1d1d1f]">Novo plano 'Silver' versionado em Condo Lab.</p>
                                    <p className="text-[10px] text-[#86868b]">Há poucas horas.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
