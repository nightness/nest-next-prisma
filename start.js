const fs = require('fs');
const { exec } = require('child_process');

fs.watch('./src', { recursive: true }, (eventType, filename) => {
  if (filename) {
    console.log(`${filename} file changed, restarting...`);
    exec('node app.js', (err, stdout, stderr) => {
      if (err) {
        console.error(`Error restarting: ${err}`);
        return;
      }
      console.log(stdout);
      console.error(stderr);
    });
  }
});
