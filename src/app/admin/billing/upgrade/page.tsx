import { getSubscriptionDataAction, upgradePlanAction } from "@/application/features/billing/billing.action"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowRight, Zap, ShieldCheck, Sparkles } from "lucide-react"
import { redirect } from "next/navigation"

export default async function UpgradePage() {
    const { currentPlan, allPlans } = await getSubscriptionDataAction()

    if (!currentPlan && allPlans.length > 0) {
        // Fallback para caso o contrato não tenha plano definido (primeiro acesso)
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header com Estética Apple */}
            <div className="text-center space-y-4 max-w-2xl mx-auto mt-10">
                <Badge className="bg-[#0066cc]/10 text-[#0066cc] border-0 font-bold uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full ring-1 ring-[#0066cc]/20">
                    Sua Assinatura
                </Badge>
                <h1 className="text-5xl font-black tracking-tighter text-[#1d1d1f] leading-tight">
                    Escolha o futuro do seu condomínio.
                </h1>
                <p className="text-[#86868b] text-lg font-medium leading-relaxed">
                    Desbloqueie ferramentas avançadas de BI, automação financeira e gestão de staff.
                </p>
            </div>

            {/* Grid de Planos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {allPlans.map((plan: any) => {
                    const isCurrent = currentPlan?.id === plan.id
                    const isGold = plan.name.toLowerCase().includes('gold')
                    const isSilver = plan.name.toLowerCase().includes('silver')

                    return (
                        <Card
                            key={plan.id}
                            className={`relative border-0 rounded-[32px] overflow-hidden transition-all duration-500 shadow-apple hover:shadow-apple-hover hover:-translate-y-2 flex flex-col ${isCurrent ? 'ring-4 ring-[#0066cc] ring-offset-4' : ''} ${isGold ? 'bg-[#1d1d1f] text-white shadow-2xl' : 'bg-white text-[#1d1d1f]'}`}
                        >
                            {plan.badge && (
                                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isGold ? 'bg-[#0066cc] text-white' : 'bg-[#f5f5f7] text-[#86868b]'}`}>
                                    {plan.badge}
                                </div>
                            )}

                            <CardHeader className="p-10 pb-6 border-b border-[#d2d2d7]/20">
                                <div className="flex items-center gap-3 mb-4">
                                    {isGold ? <Sparkles className="w-6 h-6 text-amber-400" /> : isSilver ? <Zap className="w-6 h-6 text-[#0066cc]" /> : <ShieldCheck className="w-6 h-6 text-[#86868b]" />}
                                    <CardTitle className="text-2xl font-black tracking-tight uppercase">{plan.name.split(' ')[0]}</CardTitle>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black">R$ {Number(plan.basePrice).toFixed(0)}</span>
                                    <span className={`text-sm font-bold opacity-60`}>/mês</span>
                                </div>
                                <p className={`text-sm mt-4 font-medium opacity-70`}>Base para condomínios padrão.</p>
                            </CardHeader>

                            <CardContent className="p-10 flex-1 space-y-5">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">O que está incluído:</p>
                                <ul className="space-y-4">
                                    {plan.planFeatures.map((pf: any) => (
                                        <li key={pf.id} className="flex items-start gap-3">
                                            <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${isGold ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                                <Check className="w-3.5 h-3.5 stroke-[4]" />
                                            </div>
                                            <span className="text-sm font-semibold tracking-tight leading-tight">{pf.feature.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="p-10 pt-0">
                                {isCurrent ? (
                                    <button disabled className="w-full py-4 bg-[#f5f5f7] text-[#86868b] rounded-2xl text-sm font-black uppercase tracking-widest cursor-default">
                                        Plano Atual
                                    </button>
                                ) : (
                                    <form action={async () => {
                                        "use server"
                                        await upgradePlanAction(plan.id)
                                        redirect("/admin/dashboard")
                                    }} className="w-full">
                                        <button
                                            type="submit"
                                            className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${isGold ? 'bg-[#0066cc] text-white shadow-lg shadow-[#0066cc]/40 hover:bg-[#0052a3]' : 'bg-[#1d1d1f] text-white hover:bg-black shadow-lg shadow-black/10'}`}
                                        >
                                            Migrar Agora <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </form>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {/* Banner Informativo */}
            <div className="max-w-4xl mx-auto p-8 rounded-[24px] bg-white border border-[#d2d2d7] shadow-sm flex items-center gap-8 ring-1 ring-[#f5f5f7]">
                <div className="w-20 h-20 shrink-0 bg-[#f5f5f7] rounded-3xl flex items-center justify-center text-[#1d1d1f]">
                    <Sparkles className="w-10 h-10 opacity-30" />
                </div>
                <div>
                    <h4 className="text-xl font-black tracking-tight">Precisa de algo sob medida?</h4>
                    <p className="text-[#86868b] text-sm font-medium">Para condomínios acima de 500 unidades, oferecemos taxas customizadas de faturamento. Fale com nosso suporte em Condo Lab.</p>
                </div>
                <button className="ml-auto px-6 py-3 border border-[#d2d2d7] rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#f5f5f7] transition-all">
                    Suporte
                </button>
            </div>
        </div>
    )
}
