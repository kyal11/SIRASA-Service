import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: 'superadmin@example.com',
      nim: '0012345678',
      password: await bcrypt.hash('superadmin123', 10),
      role: Role.superadmin,
      phoneNumber: '08123456789',
      name: 'Admin User',
      verified: true,
      imageUrl: null,
    },
    {
      email: 'admin@example.com',
      nim: '00123325678',
      password: await bcrypt.hash('admin123', 10),
      role: Role.admin,
      phoneNumber: '08123456434',
      name: 'Admin User',
      verified: true,
      imageUrl: null,
    },
    {
      email: 'user@example.com',
      nim: '0012345679',
      password: await bcrypt.hash('user123', 10),
      role: Role.user,
      phoneNumber: '08123453213',
      name: 'Regular User',
      verified: true,
      imageUrl: null,
    },
  ];

  for (const user of users) {
    const existingUser = await prisma.users.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      await prisma.users.create({
        data: user,
      });
      console.log(`User ${user.email} created successfully.`);
    } else {
      console.log(`User ${user.email} already exists.`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
