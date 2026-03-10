# TASK: 4.4 - CONCIERGE & DELIVERIES (PORTARIA)
> **Assignee:** ops-dex
> **Status:** Planning

## Contexto
O porteiro recebe a encomenda e avisa o morador. É a principal tarefa da recepção.

## Goals
1. Criar Server Action `registerDeliveryAction`.
2. UI de Portaria (Dashboard Admin simplificado):
   - Receber encomenda (Código, Transportadora, Unidade).
   - Status: `RECEIVED` (pelo porteiro), `PICKED_UP` (pelo morador).
3. Mostrar "Entregas Pendentes" no Dashboard do Morador.
4. Timeline de entrega no detalhe da Unidade.

## ACCEPTANCE CRITERIA
- Morador vê a notificação no dashboard.
- Porteiro pode dar "baixa" na entrega (PICKED_UP).
- Auditoria de quem recebeu (user_id do porteiro).
