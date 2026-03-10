# TASK: 5.8 - CSAT ANALYTICS & GOVERNANCE DASHBOARD
> **Assignee:** wizard-dex
> **Status:** Planning

## Contexto
O síndico e o conselho querem ver a "Saúde do Condomínio" (NPS do Morador).

## Goals
1. Criar novo dashboard BI em `/admin/reports/csat`.
2. UI BI Analytics:
   - Média Global de Estrelas (1-5).
   - Rating por Categoria (Elevador, Limpeza, Barulho).
   - "Top 5 Categorias Negativas" vs "Top 5 Positivas".
3. Gráfico de Evolução Mensal (Timeline de Satisfação).
4. Alertas de Baixa Satisfação (< 3 estrelas persistentes).

## FEATURE GATE
- Código: `CSAT_ANALYTICS`

## ACCEPTANCE CRITERIA
- Dashboard renderiza com base nos dados reais de `SatisfactionSurvey`.
- Filtro por período.
- IA gera comentário resumido: "O condomínio está satisfeito com X, mas reclama de Y".
