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
            let theDevices = tempDevices
            console.log(theDevices)
            setDevices(theDevices)
            if (theDevices.length === 0) {
                setSelectedDevice(null)
            }
        })

        return () => {
            ipcRenderer.removeAllListeners('connectedDevices')
        }
    }, [])

    useEffect(() => {
        console.log(devices)
    }, [devices])

    const uploadFirmware = () => {
        if (selectedDevice !== null) {
            ipcRenderer.send('chooseUpload', selectedDevice.value)
        }
    }

    const makeBelow = () => {
        return (
            <div>
                <Button size="sm" variant="outline-primary" onClick={() => uploadFirmware()}>Upload</Button>
            </div>
        )
    }

    let options = []
    for (let i = 0; i < devices.length; i++) {
        options.push({ label: devices[i].UserName + " - " + devices[i].port, value: devices[i].port })
    }

    return (
        <div style={{ padding: '10px' }}>
            <div>
                <Select styles={selectStyle} options={options} value={selectedDevice} onChange={(e) => setSelectedDevice(e)} />
            </div>
            <hr />
            {makeBelow()}
        </div>
    )
}
