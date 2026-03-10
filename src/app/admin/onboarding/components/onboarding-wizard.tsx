"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Building2, Home, CreditCard, ChevronRight, ChevronLeft, Check, Search, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { setupCondoAction } from "@/application/features/onboarding/onboarding.action"

const setupSchema = z.object({
    // Step 1: Info Básica
    tradeName: z.string().min(3, "Nome Fantasia é obrigatório"),
    legalName: z.string().min(5, "Razão Social é obrigatória"),
    cnpj: z.string().min(14, "CNPJ inválido"),

    // Endereço
    cep: z.string().min(8, "CEP inválido"),
    address: z.string().min(5, "Endereço obrigatório"),
    number: z.string().min(1, "Número obrigatório"),
    city: z.string(),
    state: z.string(),

    // Step 2: Estrutura
    blockName: z.string().min(1, "Nome do bloco é obrigatório"),
    floors: z.number().min(1).max(100),
    unitsPerFloor: z.number().min(1).max(50),
})

type SetupFormData = z.infer<typeof setupSchema>

export function OnboardingWizard() {
    const [step, setStep] = useState(1)
    const [isSearchingCep, setIsSearchingCep] = useState(false)
    const router = useRouter()

    const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<SetupFormData>({
        resolver: zodResolver(setupSchema),
        mode: "onChange",
        defaultValues: {
            blockName: "Bloco A",
            floors: 1,
            unitsPerFloor: 4
        }
    })

    const cepValue = watch("cep")
    const floors = watch("floors")
    const unitsPerFloor = watch("unitsPerFloor")
    const totalUnits = (floors || 0) * (unitsPerFloor || 0)

    // Auto-busca CEP (Frictionless UX)
    const lookupCep = async () => {
        if (cepValue?.length >= 8) {
            setIsSearchingCep(true)
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cepValue.replace(/\D/g, '')}/json/`)
                const data = await res.json()
                if (!data.erro) {
                    setValue("address", data.logradouro)
                    setValue("city", data.localidade)
                    setValue("state", data.uf)
                }
            } catch (e) {
                console.error("Erro busca CEP", e)
            } finally {
                setIsSearchingCep(false)
            }
        }
    }

    const onSubmit = async (data: SetupFormData) => {
        try {
            await setupCondoAction({
                ...data,
                blocks: [{ name: data.blockName, floors: data.floors, unitsPerFloor: data.unitsPerFloor }]
            })
            router.push("/admin/dashboard")
            router.refresh()
        } catch (e) {
            console.error(e)
            alert("Erro ao criar condomínio. Tente novamente.")
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            {/* Stepper Visual */}
            <div className="mb-10">
                <div className="flex justify-between mb-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                step >= s ? "bg-primary border-primary text-white" : "border-slate-200 text-slate-400 bg-white"
                            )}>
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </div>
                            <span className={cn(
                                "text-xs font-semibold uppercase tracking-wider",
                                step >= s ? "text-primary" : "text-slate-400"
                            )}>
                                {s === 1 ? "Empresa" : s === 2 ? "Estrutura" : "Finalizar"}
                            </span>
                        </div>
                    ))}
                </div>
                <Progress value={(step / 3) * 100} className="h-1" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {step === 1 && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    Dados do Condomínio
                                </CardTitle>
                                <CardDescription>Informações legais para faturamento e Asaas.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nome Fantasia (Trade Name)</Label>
                                        <Input {...register("tradeName")} placeholder="Ex: Condomínio Solar" />
                                        {errors.tradeName && <p className="text-xs text-red-500">{errors.tradeName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CNPJ</Label>
                                        <Input {...register("cnpj")} placeholder="00.000.000/0000-00" />
                                        {errors.cnpj && <p className="text-xs text-red-500">{errors.cnpj.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Razão Social</Label>
                                    <Input {...register("legalName")} placeholder="Ex: CONDOMINIO RESIDENCIAL SOLAR LTDA" />
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1 space-y-2">
                                            <Label>CEP (Busca Automática)</Label>
                                            <Input {...register("cep")} onBlur={lookupCep} placeholder="00000-000" />
                                        </div>
                                        <Button type="button" variant="outline" size="icon" onClick={lookupCep} disabled={isSearchingCep}>
                                            {isSearchingCep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-3 space-y-2">
                                            <Label>Rua/Logradouro</Label>
                                            <Input {...register("address")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nº</Label>
                                            <Input {...register("number")} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="button" onClick={() => setStep(2)}>
                                    Próximo <ChevronRight className="ml-2 w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Home className="w-5 h-5 text-primary" />
                                    Geração de Unidades
                                </CardTitle>
                                <CardDescription>Defina como seu condomínio é organizado.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Total Estimado</p>
                                        <p className="text-2xl font-bold text-primary">{totalUnits} Unidades</p>
                                    </div>
                                    <p className="text-xs text-slate-500 text-right max-w-[120px]">
                                        Serão criadas {unitsPerFloor} unidades por andar automaticamente.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nome do Bloco/Torre</Label>
                                        <Input {...register("blockName")} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Quantidade de Andares</Label>
                                            <Input type="number" {...register("floors")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Unidades por Andar</Label>
                                            <Input type="number" {...register("unitsPerFloor")} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                    <ChevronLeft className="mr-2 w-4 h-4" /> Voltar
                                </Button>
                                <Button type="button" onClick={() => setStep(3)}>
                                    Próximo <ChevronRight className="ml-2 w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <Card className="border-primary border-2 shadow-xl shadow-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Resumo e Ativação
                                </CardTitle>
                                <CardDescription>Confirme os dados para iniciar o TRIAL de 14 dias.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-md space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">Nome:</span> <strong>{watch("tradeName")}</strong></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Endereço:</span> <strong>{watch("address")}, {watch("number")}</strong></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Estrutura:</span> <strong>{totalUnits} Unidades (Bloco {watch("blockName")})</strong></div>
                                </div>
                                <div className="p-4 border-2 border-dashed rounded-md text-center bg-emerald-50 border-emerald-200">
                                    <p className="text-emerald-700 font-bold">Plano Business (V1)</p>
                                    <p className="text-xs text-emerald-600">Ativação automática do motor de faturamento Ledger.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button type="submit" className="w-full h-12 text-lg">
                                    🚀 Ativar Condomínio agora
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                                    Corrigir Estrutura
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </form>
        </div>
    )
}
