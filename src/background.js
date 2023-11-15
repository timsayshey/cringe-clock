const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const iconPath = path.join(app.getAppPath(), 'public', 'icon2.png');
  mainWindow = new BrowserWindow({
    width: 166,
    height: 265,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true, // Be cautious with security implications
      contextIsolation: false // Same as above
    },
    icon: iconPath
  });

  var isDev = process.env.ELECTRON_DEV == '1' || false;
  // Construct the correct path to index.html in production
  const indexPath = isDev
    ? 'http://localhost:3000' // Development server URL
    : `file://${path.join(app.getAppPath(), 'dist/index.html')}`;

  mainWindow.loadURL(indexPath);

  // Open the DevTools if in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
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
