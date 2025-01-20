import { ipcMain, shell } from 'electron';

export function showFile() {
  ipcMain.handle('show_file', async (event, filepath: string) => {
    shell.showItemInFolder(filepath);
  });
}
