import { useEffect, useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import Terminal from './components/Terminal';
import TopBar from './components/TopBar';
import Updates from './Updates';

const { ipcRenderer } = window.require('electron')

function App() {

  const [loadingModal, setLoadingModal] = useState({
    show: false
  })

  useEffect(() => {
    ipcRenderer.on('message', (e, theMessage) => {
      console.log(theMessage)
    })

    ipcRenderer.on('app_version', (event, arg) => {
      document.title = 'pa manager firmware uploader --- v' + arg.version;
    });

    ipcRenderer.on('uploading', () => {
      showLoadingModal(true)
    })

    ipcRenderer.on('uploadFinished', (e, theDevices) => {
      showLoadingModal(false)
    })

    ipcRenderer.send('reactIsReady')

    return () => {
      ipcRenderer.removeAllListeners('message');
      ipcRenderer.removeAllListeners('app_version');
      ipcRenderer.removeAllListeners('uploading');
      ipcRenderer.removeAllListeners('uploadFinished');
    }
  }, [])

  const showLoadingModal = (bool) => {
    let tempLoadingModal = { ...loadingModal }
    tempLoadingModal.show = bool
    setLoadingModal(tempLoadingModal)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <TopBar />
      <Updates />
      <Terminal />
      <Modal
        show={loadingModal.show}
        onHide={() => showLoadingModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Uploading Firmware</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Spinner size="xl" animation="border" />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
