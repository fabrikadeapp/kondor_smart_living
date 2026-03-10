# TASK: 4.5 - FINANCIAL TRANSPARENCY REPORT (ADMIN/RESIDENT)
> **Assignee:** ops-dex
> **Status:** Planning

## Contexto
O condomínio precisa de transparência. Vamos mostrar onde cada Real está sendo gasto.

## Goals
1. Criar `src/app/admin/reports/transparency/page.tsx`.
2. Totalizar Receitas (Quotas + Marketplace) e Despesas (Manutenção, etc).
3. Mostrar um Gráfico ou Tabela consolidada por Categoria.
4. Mostrar o Balanço Geral (Receitas - Despesas).
5. Versão visual para o Morador no `Resident Dashboard` (seja via botão ou sumário).

## ACCEPTANCE CRITERIA
- Exibição de totais por categoria (Manutenção, Limpeza, Quotas).
- Audit trail de todas as transações Ledger `contract_id`.
