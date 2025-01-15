import { exec } from 'node:child_process';

export function killWindowsApp(appName: string) {
  exec('tasklist', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error finding process: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    const processes = stdout.split('\n');
    const appProcess = processes.find((line) => line.includes(appName));

    if (appProcess) {
      exec(`taskkill /F /IM ${appName}`, (killError, killStdout, killStderr) => {
        if (killError) {
          console.error(`Error killing process: ${killError.message}`);
          return;
        }
        if (killStderr) {
          console.error(`stderr: ${killStderr}`);
          return;
        }
        console.log(`${appName} process killed successfully.`);
      });
    } else {
      console.log(`No ${appName} process found.`);
    }
  });
}
