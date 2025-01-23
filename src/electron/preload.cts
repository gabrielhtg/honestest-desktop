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
  exit: () => electron.ipcRenderer.send('app-exit'),
  start_exam_mode: () => electron.ipcRenderer.invoke('start_exam_mode'),
  stop_exam_mode: () => electron.ipcRenderer.invoke('stop_exam_mode'),
  get_battery_percentage: () => electron.ipcRenderer.invoke('get_battery_percentage'),
  is_charging: () => electron.ipcRenderer.invoke('is_charging'),
  show_file: (filepath: string) => electron.ipcRenderer.invoke('show_file', filepath),
  generate_credential_file: (data: string) =>
    electron.ipcRenderer.invoke('generate-credential-file', data),
  get_app_path: () => electron.ipcRenderer.invoke('get_app_path'),
  save_image: (imageSrc: any) => electron.ipcRenderer.invoke('save_image', imageSrc)
});
