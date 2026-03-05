import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PMS 0.1 with new schema...');

  // 1. Create System Configs
  await prisma.systemConfig.upsert({
    where: { key: 'WIP_LIMIT_PER_USER' },
    update: {},
    create: { key: 'WIP_LIMIT_PER_USER', value: '3' },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'P1_LIMIT_PER_USER' },
    update: {},
    create: { key: 'P1_LIMIT_PER_USER', value: '1' },
  });

  // 2. Create a Team
  const mainTeam = await prisma.team.create({
    data: {
      name: 'Core Operations',
    }
  });

  // 3. Create an Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      role: 'ADMIN' as Role,
      status: 'active',
      teamId: mainTeam.id
    }
  });

  // 4. Create a Manager
  const manager = await prisma.user.create({
    data: {
      name: 'Alex Executioner',
      role: 'MANAGER' as Role,
      status: 'active',
      teamId: mainTeam.id
    }
  });

  // 5. Create a Team Lead
  const teamLead = await prisma.user.create({
    data: {
      name: 'Sam Leader',
      role: 'TEAM_LEAD' as Role,
      status: 'active',
      teamId: mainTeam.id
    }
  });

  // 6. Create Contributors
  const users = [
    { name: 'Jordan Builder', role: 'CONTRIBUTOR' as Role },
    { name: 'Taylor Developer', role: 'CONTRIBUTOR' as Role },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: {
        ...u,
        status: 'active',
        teamId: mainTeam.id
      },
    });
  }

  // 7. Set Team Leader
  await prisma.team.update({
    where: { id: mainTeam.id },
    data: { leaderId: teamLead.id }
  });

  // 8. Create a Sample Project
  await prisma.project.create({
    data: {
      name: 'Q1 Execution Excellence',
      description: 'Main project for the first quarter throughput optimization.',
      managerId: manager.id,
      status: 'active'
    }
  });

  console.log('Seed completed successfully! 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
