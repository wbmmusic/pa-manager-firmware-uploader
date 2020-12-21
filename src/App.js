import { useEffect } from 'react';
import TopBar from './components/TopBar';

const { ipcRenderer } = window.require('electron')

function App() {

  useEffect(() => {
    ipcRenderer.on('message', (e, theMessage) => {
      console.log(theMessage)
    })

    ipcRenderer.on('app_version', (event, arg) => {
      document.title = 'ENTER NAME IN APP.JS --- v' + arg.version;
    });


    ipcRenderer.send('reactIsReady')

    return () => {
      ipcRenderer.removeAllListeners('message');
      ipcRenderer.removeAllListeners('app_version');
    }
  }, [])


  return (
    <div>
      <TopBar />
    </div>
  );
}

export default App;
