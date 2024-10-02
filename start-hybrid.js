/**
 * Hybrid Development Server
 *
 * Overview:
 * - Watches the './src' directory for any file changes using 'chokidar'.
 * - On detecting a change:
 *   - Compiles TypeScript files using 'tsc' with the 'tsconfig.server.json' configuration, outputting to the '.nest' directory.
 *   - Restarts the Node.js server by running the compiled JavaScript files.
 * - Manages child processes to ensure only one instance of the server runs at a time.
 * - Handles graceful shutdown on 'Ctrl+C' or 'SIGINT', ensuring all child processes are terminated.
 * - Prevents multiple shutdowns using a closure to manage the shutdown state.
 * - Uses 'readline' to capture keypress events and override default terminal behavior.
 *
 * Key Features:
 * - **File Watching**: Monitors source files for changes and triggers recompilation and restart.
 * - **Process Management**: Keeps track of spawned processes and ensures clean termination.
 * - **Graceful Shutdown**: Listens for interrupt signals to perform a controlled shutdown.
 * - **Cross-Platform Compatibility**: Uses polling in 'chokidar' for better support on various file systems and environments.
 * - **Prisma Integration**: Regenerates the Prisma client and pushes schema changes to the database.
 *
 * Notes:
 * - Add the ability to disconnect the NextJS process during a restart, and reconnect it after the app is back up?
 * 
 */

const chokidar = require('chokidar');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const readline = require('readline');

// Array to store all running processes
let processes = [];

// Set to store all active promises
const activePromises = new Set();

// Check if the script is running in watch mode
const watch = process.argv.includes('--watch');

// Sanity check on arguments
if (process.argv.length > 2 && !process.argv.includes('--watch')) {
  console.error('Invalid argument. Use --watch to start the script in watch mode.');
  process.exit(1);
}

// Does the terminal support raw mode?
const supportsRawMode = !!process.stdin.setRawMode

if (supportsRawMode) {
  // Create a readline interface
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  // Prevent Ctrl+C from sending SIGINT to the process
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      // console.log('Ctrl+C was pressed, but it is disabled.');
      shutdown();
    }
  });
} else {
  // Inside the container, raw mode is not supported
  // Telemetry opt-out Next.js... If not in a container, the user's preference will be used
  process.env.NEXT_TELEMETRY_DISABLED = '1';
}

// Watch the 'src' directory for changes.
const watcher = (function () {
  if (!watch) {
    return;
  }

  // Initialize watcher.
  const watcher = chokidar.watch(['./src', './prisma', './public'], {
    persistent: true,
    ignoreInitial: true,
    usePolling: true,  // Use polling for better cross-platform support, particularly on network file systems or Docker containers
  });

  // Event listeners for when files change
  watcher.on('change', async (path) => {
    if (path === 'prisma/schema.prisma') {
      // npx prisma generate
      try {
        console.log('Prisma schema has been changed. Regenerating Prisma client...');
        await spawnProcess('npx', ['prisma', 'generate']);
      } catch (error) {
        console.error('Error generating Prisma client:', error.message);
      }

      // npx prisma db push
      try {
        console.log('Prisma schema has been changed. Pushing changes to the database...');
        await spawnProcess('npx', ['prisma', 'db', 'push', '--force-reset']);
      } catch (error) {
        console.error('Error pushing changes to the database:', error.message);
      }

      // Restart the app
      console.log(`Restarting app...`);
    } else {
      console.log(`'${path}' has been changed. Restarting app...`);
    }

    // Kill all running processes
    await stopAllProcesses();

    // Clear out old processes (should be empty after stopAllProcesses anyways)
    processes = [];

    // Start the app again
    startApp();
  });

  watcher.on('error', (error) => console.error(`Watcher error: ${error}`));

  return watcher;
})();

async function startApp() {
  if (process.env.NODE_ENV === 'production') {
    return trackPromise(startProduction());
  } else {
    return trackPromise(startDev());
  }
}

// Start the app
async function startDev() {
  try {
    await compile();
    await seedPrisma();
    await startServer()
  } catch (error) {
    console.error('Error during app execution:', error.message);
  }
}

// Start the app
async function startProduction() {
  return new Promise(async (resolve, reject) => {
    try {
      const { code } = await startServer();
      if (code !== 0) {
        console.error(`Process exited with code ${code}. Restarting...`);
        await sleep(1000); // Wait a bit before restarting
        startApp(); // Restart the server
      }
    } catch (error) {
      console.error('Error during app execution:', error.message);
    } finally {
      resolve();
    }
  });
}

// Defines a one-shot shutdown function, using a closure to prevent multiple shutdown calls
const shutdown = (() => {
  // Flag to prevent multiple shutdowns
  let shuttingDown = false;

  return async function () {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.log('\nShutting down...');

    if (supportsRawMode) {
      // Done with the raw mode
      process.stdin.setRawMode(false); // Let's the user use the terminal again  
      process.stdin.pause(); // Stop reading from stdin
    }

    // Close the watcher if it exists
    watcher?.close();

    // Kill all running processes
    await stopAllProcesses();

    // Wait for all tracked promises to finish before exiting
    await Promise.all(Array.from(activePromises));

    // Check if all processes have been killed
    if (processes.length > 0) {
      console.warn('Unable to kill the following processes:', processes.map((proc) => proc.pid).join(', '));
    }

    // Exit the process
    process.exit();
  }
})();

// Handle SIGINT signal by calling shutdown function
// Note: Ctrl-c is normally handled by the readline interface
process.on('SIGINT', async () => {
  await shutdown();
});

(async function main() {
  // Start the app
  console.log(watch ? 'Watching for file changes...' : 'Starting app...');
  try {
    await trackPromise(startApp())
  } catch (error) {
    console.error('Error starting app:', error.message);
  }
})();
process.stdin.resume(); // Keep the process alive

/*********************************************************************** */
/*  End of control flow, the remaining code contains helper functions    */
/*********************************************************************** */

// Helper function to sleep for a given number of milliseconds
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to create a generator that sleeps for a given number of milliseconds
async function* asleep(ms, retries = 3) {
  for (let i = 0; i < retries; i++) {
    yield sleep(ms);
  }
}

// Helper function to compile the app
async function compile() {
  return spawnProcess('tsc', ['--project', 'tsconfig.server.json', '--outDir', '.nest']);
}

// Helper function to seed the database
async function seedPrisma() {
  return spawnProcess('npx', ['prisma', 'db', 'seed']);
}

// Helper function to start the server
async function startServer() {
  return await spawnProcess('node', ['.nest/src/main.js']);
}

// Helper function to stop all running processes
async function stopAllProcesses(signals = ['SIGINT', 'SIGTERM', 'SIGKILL']) {
  // Get the first signal to use
  const signal = signals.shift();

  // Attempt to shutdown all processes using this signal
  await signalAllProcesses(signal);

  // Wait for all processes to exit, this is a retry mechanism
  for await (const result of asleep(100, 5)) {
    if (processes.length === 0)
      break;
  }

  // If there are still processes running, try the next signal
  if (processes.length > 0 && signals.length > 0) {
    await stopAllProcesses(signals);
  }
}

// Helper function to send a signal to all running processes
async function signalAllProcesses(signal) {
  // New processes array with only the processes that are still running
  processes = processes.filter((proc) => !proc.killed || proc.exitCode === null);

  if (processes.length === 0) {
    return;
  }

  await Promise.all(
    processes.map((childProcess) =>
      new Promise((resolve) => {
        kill(childProcess.pid, signal, (err) => {
          if (err) {
            console.error(`Error force killing process ${childProcess.pid}:`, err);
          }
          resolve(true);
        });
      })
    )
  );
}

// Helper function to track promises
function trackPromise(promise) {
  if (!promise || typeof promise.finally !== 'function') {
    throw new Error('trackPromise expects a Promise as an argument.');
  }
  activePromises.add(promise);
  promise.finally(() => activePromises.delete(promise));
  return promise;
}

// Helper function to spawn a child process
function spawnProcess(command, args, options = {}) {
  return trackPromise(new Promise((resolve, reject) => {
    let childProcess = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });
    processes.push(childProcess);

    childProcess.on('close', (code, signal) => {
      // Remove the child process from the list of running processes
      processes = processes.filter((p) => p !== childProcess);
      resolve({ code, signal });
    });

    childProcess.on('error', (err) => {
      reject(err);
    });
  }));
}


