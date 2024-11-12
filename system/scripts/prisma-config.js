#!/usr/bin/env node
/**
 * This script requires the following npm packages:
 * - commander
 * - inquirer
 * - js-yaml
 *
 * Install them by running:
 * npm install commander inquirer js-yaml
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { Command } = require('commander');
const inquirer = require('inquirer').default || require('inquirer');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const yaml = require('js-yaml');

const program = new Command();

// List of supported providers
const supportedProviders = [
  'postgresql',
  'mysql',
  'sqlite',
  'sqlserver',
  'mongodb',
  'cockroachdb',
];

program
  .option('--provider <type>', 'Specify the database provider')
  .option('--defaults', 'Use default settings (non-interactive)')
  .addHelpText(
    'after',
    `
Available providers:
  ${supportedProviders.join('\n  ')}
`
  );

program.parse(process.argv);

const options = program.opts();

// List of .env files to update
const envFiles = ['.env', '.env.docker', '.env.docker.dev'];

/**
 * Database service configurations for docker-compose files.
 */
const dbServices = {
  postgresql: {
    serviceName: 'postgres',
    image: 'postgres:13',
    environment: {
      POSTGRES_USER: 'user',
      POSTGRES_PASSWORD: 'password',
      POSTGRES_DB: 'mydb',
    },
    ports: ['5432:5432'],
    volumes: ['postgres-data:/var/lib/postgresql/data'],
  },
  mysql: {
    serviceName: 'mysql',
    image: 'mysql:8.0',
    environment: {
      MYSQL_ROOT_PASSWORD: 'root',
      MYSQL_DATABASE: 'mydb',
      MYSQL_USER: 'user',
      MYSQL_PASSWORD: 'password',
    },
    ports: ['3306:3306'],
    volumes: ['mysql-data:/var/lib/mysql'],
  },
  sqlite: {
    // SQLite is file-based, so no service needed
    serviceName: null,
  },
  sqlserver: {
    serviceName: 'mssql',
    image: 'mcr.microsoft.com/mssql/server:2019-latest',
    environment: {
      ACCEPT_EULA: 'Y',
      SA_PASSWORD: 'yourStrong(!)Password',
      MSSQL_PID: 'Express',
    },
    ports: ['1433:1433'],
    volumes: ['mssql-data:/var/opt/mssql'],
  },
  mongodb: {
    serviceName: 'mongo',
    image: 'mongo:latest',
    environment: {
      MONGO_INITDB_ROOT_USERNAME: 'user',
      MONGO_INITDB_ROOT_PASSWORD: 'password',
      MONGO_INITDB_DATABASE: 'mydb',
    },
    ports: ['27017:27017'],
    volumes: ['mongo-data:/data/db'],
  },
  cockroachdb: {
    serviceName: 'cockroachdb',
    image: 'cockroachdb/cockroach:v21.1.6',
    command: 'start-single-node --insecure',
    ports: ['26257:26257'],
    volumes: ['cockroach-data:/cockroach/cockroach-data'],
  },
};

async function main() {
  let provider = options.provider;

  // Validate provider if specified
  if (provider && !supportedProviders.includes(provider)) {
    console.error(`Unsupported provider: ${provider}`);
    console.error(`Supported providers are: ${supportedProviders.join(', ')}`);
    process.exit(1);
  }

  let dbAnswers = {};

  if (options.defaults) {
    // Non-interactive mode: Use default settings
    if (!provider) {
      provider = 'postgresql'; // Default provider
    }

    dbAnswers = {
      user: 'user',
      password: 'password',
      database: 'mydb',
    };

    switch (provider) {
      case 'postgresql':
        dbAnswers.address = 'localhost:5432';
        break;
      case 'mysql':
        dbAnswers.address = 'localhost:3306';
        break;
      case 'sqlite':
        // SQLite doesn't require address, user, or password
        break;
      case 'sqlserver':
        dbAnswers.address = 'localhost:1433';
        break;
      case 'mongodb':
        dbAnswers.address = 'localhost:27017';
        break;
      case 'cockroachdb':
        dbAnswers.address = 'localhost:26257';
        break;
      default:
        console.error(`Unsupported provider: ${provider}`);
        process.exit(1);
    }

    console.log(`Using default settings for provider: ${provider}`);
  } else {
    // Interactive mode
    if (!provider) {
      // Prompt for provider if not specified
      const providerAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: 'Select a database provider',
          choices: supportedProviders,
        },
      ]);
      provider = providerAnswer.provider;
    }

    // Ask for database connection details based on provider
    let dbQuestions = [];

    if (provider === 'sqlite') {
      dbQuestions = [
        {
          type: 'input',
          name: 'database',
          message: 'Database file name',
          default: 'dev',
        },
      ];
    } else {
      dbQuestions = [
        {
          type: 'input',
          name: 'address',
          message: 'Database Address (e.g., localhost:5432)',
          default:
            provider === 'mysql'
              ? 'localhost:3306'
              : provider === 'postgresql'
                ? 'localhost:5432'
                : provider === 'sqlserver'
                  ? 'localhost:1433'
                  : provider === 'mongodb'
                    ? 'localhost:27017'
                    : provider === 'cockroachdb'
                      ? 'localhost:26257'
                      : 'localhost',
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
    }

    dbAnswers = await inquirer.prompt(dbQuestions);

    // In the main function, after dbAnswers is populated
    let host = dbAnswers.address;
    let port = '';
    if (dbAnswers.address.includes(':')) {
      [host, port] = dbAnswers.address.split(':');
    } else {
      port = getDefaultPort(provider);
    }

    dbAnswers.address = `${host}:${port}`;

    // Helper function to get default port
    function getDefaultPort(provider) {
      switch (provider) {
        case 'postgresql':
          return '5432';
        case 'mysql':
          return '3306';
        case 'sqlite':
          return '';
        case 'sqlserver':
          return '1433';
        case 'mongodb':
          return '27017';
        case 'cockroachdb':
          return '26257';
        default:
          throw new Error("")
      }
    }
  }

  // Generate the DATABASE_URL
  let databaseUrl;
  try {
    databaseUrl = generateDatabaseUrl(provider, dbAnswers);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  // Update the .env files
  updateEnvFiles(databaseUrl);

  // Update Prisma schema file
  updatePrismaSchema(provider);

  // Update docker-compose files
  updateDockerComposeFiles(provider);

  console.log('Database provider has been switched successfully!');
}

/**
 * Generates the DATABASE_URL based on the provider and connection details.
 * @param {string} provider - The database provider.
 * @param {object} dbAnswers - The database connection details.
 * @returns {string} - The DATABASE_URL string.
 */
function generateDatabaseUrl(provider, dbAnswers) {
  const user = encodeURIComponent(dbAnswers.user);
  const password = encodeURIComponent(dbAnswers.password);
  const address = dbAnswers.address;
  const database = encodeURIComponent(dbAnswers.database);

  switch (provider) {
    case 'postgresql':
      return `postgresql://${user}:${password}@${address}/${database}`;
    case 'mysql':
      return `mysql://${user}:${password}@${address}/${database}`;
    case 'sqlite':
      return `file:./${database}.db`;
    case 'sqlserver':
      return `sqlserver://${user}:${password}@${address};database=${database}`;
    case 'mongodb':
      return `mongodb://${user}:${password}@${address}/${database}`;
    case 'cockroachdb':
      return `postgresql://${user}:${password}@${address}/${database}?sslmode=disable`;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Updates the .env files with the DATABASE_URL.
 * @param {string} databaseUrl - The DATABASE_URL string.
 */
function updateEnvFiles(databaseUrl) {
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
}

/**
 * Updates the Prisma schema file with the database provider.
 * @param {string} provider - The database provider.
 */
function updatePrismaSchema(provider) {
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
  datasourceBlock = datasourceBlock.replace(
    providerRegex,
    `provider = "${provider}"`
  );

  // Replace the old datasource block with the updated one
  schemaContent = schemaContent.replace(datasourceRegex, datasourceBlock);

  fs.writeFileSync(schemaFilePath, schemaContent, 'utf8');
  console.log(`Updated schema.prisma with provider: ${provider}`);

  // Run npx prisma validate
  console.log(`Running npx prisma validate...`);
  try {
    child_process.execSync('npx prisma validate', { stdio: 'inherit' });
  } catch (error) {
    console.error(`Prisma validation failed.`, error?.message);
    process.exit(1);
  }
}

/**
 * Updates the docker-compose files with the database service.
 * @param {string} provider - The database provider.
 */
function updateDockerComposeFiles(provider) {
  // Update docker-compose files
  const dockerComposeFiles = ['docker-compose.yml', 'docker-compose.dev.yml'];

  for (const composeFileName of dockerComposeFiles) {
    const composeFilePath = path.resolve(process.cwd(), composeFileName);
    if (fs.existsSync(composeFilePath)) {
      console.log(`Updating ${composeFileName}...`);
      const composeContent = fs.readFileSync(composeFilePath, 'utf8');
      let composeYAML;
      try {
        composeYAML = yaml.load(composeContent);
      } catch (e) {
        console.error(`Failed to parse ${composeFileName}:`, e.message);
        continue;
      }

      // Remove existing database services
      const existingDbServices = [
        'mysql',
        'postgres',
        'mssql',
        'mongo',
        'cockroachdb',
      ];
      for (const serviceName of existingDbServices) {
        if (composeYAML.services && composeYAML.services[serviceName]) {
          delete composeYAML.services[serviceName];
        }
      }

      // Add the selected database service if applicable
      const dbServiceConfig = dbServices[provider];
      if (dbServiceConfig && dbServiceConfig.serviceName) {
        composeYAML.services[dbServiceConfig.serviceName] = {
          image: dbServiceConfig.image,
          environment: dbServiceConfig.environment,
          ports: dbServiceConfig.ports,
          volumes: dbServiceConfig.volumes,
          networks: ['app-net'],
        };
        if (dbServiceConfig.command) {
          composeYAML.services[dbServiceConfig.serviceName].command =
            dbServiceConfig.command;
        }

        // Update volumes
        composeYAML.volumes = composeYAML.volumes || {};
        for (const volume of dbServiceConfig.volumes) {
          const volumeName = volume.split(':')[0];
          if (!composeYAML.volumes[volumeName]) {
            composeYAML.volumes[volumeName] = null;
          }
        }
      }

      // Write the updated compose file
      const newComposeContent = yaml.dump(composeYAML, { noRefs: true });
      fs.writeFileSync(composeFilePath, newComposeContent, 'utf8');
      console.log(
        `Updated ${composeFileName} with ${provider} database service.`
      );
    } else {
      console.warn(`File ${composeFileName} not found.`);
    }
  }
}

main().catch((error) => {
  console.error('An error occurred:', error);
});
