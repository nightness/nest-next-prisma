const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.resolve('.env');
const dotenvInitPath = path.resolve('system/dotenv-init');

if (!fs.existsSync(envPath)) {
  console.log('.env file not found. Copying from system/dotenv-init...');
  execSync(`cp -r ${dotenvInitPath}/* ./`, { stdio: 'inherit' });
  console.log('.env setup complete.');
} else {
  console.log('.env file already exists.');
}
