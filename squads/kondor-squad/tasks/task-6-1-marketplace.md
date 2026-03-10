# TASK: 6.1 - MARKETPLACE FOUNDATION (CONDOMINIUM PARTNERS)
> **Assignee:** fin-dex
> **Status:** Planning

## Contexto
O condomínio quer oferecer serviços (Limpeza, Elétrica, Pintura) que paguem uma taxa (commission) para o condomínio.

## Goals
1. Criar modelo Prisma `Partner` e `PartnerService` (se não houver).
2. UI de Admin para gerenciar Parcerias:
   - Cadastrar Empresa Parceira.
   - Definir Comissão (%).
3. Mostrar "Serviços do Condomínio" no Portal do Morador.
4. Integrar com o **Ledger** para que 1 venda gere comissão automática p/ o prédio.

## ACCEPTANCE CRITERIA
- Grid de parceiros visível no Admin.
- Registro de transação automática `CREDIT` no Ledger `contractId` ao contratar.
