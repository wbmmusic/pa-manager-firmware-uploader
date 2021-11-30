import { useEffect } from 'react';
import TopBar from './components/TopBar';
import Updates from './Updates';

function App() {

  useEffect(() => {
    window.api.receive('message', (e, theMessage) => {
      console.log(theMessage)
    })

    window.api.receive('app_version', (event, arg) => {
      document.title = 'io-manager firmware uploader --- v' + arg.version;
    });

    window.api.send('reactIsReady')

    return () => {
      window.api.removeAllListeners('message');
      window.api.removeAllListeners('app_version');
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
