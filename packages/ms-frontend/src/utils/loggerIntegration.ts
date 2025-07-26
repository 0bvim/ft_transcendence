/**
 * Frontend Logger Integration for Vanilla JavaScript/TypeScript
 * Provides easy integration of logging functionality into DOM elements and application logic
 */

import logger, { LogCategory } from './logger';

export interface LoggerIntegration {
  initializePageLogging: (pageName: string) => void;
  logButtonClick: (buttonId: string, additionalData?: Record<string, any>) => void;
  logFormSubmission: (formId: string, formData?: Record<string, any>) => void;
  logNavigation: (from: string, to: string) => void;
  logGameEvent: (event: string, gameData?: Record<string, any>) => void;
  logAuthEvent: (event: string, authData?: Record<string, any>) => void;
  logUserAction: (action: string, details?: Record<string, any>) => void;
  setupErrorBoundary: () => void;
  setupPerformanceMonitoring: () => void;
}

class VanillaLoggerIntegration implements LoggerIntegration {
  private currentPage: string = '';
  private pageStartTime: number = 0;

  constructor() {
    this.setupErrorBoundary();
    this.setupPerformanceMonitoring();
  }

  initializePageLogging(pageName: string): void {
    this.currentPage = pageName;
    this.pageStartTime = performance.now();

    // Log page view
    logger.logUserAction('page_view', {
      page: pageName,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    });

    // Set up page unload logging
    window.addEventListener('beforeunload', () => {
      const timeOnPage = performance.now() - this.pageStartTime;
      logger.logPerformance('time_on_page', timeOnPage, 'ms');
      logger.logUserAction('page_unload', {
        page: pageName,
        timeOnPage,
      });
    });

    // Log page load completion
    if (document.readyState === 'complete') {
      this.logPageLoadComplete();
    } else {
      window.addEventListener('load', () => this.logPageLoadComplete());
    }
  }

  private logPageLoadComplete(): void {
    const loadTime = performance.now() - this.pageStartTime;
    logger.logPerformance('page_load_time', loadTime, 'ms');
    logger.info(LogCategory.APPLICATION, `Page ${this.currentPage} loaded`, {
      loadTime,
      readyState: document.readyState,
    });
  }

  logButtonClick(buttonId: string, additionalData?: Record<string, any>): void {
    logger.logUserAction('button_click', {
      buttonId,
      page: this.currentPage,
      ...additionalData,
    });
  }

  logFormSubmission(formId: string, formData?: Record<string, any>): void {
    logger.logUserAction('form_submission', {
      formId,
      page: this.currentPage,
      ...formData,
    });
  }

  logNavigation(from: string, to: string): void {
    logger.logUserAction('navigation', {
      from,
      to,
      method: 'client_side',
    });
  }

  logGameEvent(event: string, gameData?: Record<string, any>): void {
    logger.logUserAction('game_event', {
      event,
      page: this.currentPage,
      ...gameData,
    });
  }

  logAuthEvent(event: string, authData?: Record<string, any>): void {
    logger.logUserAction('auth_event', {
      event,
      page: this.currentPage,
      ...authData,
    });

    // Set user context if login successful
    if (event === 'login_success' && authData?.userId) {
      logger.setUserId(authData.userId as string);
    } else if (event === 'logout') {
      logger.clearUserId();
    }
  }

  logUserAction(action: string, details?: Record<string, any>): void {
    logger.logUserAction(action, {
      page: this.currentPage,
      ...details,
    });
  }

  setupErrorBoundary(): void {
    // Global error handler is already set up in the logger constructor
    // This method can be used for additional error handling setup
    logger.info(LogCategory.APPLICATION, 'Error boundary initialized');
  }

  setupPerformanceMonitoring(): void {
    // Monitor performance metrics
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Log navigation timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            logger.logPerformance('dns_lookup', navigation.domainLookupEnd - navigation.domainLookupStart);
            logger.logPerformance('tcp_connect', navigation.connectEnd - navigation.connectStart);
            logger.logPerformance('request_response', navigation.responseEnd - navigation.requestStart);
            logger.logPerformance('dom_processing', navigation.domComplete - navigation.domContentLoadedEventStart);
          }
        }, 0);
      });

      // Monitor resource loading
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            logger.logPerformance('resource_load', resource.duration, 'ms');
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // Performance observer not supported
        logger.warn(LogCategory.APPLICATION, 'Performance observer not supported');
      }
    }
  }
}

// Create singleton instance
export const loggerIntegration = new VanillaLoggerIntegration();

// Helper functions for easy DOM integration
export const setupButtonLogging = (buttonSelector: string, buttonId?: string): void => {
  const buttons = document.querySelectorAll(buttonSelector);
  buttons.forEach((button, index) => {
    const id = buttonId || button.id || `button_${index}`;
    button.addEventListener('click', (event) => {
      loggerIntegration.logButtonClick(id, {
        text: button.textContent?.trim(),
        className: button.className,
      });
    });
  });
};

export const setupFormLogging = (formSelector: string): void => {
  const forms = document.querySelectorAll(formSelector);
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const formId = form.id || 'unnamed_form';
      const formData = new FormData(form as HTMLFormElement);
      const data: Record<string, any> = {};
      
      // Extract non-sensitive form data for logging
      formData.forEach((value, key) => {
        // Don't log sensitive fields
        if (!key.toLowerCase().includes('password') && 
            !key.toLowerCase().includes('secret') &&
            !key.toLowerCase().includes('token')) {
          data[key] = value;
        }
      });

      loggerIntegration.logFormSubmission(formId, {
        fieldCount: Object.keys(data).length,
        fields: Object.keys(data),
      });
    });
  });
};

export const setupLinkLogging = (linkSelector: string = 'a'): void => {
  const links = document.querySelectorAll(linkSelector);
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (href) {
        loggerIntegration.logNavigation(window.location.pathname, href);
      }
    });
  });
};

export default loggerIntegration;
