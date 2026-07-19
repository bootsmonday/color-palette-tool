import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// If you're using React:
// import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Use the repository path only for production builds (GitHub Pages).
  base: command === 'build' ? '/color-palette-tool/' : '/',
  plugins: [tailwindcss()],
}));
