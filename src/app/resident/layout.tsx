import { ReactNode } from "react"
import { Building, WalletCards, Wrench } from "lucide-react"
import { TenantSwitcher } from "@/components/tenant-switcher"

export default function ResidentLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* App Header */}
            <header className="h-16 flex items-center justify-between px-4 border-b bg-white sticky top-0 z-10">
                <div className="font-semibold text-lg text-slate-800">
                    Kondor <span className="text-primary font-bold">App</span>
                </div>
                <div className="w-48">
                    {/* Tenant Switcher minimal para app mode */}
                    <TenantSwitcher />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20">
                {children}
            </main>

            {/* Bottom Navigation Navbar (Mobile First) */}
            <nav className="fixed bottom-0 left-0 w-full h-16 bg-white border-t flex items-center justify-around z-10 safe-area-pb">
                <div className="flex flex-col items-center justify-center w-1/3 text-primary h-full">
                    <Building className="h-6 w-6" />
                    <span className="text-[10px] mt-1 font-medium">Início</span>
                </div>
                <div className="flex flex-col items-center justify-center w-1/3 text-slate-400 hover:text-slate-600 h-full">
                    <WalletCards className="h-6 w-6" />
                    <span className="text-[10px] mt-1 font-medium">Boletos</span>
                </div>
                <div className="flex flex-col items-center justify-center w-1/3 text-slate-400 hover:text-slate-600 h-full">
                    <Wrench className="h-6 w-6" />
                    <span className="text-[10px] mt-1 font-medium">Ocorrências</span>
                </div>
            </nav>
        </div>
    )
}
