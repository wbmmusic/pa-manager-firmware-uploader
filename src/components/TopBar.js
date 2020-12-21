import React, { useEffect, useState } from 'react'
const { ipcRenderer } = window.require('electron')

export default function TopBar() {
    const [devices, setDevices] = useState([])

    useEffect(() => {
        ipcRenderer.on('connectedDevices', (e, theDevices) => {
            console.log(theDevices)
            setDevices(theDevices)
        })

        
        return () => {
            ipcRenderer.removeAllListeners('connectedDevices')
        }
    }, [])

    return (
        <div>
            <button onClick={() => ipcRenderer.send('chooseUpload')}>Upload</button>
            <select>
                {devices.map(dev => <option>{dev.path + " - " + dev.serialNumber}</option>)}
            </select>
        </div>
    )
}
