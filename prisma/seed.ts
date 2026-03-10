import { PrismaClient, Role, ContractStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database - Condo Lab Master Setup...')

  // 1. First Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@kondorsmartliving.com' },
    update: {},
    create: {
      email: 'admin@kondorsmartliving.com',
      name: 'Global Administrator',
      passwordHash: '$2b$10$YourHashedPasswordHere',
      is2FAEnabled: false,
    },
  })

  // 2. Features mapping
  console.log('Creating base features for Condo Lab...')
  const baseFeatures = [
    { code: 'DASHBOARD_BASIC', name: 'Dashboard Básico' },
    { code: 'UNIT_MANAGEMENT', name: 'Gestão de Unidades' },
    { code: 'RESIDENT_MANAGEMENT', name: 'Gestão de Moradores' },
    { code: 'OCCURRENCES', name: 'Ocorrências e Chamados' },
    { code: 'FINANCE_OPERATIONAL', name: 'Financeiro Operacional' },
    { code: 'ASSEMBLIES', name: 'Assembleias Digitais' },
    { code: 'VOTING', name: 'Votações Virtuais' },
    { code: 'REPORTS_ADVANCED', name: 'Relatórios Avançados' },
    { code: 'MARKETPLACE', name: 'Marketplace Transacional' },
    { code: 'NOTIFICATIONS_WHATSAPP', name: 'Notificações WhatsApp/Push' },
    { code: 'FINES_AND_WARNINGS', name: 'Multas e Advertências Digitais' },
    { code: 'STAFF_TIME_CLOCK', name: 'Ponto Digital (Staff/RH)' },
    { code: 'CSAT_ANALYTICS', name: 'BI: Satisfação & CSAT' },
  ]

  const featureMap: Record<string, string> = {}
  for (const f of baseFeatures) {
    const created = await prisma.feature.upsert({
      where: { code: f.code },
      update: { name: f.name },
      create: f
    })
    featureMap[f.code] = created.id
  }

  // 3. Planos: Bronze, Silver, Gold
  console.log('Creating Kondo Plans (Bronze, Silver, Gold)...')

  // BRONZE - Essencial
  await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' }, // Hardcoded ID for seed consistency
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Bronze (Essencial/Trial)',
      basePrice: 199.00,
      billingCycle: 'MONTHLY',
      badge: 'Novato',
      displayOrder: 1,
      planFeatures: {
        create: [
          { featureId: featureMap['DASHBOARD_BASIC'] },
          { featureId: featureMap['UNIT_MANAGEMENT'] },
          { featureId: featureMap['RESIDENT_MANAGEMENT'] },
          { featureId: featureMap['OCCURRENCES'] },
          { featureId: featureMap['FINANCE_OPERATIONAL'] },
        ]
      },
      unitTiers: {
        create: [{ minUnits: 0, maxUnits: 50, pricePerUnit: 2.00, flatPrice: 0 }]
      }
    }
  })

  // SILVER - Profissional
  await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Silver (Profissional)',
      basePrice: 499.00,
      billingCycle: 'MONTHLY',
      badge: 'Mais Vendido',
      displayOrder: 2,
      planFeatures: {
        create: [
          { featureId: featureMap['DASHBOARD_BASIC'] },
          { featureId: featureMap['UNIT_MANAGEMENT'] },
          { featureId: featureMap['RESIDENT_MANAGEMENT'] },
          { featureId: featureMap['OCCURRENCES'] },
          { featureId: featureMap['FINANCE_OPERATIONAL'] },
          { featureId: featureMap['ASSEMBLIES'] },
          { featureId: featureMap['VOTING'] },
          { featureId: featureMap['NOTIFICATIONS_WHATSAPP'] },
          { featureId: featureMap['REPORTS_ADVANCED'] },
        ]
      },
      unitTiers: {
        create: [{ minUnits: 0, maxUnits: 100, pricePerUnit: 1.80, flatPrice: 0 }]
      }
    }
  })

  // GOLD - Master/BI
  await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Gold (Master Full)',
      basePrice: 999.00,
      billingCycle: 'MONTHLY',
      badge: 'Completo',
      displayOrder: 3,
      planFeatures: {
        create: baseFeatures.map(f => ({ featureId: featureMap[f.code] }))
      },
      unitTiers: {
        create: [{ minUnits: 0, maxUnits: null, pricePerUnit: 1.50, flatPrice: 0 }]
      }
    }
  })
  // 4. Demo Condomínio
  console.log('Creating demo contract...')
  const demoContract = await prisma.contract.upsert({
    where: { cnpj: '00.000.000/0001-91' },
    update: { planId: '00000000-0000-0000-0000-000000000001' },
    create: {
      cnpj: '00.000.000/0001-91',
      legalName: 'Condomínio KONDOR Demo',
      tradeName: 'Kondor Tower',
      status: ContractStatus.ACTIVE,
      planId: '00000000-0000-0000-0000-000000000001', // Bronze
      units: {
        create: [
          { block: 'A', number: '101' },
          { block: 'A', number: '102' }
        ]
      }
    }
  })

  // 5. Membership para Superadmin
  await prisma.membership.upsert({
    where: { userId_contractId: { userId: superAdmin.id, contractId: demoContract.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      contractId: demoContract.id,
      role: Role.SUPERADMIN
    }
  })

  console.log('Seed Condo Lab executed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
