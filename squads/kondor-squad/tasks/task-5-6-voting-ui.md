# TASK: 5.6 - PREMIUM VOTING UI (RESIDENT MOBILE)
> **Assignee:** wizard-dex
> **Status:** Planning

## Contexto
A UI de votação precisa ser extremamente simples e rápida para o morador no celular.

## Goals
1. Criar `src/app/resident/assemblies/[id]/page.tsx`.
2. Listar itens de pauta (Polls) como Cards Interativos.
3. Implementar o voto com `Optimistic UI` (feedback imediato).
4. Mostrar barra de progresso (ex: "3 de 5 itens votados").

## ACCEPTANCE CRITERIA
- Morador consegue votar em múltiplas opções em uma única tela.
- Estado do botão muda para "Votado" após o clique.
- Bloqueio de re-voto via UI (puxando do DB).
