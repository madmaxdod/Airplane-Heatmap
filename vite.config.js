import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite assumes the entry point is index.html in the root.
  // We need to tell it to look in the 'public' folder.
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    // Configure Vite to look for index.html in the public folder
    fs: {
      allow: ['.', 'public', 'src'],
    },
    // Set the base directory for the dev server to 'public'
    // Note: If running from root, Vite should typically handle this.
    // We explicitly set base to '/' and rely on root: './' to manage paths.
  }
});
