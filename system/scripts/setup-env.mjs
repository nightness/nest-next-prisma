// system/scripts/setup-env.mjs
import isDocker from 'is-docker';
import { constants, copyFileSync, existsSync } from 'fs';
import path from 'path';

// This script is run after running `npm install`
// Currently, it copies the .env files to the root of the project if they don't exist

function main() {
  // These files are not copied to the container (so they wont exist in the container when running install)
  // Docker will handle its environment internally from the .env.docker files
  if (isDocker()) {
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
    copyFileSync(`${dotenvInitPath}/.env`, './.env', constants.COPYFILE_EXCL);
  }
  if (!noDocker && !existsSync(envDockerPath)) {
    copyFileSync(`${dotenvInitPath}/.env.docker`, './.env.docker', constants.COPYFILE_EXCL);
  }
  if (!noDocker && !existsSync(envDockerDevPath)) {
    copyFileSync(`${dotenvInitPath}/.env.docker.dev`, './.env.docker.dev', constants.COPYFILE_EXCL);
  }
}
main();
