import { ipcMain } from 'electron';
import Store from 'electron-store';
import { createDecipheriv, createHash } from 'node:crypto';
const store = new Store();

export function decryptExamFile() {
  ipcMain.handle('decrypt-exam', async (event, file: string, password: string) => {
    const key = createHash('sha256').update(password).digest().subarray(0, 32); // Panjang key 32 byte
    const iv = createHash('md5').update('ta12').digest();
    const temp = Buffer.from(file.split(',')[1], 'base64');

    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([decipher.update(temp), decipher.final()]);

    try {
      store.set('exam-data', JSON.parse(decryptedText.toString()));

      return {
        message: 'success',
        data: JSON.parse(decryptedText.toString())
      };
    } catch (error: any) {
      return {
        message: 'Wrong Password',
        data: null
      };
    }
  });
}
