# TASK: 4.8 - FINES & DIGITAL WARNINGS
> **Assignee:** ops-dex
> **Status:** Planning

## Contexto
O síndico precisa aplicar penalidades (Multas e Advertências) por infrações ao regimento interno.

## Goals
1. Criar modelo Prisma `FineWarning`.
2. UI de Admin para emitir Multa/Advertência:
   - Selecionar Unidade.
   - Selecionar Artigo do Regimento.
   - Anexar Foto/Prova.
   - Definir Valor (se Multa).
3. Lógica Financeira:
   - Multas geram um `CREDIT` (Receita) no Ledger do Condomínio.
   - Gerar "Boleto" (simulado) ou adicionar no próximo vencimento.
4. Notificação Automática:
   - Enviar `Notification` (WhatsApp/Push) para o morador infrator.

## FEATURE GATE
- Código: `FINES_AND_WARNINGS`

## ACCEPTANCE CRITERIA
- Admin consegue aplicar multa com valor.
- Histórico de multas visível no dashboard da Unidade.
- Débito aparece no relatório financeiro.
