# Guia Mestre de Orquestração AIOX 👑

Este documento descreve a sequência lógica e a passagem de bastão entre os agentes do **Synkra AIOX**, garantindo um ciclo de desenvolvimento impenetrável, previsível e alinhado aos princípios Globais (Multi-tenant, Clean Architecture, Segurança).

---

## A) FASE 1: CONCEPÇÃO & REQUISITOS (PLANEJAMENTO)

A regra de ouro do AIOX é **nunca codificar antes de documentar**. A fase de planejamento define as restrições globais do sistema.

### 1. `/aiox-analyst` (Concepção & Brainstorming)
**Onde tudo começa.**
- **Ação Principal:** `*brainstorm` e `*gather-requirements`.
- **Papel:** Facilita sessões estruturadas de ideação com o usuário ou equipe. Explora o mercado (clínicas/smart living), extrai as reais necessidades do negócio e traduz as restrições globais (LGPD, isolamento multi-tenant).
- **Entregável:** Um documento bruto de *Insights*, *Features* Desejadas e Limites de Escopo.

### 2. `/aiox-pm` (Produto & Especificação)
**O funil de negócios.**
- **Ação Principal:** Redação do **Product Requirements Document (PRD)**.
- **Papel:** Pega o *brainstorming* do Analyst e transforma em um documento acionável. Define os Épicos (ex: Motor de Agendamento, Prontuário Clínico Eletrônico), jornadas de usuário, e garante que as premissas de negócio (como comissão atrelada a preenchimento de prontuário) estejam explícitas.
- **Entregável:** `PRD.md` contendo todos os Épicos e prioridades.

### 3. `/aiox-ux-design-expert` (Design System)
**A camada visual "Clinico-Tech".**
- **Ação Principal:** Extração de tokens e idealização de interface.
- **Papel:** Trabalha em paralelo ao PM para definir a gramática visual (componentes Shadcn, paleta neutra, feedback states: sucesso, alerta, erro). Nenhuma tela é criada genericamente.
- **Entregável:** Documento de Especificação de UI/UX e Design Tokens.

---

## B) FASE 2: ARQUITETURA & FUNDAÇÃO (FOUNDATION)

Com o PRD em mãos, a engenharia entra para desenhar as plantas do sistema.

### 4. `/aiox-architect` (Desenho Técnico)
**O guardião do framework.**
- **Ação Principal:** `*create-plan` e especificações técnicas.
- **Papel:** Analisa o `PRD.md` e estabelece a stack real (React, Next.js, Supabase, etc). Garante que a arquitetura siga o padrão Multi-tenant exigido, separando persistência, camadas de serviço e definindo transações críticas (Ledger Imutável).
- **Entregável:** `Architecture_Specs.md` e `System_Diagrams`.

### 5. `/aiox-data-engineer` (Persistência e RLS)
**O guardião dos dados.**
- **Ação Principal:** Modela o banco e as migrações.
- **Papel:** Conduz o desenho físico do banco de dados lado a lado com o Arquiteto. Seu foco número um é criar o schema onde *todas* as queries dependem do filtro de `contract_id` e a segurança via RLS (Row Level Security) no Supabase.
- **Entregável:** `Schema.sql` e scripts de Migration.

### 6. `/aiox-devops` (Integração Contínua)
**A esteira ágil.**
- **Ação Principal:** `*setup-pipelines` e Infraestrutura as Code.
- **Papel:** Prepara o repositório, cria *Github Actions*, configura a gestão de segredos (Secret Manager) e garante proteções de branch e versionamento.

---

## C) FASE 3: REFINAMENTO & EXECUÇÃO (CICLO DIÁRIO)

A partir daqui, a execução acontece de forma atômica e extremamente controlada via histórias.

### 7. `/aiox-po` (Product Owner)
**O tradutor para o time.**
- **Ação Principal:** Quebra os Épicos e gerencia o Backlog.
- **Papel:** Converte o `PRD.md` e as `Architecture_Specs.md` em itens de backlog (User Stories) granulares e prioriza o que deve ser desenvolvido primeiro na Sprint.

### 8. `/aiox-sm` (Scrum Master)
**O controlador de qualidade e contexto.**
- **Ação Principal:** Cria arquivos `.md` individuais para cada História.
- **Papel:** Ele preenche a História com TUDO o que o Desenvolvedor precisa: contexto do negócio, diagrama, e principalmente, Gherkins de Critérios de Aceite e Definition of Done (DoD). Garante que o Desenvolvedor não precise "adivinhar" regras.
- **Entregável:** `Story-[ID].md` prontas para execução.

### 9. `/aiox-dev` (O Executor Fullstack)
**O codificador focado.**
- **Ação Principal:** Codificação e Testes.
- **Papel:** Abre o `Story-[ID].md` validado pelo SM e gera/modifica o código fonte estritamente associado àquela história, obedecendo regras de TypeScript, testes unitários, formatação de logs (Trace, Contract_id) e padronizações estritas.
- **Entregável:** Pull Request e Código Comitável.

### 10. `/aiox-qa` (Auditor de Qualidade)
**O guardião anti-regressão.**
- **Ação Principal:** Evita débitos técnicos e validação do fluxo.
- **Papel:** Revisa todo Pull Request do `/aiox-dev`. Ele levanta as bandeiras se a completude técnica falhar (cobertura abaixo de 80%, endpoint rodando sem Tenant Filter, falta de Logs de Auditoria para campos sensíveis).

---

## D) FASE 4: ORQUESTRAÇÃO SUPERIOR E EXCEÇÕES

### 11. `/aiox-master` (Orion - O Orquestrador)
**Desenvolvimento do próprio AIOX e workflow complexo.**
- **Ação Principal:** Alterações complexas, automações, ou socorro geral.
- **Papel:** Usado sempre que houver falhas de alinhamento em escala, ou for necessário reprogramar um agente, redefinir como a equipe deve atuar e gerar novas regras globais (ou `rules.md` para as IDEs).

---

## DICA DE RETENÇÃO DE CONTEXTO
> Sempre faça a passagem de bastão! Se o PM terminar o PRD, instrua o Arquiteto:
> *"@aiox-architect, por favor, leia o PRD gerado em `docs/PRD.md` e inicie a arquitetura técnica considerando a restrição X e Y."*
