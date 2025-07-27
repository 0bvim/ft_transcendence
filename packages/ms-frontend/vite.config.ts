import { defineConfig } from "vite";
import path from "path";
import fs from "fs";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3010,
    host: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/cert.pem"))
    },
    proxy: {
      '/api/tournament': {
        target: 'http://tournament:4243',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tournament/, '')
      },
      '/api/blockchain': {
        target: 'http://blockchain:3004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/blockchain/, '')
      },
      '/api/game': {
        target: 'http://game:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/game/, '')
      }
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
