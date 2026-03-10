# Task 4.3: Occurrences and Ticketing
ID: task-4-3-occurrences
Agent: ops-dex

Instructions:
1.  Add `src/app/admin/occurrences` (List of all tickets).
2.  Add `src/app/resident/dashboard/occurrences` (List of units' own tickets).
3.  Implement CRUD for occurrences (Resident creates, Admin resolves).
4.  Ensure status transitions are saved in the DB and reflect in both views.

Acceptance Criteria:
- Resident can open an occurrence.
- Admin can mark as "RESOLVED".
- All queries strictly filtered by `contractId` and `unitId`.
