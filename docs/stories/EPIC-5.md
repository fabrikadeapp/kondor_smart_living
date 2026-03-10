# EPIC 5: ADVANCED GOVERNANCE (DIGITAL ASSEMBLIES & VOTING)
> Baseado no PRD V1.0 e Backlog Priorizado pelo PO
> **Status:** Planning

Este épico traz a transparência e a legalidade para o processo de decisão do condomínio, permitindo que assembleias ocorram de forma híbrida ou digital com validade jurídica e auditoria.

---

## 📖 Story 5.1: Agendamento de Assembleias e Pauta
**Como** Síndico (ADMIN)
**Quero** criar uma Assembleia com data, hora, link de vídeo e pauta (itens a serem discutidos)
**Para que** os moradores sejam notificados e possam se preparar.

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Assembly Scheduling
  Scenario: Creating a new Assembly
    Given an authenticated ADMIN
    When they create an assembly "Ordinária Jan/2026"
    Then the record is saved with status SCHEDULED
    And it is visible in the Resident Portal for that Contract
```

---

## 📖 Story 5.2: Itens de Pauta e Votação Digital
**Como** Sistema / ADMIN
**Quero** que cada item da pauta possa ser transformado em uma votação (Sim/Não/Abstenção ou Opções)
**Para que** possamos coletar os votos dos moradores de forma digital.

**Contexto Restritivo:** Um morador (Unit) só pode votar uma vez por item. Se a Unidade tem múltiplos donos, o primeiro voto "trava" a unidade ou exige procuração (V1 simplificada: 1 voto por Unit).

**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Virtual Voting Logic
  Scenario: Resident casting a vote
    Given an ACTIVE assembly
    When a RESIDENT from Unit 101 votes "SIM" on item "Reforma Fachada"
    Then a Vote record is created linked to Unit 101
    And the system prevents a second vote from the same unit
```

---

## 📖 Story 5.3: Quorum e Apuração em Tempo Real
**Como** ADMIN
**Quero** visualizar quantos moradores já votaram e qual o percentual de aprovação por item
**Para que** eu possa encerrar a assembleia com base no quorum necessário.

---

## 📖 Story 5.4: Geração de Ata (Minute)
**Como** ADMIN
**Quero** redigir a ata final baseada nos resultados das votações e exportar em PDF
**Para que** o documento possa ser registrado em cartório se necessário.
