interface GameClientLogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  timestamp: string;
  source: string;
  gameState?: string;
  playerInfo?: any;
}

class GameClientLogger {
  private logBuffer: GameClientLogEntry[] = [];
  private readonly maxBufferSize = 30;
  private readonly flushInterval = 3000; // 3 seconds for games (more frequent)
  private flushTimer: number | null = null;
  private readonly endpoint = '/api/logs/game-client';

  constructor() {
    this.startPeriodicFlush();
    this.captureErrors();
  }

  private captureErrors() {
    window.addEventListener('error', (event) => {
      this.log('error', 'Game Runtime Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.log('error', 'Game Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  public log(level: GameClientLogEntry['level'], message: string, data?: any) {
    const logEntry: GameClientLogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source: 'game-client',
      gameState: this.getGameState()
    };

    this.logBuffer.push(logEntry);

    // Flush immediately for errors
    if (level === 'error') {
      this.flush();
    } else if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private getGameState(): string {
    // Try to get game state from global variables if available
    try {
      return document.title || 'game-active';
    } catch {
      return 'unknown';
    }
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

  // Convenience methods
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

  public gameEvent(eventType: string, data?: any) {
    this.log('info', `Game Event: ${eventType}`, data);
  }
}

// Create global instance
export const gameLogger = new GameClientLogger();

// Global cleanup on page unload
window.addEventListener('beforeunload', () => {
  gameLogger.destroy();
});

// Make available globally for easy access in game code
(window as any).gameLogger = gameLogger; 