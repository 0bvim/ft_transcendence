/**
 * Frontend Metrics Endpoint
 * Provides Prometheus-compatible metrics for the frontend service
 */

export class FrontendMetrics {
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;

  constructor() {
    this.startTime = Date.now();
    this.setupMetricsEndpoint();
  }

  private setupMetricsEndpoint() {
    // Check if we're in the metrics path
    if (window.location.pathname === '/metrics') {
      this.serveMetrics();
      return;
    }

    // Increment request count for regular pages
    this.requestCount++;
  }

  private serveMetrics() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const metrics = this.generatePrometheusMetrics(uptime);
    
    // Replace the entire page content with metrics
    document.body.innerHTML = `<pre>${metrics}</pre>`;
    document.head.innerHTML = '<meta charset="utf-8">';
    
    // Set the correct content type
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Type');
    metaTag.setAttribute('content', 'text/plain; charset=utf-8');
    document.head.appendChild(metaTag);
  }

  private generatePrometheusMetrics(uptime: number): string {
    return `# HELP frontend_uptime_seconds Frontend service uptime in seconds
# TYPE frontend_uptime_seconds gauge
frontend_uptime_seconds ${uptime}

# HELP frontend_requests_total Total number of requests processed
# TYPE frontend_requests_total counter
frontend_requests_total ${this.requestCount}

# HELP frontend_errors_total Total number of errors encountered
# TYPE frontend_errors_total counter
frontend_errors_total ${this.errorCount}

# HELP frontend_status Frontend service health status
# TYPE frontend_status gauge
frontend_status 1

# HELP frontend_memory_usage_bytes Estimated frontend memory usage
# TYPE frontend_memory_usage_bytes gauge
frontend_memory_usage_bytes ${this.getMemoryUsage()}

# HELP frontend_dom_elements_total Total number of DOM elements
# TYPE frontend_dom_elements_total gauge
frontend_dom_elements_total ${document.querySelectorAll('*').length}

# HELP frontend_load_time_seconds Page load time in seconds
# TYPE frontend_load_time_seconds gauge
frontend_load_time_seconds ${this.getLoadTime()}
`;
  }

  private getMemoryUsage(): number {
    // Estimate memory usage based on DOM size and other factors
    const domSize = document.documentElement.outerHTML.length;
    const estimatedMemory = domSize * 2; // Rough estimation
    return estimatedMemory;
  }

  private getLoadTime(): number {
    if (performance && performance.timing) {
      const loadTime = (performance.timing.loadEventEnd - performance.timing.navigationStart) / 1000;
      return Math.round(loadTime * 100) / 100; // Round to 2 decimal places
    }
    return 0;
  }

  public incrementErrorCount() {
    this.errorCount++;
  }

  public incrementRequestCount() {
    this.requestCount++;
  }
}

// Global metrics instance
export const frontendMetrics = new FrontendMetrics();
