import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Se actualiza sola cuando subes cambios
      devOptions: {
        enabled: true // Para que podamos probarla en tu computadora
      },
      manifest: {
        name: 'Sistema GLI - Salón del Queso',
        short_name: 'GLI Ventas',
        description: 'Punto de Venta y Control de Almacén',
        theme_color: '#524e9c', /* Tu color morado corporativo */
        background_color: '#f1f5f9',
        display: 'standalone', /* Esto hace que se vea como App (sin barra de navegador) */
        orientation: 'portrait', /* Bloquea la app en modo vertical */
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});