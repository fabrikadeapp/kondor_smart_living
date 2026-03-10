import { requireTenantContext } from "@/core/tenant/tenant-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import prisma from "@/infrastructure/db/prisma"

export default async function AdminDashboardPage() {
    // A barreira do Multi-Tenant - "Hard Boundary"
    // Exigência 3.1: Injeta forçadamente isso ou barra a página.
    const { contractId, role, user } = await requireTenantContext()

    // Simulating fetching a specific Contract info
    const activeContract = await prisma.contract.findUnique({
        where: { id: contractId }
    })

    // Exemplo Prático do Multi-Tenant Enforced na query:
    const activeUnitsCount = await prisma.unit.count({
        where: { contractId } // NUNCA deve faltar esta linha
    })

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Bem-vindo, Síndico!
            </h2>
            <p className="text-slate-600">
                Você está visualizando os dados restritos ao condomínio
                <strong className="text-primary italic ml-2">"{activeContract?.tradeName || contractId}"</strong>.
                Suas permissões locais aqui carregaram como <strong className="text-amber-600">{role}</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-slate-500 font-medium pb-2">Unidades Ativas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{activeUnitsCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-slate-500 font-medium pb-2">Boletos em Aberto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">R$ 0,00</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-slate-500 font-medium pb-2">Ocorrências Agrupadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">0</p>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
