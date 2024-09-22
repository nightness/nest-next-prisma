const chokidar = require('chokidar');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const readline = require('readline');

// Create a readline interface
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// Prevent Ctrl+C from terminating the process
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    // console.log('Ctrl+C was pressed, but it is disabled.');
    shutdown();
  }
});

let processes = [];

const activePromises = new Set();

// Helper function to track promises
function trackPromise(promise) {
  if (!promise || typeof promise.finally !== 'function') {
      throw new Error('trackPromise expects a Promise as an argument.');
  }
  activePromises.add(promise);
  promise.finally(() => activePromises.delete(promise));
  return promise;
}

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

// Initialize watcher.
const watcher = chokidar.watch('./src', {
  persistent: true,
  ignoreInitial: true,
  usePolling: true,  // Use polling for better cross-platform support, particularly on network file systems or Docker containers
});

// Helper function to compile the app
async function compile() {
  return trackPromise(spawnProcess('tsc', ['--project', 'tsconfig.server.json', '--outDir', '.nest']));
}

// Start the app
async function startApp() {
  try {
    await compile();
    // console.log('Compilation complete');
    await trackPromise(spawnProcess('node', ['.nest/src/main.js']));
  } catch (error) {
    console.error('Error during app execution:', error.message);
  }
}

async function killProcesses() {
  // Filter out processes that have already been killed
  processes = processes.filter((proc) => !proc.killed);

  // Kill each process gracefully with SIGTERM
  await Promise.all(
    processes.map((childProcess) =>
      new Promise((resolve) => {
        // console.log(`Killing process ${childProcess.pid}`);
        kill(childProcess.pid, 'SIGTERM', (err) => {
          if (err) {
            console.error(`Error killing process ${childProcess.pid}:`, err);
          }
          resolve(true);
        });
      })
    )
  );

  // Wait for 500ms to allow graceful shutdown
  await new Promise((resolve) => setTimeout(resolve, 500));

  // New processes array with only the processes that are still running
  processes = processes.filter((proc) => !proc.killed);

  // Force kill any remaining processes
  await Promise.all(
    processes.map((childProcess) =>
      new Promise((resolve) => {
        // console.log(`Force killing process ${childProcess.pid}`);
        kill(childProcess.pid, 'SIGKILL', (err) => {
          if (err) {
            console.error(`Error force killing process ${childProcess.pid}:`, err);
          }
          resolve(true);
        });
      })
    )
  );
}

let shuttingDown = false;
async function shutdown() {
  if (!shuttingDown) {
    shuttingDown = true;
    console.log('\nShutting down...');

    // Close the watcher
    watcher.close();

    // Kill all running processes
    await killProcesses();
  }

  // Check if all processes have been killed
  if (processes.length > 0) {
    // Wait for 500ms to allow graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter out processes that have already been killed
    processes = processes.filter((proc) => !proc.killed);
    if (processes.length > 0) {
      console.error('Unable to kill the following processes:', processes.map((proc) => proc.pid).join(', '));
      // process.exit(1);
    }
  }

  // Wait for all tracked promises to finish before exiting
  await Promise.all(Array.from(activePromises));

  // Stop reading from stdin
  // process.stdin.setRawMode(false); // TTY mode
  process.stdin.pause();

  // 100ms delay to allow console output to complete
  await new Promise((resolve) => setTimeout(resolve, 100));
}

process.on('SIGINT', async () => { 
  await shutdown();

  // Exit the process
  process.exit();
});

// Event listeners for when files change
watcher.on('change', async (path) => {
  console.log(`${path} has been changed. Restarting app...`);

  // Kill all running processes
  await killProcesses();

  // Clear out old processes
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