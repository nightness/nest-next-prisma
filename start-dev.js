const chokidar = require('chokidar');
const { spawn } = require('child_process');
const kill = require('tree-kill');

let child = null;

function spawnProcess(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        child = spawn(command, args, {
            stdio: 'inherit', // Use this to inherit stdio so you can see output in the console
            ...options,
        });

        // Resolve the promise if the child process finishes successfully
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });

        // Handle any errors in spawning the process
        child.on('error', (err) => {
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
function startApp() {
    // child = spawn('npx', ['ts-node', '--project', 'tsconfig.server.json', 'src/main.ts'], { stdio: 'inherit' });
    // spawnProcess('npx', ['ts-node', '--project', 'tsconfig.server.json', 'src/main.ts'], { stdio: 'inherit' });
    // spawnProcess('tsc --project tsconfig.server.json --watch src/main.ts', { stdio: 'inherit' });

    // npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
    // spawnProcess('npx', ['tailwindcss', '-i', './app/global.in.css', '-o', './app/global.css', '--watch'], { stdio: 'inherit' });
    // spawnProcess('npx', ['tailwindcss', '-i', './app/globals.in.css', '-o', './app/globals.css'], { stdio: 'ignore', stderr: 'inherit' }).then(() => {
        spawnProcess('tsc', ['--project', 'tsconfig.server.json', '--outDir', '.nest'], { stdio: 'inherit' }).then(() => {    
            console.log('Compilation complete');
            child = spawn('node', ['.nest/main.js'], { stdio: 'inherit' });
            child.on('error', (error) => {
                console.log('Error starting', command, ':', error.message);
            });        
        }).catch((error) => {
            console.error('Error compiling:', error.message);
        });
    // }).catch((error) => {
    //     console.error('Error compiling:', error.message);
    // });
}

process.on('SIGINT', () => {
    console.log('\nShutting down...');
    if (child) {
        console.log('Killing child process...');
        kill(child.pid, 'SIGKILL');    
    }
    process.exit();
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
