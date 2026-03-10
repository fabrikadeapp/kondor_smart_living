import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle2, MapPin } from "lucide-react"
import { retrieveDeliveryAction } from "@/application/features/concierge/deliveries.action"
import { revalidatePath } from "next/cache"

export default async function AdminDeliveriesPage() {
    const { contractId } = await requireTenantContext()

    // Buscar entregas que não foram ainda retiradas
    const deliveries = await prisma.delivery.findMany({
        where: { contractId, status: { in: ['PENDING', 'NOTIFIED'] } },
        include: {
            unit: true
        },
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Portaria & Encomendas</h2>
                    <p className="text-slate-500 text-sm">Controle de recebimento e entrega de volumes aos moradores.</p>
                </div>

                <Button className="font-semibold shadow-lg shadow-primary/10">
                    <Package className="mr-2 w-4 h-4" /> Registrar Volume
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="py-4 px-5">
                        <CardTitle className="text-sm font-medium text-slate-500">Volumes na Portaria</CardTitle>
                        <p className="text-2xl font-bold text-primary">{deliveries.length}</p>
                    </CardHeader>
                </Card>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-bold">Unidade</TableHead>
                            <TableHead className="font-bold">Descrição</TableHead>
                            <TableHead className="font-bold">Data Recebimento</TableHead>
                            <TableHead className="font-bold text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deliveries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                                    Nenhum volume pendente de retirada.
                                </TableCell>
                            </TableRow>
                        ) : deliveries.map((delivery) => (
                            <TableRow key={delivery.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-bold text-slate-700">{delivery.unit?.block || ''} / {delivery.unit?.number}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm font-medium">{delivery.description}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{delivery.trackingCode || 'Sem rastreio'}</p>
                                </TableCell>
                                <TableCell className="text-xs text-slate-500">
                                    {new Date(delivery.createdAt).toLocaleString('pt-BR')}
                                </TableCell>
                                <TableCell className="text-center">
                                    <form action={async () => {
                                        "use server"
                                        await retrieveDeliveryAction(delivery.id)
                                    }}>
                                        <Button size="sm" variant="ghost" className="text-emerald-600 font-bold hover:bg-emerald-50 h-8">
                                            <CheckCircle2 className="mr-1 w-3.5 h-3.5" /> Confirmar Entrega
                                        </Button>
                                    </form>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
