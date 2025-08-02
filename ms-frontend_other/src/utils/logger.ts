/**
 * Frontend Logger Utility
 * Provides centralized logging for the frontend application
 * Supports application logs, error tracking, and user action logging
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogCategory {
  APPLICATION = 'application',
  USER_ACTION = 'user_action',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
}

export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  timestamp: string;
  service: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

class FrontendLogger {
  private serviceName = 'ms-frontend';
  private logstashUrl: string;
  private sessionId: string;
  private userId?: string;
  private logLevel: LogLevel;

  constructor() {
    // Generate session ID for tracking user sessions
    this.sessionId = this.generateSessionId();
    
    // Configure logging endpoint (use environment variable or default)
    const logstashHost = this.getEnvVar('LOGSTASH_HOST') || 'localhost';
    const logstashPort = this.getEnvVar('LOGSTASH_PORT') || '5001';
    this.logstashUrl = `https://${logstashHost}:${logstashPort}`;
    
    // Set log level from environment or default to INFO
    this.logLevel = (this.getEnvVar('LOG_LEVEL') as LogLevel) || LogLevel.INFO;
    
    // Set up global error handler
    this.setupGlobalErrorHandler();
    
    // Log application startup
    this.info(LogCategory.APPLICATION, 'Frontend application initialized', {
      version: this.getEnvVar('APP_VERSION') || '1.0.0',
      environment: this.getEnvVar('NODE_ENV') || 'development',
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEnvVar(key: string): string | undefined {
    // In a vanilla JS/TS frontend, we can access environment variables through:
    // 1. Global window object (if set by build process)
    // 2. Process env (if available in build context)
    // 3. HTML meta tags or data attributes
    
    // Try window global first (common pattern for frontend env vars)
    if (typeof window !== 'undefined' && (window as any).ENV) {
      return (window as any).ENV[key];
    }
    
    // Try process.env if available (build-time)
    if (typeof process !== 'undefined' && (process as any).env) {
      return (process as any).env[key];
    }
    
    // Try meta tags (alternative approach)
    if (typeof document !== 'undefined') {
      const metaTag = document.querySelector(`meta[name="env-${key.toLowerCase()}"]`);
      if (metaTag) {
        return metaTag.getAttribute('content') || undefined;
      }
    }
    
    return undefined;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private async sendLog(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // Always log to console for development
    if (this.getEnvVar('NODE_ENV') !== 'production') {
      const consoleMethod = entry.level === LogLevel.ERROR ? 'error' : 
                           entry.level === LogLevel.WARN ? 'warn' : 'log';
      console[consoleMethod](`[${entry.level.toUpperCase()}] ${entry.category}: ${entry.message}`, entry.metadata);
    }

    // Send to Logstash for centralized logging
    try {
      await fetch(this.logstashUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console if Logstash is unavailable
      console.error('Failed to send log to Logstash:', error);
      console.log('Original log entry:', entry);
    }
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      level,
      category,
      message,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata,
    };
  }

  private setupGlobalErrorHandler(): void {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.error(LogCategory.ERROR, 'Unhandled JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error(LogCategory.ERROR, 'Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  // Public logging methods
  debug(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, category, message, metadata);
    this.sendLog(entry);
  }

  info(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, category, message, metadata);
    this.sendLog(entry);
  }

  warn(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, category, message, metadata);
    this.sendLog(entry);
  }

  error(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, category, message, metadata);
    this.sendLog(entry);
  }

  // Specialized logging methods
  logUserAction(action: string, details?: Record<string, any>): void {
    this.info(LogCategory.USER_ACTION, `User action: ${action}`, details);
  }

  logPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(LogCategory.PERFORMANCE, `Performance metric: ${metric}`, {
      metric,
      value,
      unit,
    });
  }

  logSecurityEvent(event: string, details?: Record<string, any>): void {
    this.warn(LogCategory.SECURITY, `Security event: ${event}`, details);
  }

  // User context management
  setUserId(userId: string): void {
    this.userId = userId;
    this.info(LogCategory.APPLICATION, 'User context updated', { userId });
  }

  clearUserId(): void {
    const previousUserId = this.userId;
    this.userId = undefined;
    this.info(LogCategory.APPLICATION, 'User context cleared', { previousUserId });
  }
}

// Create singleton instance
export const logger = new FrontendLogger();

// Export for use in components
export default logger;
