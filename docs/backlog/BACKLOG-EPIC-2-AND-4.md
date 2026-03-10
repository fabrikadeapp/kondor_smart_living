# KONDOR SMART LIVING: MACRO BACKLOG & ROADMAP B2B

**Author:** @aiox-po (Pax)
**Date:** 09 de Março de 2026
**Status:** Priorizado (Ready for SM Breakdown)

---

## 🎯 VISÃO GERAL DE PRIORIZAÇÃO
A base estrutural (EPIC 1 - Multi-Tenant Foundation) foi concluída e o isolamento de dados validado no banco. O fluxo atual de priorização de produto focará no funil de entrada de caixa e operação real dos síndicos. 

**Sequência Lógica de Desenvolvimento Determinada:**
1. **Epic 2 (Onboarding & Institutional Setup)** - Ponto focal para atrair e converter (pagamento inicial). O "Front Door".
2. **Epic 4 (Operational & Financial Core)** - O piso operacional de dia-a-dia que justifica o produto.
*(Nota: O Epic 3 - Master B2B e o Epic 5 - Governança Avançada, assumem menor prioridade momentânea enquanto os fluxos diários do Síndico não operam.)*

---

## 📦 EPIC 2: ONBOARDING MÁGICO & WIZARD INSTITUCIONAL (Prioridade Alta - "Front Door")

**Valor de Negócio:** Permitir auto-cadastro de condomínios por síndicos de maneira fluida ("Frictionless UX"), integrando a criação de tabela mestre com processamento inicial do Ledger Asaas e geração orgânica de N blocos habitacionais.

**Requisitos Inegociáveis (Acceptance Threshold):**
- **UX de Classe Mundial:** O assistente (Wizard) deve ser livre de ruídos. Um formulário por etapa (ex: Step 1: CNPJ + Autocomplete -> Step 2: Auto-generação de Blocos).
- **Consistência de Tenancy:** Ao finalizar, o banco precisa ter gerado o `Contract`, a `Membership` do Criador como ADMIN, e a matriz inteira de `Unit`.
- **Inteligência de Venda:** Seleção de plano inicial que gera a Subscription e já engatilha o Status "TRIAL" ou "ACTIVE" baseado no gateway.

**Histórias Esperadas (Para o SM fatiar):**
1. *Wizard Steps (UI/UX Componentes state-machine Form).*
2. *Integração ViaCEP e Consulta CNPJ automatizada visando atrito-zero.*
3. *Macro-Geração de Layout de Condomínio: Script rápido via Form para construir tabela Unidades (X Blocos com Y Andares).*
4. *Página Institucional Básica (Landing Page Marketing / Pricing).*

---

## 📦 EPIC 4: O "CORE" OPERACIONAL E FINANCEIRO DO SÍNDICO E MORADOR (Prioridade Altíssima - "Daily Usage")

**Valor de Negócio:** A ferramenta de trabalho unificada do síndico. Extingue planilhas do Excel e grupos do WhatsApp indisciplinados. Todo histórico de uso deve deixar uma marca temporal de auditoria e Ledger.

**Requisitos Inegociáveis (Acceptance Threshold):**
- **Idempotência Financeira Absoluta:** Nenhuma "geração de quota/boleto em lote" pode ocorrer duplicada, protegida por chaves idempotentes no banco e Ledger Entries "Append-Only".
- **Comunicação Ativa:** O sistema não é passivo; boletos, ocorrências e confirmações de portaria demandam push events/telas limpas para cada perfil.

**Histórias Esperadas (Para o SM fatiar):**
1. *B2B Admin Dashboard (CRUD Unidades, Painel Financeiro e Inadimplência).*
2. *Geração de Boletos Mestre (Engine de Quotas Ordinárias com LedgerEntry).*
3. *Livro de Ocorrências e Mural de Recados Institucionais (Fluxo de Chat Restrito).*
4. *Painel de Portaria/Recepção (Delivery Tracker Simplificado para Tela Touch).*
5. *App View Morador Finalizado (Pagamento Boleto 1 clique, Visualizar Encomendas).*

---

### 👉 DIRETRIZES TÉCNICAS REFORÇADAS PELA PO
- Não quero dados fakes rodando no frontend sem Zod Schemas atrelados.
- Nenhum formulário pode ter botão de "Salvar" sem estado de envio visual desabilitando o submit temporariamente (Skeleton UI / Loaders).
- Se faltar permissão nos Tiers de Planos (Ex: Condomínio plano "Essencial" tentando acessar "Assembleia"), devemos mostrar um Paywall Elegante e não apenas um "Erro 403".

---
*Backlog aprovado e disponibilizado para fatiamento de histórias pelo Scrum Master (@aiox-sm) através do comando `*draft`.*
