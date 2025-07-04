const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WindowTracker = require('./services/windowTracker');

let mainWindow;
let windowTracker;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  
  // Initialize window tracking
  const windowTracker = new WindowTracker();
  
  // Track active window changes
  setInterval(async () => {
    const windowInfo = await windowTracker.trackActiveWindow();
    if (windowInfo) {
      win.webContents.send('active-window-changed', `${windowInfo.window.owner} - ${windowInfo.window.title}`);
    }
  }, 1000);
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})