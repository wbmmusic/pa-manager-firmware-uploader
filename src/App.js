import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import Updates from './Updates';

const { ipcRenderer } = window.require('electron')

function App() {

  useEffect(() => {
    ipcRenderer.on('message', (e, theMessage) => {
      console.log(theMessage)
    })

    ipcRenderer.on('app_version', (event, arg) => {
      document.title = 'pa manager firmware uploader --- v' + arg.version;
    });

    ipcRenderer.send('reactIsReady')

    return () => {
      ipcRenderer.removeAllListeners('message');
      ipcRenderer.removeAllListeners('app_version');
    }
  }, [])


  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <TopBar />
      <Updates />
    </div>
  );
}

export default App;
