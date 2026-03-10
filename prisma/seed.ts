import { PrismaClient, Role, ContractStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Cria Firt Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@kondorsmartliving.com' },
    update: {},
    create: {
      email: 'admin@kondorsmartliving.com',
      name: 'Global Administrator',
      passwordHash: '$2b$10$YourHashedPasswordHere', // Use bcrypt!
      is2FAEnabled: false,
    },
  })

  // 2. Features
  console.log('Creating base features...')
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
  ]
  const createdFeatures = await Promise.all(
    baseFeatures.map(f => prisma.feature.upsert({
      where: { code: f.code },
      update: {},
      create: f
    }))
  )
  const [fDash, fUnits, fRes, fOccurrences, fFin, fAss, fVoting, fRep, fMkt] = createdFeatures

  // 3. Planos Base
  console.log('Creating base plans...')
  const planEssencial = await prisma.plan.create({
    data: {
      name: 'Essencial',
      basePrice: 199.00,
      billingCycle: 'MONTHLY',
      badge: '',
      hasTrial: true,
      displayOrder: 1,
      planFeatures: {
        create: [
          { featureId: fDash.id },
          { featureId: fUnits.id },
          { featureId: fRes.id },
          { featureId: fOccurrences.id },
          { featureId: fFin.id },
        ]
      },
      unitTiers: {
        create: [
           { minUnits: 0, maxUnits: 100, pricePerUnit: 2.00, flatPrice: 0 }
        ]
      }
    }
  })

  const planProfissional = await prisma.plan.create({
    data: {
      name: 'Profissional',
      basePrice: 399.00,
      billingCycle: 'MONTHLY',
      badge: 'Mais Escolhido',
      displayOrder: 2,
      planFeatures: {
        create: [
          { featureId: fDash.id },
          { featureId: fUnits.id },
          { featureId: fRes.id },
          { featureId: fOccurrences.id },
          { featureId: fFin.id },
          { featureId: fAss.id },
          { featureId: fVoting.id },
        ]
      },
      unitTiers: {
        create: [
           { minUnits: 0, maxUnits: null, pricePerUnit: 1.50, flatPrice: 0 }
        ]
      }
    }
  })

  // 4. Demo Condomínio
  console.log('Creating demo contract...')
  const demoContract = await prisma.contract.create({
    data: {
      cnpj: '00.000.000/0001-91',
      legalName: 'Condomínio KONDOR Demo',
      tradeName: 'Kondor Tower',
      status: ContractStatus.ACTIVE,
      units: {
        create: [
          { block: 'A', number: '101' },
          { block: 'A', number: '102' }
        ]
      }
    },
    include: { units: true }
  })

  // 5. Associar Superadmin ao contrato demo (Membership) para testes
  await prisma.membership.create({
    data: {
      userId: superAdmin.id,
      contractId: demoContract.id,
      role: Role.SUPERADMIN
    }
  })

  console.log('Seed executed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
