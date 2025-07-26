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
    port: 3000,
    host: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/cert.pem"))
    },
    proxy: {
      '/api/tournament': {
        target: 'http://tournament:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tournament/, '')
      },
      '/api/blockchain': {
        target: 'http://blockchain:3004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/blockchain/, '')
      },
      '/api/game': {
        target: 'http://game:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/game/, '')
      }
    },
    // Add metrics endpoint for Prometheus monitoring
    configure: (app) => {
      app.use('/metrics', (req, res, next) => {
        if (req.method === 'GET') {
          const uptime = Math.floor(Date.now() / 1000); // Simple timestamp
          const metrics = `# HELP frontend_requests_total Total number of requests to frontend
# TYPE frontend_requests_total counter
frontend_requests_total{method="GET",status="200"} 1

# HELP frontend_uptime_seconds Frontend uptime in seconds
# TYPE frontend_uptime_seconds gauge
frontend_uptime_seconds ${uptime}

# HELP frontend_status Frontend service status
# TYPE frontend_status gauge
frontend_status 1
`;
          res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
          res.end(metrics);
        } else {
          next();
        }
      });
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
