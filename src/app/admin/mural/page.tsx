import { requireTenantContext } from "@/core/tenant/tenant-context"
import prisma from "@/infrastructure/db/prisma"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Pin, Calendar, Trash2, Plus, ArrowUpRight, Bell } from "lucide-react"
import { createMuralPostAction, toggleMuralPostAction } from "@/application/features/mural/mural.action"
import { revalidatePath } from "next/cache"

export default async function AdminMuralPage() {
    const { contractId } = await requireTenantContext()

    const posts = await prisma.muralPost.findMany({
        where: { contractId },
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header High-End */}
            <div className="flex justify-between items-end border-b border-[#d2d2d7]/30 pb-10">
                <div className="space-y-1">
                    <Badge className="bg-[#0066cc]/10 text-[#0066cc] border-0 font-bold uppercase text-[9px] tracking-widest px-3 py-1 rounded-full">Comunicação Oficial</Badge>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1d1d1f] leading-tight">Mural de Avisos</h2>
                    <p className="text-[#86868b] text-sm font-medium">Publique informativos, regras e comunicados para todos os moradores.</p>
                </div>

                <form action={async () => {
                    "use server"
                    await createMuralPostAction({
                        title: "Manutenção Preventiva de Elevadores",
                        content: "Informamos que no dia 15/03 os elevadores do Bloco A passarão por manutenção das 09h às 12h.",
                        category: "MANUTENÇÃO",
                        priority: "HIGH"
                    })
                    revalidatePath("/admin/mural")
                }}>
                    <button className="px-6 py-3 bg-[#0066cc] text-white rounded-full text-xs font-black shadow-lg shadow-[#0066cc]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Novo Comunicado
                    </button>
                </form>
            </div>

            {/* Content Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-[#d2d2d7] shadow-sm space-y-3">
                    <div className="w-10 h-10 bg-blue-50 text-[#0066cc] rounded-xl flex items-center justify-center">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">Avisos Ativos</p>
                        <p className="text-xl font-black text-[#1d1d1f]">{posts.filter(p => p.isActive).length}</p>
                    </div>
                </div>
            </div>

            {/* Mural Posts Feed */}
            <div className="grid grid-cols-1 gap-6">
                {posts.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-[#d2d2d7] rounded-[40px] space-y-4">
                        <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto text-[#86868b]">
                            <Bell className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-[#86868b]">O mural está vazio. Publique seu primeiro aviso!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="bg-white border border-[#d2d2d7] rounded-[32px] p-8 shadow-apple-hover transition-all group relative overflow-hidden">
                            {post.priority === 'HIGH' && (
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-3 items-center">
                                    <Badge className="bg-[#f5f5f7] text-[#1d1d1f] border-0 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">{post.category}</Badge>
                                    <span className="text-[10px] font-bold text-[#86868b] flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <form action={async () => {
                                        "use server"
                                        await toggleMuralPostAction(post.id, !post.isActive)
                                        revalidatePath("/admin/mural")
                                    }}>
                                        <button className={`p-2 rounded-full transition-all ${post.isActive ? 'bg-[#f5f5f7] text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            <Pin className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black tracking-tighter text-[#1d1d1f] mb-3 leading-tight">{post.title}</h3>
                            <p className="text-[#86868b] font-medium leading-relaxed max-w-3xl mb-8">{post.content}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-[#f5f5f7]">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${post.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="text-[10px] font-black text-[#1d1d1f] uppercase tracking-widest">
                                        {post.isActive ? 'Visível para Moradores' : 'Arquivado / Oculto'}
                                    </span>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-[#d2d2d7] group-hover:text-[#0066cc] transition-all" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
