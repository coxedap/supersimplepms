import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PMS 0.1...');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Acme Corp',
      slug: 'acme-corp',
    },
  });

  // 2. Create System Configs (scoped to org)
  await prisma.systemConfig.createMany({
    data: [
      { id: crypto.randomUUID(), key: 'WIP_LIMIT_PER_USER', value: '3', organizationId: org.id },
      { id: crypto.randomUUID(), key: 'P1_LIMIT_PER_USER', value: '1', organizationId: org.id },
    ],
  });

  // 3. Create a Team (no leader yet)
  const mainTeam = await prisma.team.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Core Operations',
      organizationId: org.id,
    },
  });

  const passwordHash = await bcrypt.hash('password123', 12);

  // 4. Create Admin
  const admin = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'System Admin',
      email: 'admin@acme.com',
      passwordHash,
      role: 'ADMIN' as Role,
      status: 'active',
      teamId: mainTeam.id,
      organizationId: org.id,
    },
  });

  // 5. Create Manager
  const manager = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Alex Executioner',
      email: 'manager@acme.com',
      passwordHash,
      role: 'MANAGER' as Role,
      status: 'active',
      teamId: mainTeam.id,
      organizationId: org.id,
    },
  });

  // 6. Create Team Lead
  const teamLead = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Sam Leader',
      email: 'lead@acme.com',
      passwordHash,
      role: 'TEAM_LEAD' as Role,
      status: 'active',
      teamId: mainTeam.id,
      organizationId: org.id,
    },
  });

  // 7. Create Contributors
  const contributors = [
    { name: 'Jordan Builder', email: 'jordan@acme.com' },
    { name: 'Taylor Developer', email: 'taylor@acme.com' },
  ];

  for (const c of contributors) {
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: c.name,
        email: c.email,
        passwordHash,
        role: 'CONTRIBUTOR' as Role,
        status: 'active',
        teamId: mainTeam.id,
        organizationId: org.id,
      },
    });
  }

  // 8. Set Team Leader
  await prisma.team.update({
    where: { id: mainTeam.id },
    data: { leaderId: teamLead.id },
  });

  // 9. Create a Sample Project
  await prisma.project.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Q1 Execution Excellence',
      description: 'Main project for the first quarter throughput optimization.',
      managerId: manager.id,
      status: 'active',
      organizationId: org.id,
    },
  });

  console.log('Seed completed!');
  console.log('Login with: admin@acme.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
