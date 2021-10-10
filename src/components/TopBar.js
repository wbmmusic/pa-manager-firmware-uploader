import React, { useEffect, useState } from 'react'
import { Button, ProgressBar, Table } from 'react-bootstrap'
import Select from 'react-select'
import { selectStyle } from '../styles'
const { ipcRenderer } = window.require('electron')

export default function TopBar() {
    const defaultProgress = {
        erasing: false,
        writeProgress: 0,
        reading: false,
        verifyProgress: 0,
        complete: false
    }
    const [devices, setDevices] = useState([])
    const [selectedDevice, setSelectedDevice] = useState(null)
    const [progress, setProgress] = useState(defaultProgress)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        ipcRenderer.on('devList', (e, tempDevices) => {
            if (tempDevices.length === 0) {
                setSelectedDevice(null)
            } else {
                setDevices(tempDevices)
            }
        })

        ipcRenderer.on('progress', (e, theData) => {
            setProgress(theData)
        })

        ipcRenderer.on('uploading', (e) => {
            setUploading(true)
        })

        ipcRenderer.on('uploadFinished', (e) => {
            setUploading(false)
        })

        return () => {
            ipcRenderer.removeAllListeners('connectedDevices')
            ipcRenderer.removeAllListeners('progress');
            ipcRenderer.removeAllListeners('uploading');
            ipcRenderer.removeAllListeners('uploadFinished');
        }
    }, [])

    const uploadFirmware = () => {
        if (selectedDevice !== null) {
            ipcRenderer.send('chooseUpload', selectedDevice.value)
        }
    }

    let options = []
    for (let i = 0; i < devices.length; i++) {
        options.push({ label: "(" + devices[i].Model + ") " + " | " + devices[i].UserName + " | " + devices[i].path, value: devices[i].path })
    }

    return (
        <div>
            <div style={{ padding: '10px', display: 'flex', borderBottom: '1px solid lightGrey' }}>
                <div style={{ width: '100%', marginRight: '10px' }}>
                    <Select styles={selectStyle} options={options} value={selectedDevice} onChange={(e) => {
                        setSelectedDevice(e)
                        setProgress(defaultProgress)
                    }} />
                </div>
                <div>
                    <Button size="sm" variant="outline-primary" onClick={() => uploadFirmware()}>Upload</Button>
                </div>
            </div>
            <div style={{ padding: '10px' }}>
                <div style={{ display: 'inline-block' }}>
                    <Table size="sm">
                        <tbody>
                            <tr>
                                <td>Uploading</td>
                                <td><input type="checkbox" checked={uploading} /></td>
                            </tr>
                            <tr>
                                <td>Erase</td>
                                <td><input type="checkbox" checked={progress.erasing} /></td>
                            </tr>
                            <tr>
                                <td>Write</td>
                                <td><ProgressBar now={progress.writeProgress} label={`${progress.writeProgress}%`} /></td>
                            </tr>
                            <tr>
                                <td>Read</td>
                                <td><input type="checkbox" checked={progress.reading} /></td>
                            </tr>
                            <tr>
                                <td>Verify</td>
                                <td style={{ width: '200px' }}><ProgressBar now={progress.verifyProgress} label={`${progress.verifyProgress}%`} /></td>
                            </tr>
                            <tr>
                                <td>Complete</td>
                                <td><input type="checkbox" checked={progress.complete} /></td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
