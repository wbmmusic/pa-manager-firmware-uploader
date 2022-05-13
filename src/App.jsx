import { useEffect } from "react";
import TopBar from "./components/TopBar";
import Updates from "./Updates";
import { Box, CssBaseline } from "@mui/material";

function App() {
  useEffect(() => {
    window.api.receive("message", (e, theMessage) => {
      console.log(theMessage);
    });

    window.api.receive("app_version", (event, arg) => {
      document.title = "io-manager firmware uploader --- v" + arg.version;
    });

    window.api.send("reactIsReady");

    return () => {
      window.api.removeAllListeners("message");
      window.api.removeAllListeners("app_version");
    };
  }, []);

  return (
    <Box
      width="100vw"
      height="100vh"
      maxHeight="100vh"
      maxWidth="100vw"
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CssBaseline />
      <TopBar />
      <Updates />
    </Box>
  );
}

export default App;
