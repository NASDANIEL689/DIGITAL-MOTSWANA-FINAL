import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './', // Serve files from the root folder
  base: './', // Use relative paths for development
  build: {
    outDir: 'dist', // Output directory for the build
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        user: resolve(__dirname, 'user.html'),
        profile: resolve(__dirname, 'profile.html'),
        documents: resolve(__dirname, 'documents.html'),
        security: resolve(__dirname, 'security.html'),
        verification: resolve(__dirname, 'verification.html'),
        announcements: resolve(__dirname, 'announcements.html'),
        support: resolve(__dirname, 'support.html')
      }
    }
  },
  server: {
    port: 3000, // Set port to 3000
    open: true, // Open browser automatically
  },
  resolve: {
    alias: {
      '@': '/src', // Allow @ to point to src directory
      '~': '/public' // Allow ~ to point to public directory
    }
  }
});
