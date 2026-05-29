const { defineConfig } = require('electron-vite')
const react = require('@vitejs/plugin-react')
const path = require('path')

module.exports = defineConfig({
    main: {
        build: {
            outDir: 'build',
            emptyOutDir: false,
            lib: {
                entry: path.resolve(__dirname, 'public/main.js'),
                formats: ['cjs'],
                fileName: () => 'main.js'
            },
            rollupOptions: {
                external: [
                    'electron',
                    'io-manager-usb-bootloader',
                    '@wbm-tek/version-manager',
                    'electron-updater',
                    'serialport',
                    'usb'
                ]
            }
        }
    },
    preload: {
        build: {
            outDir: 'build',
            emptyOutDir: false,
            lib: {
                entry: path.resolve(__dirname, 'public/preload.js'),
                formats: ['cjs'],
                fileName: () => 'preload.js'
            },
            rollupOptions: {
                external: ['electron']
            }
        }
    },
    renderer: {
        root: '.',
        build: {
            outDir: 'build',
            emptyOutDir: false,
            rollupOptions: {
                input: {
                    app: path.resolve(__dirname, 'index.html')
                }
            }
        },
        plugins: [react()]
    }
})
