import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Em dev, /api vai para o servidor Node (cookie de sessão fica no mesmo domínio).
    proxy: { '/api': 'http://localhost:3001' }
  }
});
