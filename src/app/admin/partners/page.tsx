import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Handshake, TrendingUp, Users } from "lucide-react"

export default async function AdminPartnersPage() {
    const { contractId } = await requireTenantContext()

    const partners = await prisma.partner.findMany({
        where: { contractId },
        include: { services: true }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Parceiros & Marketplace</h2>
                    <p className="text-slate-500 text-sm">Gerencie empresas prestadoras de serviço e acompanhe suas comissões.</p>
                </div>

                <Button className="font-semibold shadow-lg">
                    <Handshake className="mr-2 w-4 h-4" /> Novo Parceiro
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {partners.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Nenhum parceiro cadastrado.</p>
                    </div>
                ) : partners.map((partner) => (
                    <Card key={partner.id} className="border-slate-100 hover:shadow-md transition-all">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                                    {partner.category}
                                </Badge>
                                <div className="flex items-center text-xs font-bold text-emerald-600">
                                    <TrendingUp className="w-3 h-3 mr-1" /> {partner.commissionRate.toString()}% Fee
                                </div>
                            </div>
                            <CardTitle className="text-lg font-bold mt-2">{partner.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-slate-500">
                                {partner.services.length} serviços oferecidos no marketplace.
                            </p>
                            <div className="mt-3 space-y-1">
                                {partner.services.slice(0, 2).map(s => (
                                    <div key={s.id} className="text-[11px] text-slate-600 py-1 border-b border-slate-50 flex justify-between">
                                        <span>{s.name}</span>
                                        <span className="font-bold">R$ {s.price.toString()}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="secondary" className="w-full text-xs font-bold h-9">
                                Ver Performance
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
