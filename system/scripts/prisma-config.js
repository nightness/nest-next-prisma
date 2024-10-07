#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer').default || require('inquirer');
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');

const program = new Command();

// List of supported providers
const supportedProviders = ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'mongodb', 'cockroachdb'];

program
  .requiredOption('--provider <type>', 'Specify the database provider')
  .option('--defaults', 'Use default settings (non-interactive)')
  .addHelpText('after', `
Available providers:
  ${supportedProviders.join('\n  ')}
`);

program.parse(process.argv);

const options = program.opts();

// List of .env files to update
const envFiles = ['.env', '.env.docker', '.env.docker.dev'];

async function main() {
  let provider = options.provider;
  if (!supportedProviders.includes(provider)) {
    console.error(`Unsupported provider: ${provider}`);
    console.error(`Supported providers are: ${supportedProviders.join(', ')}`);
    process.exit(1);
  }

  let databaseUrl = '';

  if (!options.defaults) {
    // Interactive mode
    const providerAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select a database provider',
        choices: supportedProviders,
        default: provider,
      },
    ]);

    provider = providerAnswer.provider;

    // Ask for database connection details
    const dbQuestions = [
      {
        type: 'input',
        name: 'address',
        message: 'Database Address (e.g., localhost:5432)',
        default: 'localhost',
      },
      {
        type: 'input',
        name: 'user',
        message: 'Database User',
        default: 'user',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database Password',
        mask: '*',
      },
      {
        type: 'input',
        name: 'database',
        message: 'Database Name',
        default: 'mydb',
      },
    ];

    const dbAnswers = await inquirer.prompt(dbQuestions);

    // FIXME: Move the switch statement to a reusable function to remove code duplication

    // Compose the DATABASE_URL
    switch (provider) {
      case 'postgresql':
        databaseUrl = `postgresql://${dbAnswers.user}:${dbAnswers.password}@${dbAnswers.address}/${dbAnswers.database}`;
        break;
      case 'mysql':
        databaseUrl = `mysql://${dbAnswers.user}:${dbAnswers.password}@${dbAnswers.address}/${dbAnswers.database}`;
        break;
      case 'sqlite':
        databaseUrl = `file:./${dbAnswers.database}.db`;
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
  } else {
    // Non-interactive mode: Set default DATABASE_URL based on provider
    // FIXME: USE THE DEFAULT
    switch (provider) {
      case 'postgresql':
        databaseUrl = 'postgresql://user:password@localhost:5432/mydb';
        break;
      case 'mysql':
        databaseUrl = 'mysql://user:password@localhost:3306/mydb';
        break;
      case 'sqlite':
        databaseUrl = 'file:./dev.db';
        break;
      case 'sqlserver':
        databaseUrl = 'sqlserver://user:password@localhost:1433;database=mydb';
        break;
      case 'mongodb':
        databaseUrl = 'mongodb://user:password@localhost:27017/mydb';
        break;
      case 'cockroachdb':
        databaseUrl = 'postgresql://user:password@localhost:26257/mydb?sslmode=verify-full';
        break;
      default:
        console.error(`Unsupported provider: ${provider}`);
        process.exit(1);
    }
    console.log(`Using default DATABASE_URL for provider: ${provider}`);
  }

  // Update the .env files
  for (const envFileName of envFiles) {
    const envFilePath = path.resolve(process.cwd(), envFileName);
    let envFileContent = '';

    if (fs.existsSync(envFilePath)) {
      envFileContent = fs.readFileSync(envFilePath, 'utf8');
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
      console.log(`Updated ${envFileName} with DATABASE_URL`);
    } else {
      // Create the .env file with DATABASE_URL if it doesn't exist
      fs.writeFileSync(envFilePath, `DATABASE_URL="${databaseUrl}"\n`, 'utf8');
      console.log(`Created ${envFileName} with DATABASE_URL`);
    }
  }

  // Update the schema.prisma file
  const schemaFilePath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaFilePath)) {
    console.error(`schema.prisma file not found at ${schemaFilePath}`);
    process.exit(1);
  }

  let schemaContent = fs.readFileSync(schemaFilePath, 'utf8');

  // Regex to find the datasource block
  const datasourceRegex = /datasource\s+\w+\s+\{[^}]*\}/gm;
  const datasourceMatch = schemaContent.match(datasourceRegex);

  if (!datasourceMatch) {
    console.error('Could not find the datasource block in schema.prisma');
    process.exit(1);
  }

  let datasourceBlock = datasourceMatch[0];

  // Regex to find provider in datasource block
  const providerRegex = /provider\s*=\s*".*?"/;
  datasourceBlock = datasourceBlock.replace(providerRegex, `provider = "${provider}"`);

  // Replace the old datasource block with the updated one
  schemaContent = schemaContent.replace(datasourceRegex, datasourceBlock);

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
