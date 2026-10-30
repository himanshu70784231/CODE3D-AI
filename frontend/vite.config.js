import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let resolvedBackendUrl = (
    env.VITE_BACKEND_URL ||
    env.VITE_API_URL ||
    env.VITE_API_BASE_URL ||
    env.BACKEND_URL ||
    ''
  ).trim();

  // Strip any obsolete or defunct subdomain from environment overrides
  if (/code3d-ai-oscc\.onrender\.com/i.test(resolvedBackendUrl)) {
    resolvedBackendUrl = resolvedBackendUrl.replace(/code3d-ai-oscc\.onrender\.com/gi, 'code3d-ai.onrender.com');
  }

  return {
    plugins: [react()],
    // If BACKEND_URL or VITE_BACKEND_URL is provided, safely inject into import.meta.env
    define: resolvedBackendUrl
      ? {
          'import.meta.env.VITE_BACKEND_URL': JSON.stringify(resolvedBackendUrl),
        }
      : {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES ? '/CODE3D-AI/' : '/'),
    server: {
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: resolvedBackendUrl || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
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
  };
});

