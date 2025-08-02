/**
 * Standalone Metrics Server for Frontend Service
 * Runs on port 3001 to serve Prometheus metrics
 */

const http = require('http');

const metricsData = {
  startTime: Date.now(),
  requestCount: 0,
  errorCount: 0
};

function generateMetrics() {
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

# HELP frontend_memory_usage_bytes Estimated frontend memory usage
# TYPE frontend_memory_usage_bytes gauge
frontend_memory_usage_bytes ${process.memoryUsage().heapUsed}
`;
}

const server = http.createServer((req, res) => {
  // Increment request count
  metricsData.requestCount++;

  if (req.method === 'GET' && req.url === '/metrics') {
    // Set proper headers for Prometheus
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Generate and send metrics
    const metrics = generateMetrics();
    res.writeHead(200);
    res.end(metrics);
  } else if (req.method === 'GET' && req.url === '/health') {
    // Health check endpoint
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'healthy', uptime: Math.floor((Date.now() - metricsData.startTime) / 1000) }));
  } else {
    // 404 for other endpoints
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend metrics server running on port ${PORT}`);
  console.log(`Metrics available at: https://localhost:${PORT}/metrics`);
  console.log(`Health check at: https://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Metrics server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Metrics server closed');
    process.exit(0);
  });
});
