// system/scripts/setup-env.mjs
//
// This is the 'prepare' script, it runs automatically after running `npm install`
// Currently, it copies the .env files to the root of the project if they don't exist
//
import isDocker from 'is-docker';
import { constants, copyFileSync, existsSync } from 'fs';
import path from 'path';

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

function main() {
  // These files are not copied to the container (so they wont exist in the container when running install)
  // Docker will handle its environment internally from the .env.docker files existing in the project root
  if (isDocker() || !isDev) {
    if (!isDev) {
      logger.log({
        level: 'info',
        message: 'Running in production mode, skipping .env setup...',
      });
    }
    return;
  }

  // Paths to the .env files
  const envPath = path.resolve('.env');
  const envDockerPath = path.resolve('.env.docker');
  const envDockerDevPath = path.resolve('.env.docker.dev');

  // If there is no Dockerfile, we don't need the .env.docker files
  const dockerfilePath = path.resolve('Dockerfile');
  const noDocker = !existsSync(dockerfilePath);

  // Copy the .env files if they don't exist
  const dotenvInitPath = path.resolve('system/dotenv-init');
  if (!existsSync(envPath)) {
    logger.log({
      level: 'info',
      message: 'Copying default .env file to project root...',
    });
    copyFileSync(`${dotenvInitPath}/.env`, './.env', constants.COPYFILE_EXCL);
  }
  if (!noDocker && !existsSync(envDockerPath)) {
    logger.log({
      level: 'info',
      message: 'Copying default .env.docker file to project root...',
    });
    copyFileSync(`${dotenvInitPath}/.env.docker`, './.env.docker', constants.COPYFILE_EXCL);
  }
  if (!noDocker && !existsSync(envDockerDevPath)) {
    logger.log({
      level: 'info',
      message: 'Copying default .env.docker.dev file to project root...',
    });
    copyFileSync(`${dotenvInitPath}/.env.docker.dev`, './.env.docker.dev', constants.COPYFILE_EXCL);
  }
}
main();
