import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
require('dotenv').config()

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: parseInt(process.env.PORT) || 8080
    },
    plugins: [
        vue(),
        // commonjs()
        // babel({ babelHelpers: 'bundled' }),
    ]
})
