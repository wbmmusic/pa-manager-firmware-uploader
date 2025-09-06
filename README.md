# PA Manager Firmware Uploader

React + Electron desktop application used during development for uploading firmware to PAM system devices via USB bootloader. This development tool provides direct firmware upload capabilities for testing and development purposes.

## Key Features

- **USB Device Detection**: Automatically detects and monitors WBM USB devices in bootloader mode during development
- **Firmware Upload**: Uploads firmware files (.bin) directly to connected PAM devices via USB for testing
- **Version Management**: Integrates with WBM version manager for firmware download and organization
- **Auto-Update**: Built-in electron-updater for automatic application updates during development cycles
- **Progress Tracking**: Real-time upload progress monitoring with visual feedback for development workflow
- **File Management**: Organizes firmware files by device type in user data directory for easy access
- **Bootloader Integration**: Uses io-manager-usb-bootloader for direct device communication and firmware upload
- **Material-UI Interface**: Professional interface for development firmware management operations
- **Development Tool**: Designed specifically for firmware development and testing workflows

## Architecture

Electron application with React frontend, USB device management, and automatic update capabilities designed for development use.

## Development Usage

Used during PAM system development for direct firmware upload to devices, bypassing the normal brain-managed update process for testing and development purposes.

## Dependencies

- React
- Electron
- Material-UI
- SerialPort
- USB
- electron-updater
- io-manager-usb-bootloader
- wbm-version-manager