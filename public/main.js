const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
//require('update-electron-app')()

const { autoUpdater } = require('electron-updater');

const SerialPort = require('serialport')

//Get the OS
const isMac = process.platform === 'darwin'

//Used for firmware update (BOSSAC)
const { execFile } = require('child_process');

//Get Path to bossa
var pathToBossa
if (isMac) {
  pathToBossa = path.join(__dirname, '/bossacmac');
} else {
  pathToBossa = 'public/bossacwin';
}

//USB Detection ///////////////////////////////////////////////////////////
var usbDetect = require('usb-detection');
usbDetect.on('add', function (device) {
  console.log(device)
  listPorts()
});
usbDetect.on('remove', function (device) { listPorts() });
//END USB Detection ///////////////////////////////////////////////////////

const listPorts = () => {
  SerialPort.list().then(function (data) {
    console.log(data);
    win.webContents.send('connectedDevices', data)
  });
}

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

function createWindow() {
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
    //Start Listening for USB connection events
    usbDetect.startMonitoring()
    console.log('React Is Ready')
    win.webContents.send('message', 'React Is Ready')
    win.webContents.send('app_version', { version: app.getVersion() });



    if (app.isPackaged) {
      win.webContents.send('message', 'App is packaged')

      autoUpdater.on('checking-for-update', () => win.webContents.send('message', 'Checking for update'))
      autoUpdater.on('update-available', () => win.webContents.send('message', 'Update Available'))
      autoUpdater.on('update-not-available', () => win.webContents.send('message', 'Update NOT Available'))
      autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => win.webContents.send('message', 'Update Downloaded'))
      autoUpdater.on('error', message => win.webContents.send('message', message))

      setInterval(() => {
        win.webContents.send('message', 'Interval')
        autoUpdater.checkForUpdatesAndNotify()
      }, 600000);

      autoUpdater.checkForUpdatesAndNotify()
    }

  })

  ipcMain.on('chooseUpload', () => {
    console.log('Were Gonna Upload a file')
    chooseFirmware()
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


////////////////////////// FIRMWARE UPLOAD /////////////////////////////////////////
//Firmware stuff
let pathToFirmware
let firmwareUpload = false

const uploadFirmware = (port, path) => {
  console.log('In getNetInfo()')

  var bossaArguments = ['-d', '-u', '-i', '-o', '0x2000', '-p', port, '-e', '-w', '-v', '-R', '-b', path]

  execFile(pathToBossa, bossaArguments, (error, stdout, stderr) => {
    if (error) {
      console.log(`child process ERROR ${error}`);
      firmwareUpload = false
      throw error;
    }

    console.log(stdout);
    console.log(`child process FINISHED`);
    firmwareUpload = false
    win.webContents.send('uploadFinished')
  });
}

const chooseFirmware = () => {
  console.log('Choosing Firmware')

  dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [
      { name: 'Firmware File', extensions: ['bin'] }
    ]
  }).then(result => {
    if (result.canceled) {
      console.log('FIRMWARE SELECT CANCELED')
    } else {
      if (firmwareUpload) {
        console.log('CANT UPLOAD FIRMWARE - UPLOAD ALREADY IN PROGRESS')
      } else {
        win.webContents.send('uploading')
        console.log(result.filePaths[0])
        pathToFirmware = result.filePaths[0]
        firmwareUpload = true
        uploadFirmware('COM6', pathToFirmware)
        //conDevs[dev - 1].port.write('WBM FIRMWARE REBOOT COMMAND')
        //uploadFirmware(conDevs[dev].ports.path, result.filePaths[0])
      }
    }
  }).catch(err => {
    console.log(err)
  })

}