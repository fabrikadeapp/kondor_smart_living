# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Project:** Kondor Smart Living
**Version:** 1.0 (Baseada no Mestre Prompt e Briefing)
**Date:** 09 de Março de 2026
**Author:** @aiox-pm (Morgan)

## 1. INTRODUÇÃO & OBJETIVOS DO PRODUTO
**Elevator Pitch:** Kondor Smart Living é uma plataforma SaaS B2B Multi-Tenant para a nova era da administração de condomínios. Ele unifica a gestão financeira, operacional, relacional e predial em num ecossistema único que quebra a barreira entre Administradora, Síndico, Portaria e Morador, através de uma "Frictionless UX" (UX Zero Atrito).

**Objetivo Estratégico:** 
* Construir uma fundação segura e comercializável de software capaz de transacionar e precificar em três eixos independentes:
  1. Licença Base do Sistema (Mensalidade SaaS por feature).
  2. Licença Volume (Taxa extra por Unidade Habitacional excedente).
  3. Comissionamento (Take Rate via Marketplace transacional e venda de publicidade internalizada).

**Métricas de Sucesso (KPIs):**
- Taxa de adoção dos moradores ao App View.
- Crescimento percentual da inadimplência (redução através das automações locais).
- Número de chamados operacionais resolvidos via plataforma comparado ao antigo WhatsApp.
- Conversão de Vendors locais pagantes para exibição no Módulo de Marketplace.
- Retenção (Churn Rate) de administradoras e síndicos profissionais em < 2%/mês.

---

## 2. PÚBLICO & MODELO DE ACESSO (PERFIS)
A arquitetura de segurança é estrita e mapeada em 5 perfis.
1. **SUPERADMIN:** Administra os donos do Sistema. Gerencia assinaturas dos condomínios, MRR e Billing Root no Asaas, além de Vouchers SaaS e Health Score. Acessa o `/(master)`.
2. **ADMIN:** O Síndico ou Administrador (o Pagador). Acessa a Área Gerencial `/(admin)` escalável de Acordo com seu `contract_id` com o Context Switch. O ADMIN pode ter "Modo Morador".
3. **RESIDENT (Morador):** Dono ou Inquilino de *N* UHs (Múltiplas Propriedades Suportadas) gerindo todas em uma tela única simplificada `/(resident)`. Foco em 1 clique para resolver a dor.
4. **RECEPTION (Portaria):** Perfil de fluxo rápido para Delivery e Cadastro de Incidentes. Sem acesso às despesas e receitas do condomínio ou PII desnecessário.
5. **SPECIALIST:** Prestador de serviço ou funcionário do condomínio. ABAC total: só enxerga as rotas delegadas a ele no objeto JSON `SpecialistPermission`.

---

## 3. ARQUITETURA "MULTI-TENANT HARD" (O CEREBRO DO SISTEMA)
*   Toda query submetida às tabelas operacionais é blindada verificando a posse através da Membership validada, usando a coluna `contract_id` para garantir o isolamento Hard-Bound.
*   **O Ledger:** Transações do Financeiro em `LedgerEntry` operam unicamente baseadas na teoria de Contabilidade Moderna: **Append-Only**.
*   **Gestão de Documentos:** Persistência dos ponteiros de S3 bucket restritos a chaves autenticadas.
*   **Gateway Integrado (V1):** Asaas. Cuidará das transações do Módulo Financeiro. Todos os campos dos formulários da aplicação (ex: CEP) usam inteligência de Auto-Fill e Máscara para garantir consistência dos dados de integração sem frustrar o usuário.

---

## 4. O BACKLOG MACRO (ROADMAP DE ÉPICOS)

Abaixo, a decomposição do Master Prompt em **5 Épicos** sequenciais para a Engenhara. O `aiox-sm` deverá fatiá-los em **User Stories Atômicas**.

### EPIC 1: O MOTOR DE AUTENTICAÇÃO E O ISOLAMENTO (FOUNDATION)
*   **Descrição:** O coração do software (Cadastro, Login Seguro via JWT, Multi-Tenancy Engine, Troca de Condomínio).
*   **Escopo:**
    *   Setup de Auth (Login Simples). MFA opcional para Futuro.
    *   A tela de Switch-Tenant persistindo a Sessão na navegação (Modo `ADMIN` visualizando múltiplos `Contracts`).
    *   O Seeder Global do Ambiente (Geração de Master Planos via Prisma).
*   **Métrica de Qualidade:** Se o usuário `X` que for Síndico de A tentar dar get_URL_params na API do Síndico de B, a API deve devolver `403 Forbidden` absoluto.

### EPIC 2: ONBOARDING MÁGICO & WIZARD INSTITUCIONAL
*   **Descrição:** Fundo de conversão do novo cliente. Assistente com 12 passos guiando "Criação de Conta > CEP Inteligente -> Auto Geração de Blocos e 120 apartamentos -> Integração de Pagamento Incial -> Lançamento".
*   **Escopo:**
    *   Módulo Cadastro Condomínio Inteligente.
    *   Relacionamento `User -> MemberShip -> UserUnit(1:N)`.
    *   O Módulo `/marketing/` contendo a tabela híbrida de planos dinâmica e o Check-Out com Inserção de `Vouchers` da regra complexa.

### EPIC 3: PORTAL MASTER E A VISÃO GLOBAL B2B
*   **Descrição:** O Painel de Voo da Kondor Smart Living no `/(master)`.
*   **Escopo:**
    *   Cadastro, Alteração de Planos via Edição de "Features Liberais" atreladas às chaves da aplicação.
    *   Gestão Integrada de Health Score, Billing Integrado Asaas Master View e Add-Ons Liberais (Feature Flags Globais).

### EPIC 4: O "CORE" OPERACIONAL E FINANCEIRO DO SÍNDICO E MORADOR
*   **Descrição:** O piso e o teto da empresa. Geração do dinheiro do Condomínio e manutenção da infra.
*   **Escopo:**
    *   Painel Executivo Dashboard. CRUD Extenso (Unidades, Moradores, Ocorrências Abertas, Comunicação Oficial Mural e Controle de Encomendas Portaria).
    *   Faturamento Básico (Envio de Boletos/PIX) suportado pela estrutura Ledger Append Only gerando Boletos via Asaas.
    *   A App View (Portal Morador) minimalista. Acesso ao Boleto da Quota, Relatório das suas Encomendas.
    *   Integração do "Status do Morador" (Inadimplente = restrição em áreas do condomínio ou na reserva de quadra esportiva).

### EPIC 5: EXPANSÃO: GOVERNANÇA AVANÇADA, ASSEMBLEIAS E MARKETPLACE
*   **Descrição:** Os complementos Premium que destrancam Tiers mais caros e a vertente de comissão.
*   **Escopo:**
    *   O motor de Enquetes Eleitorais. Geração Criptográfica e Exportação de PDF da Assembleia garantindo Integridade de `1 Voto Único` por Unidade Habitacional.
    *   Marketplace. Estrutura Transacional B2C Integrada de Categorias, Checkout Asaas B2C repassando Split pro Fornecedor e Margem pro Condomínio e Sistema Global. Tracking de visualizações nos produtos.

---

## 5. DESIGN & EXPERIENCE
Liderado pelo `aiox-ux-design-expert` ou pelas decisões de Frontend, a plataforma deverá expressar **Luxo Tecnológico Minimalista**.

*   **Identidade Visual:** Branco hospitalar (Clinico-Tech), Dark Mode total. Espaçamento relaxado, sombras mínimas. Cores neutras pra textos, Verde Emerald pra Dinheiro e Vermelho Rose para Débito/Falhas.
*   **Interatividade (Micro-interações):** Tudo no site deverá sofrer transição suave via Tailwind (Spinners, Skeletons de Página na lentidão, Modal de Carregamento Assíncrono para os Vínculos Morador-UH em planilhas CSV). Todos formulários têm auto-completamento (ViaCEP) nativo e auto-máscaras garantidos pelo *react-hook-form* aliado nativamente ao *zod* frontend.

---

> Próximo passo recomendado para o Líder Técnico ou SM: Quebrar o **Epic 1** na pasta inicial de "User Stories" e pedir pro `aiox-architect` aprovar os stubs do código Back / Front da fundação Multi-Tenant do NextJS 14 App Router.
