import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/infrastructure/db/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Kondor Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "seu@email.com" },
                password: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials")
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        memberships: {
                            where: { status: 'ACTIVE' },
                            include: {
                                contract: { select: { id: true, tradeName: true, legalName: true } }
                            }
                        }
                    }
                })

                if (!user) {
                    throw new Error("Invalid credentials")
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials")
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    memberships: user.memberships
                } as any
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 dias
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.memberships = (user as any).memberships
            }

            // Context Switch updating in token
            if (trigger === "update" && session?.activeContractId) {
                token.activeContractId = session.activeContractId
            }

            // Setup default active contract if none chosen
            if (!token.activeContractId && token.memberships && (token.memberships as any[]).length > 0) {
                token.activeContractId = (token.memberships as any[])[0].contractId
            }

            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.memberships = token.memberships as any[]
                session.activeContractId = token.activeContractId as string
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || "default_kondor_secret_jwt_for_development",
}
