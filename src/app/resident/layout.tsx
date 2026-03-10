import { ReactNode } from "react"
import Link from "next/link"
import { Building, WalletCards, Wrench, Vote, Handshake } from "lucide-react"
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
            <nav className="fixed bottom-0 left-0 w-full h-16 bg-white border-t flex items-center justify-around z-20">
                <Link href="/resident/dashboard" className="flex flex-col items-center justify-center w-1/4 text-primary h-full">
                    <Building className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-medium italic">Home</span>
                </Link>
                <Link href="/resident/assemblies" className="flex flex-col items-center justify-center w-1/4 text-slate-400 hover:text-primary h-full transition-colors">
                    <Vote className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-medium">Decisões</span>
                </Link>
                <Link href="/resident/marketplace" className="flex flex-col items-center justify-center w-1/4 text-slate-400 hover:text-primary h-full transition-colors">
                    <Handshake className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-medium italic">Serviços</span>
                </Link>
                <Link href="/resident/dashboard" className="flex flex-col items-center justify-center w-1/4 text-slate-400 hover:text-primary h-full transition-colors">
                    <Wrench className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-medium">Chamados</span>
                </Link>
            </nav>
        </div>
    )
}
