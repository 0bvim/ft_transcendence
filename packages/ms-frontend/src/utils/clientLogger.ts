interface ClientLogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  timestamp: string;
  source: string;
  url: string;
  userAgent: string;
  userId?: string;
}

class ClientLogger {
  private logBuffer: ClientLogEntry[] = [];
  private readonly maxBufferSize = 50;
  private readonly flushInterval = 5000; // 5 seconds
  private flushTimer: number | null = null;
  private readonly endpoint = '/api/logs/client';

  constructor() {
    this.startPeriodicFlush();
    this.interceptConsole();
    this.captureErrors();
  }

  private interceptConsole() {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    console.log = (...args) => {
      this.log('info', this.formatMessage(args));
      originalConsole.log(...args);
    };

    console.warn = (...args) => {
      this.log('warn', this.formatMessage(args));
      originalConsole.warn(...args);
    };

    console.error = (...args) => {
      this.log('error', this.formatMessage(args));
      originalConsole.error(...args);
    };

    console.info = (...args) => {
      this.log('info', this.formatMessage(args));
      originalConsole.info(...args);
    };
  }

  private captureErrors() {
    window.addEventListener('error', (event) => {
      this.log('error', 'Uncaught Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.log('error', 'Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  private formatMessage(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  private log(level: ClientLogEntry['level'], message: string, data?: any) {
    // Don't log our own logging requests to avoid recursion
    if (message.includes('/api/logs/client')) return;

    const logEntry: ClientLogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source: 'frontend-client',
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId()
    };

    this.logBuffer.push(logEntry);

    // Flush immediately for errors
    if (level === 'error') {
      this.flush();
    } else if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private getUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id;
      }
    } catch {
      // Ignore errors parsing user data
    }
    return undefined;
  }

  private async flush() {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend })
      });
    } catch (error) {
      // If sending fails, put logs back in buffer (but don't exceed max size)
      const remainingSpace = this.maxBufferSize - this.logBuffer.length;
      if (remainingSpace > 0) {
        this.logBuffer.unshift(...logsToSend.slice(0, remainingSpace));
      }
    }
  }

  private startPeriodicFlush() {
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Final flush
  }

  // Manual logging methods
  public info(message: string, data?: any) {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  public error(message: string, data?: any) {
    this.log('error', message, data);
  }

  public debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

// Create global instance
export const clientLogger = new ClientLogger();

// Global cleanup on page unload
window.addEventListener('beforeunload', () => {
  clientLogger.destroy();
}); 