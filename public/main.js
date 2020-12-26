const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const wbmUsb = require('wbm-usb-device')
const path = require('path')
const url = require('url')
//require('update-electron-app')()

const { autoUpdater } = require('electron-updater');

let firstReactInit = true

////////////////// App Startup ///////////////////////////////////////////////////////////////////
let win
////////  SINGLE INSTANCE //////////
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})
//////  END SINGLE INSTANCE ////////

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: path.join(__dirname, '/favicon.ico')
  })

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  win.loadURL(startUrl);
  //win.maximize()

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })
}

// Create myWindow, load the rest of the app, etc...
app.on('ready', () => {
  //log("-APP IS READY");
  ipcMain.on('reactIsReady', () => {
    if (firstReactInit === true) {

      wbmUsb.events.on('devList', (data) => {
        console.log('DEV LIST YO', data)
        win.webContents.send('devList', data)
      })

      wbmUsb.events.on('fwUploadFinished', () => {
        console.log('FW Upload Finished')
        win.webContents.send('uploadFinished')
      })

      wbmUsb.events.on('fwUploading', () => {
        console.log('FW Uploading')
        win.webContents.send('uploading')
      })

      firstReactInit = false

      wbmUsb.startWbmUsb()
      
    }


    console.log('React Is Ready')
    win.webContents.send('message', 'React Is Ready')
    win.webContents.send('app_version', { version: app.getVersion() });

    if (app.isPackaged) {
      win.webContents.send('message', 'App is packaged')

      autoUpdater.on('checking-for-update', () => win.webContents.send('checkingForUpdates'))
      autoUpdater.on('update-available', () => win.webContents.send('updateAvailable'))
      autoUpdater.on('update-not-available', () => win.webContents.send('noUpdate'))
      autoUpdater.on('update-downloaded', (e, updateInfo, f, g) => { win.webContents.send('updateDownloaded', e) })
      autoUpdater.on('download-progress', (e) => { win.webContents.send('updateDownloadProgress', e.percent) })
      autoUpdater.on('error', (message) => win.webContents.send('updateError', message))


      setInterval(() => {
        win.webContents.send('message', 'Interval Check for update')
        autoUpdater.checkForUpdatesAndNotify()
      }, 600000);

      autoUpdater.checkForUpdatesAndNotify()
    }

  })

  ipcMain.on('chooseUpload', (e, path) => {
    console.log('Were Gonna Upload a file')

    let pathToFirmware

    console.log('IN FIRMWARE SELECT') // prints "ping"

    dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Firmware File', extensions: ['bin'] }
      ]
    }).then(result => {
      if (result.canceled) {
        console.log('FIRMWARE SELECT CANCELED')
      } else {
        console.log(result.filePaths[0])
        pathToFirmware = result.filePaths[0]
        wbmUsb.fwUpload(path, pathToFirmware)
      }
    }).catch(err => {
      console.log(err)
    })



  })

  createWindow()
})
///////////////////////

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

////////////////// END App Startup ///////////////////////////////////////////////////////////////