const chokidar = require('chokidar');
const { spawn } = require('child_process');
const kill = require('tree-kill');

// Begin reading from stdin so the process does not exit.
process.stdin.resume();

let processes = [];

function spawnProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    let childProcess = spawn(command, args, {
      stdio: 'inherit', // Use this to inherit stdio so you can see output in the console
      ...options,
    });
    processes.push(childProcess);

    // Resolve the promise if the child process finishes successfully
    childProcess.on('close', (code) => {
      // processes = processes.filter((p) => p !== childProcess);
      if (code === 0) {
        // Remove the child process from the list of running processes
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    // Handle any errors in spawning the process
    childProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Initialize watcher.
const watcher = chokidar.watch('./src', {
  persistent: true,
  ignoreInitial: true,
  usePolling: true,  // Use polling for better cross-platform support, particularly on network file systems or Docker containers
});

// Start the app
async function startApp() {
  try {
    await spawnProcess('tsc', ['--project', 'tsconfig.server.json', '--outDir', '.nest']);
    console.log('Compilation complete');
    await spawnProcess('node', ['.nest/src/main.js']);
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
        console.log(`Killing process ${childProcess.pid}`);
        kill(childProcess.pid, 'SIGTERM', (err) => {
          if (err) {
            console.error(`Error killing process ${childProcess.pid}:`, err);
          }
          resolve(true);
        });
      })
    )
  );

  // Wait for 1 second to allow graceful shutdown
  await new Promise((resolve) => setTimeout(resolve, 500));

  // New processes array with only the processes that are still running
  processes = processes.filter((proc) => !proc.killed);

  // Force kill any remaining processes
  await Promise.all(
    processes.map((childProcess) =>
      new Promise((resolve) => {
        console.log(`Force killing process ${childProcess.pid}`);
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

process.on('SIGINT', async () => {
  console.log('\nShutting down...');

  // Kill all running processes
  await killProcesses();

  // Close the watcher
  watcher.close();

  // Stop reading from stdin
  process.stdin.pause();

  console.log('All processes killed');
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

// Start the app
console.log('Starting app...');
startApp();
