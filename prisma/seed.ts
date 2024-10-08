import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // See if 'admin@localhost' user already exists
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@localhost' },
  });

  if (adminUser) {
    console.log('Admin user already exists:', adminUser);
    return;
  }

  // Seed users
  const user = await createUser({
    email: 'admin@localhost',
    name: 'Admin',
    password: 'admin',
    isActive: true,
    isAdmin: true,
    isEmailVerified: true,
  });

  console.log('Created user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function createUser({
  email,
  name,
  password,
  isActive = true,
  isAdmin = false,
  isEmailVerified = false,
}: {
  email: string;
  name: string;
  password: string;
  isActive?: boolean;
  isAdmin?: boolean;
  isEmailVerified?: boolean;
}) {
  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
      isActive,
      isAdmin,
      isEmailVerified,
    },
  });
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}


// async function comparePassword(
//   enteredPassword: string,
//   storedPasswordHash: string,
// ): Promise<boolean> {
//   return bcrypt.compare(enteredPassword, storedPasswordHash);
// }
