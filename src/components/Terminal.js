import React, { useEffect, useState } from 'react'

const { ipcRenderer } = window.require('electron')

export default function Terminal() {

    const [term, setTerm] = useState([])

    useEffect(() => {
        console.log('TOP OF TERMINAL')

        ipcRenderer.on('serialData', (e, path, theData) => {
            console.log('Got DATA')
            let tempTerminal = [...term]
            tempTerminal.push(
                <div key={"line" + tempTerminal.length} >
                    {path + " > " + Buffer.from(theData).toString()}
                </div>
            )
            setTerm(tempTerminal)
        })
        return () => {
            ipcRenderer.removeAllListeners('serialData');
        }
    }, [])

    return (
        <div style={{ width: '100%', height: '100%', padding: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column' }} >
            {term}
        </div>
    )
}
