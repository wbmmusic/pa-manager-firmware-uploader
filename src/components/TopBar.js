import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Select from 'react-select'
import { selectStyle } from '../styles'
const { ipcRenderer } = window.require('electron')

export default function TopBar() {
    const [devices, setDevices] = useState([])
    const [selectedDevice, setSelectedDevice] = useState(null)

    useEffect(() => {
        ipcRenderer.on('devList', (e, tempDevices) => {
            if (tempDevices.length === 0) {
                setSelectedDevice(null)
            } else {
                setDevices(tempDevices)
            }
        })

        return () => {
            ipcRenderer.removeAllListeners('connectedDevices')
        }
    }, [])

    const uploadFirmware = () => {
        if (selectedDevice !== null) {
            ipcRenderer.send('chooseUpload', selectedDevice.value)
        }
    }

    let options = []
    for (let i = 0; i < devices.length; i++) {
        options.push({ label: devices[i].UserName + " - " + devices[i].port, value: devices[i].port })
    }

    return (
        <div style={{ padding: '10px', display: 'flex', borderBottom: '1px solid lightGrey' }}>
            <div style={{ width: '100%', marginRight: '10px' }}>
                <Select styles={selectStyle} options={options} value={selectedDevice} onChange={(e) => setSelectedDevice(e)} />
            </div>
            <div>
                <Button size="sm" variant="outline-primary" onClick={() => uploadFirmware()}>Upload</Button>
            </div>
        </div>
    )
}
