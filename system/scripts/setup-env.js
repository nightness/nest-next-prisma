const { constants, copyFileSync, existsSync } = require('fs');
const path = require('path');

const isDocker = require('is-docker')();
if (isDocker) {
  return;
}

const envPath = path.resolve('.env');
const envDockerPath = path.resolve('.env.docker');
const envDockerDevPath = path.resolve('.env.docker.dev');

const dotenvInitPath = path.resolve('system/dotenv-init');

// Pass this flag to skip copying the .env.docker and .env.docker.dev files
const noDocker = process.argv.includes('--no-docker');

if (!existsSync(envPath)) {
  copyFileSync(`${dotenvInitPath}/.env`, './.env', constants.COPYFILE_EXCL);
}

if (!noDocker && !existsSync(envDockerPath)) {
  copyFileSync(`${dotenvInitPath}/.env.docker`, './.env.docker', constants.COPYFILE_EXCL);
}

if (!noDocker && !existsSync(envDockerDevPath)) {
  copyFileSync(`${dotenvInitPath}/.env.docker.dev`, './.env.docker.dev', constants.COPYFILE_EXCL);
}
