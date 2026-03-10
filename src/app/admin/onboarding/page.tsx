import { Metadata } from "next"
import { OnboardingWizard } from "./components/onboarding-wizard"

export const metadata: Metadata = {
    title: "Onboarding | Kondor Smart Living",
    description: "Configure seu novo condomínio em poucos segundos.",
}

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuração Inicial</h1>
                <p className="text-slate-500 mt-2">Bem-vindo à Kondor. Vamos montar sua estrutura.</p>
            </div>
            <OnboardingWizard />
        </div>
    )
}
