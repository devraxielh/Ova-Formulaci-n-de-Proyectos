import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api/crossref': {
                target: 'https://api.crossref.org',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/crossref/, ''),
            },
            '/api': {
                target: 'http://127.0.0.1:8787',
                changeOrigin: false,
            },
        },
    },
})
