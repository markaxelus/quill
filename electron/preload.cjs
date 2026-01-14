const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    scanInbox: (config) => ipcRenderer.invoke('scan-inbox', config),
    processJobs: (items, options) => ipcRenderer.invoke('process-jobs', { items, options }),
    onProcessingUpdate: (callback) => {
        const subscription = (_event, value) => callback(value);
        ipcRenderer.on('processing-update', subscription);
        return () => ipcRenderer.removeListener('processing-update', subscription);
    },
    openFile: (path) => ipcRenderer.invoke('open-file', path),
    openFolder: (path) => ipcRenderer.invoke('open-folder', path)
});
