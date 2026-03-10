# EPIC 1: O MOTOR DE AUTENTICAÇÃO E O ISOLAMENTO (FOUNDATION)
> Baseado no PRD V1.0 e Arquitetura do Kondor Smart Living
> **Autor:** @aiox-sm (River)

Este épico deve ser construído na fundação Monolítica Modular (Next.js 14 App Router, TypeScript, Prisma, Tailwind).

---

## 📖 Story 1.1: Setup do Framework Base & DB Middleware
**Como** Desenvolvedor
**Quero** configurar o repositório base com ferramentas de qualidade e a camada de middleware do Prisma
**Para que** possamos desenvolver o isolamento Multi-Tenant com segurança e tipagem rígida.

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Foundation & DB Setup
  Scenario: Validate Next.js and Prisma config
    Given a fresh install of Next.js 14 App Router with Tailwind and Shadcn
    And Prisma is initialized with the Kondor schema
    When the server compiles and starts
    Then there should be zero compilation errors
    And the database should accept the seeding script without errors
```
**CodeRabbit Prediction:** Assign to Validate Architectural Compliance and DB Security.

---

## 📖 Story 1.2: Motor de Autenticação (NextAuth/JWT base)
**Como** Usuário (Global ou Tenant)
**Quero** fazer login no sistema com meu e-mail e senha
**Para que** eu possa acessar os recursos restritos ao meu perfil e receber meu token JWT autenticado com meus cargos (Roles).

**Contexto Restritivo:** A tabela `User` é a base. O payload da sessão deve incluir as Memberships, revelando quais `contractId` aquele `userId` pode acessar.

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Basic User Identity
  Scenario: Successful Login Authentication
    Given a user exists in the database
    When they submit valid credentials (email and password)
    Then the system issues an authenticated session
    And the session payload includes the User ID and their active Roles

  Scenario: Prevent unauthorized access
    Given an unauthenticated visitor
    When they attempt to access any route under /(admin) or /(master)
    Then they are redirected to the /(auth)/login page
```

---

## 📖 Story 1.3: Middleware "Hard Boundary" (O Isolamento Multi-Tenant)
**Como** Sistema
**Quero** interceptar todas as requisições autenticadas nas rotas administrativas
**Para que** eu possa resolver ativamente o `contract_id` atual da navegação (Baseado na URL/Sessão) e injetar esse UUID no Prisma automaticamente.

**Contexto Restritivo:** Criar um Hook (ex: `useCurrentTenant()`) e uma função de backend `requireTenantContext()`. A query nunca lê dados de outro Contract.

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Tenant Isolation
  Scenario: Block cross-contract data access
    Given a user has an active session tied to Contract A
    When the system queries data without explicitly passing Contract A's ID
    Then the Prisma Database middleware forces `contractId: A` on the query
    
  Scenario: Deny access to missing properties
    Given a user belongs to contract A
    When the user tries to fetch entities belonging to contract B manually via API
    Then the server rejects the request with HTTP 403 Forbidden
```

---

## 📖 Story 1.4: Context Switcher (Dropdown Mágico)
**Como** ADMIN (Síndico Profissional)
**Quero** um Dropdown universal no Header (ou Sidenav) da aplicação
**Para que** eu possa selecionar outro condomínio sob minha gestão sem precisar relogar, atualizando instantaneamente os dados do painel atual.

**Contexto Restritivo:** Esta funcionalidade exige que a `Membership` traga uma array de condomínios válidos para esse User. Quando ele troca de Contexto, um State e/ou Cookie local (`x-tenant-id`) é atualizado e as queries `Server Components` do Next reiniciam (Revalidate) trazendo os novos dados.

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Context Switch
  Scenario: Admin changes current active Condominium
    Given an ADMIN user has memberships in Condominium X and Condominium Y
    And the current active UI is showing Condominium X data
    When the user selects Condominium Y from the Context Switch dropdown
    Then the system updates the session's active `contract_id` parameter to Y
    And the dashboard refreshes automatically to render only Condominium Y data
```

---

## 📖 Story 1.5: Modo "Portal do Morador" (App View)
**Como** Morador proprietário de UHs
**Quero** acessar o sistema e imediatamente visualizar uma interface App-like minimalista 
**Para que** eu visualize unicamente meus boletos e incidentes, sem enxergar as rotas de finanças do Condomínio, mesmo se eu também for Síndico.

**Contexto Restritivo:** Um Síndico também pode ter sua própria casa no Condomínio. O frontend precisa trocar da rota `/(admin)` para `/(resident)`, simplificando a interface, mas os princípios de JWT e `contract_id` continuam as mesmas.

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Resident Layout Experience
  Scenario: Access layout via Resident Membership
    Given a User whose primary role is RESIDENT
    When they log in
    Then they are routed directly to the /(resident) portal
    And the UI presented is the mobile-first minimal design

  Scenario: Admin toggle to Resident mode
    Given a User has both ADMIN and RESIDENT roles in the same Contract
    When they click "Visualizar como Morador" in their profile
    Then the system redirects them to /(resident)
    And preserves their authenticated state
```
