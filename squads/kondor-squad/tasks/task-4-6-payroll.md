# TASK: 4.6 - EMPLOYEE & PAYROLL MANAGEMENT
> **Assignee:** fin-dex
> **Status:** Planning

## Contexto
O condomínio tem custos fixos (Porteiros, Zeladores, Limpeza). A administradora precisa gerenciar e pagar.

## Goals
1. Criar novo modelo Prisma `Employee`.
2. UI de Admin para Gerenciar Equipe:
   - Cadastrar Nome, Cargo, Salário.
   - Definir se é Próprio ou Terceirizado.
3. Botão "Realizar Pagamento de Salários":
   - Gera débitos automáticos no **Ledger** (Livro Caixa) por cada funcionário.
4. Histórico de Pagamentos de Folha.

## ACCEPTANCE CRITERIA
- Cadastro de funcionário funcional.
- Execução de folha gera entradas `DEBIT` no Ledger.
- Filtro de "Recursos Humanos" no Relatório de Transparência.
