import { getCondoLabData, upsertPlanAction } from "@/application/features/master/plans.action"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

import { Star, Package, Check, ArrowRight, Settings2 } from "lucide-react"

export default async function MasterPlansPage() {
    const { plans, features } = await getCondoLabData()

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <Badge className="bg-[#0066cc] text-white border-0 font-bold uppercase text-[9px] tracking-widest mb-2 px-3 py-1">Condo Lab v1.0</Badge>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1d1d1f] leading-tight">Gestão de Planos & Monetização</h2>
                    <p className="text-[#86868b] text-sm font-medium mt-1">Configure os pacotes de venda do Kondor Smart Living.</p>
                </div>
                <button className="px-6 py-2 bg-[#0066cc] text-white rounded-full text-xs font-black shadow-lg shadow-[#0066cc]/20 hover:scale-105 transition-all flex items-center gap-2">
                    Novo Plano <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan: any) => (
                    <Card key={plan.id} className="border-[#d2d2d7] shadow-apple hover:shadow-apple-hover transition-all rounded-[18px] bg-white overflow-hidden group">
                        <CardHeader className="bg-[#f5f5f7]/50 border-b border-[#d2d2d7] py-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">{plan.badge || 'ESTÁNDAR'}</span>
                                <Settings2 className="w-4 h-4 text-[#d2d2d7] group-hover:text-[#0066cc] transition-colors cursor-pointer" />
                            </div>
                            <CardTitle className="text-xl font-black text-[#1d1d1f] tracking-tight">{plan.name}</CardTitle>
                            <div className="mt-2">
                                <span className="text-3xl font-black text-[#1d1d1f]">R$ {Number(plan.basePrice).toFixed(0)}</span>
                                <span className="text-xs font-bold text-[#86868b] ml-1">/mês</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-[11px] font-black text-[#86868b] uppercase tracking-widest mb-4">Funcionalidades Ativas</p>
                            <div className="space-y-3">
                                {features.map((feature: any) => {
                                    const isChecked = plan.planFeatures.some((pf: any) => pf.featureId === feature.id)
                                    return (
                                        <div key={feature.id} className="flex items-center gap-3">
                                            <form action={async () => {
                                                "use server"
                                                // Lógica de toggle simplificada para demo
                                                const featureIds = plan.planFeatures.map((pf: any) => pf.featureId)
                                                const newFeatureIds = isChecked
                                                    ? featureIds.filter((id: string) => id !== feature.id)
                                                    : [...featureIds, feature.id]

                                                await upsertPlanAction({
                                                    id: plan.id,
                                                    name: plan.name,
                                                    basePrice: Number(plan.basePrice),
                                                    billingCycle: plan.billingCycle,
                                                    featureIds: newFeatureIds
                                                })
                                            }}>
                                                <button
                                                    type="submit"
                                                    className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${isChecked ? 'bg-[#0066cc] border-[#0066cc] text-white shadow-sm' : 'border-[#d2d2d7] bg-white group-hover:border-[#86868b]'}`}
                                                >
                                                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                                                </button>
                                            </form>
                                            <span className={`text-[13px] font-medium leading-tight ${isChecked ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>{feature.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-[#f5f5f7]/30 border-t border-[#d2d2d7] p-4">
                            <button className="w-full text-[10px] font-black text-[#86868b] uppercase tracking-widest hover:text-[#0066cc] transition-colors">
                                Ver Tabela de Unidades
                            </button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Visual Feedback de Segurança */}
            <div className="p-6 bg-white border border-[#d2d2d7] rounded-[18px] flex items-center gap-6 shadow-sm">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                    <Star className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#1d1d1f]">Master Control Mode Active</p>
                    <p className="text-xs text-[#86868b]">Todas as alterações aqui propagam instantaneamente para os novos contratos e renovações de assinatura.</p>
                </div>
            </div>
        </div>
    )
}
