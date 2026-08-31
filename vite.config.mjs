import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const sslKey = path.resolve(__dirname, './ssl/server.key');
  const sslCert = path.resolve(__dirname, './ssl/server.crt');
  const https =
    fs.existsSync(sslKey) && fs.existsSync(sslCert)
      ? { key: fs.readFileSync(sslKey), cert: fs.readFileSync(sslCert) }
      : undefined;

  return {
    plugins: [react()],
    // VITE_* for app config; GOOGLE_MAPS_* for Maps keys only (not GOOGLE_CLIENT_*)
    envPrefix: ['VITE_', 'GOOGLE_MAPS_'],
    build: {
      outDir: 'build',
    },
    server: {
      host: env.HOST || 'localhost',
      port: Number(env.PORT) || 8006,
      https,
      // Proxy /api to Node backend — avoids mixed-content (https page → http://3001)
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
        '/skate_assets': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
      // Vite can't always auto-infer wss when https is a custom cert object (vs. `https: true`).
      // Force it explicitly so HMR's websocket doesn't try ws:// against an https:// page.
      hmr: https
        ? {
            protocol: 'wss',
            host: env.HOST || 'localhost',
            clientPort: Number(env.PORT) || 8006,
          }
        : undefined,
    },
    preview: {
      host: env.HOST || 'localhost',
      port: Number(env.PORT) || 8006,
      https,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
        '/skate_assets': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
