# TASK: 1.6 - WHATSAPP/PUSH NOTIFICATION ENGINE
> **Assignee:** ops-dex
> **Status:** Planning

## Contexto
O morador quer saber de tudo por WhatsApp e Push. Vamos centralizar o log de envios.

## Goals
1. Criar novo modelo Prisma `Notification` (se não houver).
2. Criar Action `sendNotificationAction(unitId, message, type)`.
3. Integrar com um Mock (V1) que loga na tabela `Notification`.
4. Definir Gatilhos (Triggers):
   - Encomenda recebida (Portaria).
   - Assembleia aberta (Governança).
   - Boleto vencendo (Financeiro).
5. Log visual para Admin gerenciar envios pendentes.

## ACCEPTANCE CRITERIA
- Notificação fica visível no "Feed" do morador.
- Moradores com telefone cadastrado recebem log de WhatsApp (simulado).
