# EPIC 4: THE OPERATIONAL & FINANCIAL CORE
> Baseado no PRD V1.0 e Backlog Priorizado pelo PO
> **Status:** Ready for Dev

Este épico materializa a Máquina de Faturamento e a Gestão do Condomínio do dia-a-dia para suprir o Dashboard base que fizemos no Epic 1.

---

## 📖 Story 4.1: B2B Admin - Gestão de Unidades e Moradores (CRUD Base)
**Como** Síndico (ADMIN)
**Quero** um painel para adicionar e editar Unidades e vincular Usuários (Moradores/Inquilinos) a elas
**Para que** eu tenha controle de quem mora e a quem cobrar os boletos.

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Unit and Resident Management
  Scenario: List Units for Active Contract
    Given an authenticated ADMIN
    When they access the Units page
    Then the system strictly queries Units using requireTenantContext()
    And displays a data table with Unit, Type, and linked Residents

  Scenario: Bulk Link Resident to Unit
    Given a valid Unit
    When the ADMIN links a user email with relationship type "OWNER"
    Then the system creates a UserUnit record
    And immediately creates an Audit/Ledger log (non-financial) of the action
```

---

## 📖 Story 4.2: Faturamento Engine & O Ledger Imutável (Financial Core)
**Como** Sistema / Síndico
**Quero** poder lançar despesas/receitas no livro-caixa e gerar "Quotas (Boletos)" massivamente para as Unidades
**Para que** o condomínio mantenha o fluxo de caixa saudável e fature o mês usando Asaas Integrado.

**Contexto Restritivo:** A tabela `LedgerEntry` é a fonte da verdade de caixa. Ela depende atritamente do `contractId`. A geração de "faturas" criará `Payment` no banco e tentará bater na API do Asaas (Mockada na V1 inicialmente até a integração final real). Tudo deve ter "idempotencyKey".

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Immutable Financial Ledger
  Scenario: Add a standard Expense to the Ledger
    Given an ADMIN
    When they submit an expense of $500 for "Manutenção Elevador"
    Then the system creates a LedgerEntry of type "DEBIT" with absolute amount -500
    And generates a unique correlationId

  Scenario: Idempotent Mass Billing (Geração de Quota)
    Given 120 active Units
    When the ADMIN triggers "Gerar Mensalidades"
    Then the system creates a pending PAYMENT for each Unit based on Base Price
    And uses "MMYYYY-CONTRACT-UNIT" as Idempotency Key to prevent duplicate bills
```

---

## 📖 Story 4.3: Livro de Ocorrências (O Tickets System V1)
**Como** Morador ou Síndico
**Quero** abrir e consultar chamados/ocorrências (Vazamentos, Barulho, Danos)
**Para que** formalizemos as reclamações abandonando os grupos de WhatsApp.

**Contexto Restritivo:** Se o usuário é Residente, só pode ler as ocorrências vinculadas à sua própria `unitId`. Se é ADMIN, lê e responde todas do `contractId`.

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Occurrences System
  Scenario: Resident opening an occurrence
    Given an authenticated RESIDENT
    When they create an occurrence categorized as "MANUTENÇÃO"
    Then the record is saved with their unitId and status OPEN

  Scenario: Admin responding and closing
    Given an OPEN occurrence
    When the ADMIN updates the status to RESOLVED
    Then the resident's App View reflects the changes immediately
```

---

## 📖 Story 4.4: Módulo de Portaria (Delivery Tracker)
**Como** Recepcionista (RECEPTION) ou Síndico
**Quero** registrar a chegada de encomendas para os apartamentos
**Para que** o Morador seja notificado no App e venha assinar a retirada.

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Delivery Tracker
  Scenario: Receptionist registers a package
    Given a user with RECEPTION role
    When they register a Delivery for Unit 402 with tracking code "BR123"
    Then the Delivery is marked as PENDING
    And it becomes visible in the Resident Dashboard of Unit 402 Owners/Tenants

  Scenario: Package retrieval
    Given a PENDING delivery
    When the resident retrieves it
    Then the status updates to RETRIEVED with a timestamp
```
