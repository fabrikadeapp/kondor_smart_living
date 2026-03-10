# TASK: 5.7 - AI ASSEMBLY TRANSCRIPTION
> **Assignee:** wizard-dex
> **Status:** Planning

## Contexto
O síndico não quer digitar a ata do zero. Ele quer um rascunho (Draft) gerado por IA com base nos tópicos da pauta.

## Goals
1. Criar Action `generateAIDraftMinuteAction`.
2. Integrar com a API da Anthropic/Google (Gemini) para processar:
   - Título da Assembleia.
   - Itens de Pauta e Votos Totais.
3. Gerar um texto estruturado (Markdown) como proposta de Ata.
4. UI para o síndico revisar e "Assinar" (Sign) a ata.

## ACCEPTANCE CRITERIA
- Texto da ata gerado contém os resultados reais da votação.
- Status da Ata muda de `DRAFT` para `SIGNED`.
