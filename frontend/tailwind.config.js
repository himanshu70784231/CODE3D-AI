/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        code3d: {
          dark: '#070b14',
          surface: '#0d121f',
          panel: '#101c2d',
          accent: '#00f2fe',
          cyan: '#00f2fe',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          border: '#1e293b',
          lightBg: '#f8fafc',
          lightSurface: '#ffffff',
          lightPanel: '#f1f5f9',
          lightBorder: '#e2e8f0',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 242, 254, 0.25)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.25)',
        'glow-purple': '0 0 25px rgba(139, 92, 246, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

