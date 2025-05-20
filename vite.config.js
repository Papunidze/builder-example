// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@elements': path.resolve(__dirname, 'Elements'), // new alias
        },
    },
    server: {
        fs: {
            allow: [
                path.resolve(__dirname, 'Elements'), // allow access to Elements outside src
            ],
        },
    },
});
