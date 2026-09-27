import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['projects/*.html'],
      manifest: {
        name: 'Fifth Grade Coding Humanoid',
        short_name: 'TobyBot Mission Control',
        description: 'TobyBot Mission Control, the first learning path for Fifth Grade Coding Humanoid.',
        theme_color: '#0b0e1f',
        background_color: '#0b0e1f',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icons/tonybot.svg', sizes: '192x192', type: 'image/svg+xml' }
        ]
      },
      workbox: { navigateFallback: 'index.html' }
    })
  ]
});
