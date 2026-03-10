# TASK: 6.2 - ASAAS CHECKOUT INTEGRATION (MARKETPLACE)
> **Assignee:** fin-dex
> **Status:** Planning

## Contexto
Ao contratar um serviço no marketplace, o morador deve ser levado a um checkout real (Asaas).

## Goals
1. Integrar `AsaasService` para gerar `paymentLink` ou `boleto/pix` para o serviço.
2. Salvar o `link` no `MarketplaceOrder`.
3. Adicionar botão "Realizar Pagamento" no portal do morador.
4. Notificar o Ledger do PRÉDIO assim que o status for `PAID` (Webhook ou manual mock em V1).

## ACCEPTANCE CRITERIA
- Clique em "Contratar" gera uma transação no Asaas.
- Redirecionamento ou exibição do QR Code Pix.
- Atualização do status da Order.
