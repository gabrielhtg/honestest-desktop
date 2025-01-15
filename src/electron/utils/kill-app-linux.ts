import { exec } from 'node:child_process';

export function killLinuxApp(appName: string) {
  exec(`pgrep ${appName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error finding process: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    const pids: any = stdout.trim().split('\n');
    if (pids.length > 0 && pids[0]) {
      process.kill(pids[0], 'SIGTERM');
      console.log(`Found PID(s) for ${appName}: ${pids.join(', ')}`);
    } else {
      console.log(`No ${appName} process found.`);
    }
  });
}
