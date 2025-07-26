import { setupObservability, ObservabilityConfig } from '@ft-transcendence/observability';

// Browser-side metrics collection interface
interface BrowserMetrics {
  pageLoadTime: number;
  userAgent: string;
  viewport: { width: number; height: number };
  errors: Array<{ message: string; stack?: string; timestamp: string }>;
  interactions: Array<{ type: string; element: string; timestamp: string }>;
}

class FrontendObservability {
  private logger: any;
  private metricsRegistry: any;
  private browserMetrics: BrowserMetrics;

  constructor() {
    // Initialize observability for frontend service
    const config: ObservabilityConfig = {
      serviceName: 'ms-frontend',
      logLevel: 'info',
      enableMetrics: true,
      enableHealthCheck: true,
    };

    // This will be used server-side (in Vite dev server or build process)
    if (typeof window === 'undefined') {
      const { logger, metricsRegistry } = setupObservability(null as any, config);
      this.logger = logger;
      this.metricsRegistry = metricsRegistry;
    }

    // Initialize browser metrics collection
    this.browserMetrics = {
      pageLoadTime: 0,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      viewport: this.getViewportSize(),
      errors: [],
      interactions: [],
    };

    this.initializeBrowserMetrics();
  }

  private getViewportSize() {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 0, height: 0 };
  }

  private initializeBrowserMetrics() {
    if (typeof window === 'undefined') return;

    // Measure page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.browserMetrics.pageLoadTime = loadTime;
      this.logMetric('page_load_time', loadTime);
    });

    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      const error = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      };
      this.browserMetrics.errors.push(error);
      this.logError('browser_error', error);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date().toISOString(),
      };
      this.browserMetrics.errors.push(error);
      this.logError('unhandled_promise_rejection', error);
    });

    // Track viewport changes
    window.addEventListener('resize', () => {
      this.browserMetrics.viewport = this.getViewportSize();
      this.logMetric('viewport_change', this.browserMetrics.viewport);
    });

    // Track user interactions
    this.trackUserInteractions();

    // Send metrics periodically
    setInterval(() => {
      this.sendBrowserMetrics();
    }, 30000); // Every 30 seconds
  }

  private trackUserInteractions() {
    if (typeof document === 'undefined') return;

    const interactionTypes = ['click', 'keydown', 'scroll'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const interaction = {
          type,
          element: (event.target as Element)?.tagName || 'unknown',
          timestamp: new Date().toISOString(),
        };
        
        this.browserMetrics.interactions.push(interaction);
        
        // Keep only last 100 interactions to prevent memory issues
        if (this.browserMetrics.interactions.length > 100) {
          this.browserMetrics.interactions.shift();
        }
      });
    });
  }

  // Public logging methods
  public logInfo(message: string, data?: any) {
    this.sendLogToBackend('info', message, data);
  }

  public logError(message: string, error?: any) {
    this.sendLogToBackend('error', message, error);
  }

  public logWarning(message: string, data?: any) {
    this.sendLogToBackend('warn', message, data);
  }

  public logMetric(name: string, value: any) {
    this.sendLogToBackend('info', `metric:${name}`, { metric: name, value });
  }

  private sendLogToBackend(level: string, message: string, data?: any) {
    // Send logs to backend service which will forward to Logstash
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      service: 'ms-frontend-browser',
      userAgent: this.browserMetrics.userAgent,
      viewport: this.browserMetrics.viewport,
    };

    // Use fetch to send to backend endpoint
    if (typeof fetch !== 'undefined') {
      fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      }).catch(error => {
        console.warn('Failed to send log to backend:', error);
      });
    }
  }

  private sendBrowserMetrics() {
    const metrics = {
      ...this.browserMetrics,
      timestamp: new Date().toISOString(),
      service: 'ms-frontend-browser',
    };

    this.sendLogToBackend('info', 'browser_metrics', metrics);
  }

  // Get current metrics for debugging
  public getMetrics(): BrowserMetrics {
    return { ...this.browserMetrics };
  }
}

// Export singleton instance
export const frontendObservability = new FrontendObservability();
export default frontendObservability;
