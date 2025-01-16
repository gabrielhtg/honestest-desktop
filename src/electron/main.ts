import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from 'electron';
import path from 'node:path';
import { isDev } from './utils/check-dev.js';
import { getPreloadPath } from './utils/path-resolver.js';
import { dataManagementHandlers } from './utils/data-management.js';
import { decryptExamFile } from './utils/decrypt-exam-file.js';
import { getBatteryPercentage, isCharging, isVirtualMachine } from './utils/system-information.js';
import { generateCredentialFile } from './utils/generate-credential-file.js';
import { killLinuxApp } from './utils/kill-app-linux.js';
import { killWindowsApp } from './utils/kill-app-windows.js';

let mainWindow: BrowserWindow;

app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    width: 1920 * 0.8,
    height: 1080 * 0.8,
    frame: true,
    minimizable: true,
    webPreferences: {
      preload: getPreloadPath()
    }
  });

  const runningInVM = await isVirtualMachine();

  if (runningInVM) {
    console.log('Virtual env detected');
    mainWindow.loadURL('https://id.wikipedia.org/wiki/HTTP_404');
  }

  if (isDev()) {
    await mainWindow.loadURL('http://localhost:5173');
  } else {
    await mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    // Menu.setApplicationMenu(null);
  }

  // mainWindow.webContents.on('will-navigate', (event) => {
  //   event.preventDefault();
  // });

  // mainWindow.webContents.on('before-input-event', (event, input) => {
  //   if (input.type === 'keyDown' && input.key === 'BrowserBack') {
  //     event.preventDefault();
  //   }
  // });

  dataManagementHandlers();
  decryptExamFile();
  generateCredentialFile();
  // pollResources();
});

ipcMain.on('app-exit', () => {
  app.quit();
});

ipcMain.handle('start_exam_mode', async () => {
  if (mainWindow) {
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
    mainWindow.setMinimizable(false);
  }

  // kill linux app
  // killLinuxApp('telegram');
  // killLinuxApp('Discord');
  // killLinuxApp('firefox-bin');
  // killLinuxApp('chrome');
  // killLinuxApp('obs');
  // killLinuxApp('zoom');

  // kill windows app
  // killWindowsApp('Telegram.exe');
  // killWindowsApp('Discord.exe');
  // killWindowsApp('chrome.exe');
  // killWindowsApp('msedge.exe');
  // killWindowsApp('WhatsApp.exe');
  // killWindowsApp('TeamViewer_Service.exe');
  // killWindowsApp('flameshot.exe');
  // killWindowsApp('kdeconnect-indicator.exe');
  // killWindowsApp('kdeconnectd.exe');
  // killWindowsApp('brave.exe');
  // killWindowsApp('Zoom.exe');
  // killWindowsApp('Notepad.exe');
  // killWindowsApp('AvastBrowser.exe');
  // killWindowsApp('firefox.exe');
  // killWindowsApp('opera.exe');
  // killWindowsApp('opera_autoupdate.exe');
  // killWindowsApp('obs64.exe');
  // killWindowsApp('Spotify.exe');
  // killWindowsApp('Lightshot.exe');

  if (!isDev()) {
    // mainWindow.setAlwaysOnTop(true, 'screen-saver');
    // mainWindow.on('blur', () => {
    //   mainWindow.focus();
    // });
    // mainWindow.on('close', (event) => {
    //   event.preventDefault(); // Mencegah jendela tertutup
    //   console.log('Alt+F4 atau close dicegah!');
    // });
  }

  // matikan ini jika sedang development
  // mainWindow.webContents.on('before-input-event', (event, input) => {
  //   if (input.control && input.key.toLowerCase() === 'i') {
  //     event.preventDefault(); // Memblokir Ctrl+I (Developer Tools)
  //   }
  //   if (input.key === 'Tab' && input.alt) {
  //     event.preventDefault(); // Memblokir Alt+Tab
  //   }
  // });

  return {
    message: 'Exam Mode Activated',
    data: true
  };
});

// app.on('browser-window-focus', function () {
//   globalShortcut.register('CommandOrControl+R', () => {
//     console.log('CommandOrControl+R is pressed: Shortcut Disabled');
//   });
//   globalShortcut.register('F5', () => {
//     console.log('F5 is pressed: Shortcut Disabled');
//   });
// });

app.on('browser-window-blur', function () {
  globalShortcut.unregister('CommandOrControl+R');
  globalShortcut.unregister('F5');
});

ipcMain.handle('stop_exam_mode', async () => {
  if (mainWindow) {
    mainWindow.setKiosk(false);
    mainWindow.setFullScreen(false);
    mainWindow.setMinimizable(true);
  }

  mainWindow.removeAllListeners('blur');
  mainWindow.removeAllListeners('close');

  mainWindow.webContents.removeAllListeners('before-input-event');

  return {
    message: 'Exam Mode Activated',
    data: true
  };
});

ipcMain.handle('get_battery_percentage', async () => {
  return {
    message: 'success',
    data: await getBatteryPercentage()
  };
});

ipcMain.handle('is_charging', async () => {
  return {
    message: 'success',
    data: await isCharging()
  };
});
