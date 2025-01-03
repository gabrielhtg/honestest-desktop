import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from 'electron';
import path from 'node:path';
import { isDev } from './utils/check-dev.js';
import { getPreloadPath } from './utils/path-resolver.js';
import { dataManagementHandlers } from './utils/data-management.js';
import { decryptExamFile } from './utils/decrypt-exam-file.js';

let mainWindow: BrowserWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1920 * 0.8,
    height: 1080 * 0.8,
    frame: true,
    minimizable: true,
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
  decryptExamFile();

  // pollResources();
});

ipcMain.on('app-exit', () => {
  app.quit();
});

ipcMain.handle('start_exam_mode', async (event) => {
  if (mainWindow) {
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
    mainWindow.setMinimizable(false);
  }

  mainWindow.on('blur', () => {
    mainWindow.focus();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'i') {
      event.preventDefault(); // Memblokir Ctrl+I (Developer Tools)
    }
    if (input.key === 'Tab' && input.alt) {
      event.preventDefault(); // Memblokir Alt+Tab
    }
  });

  return {
    message: 'Exam Mode Activated',
    data: true
  };
});

ipcMain.handle('stop_exam_mode', async (event) => {
  if (mainWindow) {
    mainWindow.setKiosk(false);
    mainWindow.setFullScreen(false);
    mainWindow.setMinimizable(true);
  }

  mainWindow.removeAllListeners('blur');

  mainWindow.webContents.removeAllListeners('before-input-event');

  return {
    message: 'Exam Mode Activated',
    data: true
  };
});
