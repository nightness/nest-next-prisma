/**
 * Production startup script that runs the server from the '/.nest' directory.
 *
 * Features:
 * - Starts the Node.js server from the compiled files in '/.nest'.
 * - Automatically restarts the server if it crashes.
 * - Handles graceful shutdown on 'Ctrl+C' or 'SIGINT', ensuring all child processes are terminated.
 * - Reuses functions from 'start-dev.js' for process management and shutdown handling.
 *
 * Usage:
 * - Run this script to start your application in production mode.
 * - Ensure that your application is built and the output is in the '/.nest' directory before running.
 */

const { spawn } = require('child_process');
const kill = require('tree-kill');
const readline = require('readline');

// Array to store all running processes
let processes = [];

// Set to store all active promises
const activePromises = new Set();

// Create a readline interface
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// Prevent Ctrl+C from sending SIGINT to the process
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    shutdown();
  }
});

// Start the app
async function startApp() {
  return trackPromise(
    new Promise(async (resolve, reject) => {
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
    })
  );
}

// // Helper function to spawn a child process
// function spawnProcess(command, args, options = {}) {
//   return trackPromise(
//     new Promise((resolve, reject) => {
//       let childProcess = spawn(command, args, {
//         ...options,
//       });
//       processes.push(childProcess);

//       childProcess.on('close', async (code, signal) => {
//         // Remove the child process from the list of running processes
//         processes = processes.filter((p) => p !== childProcess);

//         resolve({ code, signal });
//       });

//       childProcess.on('error', (err) => {
//         reject(err);
//       });
//     })
//   );
// }


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

    // Done with the raw mode
    process.stdin.setRawMode(false); // Lets the user use the terminal again
    process.stdin.pause(); // Stop reading from stdin

    // Kill all running processes
    await stopAllProcesses();

    // Wait for all tracked promises to finish before exiting
    await Promise.all(Array.from(activePromises));

    // Check if all processes have been killed
    if (processes.length > 0) {
      console.warn(
        'Unable to kill the following processes:',
        processes.map((proc) => proc.pid).join(', ')
      );
    }

    // Exit the process
    process.exit();
  };
})();

// Handle SIGINT signal by calling shutdown function
process.on('SIGINT', async () => {
  await shutdown();
});

(async function main() {
  // Start the app
  console.log('Starting app...');
  try {
    await startApp();
  } catch (error) {
    console.error('Error starting app:', error.message);
  }
})();

// Keep the process alive
process.stdin.resume();

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

// Helper function to start the server
function startServer() {
  return spawnProcess('node', ['.nest/src/main.js'], { stdio: 'inherit' });
}

// Helper function to stop all running processes
async function stopAllProcesses() {
  // Send SIGTERM to all running child processes
  await signalAllProcesses('SIGTERM');

  // Wait for all processes to exit, this is a retry mechanism
  for await (const result of asleep(100, 5)) {
    if (processes.length === 0) break;
  }

  // Send SIGKILL to all hung child processes
  if (processes.length > 0) {
    await signalAllProcesses('SIGKILL');
  }
}

// Helper function to send a signal to all running processes
async function signalAllProcesses(signal) {
  // Filter out processes that have already exited
  processes = processes.filter((proc) => !proc.killed || proc.exitCode === null);

  if (processes.length === 0) {
    return;
  }

  await Promise.all(
    processes.map(
      (childProcess) =>
        new Promise((resolve) => {
          kill(childProcess.pid, signal, (err) => {
            if (err) {
              console.error(`Error killing process ${childProcess.pid}:`, err);
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
  return trackPromise(
    new Promise((resolve, reject) => {
      let childProcess = spawn(command, args, {
        ...options,
      });
      processes.push(childProcess);

      childProcess.on('close', async (code, signal) => {
        // Remove the child process from the list of running processes
        processes = processes.filter((p) => p !== childProcess);

        resolve({ code, signal });
      });

      childProcess.on('error', (err) => {
        reject(err);
      });
    })
  );
}
