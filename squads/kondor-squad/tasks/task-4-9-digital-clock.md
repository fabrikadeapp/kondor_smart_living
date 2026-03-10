# TASK: 4.9 - STAFF DIGITAL TIME CLOCK
> **Assignee:** fin-dex
> **Status:** Planning

## Contexto
O condomínio precisa monitorar a assiduidade do Staff (Porteiros, Zeladores). Ponto realizado via QRCode ou Pin.

## Goals
1. Criar novo modelo Prisma `TimeSheetEntry`.
2. UI de Ponto para Staff:
   - Registrar Entrada (Clock In).
   - Registrar Intervalo (Breaks).
   - Registrar Saída (Clock Out).
3. Localização (Opcional):
   - Verificar Geo-fence (coordenadas do condomínio).
4. Exportação para Folha (Task 4.6):
   - Calcular horas extras e atrasos para o Payroll.

## FEATURE GATE
- Código: `STAFF_TIME_CLOCK`

## ACCEPTANCE CRITERIA
- Funcionário bate ponto com sucesso.
- Admin visualiza folha de ponto mensal de cada `Employee`.
- Bloquear batida de ponto se o funcionário estiver `INACTIVE`.
