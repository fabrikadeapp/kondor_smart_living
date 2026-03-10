import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
        memberships: Array<{
            contractId: string
            role: string
            contract: {
                id: string
                tradeName: string
                legalName: string
            }
        }>
        activeContractId: string
    }
}
