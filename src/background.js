const { app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 166,
    height: 257,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true, // Be cautious with security implications
      contextIsolation: false // Same as above
    }
  });

  // Load the Vite development server
  mainWindow.loadURL('http://localhost:3000');

  // Open the DevTools if in development mode
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
