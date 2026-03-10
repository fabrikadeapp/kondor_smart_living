# TASK: 5.5 - GOVERNANCE PDF GENERATION (MINUTES)
> **Assignee:** wizard-dex
> **Status:** Planning

## Contexto
Toda assembleia finalizada precisa de uma ata (Minute) que contenha o resumo das votações. O síndico precisa gerar esse PDF para registro.

## Goals
1. Criar um Server Action `generateAssemblyMinuteAction`.
2. Utilizar `jspdf` para gerar um layout clínico (Laura.IA style) com:
   - Logo Kondor.
   - Nome do Condomínio.
   - Pauta e Votos (Sim/Não/Total).
3. Salvar o PDF no storage (ou mockar a URL em V1).
4. Adicionar botão "Gerar Ata Final" na UI de Admin.

## ACCEPTANCE CRITERIA
- Geração de PDF funcional com dados reais da `AssemblyPoll`.
- Salvar registro em `AssemblyMinute`.
