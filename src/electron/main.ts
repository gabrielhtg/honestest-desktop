import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from 'electron';
import path from 'node:path';
import { isDev } from './utils/check-dev.js';
import { getPreloadPath } from './utils/path-resolver.js';
import { dataManagementHandlers } from './utils/data-management.js';
import { decryptExamFile } from './utils/decrypt-exam-file.js';
import { isVirtualMachine } from './utils/system-information.js';
import { generateCredentialFile } from './utils/generate-credential-file.js';
import * as os from 'node:os';
import { showFile } from './utils/show-file.js';
import { registerIpcHandler } from './utils/register-ipc-handler.js';

let mainWindow: BrowserWindow;

app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    width: 1920 * 0.8,
    height: 1080 * 0.8,
    frame: true,
    minimizable: true,
    webPreferences: {
      preload: getPreloadPath()
    },
    icon: path.join(
      app.getAppPath(),
      isDev() ? 'logo.png' : os.platform() === 'win32' ? 'logo.png' : '../logo.png'
    )
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
    Menu.setApplicationMenu(null);
  }

  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  dataManagementHandlers();
  decryptExamFile();
  generateCredentialFile();
  showFile();

  registerIpcHandler(mainWindow);
});

ipcMain.on('app-exit', () => {
  app.quit();
});

app.on('browser-window-focus', function () {
  globalShortcut.register('CommandOrControl+R', () => {
    console.log('CommandOrControl+R is pressed: Shortcut Disabled');
  });
  globalShortcut.register('F5', () => {
    console.log('F5 is pressed: Shortcut Disabled');
  });
  globalShortcut.register('Alt+Tab', () => {
    console.log('Alt tab is pressed: Shortcut Disabled');
  });
  // globalShortcut.register('Meta', () => {
  //   console.log('Meta is pressed: Shortcut Disabled');
  // });
  // globalShortcut.register('PrintScreen', () => {
  //   console.log('PrintScreen is pressed: Shortcut Disabled');
  // });
});

app.on('browser-window-blur', function () {
  globalShortcut.unregister('CommandOrControl+R');
  globalShortcut.unregister('F5');
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
