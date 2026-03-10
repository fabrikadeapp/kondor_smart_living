import { ReactNode } from "react"
import Link from "next/link"
import { Smartphone } from "lucide-react"
import { TenantSwitcher } from "@/components/tenant-switcher"

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar B2B */}
            <aside className="w-64 border-r bg-white flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-4 border-b font-semibold text-lg">
                    Kondor <span className="text-primary font-bold ml-1">Admin</span>
                </div>

                {/* Context Switcher - A mágica acontece aqui */}
                <div className="p-4 border-b">
                    <TenantSwitcher />
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {/* Links fictícios para navegação */}
                    <div className="text-sm text-slate-500 font-medium pb-2">Menu Principal</div>
                    <Link href="/admin/dashboard" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/admin/units" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Unidades & Moradores
                    </Link>
                    <Link href="/admin/transactions" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Livro Caixa & Inadimplência
                    </Link>
                    <Link href="/admin/occurrences" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Ocorrências
                    </Link>
                    <Link href="/admin/deliveries" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Portaria & Encomendas
                    </Link>
                    <Link href="/admin/partners" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Parceiros & Marketplace
                    </Link>
                    <Link href="/admin/staff" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Gestão de Equipe & Staff
                    </Link>
                    <Link href="/admin/reports/transparency" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Transparência Financeira
                    </Link>
                    <Link href="/admin/reports/csat" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Satisfação & BI (CSAT)
                    </Link>
                    <Link href="/admin/assemblies" className="block font-medium p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors">
                        Governança & Assembleias
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen relative">
                <header className="h-16 flex items-center justify-between px-6 border-b bg-white">
                    <div className="text-lg font-medium">Dashboard</div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <Link
                            href="/resident/dashboard"
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        >
                            <Smartphone className="w-4 h-4" />
                            <span className="hidden sm:inline font-medium">Top View Morador</span>
                        </Link>
                        {/* User Profile placeholder */}
                        Menu de Usuário
                    </div>
                </header>
                <div className="p-6 md:p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    )
}
