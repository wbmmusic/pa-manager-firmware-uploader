import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
import {
  Button,
  Divider,
  Typography,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CompareIcon from "@mui/icons-material/Compare";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/system";

export default function TopBar() {
  const defaultProgress = {
    erasing: false,
    writeProgress: 0,
    reading: false,
    verifyProgress: 0,
    complete: false,
  };
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [progress, setProgress] = useState(defaultProgress);
  const [uploading, setUploading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const open = Boolean(menuAnchor);

  useEffect(() => {
    window.api.receive("devList", (e, tempDevices) => {
      if (tempDevices.length === 0) {
        setDevices([]);
      } else {
        setDevices(tempDevices);
      }
    });

    window.api.receive("progress", (e, theData) => {
      setProgress(theData);
    });

    window.api.receive("uploading", e => {
      setUploading(true);
    });

    window.api.receive("uploadFinished", e => {
      setSelectedDevice(null);
    });

    window.api.send("getDevices");

    return () => {
      window.api.removeAllListeners("connectedDevices");
      window.api.removeAllListeners("progress");
      window.api.removeAllListeners("uploading");
      window.api.removeAllListeners("uploadFinished");
    };
  }, []);

  const uploadFirmware = () => {
    window.api.send("chooseUpload", selectedDevice.value);
  };

  const uploadCurrentFirmware = () => {
    window.api.send(
      "uploadCurrent",
      devices.find(dev => dev.path === selectedDevice.value)
    );
  };

  let options = [];
  for (let i = 0; i < devices.length; i++) {
    options.push({
      label:
        "(" +
        devices[i].Model +
        ") | " +
        devices[i].UserName +
        " | " +
        devices[i].path,
      value: devices[i].path,
    });
  }

  const handleDevicesClick = e => setMenuAnchor(e.currentTarget);

  const handleDevicesClose = () => setMenuAnchor(null);

  return (
    <>
      <Box p={1} sx={{ borderTop: "1px solid lightGrey" }}>
        <Stack direction="row" spacing={1}>
          <Box width="100%">
            <Button
              size="small"
              variant="contained"
              disabled={devices.length === 0}
              endIcon={<ExpandMoreIcon />}
              onClick={handleDevicesClick}
            >
              Devices
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={open}
              onClose={handleDevicesClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              {devices.map(dev => (
                <Tooltip
                  key={dev.serialNumber}
                  title={`Installed: ${dev.firmware} | Current: ${dev.curfw}`}
                  placement="bottom"
                >
                  <MenuItem
                    onClick={() => {
                      setSelectedDevice({
                        label: `${dev.Model} | ${dev.UserName} | ${dev.path}`,
                        value: dev.path,
                      });
                      setProgress(defaultProgress);
                      setUploading(false);
                      handleDevicesClose();
                    }}
                  >
                    {`${dev.Model} | ${dev.UserName} | ${dev.path}`}
                  </MenuItem>
                </Tooltip>
              ))}
            </Menu>
          </Box>

          <Button
            size="small"
            variant="contained"
            color="warning"
            disabled={!selectedDevice}
            onClick={() => uploadFirmware()}
            sx={{ whiteSpace: "nowrap", minWidth: "auto" }}
          >
            Upload Other FW
          </Button>
          <Button
            size="small"
            variant="contained"
            color="success"
            disabled={!selectedDevice}
            onClick={() => uploadCurrentFirmware()}
            sx={{ whiteSpace: "nowrap", minWidth: "auto" }}
          >
            Upload Current FW
          </Button>
        </Stack>
      </Box>
      <Divider />
      <Box p={1}>
        <Typography variant="body2">
          {selectedDevice !== null
            ? selectedDevice.label
            : "No device Selected"}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "relative",
          background: progress.complete ? "lightGreen" : "gainsboro",
          height: "100%",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "88px",
            backgroundColor: "whitesmoke",
            whiteSpace: "nowrap",
            height: "100%",
            top: "0px",
          }}
        >
          <Timeline>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot>
                  <PlayCircleOutlineIcon
                    style={iconStyle}
                    color={uploading ? "success" : ""}
                  />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: "18px", px: 2 }}>
                <Typography
                  sx={{ fontWeight: uploading ? "bold" : "" }}
                  component="span"
                >
                  Starting Upload
                </Typography>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot>
                  <DeleteSweepIcon
                    style={iconStyle}
                    color={progress.erasing ? "success" : ""}
                  />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: "18px", px: 2 }}>
                <Typography
                  sx={{ fontWeight: progress.writeProgress > 0 ? "bold" : "" }}
                  component="span"
                >
                  Erased
                </Typography>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot>
                  <UploadIcon
                    style={iconStyle}
                    color={progress.writeProgress > 0 ? "success" : ""}
                  />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: "18px", px: 2 }}>
                <Typography
                  sx={{ fontWeight: progress.writeProgress > 0 ? "bold" : "" }}
                  component="span"
                >
                  Writing{" "}
                  {progress.writeProgress > 0
                    ? progress.writeProgress + "%"
                    : ""}
                </Typography>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot>
                  <DownloadIcon
                    style={iconStyle}
                    color={progress.reading ? "success" : ""}
                  />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: "18px", px: 2 }}>
                <Typography
                  sx={{ fontWeight: progress.reading > 0 ? "bold" : "" }}
                  component="span"
                >
                  Read
                </Typography>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot>
                  <CompareIcon
                    style={iconStyle}
                    color={progress.verifyProgress > 0 ? "success" : ""}
                  />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: "18px", px: 2 }}>
                <Typography
                  sx={{ fontWeight: progress.verifyProgress > 0 ? "bold" : "" }}
                  component="span"
                >
                  Verifying{" "}
                  {progress.verifyProgress > 0
                    ? progress.verifyProgress + "%"
                    : ""}
                </Typography>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot>
                  <CheckCircleIcon
                    style={iconStyle}
                    color={progress.complete ? "success" : ""}
                  />
                </TimelineDot>
              </TimelineSeparator>
              <TimelineContent sx={{ py: "18px", px: 2 }}>
                <Typography
                  sx={{ fontWeight: progress.complete ? "bold" : "" }}
                  component="span"
                >
                  Complete
                </Typography>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Box>
      </Box>
    </>
  );
}

const iconStyle = { fontSize: "20px" };
