import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/compare': 'http://localhost:5000',
            '/compare_json': 'http://localhost:5000',
            '/compare_text': 'http://localhost:5000',
            '/compare_csv': 'http://localhost:5000',
            '/compare_yaml': 'http://localhost:5000',
        }
    },
    build: {
        outDir: '../static/dist',
        emptyOutDir: true,
    }
})
