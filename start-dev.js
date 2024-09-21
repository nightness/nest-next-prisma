const chokidar = require('chokidar');
const { spawn } = require('child_process');
const kill = require('tree-kill');

let child = null;

// Initialize watcher.
const watcher = chokidar.watch('./src', {
    persistent: true,
    ignoreInitial: true,
    usePolling: true,  // Use polling for better cross-platform support, particularly on network file systems or Docker containers
});

// Start the app
function startApp() {
    child = spawn('npx', ['ts-node', '--project', 'tsconfig.server.json', 'src/main.ts'], { stdio: 'inherit' });

    child.on('error', (error) => {
        console.log('Error starting', command, ':', error.message);
    });
}

process.on('SIGINT', () => {
    console.log('\nShutting down...');

    if (child) {
        // console.log('Killing child process...');
        kill(child.pid, 'SIGKILL', (err) => {
            if (err) {
                console.error('Error killing child process:', err);
            }
            // kill(process.pid, 'SIGKILL');
            process.kill(process.pid, 'SIGKILL');
        });
    } else {
        // process.exit();
        // kill(process.pid, 'SIGKILL');
        process.kill(process.pid, 'SIGKILL');
    }    
});

// Event listeners for when files change
watcher.on('change', (path) => {
    console.log(`${path} has been changed. Restarting app...`);
    if (child) {
        kill(child.pid, 'SIGKILL', (err) => {
            if (err) {
                console.error('Error killing child process:', err);
            } else {
                child = null;
                startApp();
            }
        });
    }
});

watcher.on('error', (error) => console.error(`Watcher error: ${error}`));

// Start the app
console.log('Starting app...');
startApp();
