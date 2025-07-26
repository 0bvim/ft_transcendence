/**
 * Vite Plugin for Frontend Metrics Endpoint
 * Provides a /metrics endpoint for Prometheus monitoring
 */

interface MetricsData {
  startTime: number;
  requestCount: number;
  errorCount: number;
}

const metricsData: MetricsData = {
  startTime: Date.now(),
  requestCount: 0,
  errorCount: 0
};

function generateMetrics(): string {
  const uptime = Math.floor((Date.now() - metricsData.startTime) / 1000);
  
  return `# HELP frontend_uptime_seconds Frontend service uptime in seconds
# TYPE frontend_uptime_seconds gauge
frontend_uptime_seconds ${uptime}

# HELP frontend_requests_total Total number of requests processed
# TYPE frontend_requests_total counter
frontend_requests_total ${metricsData.requestCount}

# HELP frontend_errors_total Total number of errors encountered
# TYPE frontend_errors_total counter
frontend_errors_total ${metricsData.errorCount}

# HELP frontend_status Frontend service health status
# TYPE frontend_status gauge
frontend_status 1

# HELP frontend_build_info Frontend build information
# TYPE frontend_build_info gauge
frontend_build_info{version="1.0.0",environment="development"} 1
`;
}

export function metricsPlugin(): any {
  return {
    name: 'metrics-plugin',
    configureServer(server: any) {
      server.middlewares.use('/metrics', (req: any, res: any, next: any) => {
        if (req.method === 'GET') {
          // Increment request count
          metricsData.requestCount++;
          
          // Set proper headers for Prometheus
          res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          
          // Generate and send metrics
          const metrics = generateMetrics();
          res.end(metrics);
        } else {
          next();
        }
      });

      // Middleware to count all requests
      server.middlewares.use((req: any, _res: any, next: any) => {
        if (!req.url?.startsWith('/metrics')) {
          metricsData.requestCount++;
        }
        next();
      });
    }
  };
}
