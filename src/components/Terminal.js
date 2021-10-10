import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'

const { ipcRenderer } = window.require('electron')

export default function Terminal() {

    const [progress, setProgress] = useState({
        erasing: false,
        writeProgress: 0,
        reading: false,
        verifyProgress: 0,
        complete: false
    })

    useEffect(() => {
        ipcRenderer.on('progress', (e, theData) => {
            setProgress(theData)
        })

        return () => {
            ipcRenderer.removeAllListeners('progress');
        }
    }, [])

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ display: 'inline-block' }}>
                <Table>
                    <tbody>
                        <tr>
                            <td>Erase</td>
                            <td><input type="checkbox" checked={progress.erasing} /></td>
                        </tr>
                        <tr>
                            <td>Write</td>
                            <td><progress value={progress.writeProgress} /></td>
                        </tr>
                        <tr>
                            <td>Read</td>
                            <td><input type="checkbox" checked={progress.reading} /></td>
                        </tr>
                        <tr>
                            <td>Verify</td>
                            <td><progress value={progress.verifyProgress} /></td>
                        </tr>
                        <tr>
                            <td>Complete</td>
                            <td><input type="checkbox" checked={progress.complete} /></td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        </div>
    )
}
