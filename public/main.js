const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const wbmUsb = require('wbm-usb-device')
const { join } = require('path')
const url = require('url')
const { existsSync, mkdirSync, unlinkSync, readdirSync } = require('fs')
const { autoUpdater } = require('electron-updater');

const { setBase, downloadFirmware, getLines, getLine } = require('wbm-version-manager')
setBase('http://versions.wbmtek.com/api')

let firstReactInit = true

////////////////// App Startup ///////////////////////////////////////////////////////////////////
let win

////////  SINGLE INSTANCE //////////
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) app.quit()


/////////////////////////////////////////
const pathToFiles = join(app.getPath('userData'), 'data')
const pathToDevices = join(pathToFiles, 'devices')
const checkFolderStructure = () => {
    if (!existsSync(pathToFiles)) {
        mkdirSync(pathToFiles)
        console.log("Created Data Folder")
    } else console.log("Found Data Folder")

    if (!existsSync(pathToDevices)) {
        mkdirSync(pathToDevices)
        console.log("Created Devices Folder")
    } else console.log("Found Devices Folder")
}

const handleLine = async(line) => {
    console.log("Line Name:", line.name)
    console.log("Last Mod:", new Date(line.modified).toLocaleDateString())
    console.log("# of devices:", line.devices.length)

    //console.log(JSON.stringify(line, null, " "))

    await line.devices.reduce(async(acc, element) => {
        await acc

        //console.log("EL", element)

        if (element.name !== "Brain") {

            const pathToDevice = join(pathToDevices, element.path)

            if (!existsSync(pathToDevice)) mkdirSync(pathToDevice)
            let currentFirmware = null

            if (element.current !== '???') {
                currentFirmware = element.firmware.find(fw => fw.version === element.current)
                if (!currentFirmware) throw new Error('ERROR HERE')

                // If a firmware with this name is not already in this devices folder
                if (!existsSync(join(pathToDevice, currentFirmware.name))) {
                    console.log("Current firmware file doesn't exist")

                    // get name of all files in this devices folder
                    const devFolderContents = readdirSync(pathToDevice)

                    // Delete each File In this folder
                    devFolderContents.forEach(file => {
                        unlinkSync(join(pathToDevice, file))
                    })

                    try {
                        // Put New / Current Firmware in folder
                        await downloadFirmware(currentFirmware.id, join(pathToDevice, currentFirmware.name))
                        console.log("Updated Firmware", currentFirmware)
                            //addNotification({ type: "fw updated", message: element.name + " FW updated to " + currentFirmware.version })
                        win.webContents.send('updatedFirmware', currentFirmware)
                        win.webContents.send('refreshFW', currentFirmware)
                    } catch (error) {
                        console.log(error)
                    }

                }
            }
            //console.log("Device", element.name)
            //console.log("Current FW:", element.current)
            //console.log("Last Mod:", new Date(element.modified).toLocaleDateString())
        }
    }, Promise.resolve([]))

    //space()
}

const checkForFwUpdates = async() => {
    try {
        let lines = await getLines()
        if (lines === undefined) console.log("LINES IS UNDEFINED")
        let lineID = lines.find(line => line.path === 'iomanager').id
        if (lineID === undefined) console.log("THE LINEID IS UNDEFINED")
        let theLine = await getLine(lineID)
        handleLine(theLine)
    } catch (error) {
        console.log(error)
    }

}

const getCurVerInFolder = (board) => {
    const deviceFiles = readdirSync(join(pathToDevices, board))
    const binFile = deviceFiles.filter(file => file.includes('.bin'))
    if (binFile.length === 0) return "no fw"
    else {
        let fileName = binFile[0].replace('.bin', '')
        fileName = fileName.replace(/^(.*)FW/, '')
        return fileName
    }
}

checkFolderStructure()
    /////////////////////////////////////////////

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
        width: 550,
        height: 590,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            sandbox: false
        },
        autoHideMenuBar: true,
        icon: join(__dirname, '/favicon.ico')
    })

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    win.loadURL(startUrl);
    //win.maximize()

    // Emitted when the window is closed.
    win.on('closed', () => win = null)
    win.on('close', () => wbmUsb.removeAllListeners())
    win.on('ready-to-show', () => win.show())
}

const processDevList = data => {
    let devs = [...data]
    for (let i = 0; i < devs.length; i++) {
        devs[i].curfw = getCurVerInFolder(devs[i].Model.toLowerCase().replaceAll(' ', ''))
    }
    return devs
}

// Create myWindow, load the rest of the app, etc...
app.on('ready', () => {
        //log("-APP IS READY");
        ipcMain.on('reactIsReady', () => {
            if (firstReactInit === true) {

                wbmUsb.on('devList', (data) => {
                    console.log('DEV LIST YO', data)
                    win.webContents.send('devList', processDevList(data))
                })

                wbmUsb.on('data', (path, data) => {
                    console.log('Data from ' + path + " ->", data.toString())
                    win.webContents.send('serialData', path + " -> " + data.toString())
                })

                wbmUsb.on('progress', (data) => {
                    win.webContents.send('progress', data)
                })

                wbmUsb.on('fwUploadFinished', () => {
                    console.log('FW Upload Finished')
                    win.webContents.send('uploadFinished')
                })

                wbmUsb.on('fwUploading', () => {
                    console.log('FW Uploading')
                    win.webContents.send('uploading')
                })

                wbmUsb.startMonitoring()

                firstReactInit = false

                checkForFwUpdates()
                setInterval(() => {
                    checkForFwUpdates()
                }, 10 * 60 * 1000);
            }


            console.log('React Is Ready')
            win.webContents.send('message', 'React Is Ready')
            win.webContents.send('app_version', { version: app.getVersion() });

            if (app.isPackaged) {
                win.webContents.send('message', 'App is packaged')

                ipcMain.on('installUpdate', () => {
                    autoUpdater.quitAndInstall(true, true)
                })

                autoUpdater.on('checking-for-update', () => win.webContents.send('checkingForUpdates'))
                autoUpdater.on('update-available', () => win.webContents.send('updateAvailable'))
                autoUpdater.on('update-not-available', () => win.webContents.send('noUpdate'))
                autoUpdater.on('update-downloaded', (e, updateInfo, f, g) => { win.webContents.send('updateDownloaded', e) })
                autoUpdater.on('download-progress', (e) => { win.webContents.send('updateDownloadProgress', e.percent) })
                autoUpdater.on('error', (e, message) => win.webContents.send('updateError', message))


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
                    console.log('THIS STUFF ____', path, pathToFirmware)
                    wbmUsb.uploadFirmware(path, pathToFirmware)
                }
            }).catch(err => {
                console.log(err)
            })
        })

        ipcMain.on('uploadCurrent', (e, dev) => {
            console.log(dev)
            const pathToDeviceFolder = join(pathToDevices, dev.Model.toLowerCase().replaceAll(" ", ""))
            const deviceFiles = readdirSync(pathToDeviceFolder)
            const binFile = deviceFiles.filter(file => file.includes('.bin'))
            if (binFile.length === 0) console.log("no fw")
            else {
                wbmUsb.uploadFirmware(dev.path, join(pathToDeviceFolder, binFile[0]))
            }

        })

        ipcMain.on('getDevices', () => {
            console.log('GET DEVICES')
            win.webContents.send('devList', processDevList(wbmUsb.wbmDevices))
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