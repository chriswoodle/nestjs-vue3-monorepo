import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
require('dotenv').config()

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: parseInt(process.env.PORT) || 8080
    },
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '/src'),
        },
    }
})
