import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Star, ShieldCheck, ArrowRight, Zap, Coffee, Sparkles } from "lucide-react"
import { createMarketplaceOrderAction, seedMarketplaceDemoAction } from "@/application/features/marketplace/marketplace.action"
import { revalidatePath } from "next/cache"

export default async function ResidentMarketplacePage() {
    const { contractId, user } = await requireTenantContext()

    const partners = await prisma.partner.findMany({
        where: { contractId, status: "ACTIVE" },
        include: { services: true }
    })

    const userUnit = await prisma.userUnit.findFirst({
        where: { userId: user.id, contractId }
    })

    return (
        <div className="p-6 space-y-10 animate-in fade-in duration-700">
            {/* Marketplace Header */}
            <div className="space-y-2">
                <Badge className="bg-[#0066cc]/10 text-[#0066cc] border-0 font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full">Kondor Services</Badge>
                <h2 className="text-4xl font-black tracking-tighter text-[#1d1d1f] leading-tight">Marketplace</h2>
                <p className="text-[#86868b] text-sm font-medium">Serviços premium curados pelo seu condomínio.</p>
            </div>

            {/* Quick Promo Carousel Mock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#000000] rounded-[32px] p-8 text-white flex flex-col justify-between h-64 border border-[#d2d2d7]/20 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#0066cc]/20 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#86868b]">Parceiro em Destaque</p>
                        <h3 className="text-3xl font-black tracking-tighter">Limpeza Express</h3>
                    </div>
                    <div className="flex justify-between items-end relative z-10">
                        <p className="text-xs font-medium text-[#86868b]">A partir de <br /><strong className="text-xl text-white tracking-tighter">R$ 80,00</strong></p>
                        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="bg-[#f5f5f7] rounded-[32px] p-8 text-[#1d1d1f] flex flex-col justify-between h-64 border border-[#d2d2d7] shadow-sm">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#86868b]">Benefício Morador</p>
                        <h3 className="text-3xl font-black tracking-tighter">10% de Cashback</h3>
                    </div>
                    <div className="pt-4 border-t border-[#d2d2d7]">
                        <p className="text-xs font-semibold leading-relaxed">Pague pelo App e receba crédito na próxima cota condominial.</p>
                    </div>
                </div>
            </div>

            {/* Services Sections */}
            <div className="space-y-12">
                {partners.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-[#d2d2d7] rounded-[48px] space-y-4">
                        <ShoppingBag className="w-12 h-12 text-[#86868b] mx-auto opacity-20" />
                        <p className="text-sm font-bold text-[#86868b]">O marketplace está sendo preparado.</p>
                        <form action={async () => {
                            "use server"
                            await seedMarketplaceDemoAction()
                            revalidatePath("/resident/marketplace")
                        }}>
                            <button className="px-6 py-2 bg-[#1d1d1f] text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                Ativar Parceiros Demo
                            </button>
                        </form>
                    </div>
                ) : partners.map((partner) => (
                    <div key={partner.id} className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[11px] font-black text-[#1d1d1f] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" /> {partner.name}
                            </h3>
                            <Badge className="bg-transparent text-[#86868b] border border-[#d2d2d7] font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                                {partner.category}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {partner.services.map((service) => (
                                <div key={service.id} className="bg-white border border-[#d2d2d7] rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between h-56">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-[#1d1d1f] tracking-tight">{service.name}</h4>
                                        <p className="text-[11px] font-medium text-[#86868b] leading-tight line-clamp-2">{service.description}</p>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-[#f5f5f7] pt-4 mt-auto">
                                        <div>
                                            <p className="text-[9px] font-black text-[#86868b] uppercase tracking-widest">Valor</p>
                                            <p className="text-lg font-black text-[#1d1d1f] tracking-tighter">R$ {Number(service.price).toFixed(2).replace('.', ',')}</p>
                                        </div>
                                        <form action={async () => {
                                            "use server"
                                            if (!userUnit) return
                                            await createMarketplaceOrderAction({
                                                serviceId: service.id,
                                                unitId: userUnit.unitId,
                                                totalAmount: Number(service.price),
                                                commissionValue: Number(service.price) * (Number(partner.commissionRate) / 100)
                                            })
                                            revalidatePath("/resident/marketplace")
                                        }}>
                                            <button className="w-10 h-10 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#1d1d1f] group-hover:bg-[#000000] group-hover:text-white transition-all shadow-sm">
                                                <Zap className="w-4 h-4 fill-current" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Satisfaction Banner */}
            <div className="p-8 bg-emerald-50 rounded-[40px] flex flex-col md:flex-row items-center gap-8 border border-emerald-100/50">
                <div className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h3 className="text-xl font-black text-[#1d1d1f] tracking-tight leading-tight">Garantia Kondor Care</h3>
                    <p className="text-sm font-medium text-[#86868b] max-w-xl">Todos os serviços contratados pelo marketplace possuem garantia de execução. Qualquer imprevisto, nós resolvemos por você.</p>
                </div>
                <button className="px-8 py-4 bg-[#1d1d1f] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10">Saber Mais</button>
            </div>
        </div>
    )
}
