import { requireTenantContext } from "@/core/tenant/tenant-context"
import { Card, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"
import prisma from "@/infrastructure/db/prisma"

export default async function ResidentDashboardPage() {
    // A barreira do Multi-Tenant App View
    // Injeta forçadamente isso ou barra a página.
    const { contractId, role, user } = await requireTenantContext()

    // Neste cenário real, buscaremos os dados apenas das propriedades (Units)
    // em que este User está mapeado como Owner ou Tenant:
    const activeUserUnits = await prisma.userUnit.findMany({
        where: {
            contractId,
            userId: user.id
        },
        include: {
            unit: true
        }
    })

    // Retorna os Nomes Legais para exibir
    const activeContract = await prisma.contract.findUnique({
        where: { id: contractId }
    })

    // Buscar entregas pendentes para as unidades do morador
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

            {/* Alerta de Encomenda (Epic 4 finishing) */}
            {pendingDeliveries.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between animate-pulse">
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
            )}

            <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 text-sm uppercase px-1">Tipos de Acesso</h3>
                ...

                {activeUserUnits.length > 0 ? (
                    activeUserUnits.map((uu) => (
                        <Card key={uu.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="font-medium">Unidade {uu.unit.number}</div>
                                <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-semibold uppercase">
                                    {uu.relationshipType}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center text-sm text-slate-500">
                            {role === 'ADMIN' ? (
                                <>Você é Síndico aqui, mas nenhuma unidade está associada a você como morador diretamente.</>
                            ) : (
                                <>Nenhuma unidade vinculada ao seu usuário ainda. Fale com o Síndico.</>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="mt-8">
                    <h3 className="font-semibold text-slate-700 text-sm uppercase px-1 mb-2">Fatura Atual</h3>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4 space-y-1">
                            <p className="font-medium text-lg leading-none">R$ 0,00</p>
                            <p className="text-xs text-slate-500">Fechamento: Dia 05</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
