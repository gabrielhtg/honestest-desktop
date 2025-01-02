import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'node:path';
import { pollResources } from './utils/resource-manager.js';
import { isDev } from './utils/check-dev.js';
import { getPreloadPath } from './utils/path-resolver.js';
import { dataManagementHandlers } from './utils/data-management.js';

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    // fullscreen: true,
    // resizable: false,
    width: 1920 * 0.8,
    height: 1080 * 0.8,
    // frame: false,
    minimizable: false,
    webPreferences: {
      preload: getPreloadPath()
    }
  });

  Menu.setApplicationMenu(null);
  // mainWindow.maximize();

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
  }

  dataManagementHandlers();

  pollResources();
});

ipcMain.on('app-exit', () => {
  app.quit();
});
