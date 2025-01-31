import { app, desktopCapturer, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { formatDate } from './format-image-date.js';
import { getBatteryPercentage, isCharging } from './system-information.js';
import { isDev } from './check-dev.js';
import { exec } from 'child_process';
import util from 'node:util';
import os from 'node:os';
import { killWindowsApp } from './kill-app-windows.js';

export function registerIpcHandler(mainWindow: any) {
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

  ipcMain.handle('get_app_path', async () => {
    return app.getAppPath();
  });

  ipcMain.handle('save_image', async (event, base64Data, id: string) => {
    try {
      const outputPath = path.join(app.getPath('documents'), 'honestest', 'temp_exam_result');

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      await desktopCapturer
        .getSources({
          types: ['screen'],
          thumbnailSize: {
            width: 1920,
            height: 1080
          }
        })
        .then((sources: any) => {
          let image = sources[0].thumbnail.toDataURL();

          fs.writeFileSync(
            path.join(outputPath, `s_${id}.png`),
            image.replace(/^data:image\/png;base64,/, ''),
            'base64'
          );
        });

      // Simpan gambar ke disk
      fs.writeFileSync(
        path.join(outputPath, `g_${id}.jpeg`),
        base64Data.replace(/^data:image\/jpeg;base64,/, ''),
        'base64'
      );

      return { success: true, data: path.join(outputPath, `gesture_${formatDate()}.jpeg`) };
    } catch (error: any) {
      console.error('Error saving image:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get_battery_percentage', async () => {
    return {
      message: 'success',
      data: await getBatteryPercentage()
    };
  });

  ipcMain.handle('create_exam_result_file', async (event, data: any) => {
    const execPromise = util.promisify(exec);
    const jsonData = JSON.parse(data);
    let archiverDirectory: string;
    let folderPath: string = path.join(app.getPath('documents'), 'honestest', 'temp_exam_result');
    const documentsPath = path.join(app.getPath('documents'), 'honestest', 'exam_results');
    let zipFilePath: string;
    let resultFile: any;

    try {
      if (isDev()) {
        if (os.platform() === 'win32') {
          archiverDirectory = path.join(app.getAppPath(), '7z-win', '7zr.exe');
        } else {
          archiverDirectory = path.join(app.getAppPath(), '7z-linux', '7zz');
        }
      } else {
        if (os.platform() === 'win32') {
          archiverDirectory = path.join(app.getAppPath(), '..', '7z-win', '7zr.exe');
        } else {
          archiverDirectory = path.join(app.getAppPath(), '..', '7z-linux', '7zz');
        }
      }

      if (!fs.existsSync(documentsPath)) {
        fs.mkdirSync(documentsPath, { recursive: true });
      }

      // tempat zip disimpan di documents/honestest
      zipFilePath = path.join(
        documentsPath,
        `${jsonData.exam.course.title}_${jsonData.exam.title}_result_${new Date().getTime()}.ta12r`
      );

      fs.writeFileSync(path.join(folderPath, 'data.json'), data);

      try {
        await execPromise(
          `"${archiverDirectory}" a "${zipFilePath}" "${path.join(folderPath, '*')}" -ptest -mhe`
        );

        resultFile = fs.readFileSync(zipFilePath.replaceAll('"', ''));

        return {
          message: 'success',
          data: resultFile,
          filename: `${jsonData.exam.course.title}_${jsonData.exam.title}_result_${new Date().getTime()}.ta12r`,
          temp: `"${archiverDirectory}" a "${zipFilePath}" "${path.join(folderPath, '*')}" -ptest -mhe`
        };
      } catch (e: any) {
        return {
          message: 'failed',
          filename: `${jsonData.exam.course.title}_${jsonData.exam.title}_result_${new Date().getTime()}.ta12r`,
          temp: `"${archiverDirectory}" a "${zipFilePath}" "${path.join(folderPath, '*')}" -ptest -mhe`
        };
      }
    } catch (error: any) {
      console.error('Error creating zip:', error);
      return {
        message: 'error',
        error: error.message
      };
    }
  });

  ipcMain.handle('is_charging', async () => {
    return {
      message: 'success',
      data: await isCharging()
    };
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
    killWindowsApp('Telegram.exe');
    killWindowsApp('Discord.exe');
    killWindowsApp('chrome.exe');
    killWindowsApp('msedge.exe');
    killWindowsApp('WhatsApp.exe');
    killWindowsApp('TeamViewer_Service.exe');
    killWindowsApp('flameshot.exe');
    killWindowsApp('kdeconnect-indicator.exe');
    killWindowsApp('kdeconnectd.exe');
    killWindowsApp('brave.exe');
    killWindowsApp('Zoom.exe');
    killWindowsApp('Notepad.exe');
    killWindowsApp('AvastBrowser.exe');
    killWindowsApp('firefox.exe');
    killWindowsApp('opera.exe');
    killWindowsApp('opera_autoupdate.exe');
    killWindowsApp('obs64.exe');
    killWindowsApp('Spotify.exe');
    killWindowsApp('Lightshot.exe');

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
    mainWindow.webContents.on('before-input-event', (event: any, input: any) => {
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

  ipcMain.handle('get_application_path', async () => {
    return {
      message: 'success',
      data: app.getAppPath()
    };
  });
}
