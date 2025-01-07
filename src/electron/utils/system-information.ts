import si from 'systeminformation';

export async function isVirtualMachine() {
  try {
    // Ambil informasi sistem
    const systemInfo = await si.system();
    const biosInfo = await si.bios();

    // Cek indikator virtual machine
    return (
      systemInfo.manufacturer.includes('VirtualBox') ||
      systemInfo.model.includes('VirtualBox') ||
      biosInfo.vendor.includes('VirtualBox') ||
      biosInfo.version.includes('VirtualBox')
    );
  } catch (error) {
    console.error('Gagal mendeteksi VirtualBox:', error);
    return false;
  }
}

export async function getBatteryPercentage() {
  try {
    const batteryInfo = await si.battery();
    return batteryInfo.percent;
  } catch (e: any) {
    return e;
  }
}

export async function isCharging() {
  try {
    const batteryInfo = await si.battery();
    return batteryInfo.isCharging;
  } catch (e: any) {
    return e;
  }
}
