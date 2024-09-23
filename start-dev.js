const chokidar = require('chokidar');
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
    // console.log('Ctrl+C was pressed, but it is disabled.');
    shutdown();
  }
});

// Initialize watcher.
const watcher = chokidar.watch('./src', {
  persistent: true,
  ignoreInitial: true,
  usePolling: true,  // Use polling for better cross-platform support, particularly on network file systems or Docker containers
});

// Start the app
async function startApp() {
  try {
    await compile();
    await startServer()
  } catch (error) {
    console.error('Error during app execution:', error.message);
  }
}

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log('\nShutting down...');

  // Done with the raw mode
  process.stdin.setRawMode(false); // Let's the user use the terminal again  
  process.stdin.pause(); // Stop reading from stdin

  // Close the watcher
  watcher.close();

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

// Handle SIGINT signal by calling shutdown function, normally this is handled by the readline interface
process.on('SIGINT', async () => { 
  await shutdown();
});

// Event listeners for when files change
watcher.on('change', async (path) => {
  console.log(`${path} has been changed. Restarting app...`);

  // Kill all running processes
  await stopAllProcesses();

  // Clear out old processes (should be empty after killProcesses anyways)
  processes = [];

  // Start the app again
  startApp();
});

watcher.on('error', (error) => console.error(`Watcher error: ${error}`));

(async function main() {
  // Start the app
  console.log('Starting app...');
  try {
    await trackPromise(startApp())
  } catch (error) {
    console.error('Error starting app:', error.message);
  }
})();
process.stdin.resume(); // Keep the process alive

// Helper function to sleep for a given number of milliseconds
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to compile the app
async function compile() {
  return spawnProcess('tsc', ['--project', 'tsconfig.server.json', '--outDir', '.nest']);
}

// Helper function to start the server
async function startServer() {
  return await spawnProcess('node', ['.nest/src/main.js']);
}

// Helper function to stop all running processes
async function stopAllProcesses() {
  // Send SIGTERM to all running child processes
  await signalAllProcesses('SIGTERM');

  // Wait for 500ms to allow graceful shutdown
  await sleep(500);

  // Send SIGKILL to all running child processes
  await signalAllProcesses('SIGKILL');
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
      resolve(code, signal);
    });

    childProcess.on('error', (err) => {
      reject(err);
    });
  }));
}


