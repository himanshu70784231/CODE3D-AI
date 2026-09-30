import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES ? '/CODE3D-AI/' : '/'),
  server: {
    port: 5173,
    open: false,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'monaco-vendor': ['@monaco-editor/react'],
          'router-vendor': ['react-router-dom'],
          'lucide-vendor': ['lucide-react'],
        },
      },
    },
  },
}));

