import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// If you're using React:
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tailwindcss()],
});
