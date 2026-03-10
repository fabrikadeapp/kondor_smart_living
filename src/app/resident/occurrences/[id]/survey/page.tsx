import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Star, MessageSquareQuote, CheckSquare } from "lucide-react"
import Link from "next/link"

export default async function ResidentOccurrenceSurveyPage({ params }: { params: Promise<{ id: string }> }) {
    const { contractId, user } = await requireTenantContext()
    const { id } = await params

    // 1. Buscar a Ocorrência e verificar se já foi avaliada
    const occurrence = await prisma.occurrence.findUnique({
        where: { id, contractId },
        include: { survey: true } as any
    })

    // 2. Fallbacks de segurança
    if (!occurrence) throw new Error("Ocorrência não encontrada.")

    const survey = (occurrence as any).survey

    if (survey) {
        return (
            <div className="p-10 text-center space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckSquare className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold">Avaliação Concluída!</h2>
                <p className="text-slate-500 text-sm italic">Sua nota: {survey.rating} / 5 ⭐</p>
                <Link href="/resident/dashboard" className="mt-4 px-6 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all inline-block">
                    Voltar Home
                </Link>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-6 max-w-md mx-auto">
            <div className="space-y-1">
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 mb-2 font-bold text-[10px]">CHAMADO RESOLVIDO</Badge>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-tight">Como foi o atendimento?</h1>
                <p className="text-slate-500 text-sm font-medium">Sua opinião é fundamental para a governança do condomínio.</p>
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/50">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Referência Chamado</CardDescription>
                    <CardTitle className="text-sm font-bold text-slate-700">{(occurrence as any).description}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    <div className="space-y-4">
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecione uma nota</p>
                        <div className="flex justify-between items-center gap-2 max-w-[280px] mx-auto">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <form key={star} action={async () => {
                                    "use server"
                                    const { createSatisfactionSurveyAction } = await import("@/application/features/occurrences/surveys.action")
                                    await createSatisfactionSurveyAction({
                                        occurrenceId: id,
                                        rating: star
                                    })
                                }}>
                                    <button type="submit" className="group flex flex-col items-center gap-1">
                                        <div className="w-12 h-12 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center group-hover:bg-amber-50 group-hover:border-amber-400 group-hover:scale-110 active:scale-95 transition-all shadow-sm">
                                            <Star className="w-6 h-6 text-slate-200 group-hover:text-amber-500 group-hover:fill-amber-500 transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-700 uppercase">{star}</span>
                                    </button>
                                </form>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50 flex items-start gap-4">
                        <div className="h-4 w-4 rounded-full bg-slate-200 mt-1 shrink-0" />
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            <strong>Privacidade:</strong> Sua avaliação será compartilhada com a administração para fins de gestão operacional e melhoria dos serviços.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-tighter">
                        <MessageSquareQuote className="w-4 h-4" /> Qualidade Kondor Certified
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
