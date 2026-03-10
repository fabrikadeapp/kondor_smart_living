# Task 4.1: Units and Resident CRUD
ID: task-4-1-units-crud
Agent: ops-dex

Instructions:
1.  Implement the remaining Client-Side Forms (Modals) for creating Units.
2.  Implement the linkResident component (Modal/Dialog) to bind emails to units.
3.  Ensure `createUnitAction` and `linkResidentAction` are fully integrated and tested with the UI.
4.  Add simple table search/filter by unit number or block.

Acceptance Criteria:
- ADMIN can add a new unit from the UI.
- ADMIN can link a user email to a unit.
- The UI refreshes immediately after creation (revalidatePath).
- All queries use the `contractId` from the active context.
