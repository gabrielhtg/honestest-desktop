import Store from 'electron-store';
import { ipcMain } from 'electron';

const store = new Store();

export function dataManagementHandlers() {
  ipcMain.handle('store-save', (event, dataName: string, data: any) => {
    store.set(dataName, data);
    return {
      message: `Data ${dataName} saved!`
    };
  });

  ipcMain.handle('store-get', (event, dataName: string) => {
    return {
      message: 'success'
    };
  });

  ipcMain.handle('store-delete', (event, dataName: string) => {
    store.delete(dataName);
    return {
      message: `Delete ${dataName} success!`
    };
  });

  ipcMain.handle('store-reset', (event, dataName: string) => {
    store.reset(dataName);
    return {
      message: `Reset ${dataName} success!`
    };
  });

  ipcMain.handle('store-clear', (event, dataName: string) => {
    store.clear();
    return {
      message: `Clear ${dataName} success!`
    };
  });
}
