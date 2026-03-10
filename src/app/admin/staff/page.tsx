import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Users, UserPlus, CreditCard, ShieldCheck } from "lucide-react"
import { executePayrollAction } from "@/application/features/staff/staff.action"

export default async function AdminStaffPage() {
    const { contractId } = await requireTenantContext()

    // Buscar todos os funcionários do condomínio
    const employees = await prisma.employee.findMany({
        where: { contractId },
        orderBy: { createdAt: "desc" }
    })

    const totalPayroll = employees.reduce((acc, curr) => acc + Number(curr.salary), 0)

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Gestão de Equipe & Staff</h2>
                    <p className="text-slate-500 text-sm">Controle de funcionários, cargos e pagamentos de folha.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="font-semibold shadow-sm">
                        <UserPlus className="mr-2 w-4 h-4" /> Novo Funcionário
                    </Button>

                    <form action={executePayrollAction}>
                        <Button className="font-semibold shadow-lg bg-emerald-600 hover:bg-emerald-700">
                            <CreditCard className="mr-2 w-4 h-4" /> Rodar Folha de Pagamento
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="py-4">
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary">Equipe Ativa</CardDescription>
                        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" /> {employees.length} Colaboradores
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-slate-900 text-white">
                    <CardHeader className="py-4">
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Mensal (Folha)</CardDescription>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" /> R$ {totalPayroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {employees.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Nenhum colaborador cadastrado ainda.</p>
                    </div>
                ) : employees.map((employee) => (
                    <Card key={employee.id} className="border-slate-100 hover:shadow-md transition-all">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="text-[10px] text-primary border-primary/20 bg-primary/5">
                                    {employee.role}
                                </Badge>
                                <div className="flex items-center text-[10px] font-bold text-slate-400 tracking-tight">
                                    <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-500" /> {employee.isInternal ? 'Condomínio' : 'Terceirizado'}
                                </div>
                            </div>
                            <CardTitle className="text-lg font-bold mt-2">{employee.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end border-t border-slate-50 pt-2">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Remuneração Base</p>
                                    <p className="text-lg font-bold text-slate-800 tracking-tight">R$ {employee.salary.toString()}</p>
                                </div>
                                <div className="text-[10px] text-slate-500 text-right">
                                    <p className="font-semibold text-slate-600">Ativo ✅</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-3 bg-slate-50">
                            <Button variant="secondary" className="w-full text-xs font-bold h-9">
                                Ver Histórico
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
