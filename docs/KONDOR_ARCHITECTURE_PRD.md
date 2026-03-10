# KONDOR SMART LIVING: SYSTEM ARCHITECTURE & MASTER PRD

> Baseado nas regras globais do AIOX e nos preceitos Cloud SaaS B2B "Multi-Tenant Hard".
> **Autor:** @aiox-analyst & @aiox-architect 
> **Foco:** Monólito Modular Next.js 14, escalável, voltado à conversão e com faturamento recorrente ativo.

---

## 1. ARQUITETURA DE PASTAS E CONVENÇÕES DE CÓDIGO

A arquitetura reflete o princípio de "Monólito Modular", separando estritamente UI, Application e Domain.

```text
/src
  /app                        # Next.js App Router (Páginas, Layouts e Server Actions atrelados à rota)
    /(admin)                  # Portal do Condomínio (Síndico/Portaria)
    /(master)                 # Portal Master Global
    /(resident)               # Portal do Morador
    /(auth)                   # Fluxos de Registro, Login e MFA
    /(marketing)              # Landing Page & Institucional
    /api                      # Webhooks e Endpoints REST/GraphQL (ex: Stripe, WhatsApp)

  /core                       # Núcleo Multi-tenant e Shared Kernel
    /auth                     # Estratégias de Sessão JWT / JWT Context
    /tenant                   # Resolvedor e Validadores de `contract_id`
    /telemetry                # Analytics & Loggers

  /domain                     # Lógica de Negócios / Invariantes
    /financial                # Ex: Payment, Voucher, Ledger, Billing Rules (Camadas Analítica/Gerencial mapeadas)
    /condo                    # Ex: Units, Memberships, Occurrences, Reservas
    /governance               # Ex: Assemblies, Polls, Documentos
    /marketplace              # Ex: Catalog, Vendos, Checkout, Orders
    /system                   # Ex: Add-Ons, Plans, SystemSettings

  /application                # Casos de Uso / Comandos / Serviços
    /services                 # Orchestram os domínios, ex: `CreateAssemblyService`, `ProcessPaymentService`
    /jobs                     # Background Workers / Automações (Agendadas)

  /infrastructure             # Implementações Externas
    /database                 # Prisma Client e Repositórios Abstratos 
    /payment                  # Adapters (Gateway X)
    /storage                  # Upload de arquivos, OCR Clients
    /messaging                # Adapters de Email (Resend) e WhatsApp

  /presentation               # Interface & UI Compartilhada
    /components               # Shadcn/UI, Formulários (Zod + RHForm), Botões, Ícones (Lucide)
    /hooks                    # Ex: `useCurrentTenant()`, `useAuth()`
    /styles                   # globals.css, Tailwind configurations
```

---

## 2. REGRAS DE PERMISSÃO (RBAC + ABAC + MULTI-TENANT CONTEXT)

Nenhuma rota deve ser acessível sem validação de sessão em middleware (`middleware.ts`), que verifica a validade do JWT e o escopo do usuário.

1.  **Resolvedor de Tenant:** Cada requisição API ou Server Action *precisa* receber um context. Se não vier `contract_id`, bloqueia.
2.  **O Papel do SUPERADMIN:** Atua globalmente no `/(master)`. Contorna a barreira do `contract_id` para agir via `global_context`, vendo as tabelas num overview bruto.
3.  **Role ADMIN (Síndico):**
    *   Tem controle máximo _dentro de um Contract ativo_. 
    *   Se for "Síndico Profissional" (em 3 prédios), ao abrir `/(admin)` escolhe via _Dropdown Context Switcher_ qual prédio quer ver. Na requisição o `active_contract_id` da sessão muda e todas as queries atualizam imediatamente.
    *   **"Modo Morador":** O frontend muda a interface via state da URL e carrega o painel _/(resident)_ em vez do _/(admin)_, mantendo o Token.
4.  **Role SPECIALIST:** ABAC Ativo.
    *   Permissão base bloqueia tudo exceto leitura mínima do painel (Dashboard Simplificado).
    *   Autorizações finas são lidas do JSON da entidade `SpecialistPermission` na tabela do banco (`{"occurrences:write": true, "financial:read": false}`).
5.  **Role RECEPTION:** Acessa especificamente `/deliveries`, `/occurrences` operacionais e `/calendar`. Restrito de ler balanço financeiro e PII não atrelada à entrega.

---

## 3. FLUXOS CRÍTICOS & MÁQUINAS DE ESTADO

### A. Fluxo de Faturamento & Ledger (Append-Only)
1. Job diário roda verificando a entidade `Subscription`.
2. O sistema emite `Payment` (PENDING).
3. Webhook de Gateway atualiza `Payment` para PAID. Dispara evento interno `SUBSCRIPTION_ACTIVE`.
4. Uma transação no banco insere no `LedgerEntry` uma linha de crédito imutável do valor e muda a Fatura pra Fechada. (Eventos `PAYMENT_RECEIVED`).
5. Se for atrasado, altera estado de Subscription para `PAST_DUE`.

### B. Context Switcher (Troca de Prédio)
1. Usuário clica no Dropdown "Trocar Prédio" para `contract_id = uuid-predio-2`.
2. O Frontend envia POST `/api/v1/auth/switch-context` enviando o target UUID.
3. Back-end confere na tabela `Membership` se `user_id == req.user_id` e o `contract_id` pertencem.
4. Token renovado ou Session Cookie re-emitido carregando as Features liberadas para "predio-2" (o prédio 1 podia ser plano Essencial, o 2 plano Enterprise). Front-end emite Client Refresh.

### C. Sistema Vouchers & Tiers de Plano (Híbrido)
*   **A Matriz Comercial:** Mensalidade do condomínio X = `Plan.basePrice` + (`Total_Units` * `Tier.pricePerUnit`). 
*   Se o usuário aplica Voucher, processa na engine matemática e guarda log no `VoucherRedemption`, travando se o voucher for apenas para o "Plano Profissional".
*   *Feature Flags* leem `AddOnFeature` associado ao tenant. Se o prédio contratou Add-on de OCR de nota fiscal, ativa na compilação do Menu Lateral no frontend.

---

## 4. TELAS PRINCIPAIS DEFINIDAS

### `/(marketing)/` (A Máquina de Venda Automática)
*   `page.tsx` (Homepage Premium: vidro fosco, degradês discretos, ilustrações 3D da planta do prédio inteligente).
*   Seção de Tiers com interligação com Pricing Dinâmico (calculadora de UHs no card).
*   Checkout Embutido ou Formulário Mágico de Captação (Leads pro CRM Simples).

### `/(master)/` (Comando Geral Synkra AIOX)
*   **Visão Geral (Mrr, MRR Projetado, Churn Rate).**
*   **Gestor de Clientes:** Listagem Server-side Pagination robusta. Coluna de Health Score (com semáforo Vermelho = Churn Iminente, Verde = Saudável).
*   **Billing/Plans Engine:** Tela interativa onde o Superadmin clica e _desliga_ a Feature "OCR" globalmente se uma falha grave na liberação surgir, derrubando o acesso pra todos que usam.
*   **Gestor do Marketplace:** Aprovação de Vendors e produtos.

### `/(admin)/` (Síndico Premium - Produtividade Baseada Em Dashboards)
*   **Executive Dashboard:** Componentes reutilizáveis (KondorMetricCard, KondorPieChart) buscando do Backend `/domain/analytics` o balanço operacional do dia (Ocorrências atrasadas SLA > Inadimplências).
*   **Gestão Residencial (Moradores + UHs):** Tela complexa com datagrids modulares, pesquisa textual com debouncing de 500ms. Abstração de relacionamento 1:N entre Morador -> 2 UHs no mesmo tenant.
*   **Módulo Financeiro Gerencial/Operacional:** Tabelas separadas e filtráveis; visão "Append Only" para transparência.

### `/(resident)/` (Morador - App View Design)
*   **Dashboard Minimalista:** Acesso PWA-first approach (Cards enormes e acionáveis).
*   **Card "Pagar Taxa Associativa"**: Link ou QR Code Copiável da Fatura Corrente.
*   **Meus Chamados (Track Delivery):** Visual de Timeline com bolinhas de progresso (`Order Tracker Style`).
*   **Marketplace B2C:** Loja interna onde o morador compra Pão de Açúcar Express na conveniência, fluindo pelo Checkout do sistema onde uma margem fica para o Smart Living.

---

## 5. COMPONENTES COMPARTILHADOS (O FOUNDATION DESIGN)

*   `KondorButton`: Variants `[primary, destructive, outline, ghost]`. 
*   `KondorTenantSelector`: Dropdown Universal, persistido globalmente, disponível apenas no perfil ADMIN ou se Morador atuar em 2 UHs.
*   `KondorDataTable`: Tabela complexa virtualizada com Sort, Paginação Remota e State preservado na URL Query String (evitando perder estado no F5).
*   `KondorStatusChip`: Badge padronizada com cores atreladas a Estado (`PAST_DUE = red/rose-500`, `ACTIVE = emerald-500`).
*   `KondorAuditHistory`: Timeline embutível embaixo de entidades (ex: Embaixo do Morador) que busca dados de `AuditLog`.

---

## 6. BACKLOG DE EVOLUÇÃO E REFACTOR (FASE 1 PARA FRENTES)

**M1: Onboarding Rápido & Autenticação (Fase 1)**
*   Setup Middleware de Proteção + NextAuth.js ou Similar.
*   Painel do Master: Cadastro de Contratos, Planos (com Tiers configuráveis) e Vouchers.
*   Seed do banco (Prisma).

**M2: A Sincronização do Admin (Fase 1/2)**
*   Fluxo de Membership, troca de Tenant via Header (`x-tenant-id`).
*   Dashboard Visão Geral do Síndico.
*   Gestão de UHs e UserUnits.

**M3: Financeiro & Billing Base (Fase 2)**
*   Lançamento no Ledger Append-only e visualização.
*   Geração e status das Cobranças (Assinatura base híbrida).

**M4: Portais em Cena (Fase 2)**
*   Portal do Morador.
*   Ocorrências.
*   Portaria e Logística.

**M5+: Complexidade Ascendente (Fase 3/4)**
*   Assembleias e Motor Voto Unitário (Ata em PDF).
*   Motor de Marketplace (Carrinho + Checkout na Plataforma).
*   O Engine de Automações (Rules Engine: Se "boleto vence hoje" >> Action: "WhatsApp Push").
*   Módulo Analytics Refinado (Feito para escalar métricas para fundos de investimento). 
