import { app, ipcMain } from 'electron';
import path from 'node:path';
import * as fs from 'node:fs';

export function generateCredentialFile() {
  ipcMain.handle('generate-credential-file', async (event, data: string) => {
    const documentsPath = app.getPath('documents');
    const dataObj = JSON.parse(data);
    const filePath = path.join(documentsPath, `${dataObj.nim}_${dataObj.name}.ta12c`);
    fs.writeFileSync(filePath, data);

    return {
      message: 'success',
      data: filePath
    };
  });
}
