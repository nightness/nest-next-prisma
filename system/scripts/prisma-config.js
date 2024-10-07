#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');

const program = new Command();

program
  .requiredOption('--provider <type>', 'Specify the database provider')
  .option('--defaults', 'Use default settings (non-interactive)');

program.parse(process.argv);

const options = program.opts();

// List of supported providers
const supportedProviders = ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'mongodb', 'cockroachdb'];

async function main() {
  let provider = options.provider;
  if (!supportedProviders.includes(provider)) {
    console.error(`Unsupported provider: ${provider}`);
    console.error(`Supported providers are: ${supportedProviders.join(', ')}`);
    process.exit(1);
  }

  if (!options.defaults) {
    // Interactive mode
    const providerAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select a database provider',
        choices: supportedProviders,
        default: provider
      }
    ]);

    provider = providerAnswer.provider;

    // Ask for database connection details
    const dbQuestions = [
      {
        type: 'input',
        name: 'address',
        message: 'Database Address (e.g., localhost:5432)',
        default: 'localhost'
      },
      {
        type: 'input',
        name: 'user',
        message: 'Database User',
        default: 'user'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database Password',
        mask: '*'
      },
      {
        type: 'input',
        name: 'database',
        message: 'Database Name',
        default: 'mydb'
      }
    ];

    const dbAnswers = await inquirer.prompt(dbQuestions);

    // Compose the DATABASE_URL
    let databaseUrl = '';
    switch (provider) {
      case 'postgresql':
        databaseUrl = `postgresql://${dbAnswers.user}:${dbAnswers.password}@${dbAnswers.address}/${dbAnswers.database}`;
        break;
      case 'mysql':
        databaseUrl = `mysql://${dbAnswers.user}:${dbAnswers.password}@${dbAnswers.address}/${dbAnswers.database}`;
        break;
      case 'sqlite':
        databaseUrl = `file:${dbAnswers.database}.db`;
        break;
      case 'sqlserver':
        databaseUrl = `sqlserver://${dbAnswers.user}:${dbAnswers.password}@${dbAnswers.address};database=${dbAnswers.database}`;
        break;
      case 'mongodb':
        databaseUrl = `mongodb://${dbAnswers.user}:${dbAnswers.password}@${dbAnswers.address}/${dbAnswers.database}`;
        break;
      case 'cockroachdb':
        databaseUrl = `postgresql://${dbAnswers.user}:${dbAnswers.password}@${dbAnswers.address}/${dbAnswers.database}?sslmode=verify-full`;
        break;
      default:
        console.error(`Unsupported provider: ${provider}`);
        process.exit(1);
    }

    // Update the .env file
    const envFilePath = path.resolve(process.cwd(), '.env');
    let envFileContent = '';
    if (fs.existsSync(envFilePath)) {
      envFileContent = fs.readFileSync(envFilePath, 'utf8');
    }

    // Update or add the DATABASE_URL variable
    const envLines = envFileContent.split('\n');
    let databaseUrlSet = false;
    for (let i = 0; i < envLines.length; i++) {
      if (envLines[i].startsWith('DATABASE_URL=')) {
        envLines[i] = `DATABASE_URL="${databaseUrl}"`;
        databaseUrlSet = true;
        break;
      }
    }
    if (!databaseUrlSet) {
      envLines.push(`DATABASE_URL="${databaseUrl}"`);
    }

    fs.writeFileSync(envFilePath, envLines.join('\n'), 'utf8');
    console.log(`Updated .env file with DATABASE_URL`);
  } else {
    console.log(`Using defaults, no changes made to .env file.`);
  }

  // Update the schema.prisma file
  const schemaFilePath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaFilePath)) {
    console.error(`schema.prisma file not found at ${schemaFilePath}`);
    process.exit(1);
  }

  let schemaContent = fs.readFileSync(schemaFilePath, 'utf8');

  // Regex to find provider in datasource block
  const providerRegex = /provider\s*=\s*".*?"/;
  schemaContent = schemaContent.replace(providerRegex, `provider = "${provider}"`);

  fs.writeFileSync(schemaFilePath, schemaContent, 'utf8');
  console.log(`Updated schema.prisma with provider: ${provider}`);

  // Run npx prisma validate
  console.log(`Running npx prisma validate...`);
  try {
    child_process.execSync('npx prisma validate', { stdio: 'inherit' });
  } catch (error) {
    console.error(`Prisma validation failed.`);
    process.exit(1);
  }
}

main();
