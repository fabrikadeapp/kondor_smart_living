import { requireTenantContext } from "@/core/tenant/tenant-context"
import { Card, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"
import prisma from "@/infrastructure/db/prisma"
import Link from "next/link"

export default async function ResidentDashboardPage() {
    const { contractId, role, user } = await requireTenantContext()

    const activeUserUnits = await prisma.userUnit.findMany({
        where: {
            contractId,
            userId: user.id
        },
        include: {
            unit: true
        }
    })

    const activeContract = await prisma.contract.findUnique({
        where: { id: contractId }
    })

    const unitIds = activeUserUnits.map(uu => uu.unitId)
    const pendingDeliveries = await prisma.delivery.findMany({
        where: {
            unitId: { in: unitIds },
            status: { in: ['PENDING', 'NOTIFIED'] }
        }
    })

    return (
        <div className="p-4 space-y-4">
            <div className="pt-2 pb-4 border-b">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Olá, {user.name?.split(' ')[0]}!
                </h2>
                <p className="text-sm text-slate-500">
                    Você está visualizando <strong className="text-primary">{activeContract?.tradeName || activeContract?.legalName}</strong>
                </p>
            </div>

            {pendingDeliveries.length > 0 && (
                <Link href="/resident/deliveries" className="block">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between animate-pulse hover:bg-emerald-100 transition-colors">
                        <div>
                            <p className="text-sm font-bold text-emerald-800">
                                {pendingDeliveries.length === 1 ? 'Há 1 pacote te esperando!' : `Há ${pendingDeliveries.length} pacotes te esperando!`}
                            </p>
                            <p className="text-[10px] text-emerald-600">Retirada na portaria principal.</p>
                        </div>
                        <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                </Link>
            )}

            <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 text-sm uppercase px-1">Tipos de Acesso</h3>
                {activeUserUnits.length > 0 ? (
                    activeUserUnits.map((uu) => (
                        <Card key={uu.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="font-medium text-slate-700">Unidade {uu.unit.number}</div>
                                <div className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-tight">
                                    {uu.relationshipType}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center text-sm text-slate-500">
                            {role === 'ADMIN' ? (
                                <>Administrador do Sistema</>
                            ) : (
                                <>Nenhuma unidade vinculada.</>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="mt-8 flex flex-col gap-3">
                    <h3 className="font-semibold text-slate-700 text-sm uppercase px-1 mb-2">Transparência Financeira</h3>
                    <Card className="bg-slate-900 text-white overflow-hidden group border-0 shadow-lg shadow-slate-200">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saúde do Prédio</p>
                                <p className="text-sm font-medium">Veja onde seu condomínio investe.</p>
                            </div>
                            <Link href="/admin/reports/transparency" className="h-9 px-4 bg-primary text-[11px] font-bold rounded-lg flex items-center hover:bg-primary/90 transition-all">
                                Explorar
                            </Link>
                        </CardContent>
                    </Card>

                    <h3 className="font-semibold text-slate-700 text-sm uppercase px-1 mb-2 mt-4">Fatura Atual</h3>
                    <Card className="border-l-4 border-l-amber-500 shadow-sm">
                        <CardContent className="p-4 space-y-1">
                            <p className="font-bold text-lg leading-none text-slate-800 tracking-tight">R$ 0,00</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase">Vencimento: Dia 05</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
