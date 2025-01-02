import osUtils from 'os-utils';
const POLLING_INTERVAL = 5 * 1000;

export function pollResources() {
  setInterval(async () => {
    // @ts-ignore
    const cpuUsage: number = await getCpuUsage();
    const ramUsage: number = getRamUsage();
    console.log(`CPU Usage: ${cpuUsage.toFixed(2)}%`);
    console.log(`RAM Usage: ${ramUsage.toFixed(2)}%`);
    console.log();
  }, POLLING_INTERVAL);
}

function getCpuUsage() {
  return new Promise((resolve) => {
    osUtils.cpuUsage(resolve);
  });
}

function getRamUsage() {
  return 1 - osUtils.freememPercentage();
}
