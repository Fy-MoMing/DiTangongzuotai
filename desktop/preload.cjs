const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  getUpdateStatus: () => ipcRenderer.invoke('updates:status'),
  checkUpdates: (force = true) => ipcRenderer.invoke('updates:check', force),
  downloadUpdate: () => ipcRenderer.invoke('updates:download'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  openUpdateRelease: () => ipcRenderer.invoke('updates:release'),
  onUpdateStatus: callback => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('updates:changed', listener);
    return () => ipcRenderer.removeListener('updates:changed', listener);
  },
  getWeather: (force = false) => ipcRenderer.invoke('weather:read', force),
  getPrices: () => ipcRenderer.invoke('prices:read'),
  savePrices: config => ipcRenderer.invoke('prices:save', config),
  openPrices: () => ipcRenderer.invoke('prices:open'),
  setTheme: theme => ipcRenderer.invoke('theme:set', theme),
  copyText: text => ipcRenderer.invoke('text:copy', text),
  copyImage: dataUrl => ipcRenderer.invoke('image:copy', dataUrl),
  saveImage: dataUrl => ipcRenderer.invoke('image:save', dataUrl)
});
