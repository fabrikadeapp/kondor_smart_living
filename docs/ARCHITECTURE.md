# KONDOR SMART LIVING: SYSTEM ARCHITECTURE DOCUMENT

**Status:** Aprovado e Base para Implementação
**Autor:** @aiox-architect (Aria)
**Data:** 09 de Março de 2026
**Origem:** PRD V1.0 e Briefing Mestre

---

## 1. PADRÃO ARQUITETURAL (O MONÓLITO MODULAR)
A plataforma Kondor Smart Living seguirá o padrão de **Monólito Modular** utilizando **Next.js 14 (App Router)**. A escolha por não adotar microserviços prematuramente reduz o overhead de Devops e a latência de rede entre domínios fortemente acoplados (ex: Billing e Unidades).

A separação lógica ocorrerá em nível de estrutura de diretórios (`/src/domain`, `/src/application`, `/src/infrastructure`) formando limites claros para que, futuramente, caso o Módulo de *Marketplace* exija escala absurda de tráfego B2C, ele possa ser extraído para um serviço próprio sem refatoração pesada.

---

## 2. A STACK TECNOLÓGICA "BORING BUT POWERFUL"
A Stack foi escolhida para maximizar produtividade (Developer Experience) e estabilidade financeira (Cost-Conscious).
*   **Core Fullstack:** Next.js 14+ (React server components para carregamentos pesados B2B).
*   **Linguagem:** TypeScript `strict` (A tipagem pesada é obrigatória para manter as regras de domínio).
*   **Database:** PostgreSQL (Hospedado via Supabase / Railway), escalável e ACID-compliant.
*   **ORM:** Prisma (Migrations auditáveis e schema fortemente tipado - *Já estabelecidos no Epic 1*).
*   **UI/UX:** TailwindCSS + Shadcn/UI (Design System acessível e modular). Ícones do `lucide-react`.
*   **Client State & Forms:** `react-hook-form` amarrado com `zod` para validação extrema. `Zustand` para Client State UI leve (ex: Modais complexos).
*   **Autenticação:** NextAuth (Auth.js) / Provider Próprio JWT com Sessions em Database para controle de Revogação imediata e Context-Switch.

---

## 3. A REGRA DE OURO "MULTI-TENANT HARD" NA CAMADA DE APLICAÇÃO
A arquitetura de Multi-Tenancy se fundamenta no UUID absoluto de `contract_id` para todas as tabelas (exceção das Master). 

1.  **Resolver Middleware (A Barreira):**
    *   No Server Components: Criar serviço estrito `await requireTenantContext(user)` que recupera o Contexto de Navegação ativo a partir do cookie/sessão (ex: "Qual condomínio o Síndico quer ver agora?").
    *   Na Camada Prisma: Utilizar uma camada de serviço (Repository Pattern ou Actions) onde TODO `prisma.entity.findMany()` passa a ter obrigatoriamente um middleware ou decorator de injeção `where: { contractId: currentTenant.id }`.
    *   ***NUNCA, NUNCA*** passar um `contract_id` originado do payload raw do POST Frontend diretamente no banco. A validação do `contract_id` vem apenas e unicamente da assinatura validada no JWT e Contexto de Membro logado.

---

## 4. O ISOLAMENTO DE PACOTES (DIRETÓRIOS ESRPR)

```text
/src
  /app                  # Roteador. A UI burra. Puxa dados do Application.
  /core                 # Global utils. Telemetry, Error Handling Universal, Auth Context.
  /domain               # As Invariantes de Negócio:
    /models             # Zod Schemas e Tipagens abstratas correspondentes ao BD.
    /enums              # Mapeamento estrito dos Enums de Prisma.
  /application          # Caso de Uso (Commands e Queries). Toda a ação deve viver aqui.
    /features           # Ex: src/application/features/auth/login.action.ts
  /infrastructure       # A Borda do Sistema:
    /db                 # Instância Singleton do Prisma.
    /payment            # Asaas Client e Webhooks Handlers.
    /storage            # AWS S3 / Supabase Storage Client.
```

---

## 5. DESIGN DE SEGURANÇA E PERFORMANCE
1.  **Data Fetching no Next.js:** 
    *   As tabelas (B2B Admin Dashboard) farão uso massivo de *Server Actions* associadas com `<Suspense>` e *Skeletons* do Shadcn. 
    *   Faremos Cache invalidation reativo: `revalidatePath('/(admin)/occurrences')` ao submeter um form com sucesso.
2.  **Webhooks & Idempotência Financeira:**
    *   A API `/api/webhooks/asaas` será responsável pela ativação/bloqueio real das licenças. Utilizar o cabeçalho `stripe-signature` / `asaas-signature` validado via env var secret. 
    *   Campos de `idempotencyKey` definidos no Prisma evitam criação dupla de assinaturas via Double-Clicks do navegador nas rotas de Server Action.
3.  **Audit Logs Tracker:** Qualquer operação de Mutação PII, Financeira ou de ABAC gera uma inserção assíncrona (`Promise.allSettled`) no banco não-relacional lateral ou numa tabela separada `AuditLog` mapeada no Prisma contendo o trace exato: `Quem, Onde, Quando, O que Mudou (JSON.diff)`.

---

## 6. O ROADMAP TÉCNICO V1 (ALINHAMENTO COM O EPIC 1)
O framework base a ser construído pelos Devs agora:

*   **Step 1:** Inicialização do Setup do Next.js + Tailwind + Shadcn CLI. Organizar a estrutura de pastas seguindo o item 4 (ESRPR).
*   **Step 2:** Aplicar as Migrations do banco (`npx prisma migrate dev`).
*   **Step 3:** Setup Auth.js (ou JWT Base) usando `bcrypt`. Criar a action base `login(email, pass)` vinculando o acesso global e as Roles.
*   **Step 4:** Criação do Hook universal de proteção `useTenant()` / Rota Middleware do Next.

> O **Arquitetural Document** está fixado. Eu e a Data Engineer (@Dara) já validamos o Prisma. O próximo ator dessa esteira é o `/aiox-sm` ou `/aiox-dev` para programarmos a base do Next.js 14 seguindo essas diretrizes.
