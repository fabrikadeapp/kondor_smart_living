import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Vote } from "lucide-react"

export default async function ResidentAssembliesPage() {
    const { contractId } = await requireTenantContext()

    // Buscar assembleias que não são DRAFT (Visíveis para Moradores)
    const assemblies = await prisma.assembly.findMany({
        where: {
            contractId,
            status: { in: ['SCHEDULED', 'OPEN', 'CLOSED'] }
        },
        include: {
            polls: {
                include: {
                    votes: true
                }
            }
        },
        orderBy: { scheduledFor: "desc" }
    })

    return (
        <div className="space-y-6 pb-20 p-4">
            <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <h2 className="text-xl font-bold text-primary">Portal de Governança</h2>
                <p className="text-sm text-slate-500">Sua voz na gestão do condomínio.</p>
            </div>

            <div className="space-y-4">
                {assemblies.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-400 italic">Nenhuma assembleia ativa no momento.</p>
                    </div>
                ) : assemblies.map((assembly) => (
                    <Card key={assembly.id} className="border-slate-100 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center mb-2">
                                <Badge variant={assembly.status === 'OPEN' ? 'default' : 'secondary'} className={cn(
                                    "text-[10px] uppercase font-bold",
                                    assembly.status === 'OPEN' && "bg-emerald-500 hover:bg-emerald-600"
                                )}>
                                    {assembly.status === 'OPEN' ? 'Votação Aberta' : assembly.status}
                                </Badge>
                                {assembly.scheduledFor && (
                                    <div className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                        <CalendarIcon className="w-3 h-3" />
                                        {new Date(assembly.scheduledFor).toLocaleDateString('pt-BR')}
                                    </div>
                                )}
                            </div>
                            <CardTitle className="text-lg font-bold">{assembly.title}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2">{assembly.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Vote className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-600">{assembly.polls.length} itens para decisão</span>
                                </div>
                                <Button size="sm" className="h-8 text-[11px] font-bold">
                                    {assembly.status === 'OPEN' ? 'Votar Agora' : 'Ver Pauta'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
