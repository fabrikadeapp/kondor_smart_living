import { Metadata } from "next"
import { LoginForm } from "./components/login-form"

export const metadata: Metadata = {
    title: "Login | Kondor Smart Living",
    description: "Acesse sua conta corporativa da Kondor",
}

export default function LoginPage() {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center flex grid-cols-1 md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Branding background */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-slate-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    Kondor Smart Living
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Revolucionando a gestão predial, integrando portaria, faturamento e comunicação em uma única plataforma.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>

            {/* Login form block */}
            <div className="lg:p-8 w-full p-4">
                <LoginForm />
            </div>
        </div>
    )
}
