const { constants, copyFileSync, existsSync } = require('fs');
const path = require('path');

const envPath = path.resolve('.env');
const dotenvInitPath = path.resolve('system/dotenv-init');

if (!existsSync(envPath)) {
  copyFileSync(`${dotenvInitPath}/.env`, './.env', constants.COPYFILE_EXCL);
  copyFileSync(`${dotenvInitPath}/.env.docker`, './.env.docker', constants.COPYFILE_EXCL);
  copyFileSync(`${dotenvInitPath}/.env.docker.dev`, './.env.docker.dev', constants.COPYFILE_EXCL);
}
