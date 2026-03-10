# Task 2.1: Onboarding Wizard (Epic 2)
ID: task-2-1-onboarding-wizard
Agent: wizard-dex

Instructions:
1.  Add `src/app/admin/onboarding` for the new contract setup.
2.  Implement the wizard steps (Stepper component + state machine logic).
3.  Step 1: CNPJ/Address (ViaCEP and CNPJ autocomplete).
4.  Step 2: Units structure generation (Blocks, # of units per block).
5.  Step 3: Initial Subscription/Boleto generation (Mock Asaas).
6.  Auto-create the `Contract`, `Membership` and `Unit` at the end.

Acceptance Criteria:
- ADMIN can easily set up a whole new condo/contract.
- Address info auto-fills via CEP.
- Macro-generation script successfully populates the `Unit` table for the contract.
- User redirected to dashboard with all units populated after wizard.
