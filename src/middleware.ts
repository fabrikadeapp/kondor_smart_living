import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // Mapeamento básico para forçar redirect se entrar na base root
        if (path === '/') {
            if (!token) return NextResponse.redirect(new URL('/login', req.url))

            const isSuperAdmin = (token.memberships as any[])?.some(m => m.role === 'SUPERADMIN')
            if (isSuperAdmin) {
                return NextResponse.redirect(new URL('/master', req.url))
            }
            return NextResponse.redirect(new URL('/admin/dashboard', req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: [
        "/admin/:path*",
        "/master/:path*",
        "/resident/:path*",
        "/", // match root para redirecionamentos 
    ]
}
