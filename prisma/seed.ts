import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createLogger, format, transports } from 'winston';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV !== 'production';

// Create a logger
const logger = createLogger({
  // level: 'info',
  format: format.combine(format.cli(), format.timestamp()),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.cli(),
        format.timestamp()
      ),
    }),
  ],
});

const prisma = new PrismaClient();

async function main() {
  // Log the environment
  logger.log({
    level: 'info',
    message: `Environment: ${NODE_ENV}`,
  });

  // Any initialization code goes here
  // ...

  // For development, seed the database with an admin user
  if (isDev) {
    // See if 'admin@localhost' user already exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@localhost' },
    });

    // If the user already exists, log it and return
    if (adminUser) {
      logger.log({
        level: 'info',
        message: 'Admin user already exists',
      });
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

    // Log the created user
    logger.log({
      level: 'info',
      message: 'Created admin user with email: admin@localhost',
      user,
    });
  }
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
