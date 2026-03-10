# Task 4.2: Ledger Engine and Billing
ID: task-4-2-ledger-engine
Agent: fin-dex

Instructions:
1.  Create the `src/application/features/ledger` action for adding entries (Credit/Debit).
2.  Implement the "Gerar Boletos / Mensalidade" bulk action.
3.  Implement the idempotency check logic using the `MMYYYY-CONTRACT-UNIT` pattern.
4.  Mock the Asaas API call (Create Payment) in `src/infrastructure/services/payments`.

Acceptance Criteria:
- ADMIN can launch a manual expense (LedgerEntry created).
- ADMIN can trigger bulk billing generation.
- No duplicate Payment records for the same month/year per unit.
- LedgerEntries are never deleted/edited.
