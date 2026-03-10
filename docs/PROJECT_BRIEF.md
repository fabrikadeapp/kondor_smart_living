# PROJECT BRIEF: Kondor Smart Living

**Status:** Aprovado para PRD (Product Requirements Document)
**Autor:** @aiox-analyst (Atlas)
**Data:** 09 de Março de 2026

---

## 1. VISÃO EXECUTIVA
**Kondor Smart Living** é uma plataforma SaaS B2B "Product-Led" construída para revolucionar a administração condominial no Brasil. Não se trata apenas de digitalizar comunicados, mas de consolidar toda a operação — Financeira, Relacional (Síndico x Morador), Governança (Assembleias) e Monetização (Marketplace) — num ecossistema único, robusto e multi-tenant (vários condomínios na mesma base).

O objetivo é uma plataforma comercializável "em caixinha", preparada para escalar em volume de condomínios e UHs (Unidades Habitacionais), permitindo faturamento extra via Add-ons e transações de Marketplace.

## 2. PÚBLICO-ALVO & PERSONAS
O sistema atenderá 5 personas distintas, sob rigorosa gestão de acesso (RBAC + ABAC):

1. **SUPERADMIN (Plataforma):** Donos do SaaS. Controle global (MRR, Clientes, Planos, Add-ons).
2. **ADMIN (Síndicos Profissionais/Moradores e Administradoras):** Clientes pagantes. Gerem um ou múltiplos condomínios simultaneamente (Context Switch obrigatório).
3. **RESIDENT (Morador / Proprietário):** Usuário final. App-view minimalista, focado em resolver problemas sem atrito (1 clique para boleto, 1 clique para assembleia). Pode ter múltiplas UHs no mesmo condomínio.
4. **RECEPTION (Portaria):** Operacional. Foco em velocidade (encomendas, ocorrências de rotina e mural).
5. **SPECIALIST (Prestadores e Operadores de Nicho):** Acesso cirúrgico configurado limitadamente pelo Admin (ex: Manutencista que só vê aba de Manutenções).

## 3. PROPOSTA DE VALOR & POSICIONAMENTO
*   **Para a Administradora/Síndico Profissional:** "Um login para todos os seus condomínios. Um dashboard real-time de inadimplência e manutenção."
*   **Para o Morador:** "Tudo a um clique. Do boleto do mês à compra de serviços para o seu lar."
*   **Zero Atrito (Frictionless UX):** Todo o sistema deve ser auto-explicativo. Campos de formulário com máscaras automáticas (CPF, CNPJ, Telefone, CEP que preenche endereço sozinho). A meta é evitar tickets de suporte por "dificuldade de uso".

## 4. MOTORES DE NEGÓCIO & MONETIZAÇÃO
A arquitetura de faturamento não será fixa; ela se moldará ao cliente:
*   **Assinatura Híbrida (SaaS):** Valor base do plano (Essencial, Profissional, Enterprise) + Custo escalonado por Unidade Habitacional (UH) excedente.
*   **Complementos (Add-Ons):** Funcionalidades como OCR Avançado, Analytics Gerencial e Automações serão vendidos como "módulos extras" para condomínios.
*   **Marketplace Transacional:** A plataforma ganha capacidade de comissionamento (Take Rate) transacionando produtos e serviços internos via **Asaas** (Split Payment nativo).

## 5. DECISÕES DE ARQUITETURA E UX (DIRETRIZES TÉCNICAS)
*   **Isolamento Multi-Tenant "Hard":** NUNCA misturar dados de condomínios em uma query. O `contract_id` é chave master invisível no Backend.
*   **O Ledger Imutável:** Lançamentos financeiros são *Append-Only*. Não existe `DELETE` em dinheiro. Erros geram estornos compensatórios.
*   **Banco de Dados:** PostgreSQL com ORM Prisma (Schema inicial já criado).
*   **Stack Visual:** Next.js 14 (App Router), TailwindCSS, Shadcn/UI, Zustand (State Management client-side). Estética: Clean, Clinico-Tech, White Label flexível (cores de base customizáveis por tenant).
*   **Gestão de Documentos e Atas:** Versionamento simplificado mapeado no BD (Link S3 seguro para leitura), sem over-engineering inicial.
*   **Integrações Nucleares Decididas:** Asaas (Gateway de Payment, Assinaturas e Split), ViaCEP ou similar (Autocompletar).

## 6. DEFINIÇÃO DO WIZARD MÁGICO (ONBOARDING LIMITLESS)
A adesão do cliente (Síndico) não pode depender de um time de implantação de 15 dias.
O assistente de onboarding deve prever automações: ao inserir o CEP, montar o endereço; ao definir 2 Torres com 10 andares e 4 aptos por andar, gerar automaticamente dezenas UHs no banco. Se tiver planilhas legadas, CSV de importação direta.

---

> Esse Project Brief é o insumo principal para o `/aiox-pm` estruturar o Product Requirements Document (PRD) com Epics e User Stories e o Guia Gherkin validável.
