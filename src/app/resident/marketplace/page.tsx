import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Handshake, Star, CreditCard } from "lucide-react"
import { purchaseServiceAction } from "@/application/features/marketplace/marketplace.action"
import { redirect } from "next/navigation"

export default async function ResidentMarketplacePage() {
    const { contractId, user } = await requireTenantContext()

    // 1. Buscar unidades do morador
    const userUnits = await prisma.userUnit.findMany({
        where: { contractId, userId: user.id },
        include: { unit: true }
    })

    const activeUnit = userUnits[0]?.unit

    // 2. Buscar parceiros e serviços ativos
    const partners = await prisma.partner.findMany({
        where: { contractId, status: "ACTIVE" },
        include: {
            services: {
                where: { status: "ACTIVE" }
            }
        }
    })

    const allServices = partners.flatMap(p => p.services.map(s => ({ ...s, partner: p })))

    return (
        <div className="p-4 space-y-6 pb-24 max-w-2xl mx-auto">
            <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold tracking-tight">Serviços Kondor</h2>
                    <p className="text-slate-400 text-sm mt-1">Benefícios exclusivos para moradores do seu condomínio.</p>

                    <div className="flex gap-2 mt-4">
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] font-bold">10% OFF</Badge>
                        <Badge className="bg-slate-700 hover:bg-slate-600 text-[10px] font-bold">Verificados</Badge>
                    </div>
                </div>
            </div>

            {!activeUnit && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-medium">
                    Atenção: Você precisa de uma unidade vinculada para contratar serviços.
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {allServices.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
                        <Handshake className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Nenhum serviço disponível ainda.</p>
                    </div>
                ) : allServices.map((service: any) => (
                    <Card key={service.id} className="overflow-hidden border-slate-100 hover:shadow-lg transition-all border-l-4 border-l-primary">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded">
                                    {service.partner.category}
                                </span>
                                <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                                    <Star className="w-3 h-3 fill-amber-500" /> 5.0
                                </div>
                            </div>
                            <CardTitle className="text-lg font-bold mt-2">{service.name}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2">{service.description || 'Profissional qualificado e verificado pelo condomínio.'}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Investimento</p>
                                    <p className="text-xl font-bold text-slate-800 tracking-tighter">R$ {service.price.toString()}</p>
                                </div>
                                <div className="text-[11px] text-slate-500 text-right">
                                    <p className="font-semibold text-slate-600">{service.partner.name}</p>
                                    <p className="flex items-center gap-1 justify-end"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Qualidade Kondor</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-3 bg-slate-50">
                            <form className="w-full" action={async () => {
                                "use server"
                                if (!activeUnit) return;
                                const result = await purchaseServiceAction({
                                    serviceId: service.id,
                                    unitId: activeUnit.id
                                })
                                if (result.checkoutUrl) {
                                    redirect(result.checkoutUrl)
                                }
                            }}>
                                <Button disabled={!activeUnit} className="w-full text-xs font-bold h-10 shadow-lg shadow-primary/10">
                                    <CreditCard className="mr-2 w-4 h-4" /> Contratar & Pagar
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
