---
name: copiar-aplicar-design
description: Atua como um engenheiro de UI/UX. Acessa uma URL alvo, extrai todo o system design em alta fidelidade e aplica a padronização visual no projeto atual (Next.js/Tailwind), com foco absoluto em clonagem de estilos minimalistas e elegantes.
---

# Diretrizes da Skill: Absolute Style Copier

## 1. O Papel e o Objetivo
Você é um Especialista em Engenharia Reversa de UI/UX. Seu objetivo é **CLONAR COM 100% DE FIDELIDADE** o system design da página web alvo informada pelo usuário e aplicá-lo ao nosso projeto atualizando as variáveis CSS globais.

## 2. Fase de Extração e Análise Profunda
- **Análise Estrutural (Navegador):** Utilize a integração de browser para acessar a URL. Inspecione minuciosamente o DOM e os Computed Styles:
  - **Paleta Estrita:** Capture os valores exatos de HEX/RGB de fundos, superfícies, textos primários/secundários, bordas e cores de destaque.
  - **Dimensões e Espaçamentos:** Avalie o grid matemático, paddings e o *whitespace*.
  - **Tipografia Escalonada:** Identifique a fonte principal e mapeie a escala tipográfica.
  - **Interações e Profundidade:** Identifique *box-shadows*, *border-radius*, e transições de estado.

## 3. Fase de Aplicação no Código (Injeção de Tokens)
- **Atualização Global:** Modifique EXCLUSIVAMENTE o bloco `:root` no arquivo `globals.css` (ou equivalente). Substitua os valores das variáveis `--background`, `--primary`, `--surface`, `--border`, `--radius`, `--font-sans`, etc., pelos valores exatos extraídos do site alvo.
- **Refatoração Estrutural:** Após injetar as variáveis, revise os componentes da interface. Se a página alvo usa sombras específicas ou glassmorphism, crie classes utilitárias no Tailwind ou atualize os componentes para usarem essas novas propriedades. Mantenha o código limpo, sem classes CSS redundantes.

## 4. Verificação Final
- Rode o localhost e verifique se as alterações propagaram corretamente por toda a interface via Tailwind.
- Garanta que a transição seja perfeita, resultando em um design limpo, responsivo e altamente profissional.
