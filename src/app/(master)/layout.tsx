import { ReactNode } from "react"
import Link from "next/link"
import { ShieldAlert, LayoutDashboard, CreditCard, Settings, LogOut, Package } from "lucide-react"
import { requireGlobalContext } from "@/core/tenant/tenant-context"

export default async function MasterLayout({ children }: { children: ReactNode }) {
    await requireGlobalContext()

    return (
        <div className="flex h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans overflow-hidden">
            {/* Sidebar High-End */}
            <aside className="w-64 border-r border-[#d2d2d7] bg-white/80 backdrop-blur-xl flex flex-col p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-[#0066cc] rounded-lg flex items-center justify-center text-white">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-black text-sm tracking-tight leading-none">Condo Lab</h1>
                        <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest mt-1">SuperAdmin Dashboard</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <Link href="/master/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-[#f5f5f7] transition-all">
                        <LayoutDashboard className="w-4 h-4 text-[#86868b]" /> Overview
                    </Link>
                    <Link href="/master/plans" className="flex items-center gap-3 px-3 py-2 text-sm font-bold bg-[#f5f5f7] text-[#0066cc] rounded-xl transition-all shadow-sm">
                        <Package className="w-4 h-4" /> Gestão de Planos
                    </Link>
                    <Link href="/master/tenants" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-[#f5f5f7] transition-all text-[#1d1d1f]">
                        <ShieldAlert className="w-4 h-4 text-[#86868b]" /> Condomínios (Tenants)
                    </Link>
                    <Link href="/master/billing" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-[#f5f5f7] transition-all text-[#1d1d1f]">
                        <CreditCard className="w-4 h-4 text-[#86868b]" /> Faturamento Global
                    </Link>
                </nav>

                <div className="border-t border-[#d2d2d7] pt-6 space-y-1">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                        <LogOut className="w-3 h-3" /> Sair do Master
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#f5f5f7]">
                <div className="p-10 max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
