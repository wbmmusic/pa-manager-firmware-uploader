import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

const { ipcRenderer } = window.require('electron')

export default function Terminal() {

    const [term, setTerm] = useState([])

    useEffect(() => {
        console.log('TOP OF TERMINAL')

        ipcRenderer.on('serialData', (e, theData) => {
            setTerm(old => [(
                <div>
                    {theData}
                </div>
            ), ...old])
        })
        return () => {
            ipcRenderer.removeAllListeners('serialData');
        }
    }, [])

    return (
        <div style={{ width: '100%', height: '100%', padding: '5px', fontSize: '11px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} >
            <div style={{ padding: '5px' }}>
                <Button onClick={() => setTerm([])} size="sm" variant="outline-primary" >Clear Terminal</Button>
            </div>
            <div style={{ width: '100%', height: '100%', display: 'flex', padding: '5px', flexDirection: 'column-reverse', overflowY: 'scroll', border: '1px solid lightGrey' }} >
                {term}
            </div>
        </div>
    )
}
