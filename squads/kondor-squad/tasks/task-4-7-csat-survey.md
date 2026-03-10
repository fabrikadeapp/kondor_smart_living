# TASK: 4.7 - AUTOMATIC SATISFACTION SURVEY (CSAT)
> **Assignee:** ops-dex
> **Status:** Planning

## Contexto
O síndico quer monitorar a qualidade do atendimento prestado aos moradores. Toda ocorrência resolvida deve disparar uma pesquisa.

## Goals
1. Criar novo modelo Prisma `SatisfactionSurvey` vinculado a `Occurrence`.
2. UI de Pesquisa para Morador:
   - Nota (1 a 5 estrelas).
   - Comentário opcional.
3. Lógica Automática (Automated Trigger):
   - Ao mudar ocorrência para `RESOLVED`, enviar `Notification` (WhatsApp/Push) com o link da pesquisa.
4. Dashboard de Admin:
   - Exibir média de satisfação (CSAT) no relatório de transparência ou operacional.

## ACCEPTANCE CRITERIA
- Morador consegue avaliar chamados resolvidos.
- Pesquisa só pode ser respondida uma vez por chamado.
- Admin visualiza a nota média por categoria de chamado.
