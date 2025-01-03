const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
  store: {
    save: (dataName: string, data: any) =>
      electron.ipcRenderer.invoke('store-save', dataName, data),
    reset: (dataName: string) => electron.ipcRenderer.invoke('store-reset', dataName),
    get: (dataName: string) => electron.ipcRenderer.invoke('store-get', dataName),
    delete: (dataName: string) => electron.ipcRenderer.invoke('store-delete', dataName),
    clear: () => electron.ipcRenderer.invoke('store-clear')
  },
  open_config: (filePath: string, password: string) =>
    electron.ipcRenderer.invoke('decrypt-exam', filePath, password),
  exit: () => electron.ipcRenderer.send('app-exit')
});
