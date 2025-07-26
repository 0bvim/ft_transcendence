/**
 * Frontend Logging Initialization
 * Sets up logging for the ft_transcendence frontend application
 */

import { loggerIntegration, setupButtonLogging, setupFormLogging, setupLinkLogging } from './loggerIntegration';
import logger, { LogCategory } from './logger';

/**
 * Initialize logging for the entire application
 * Call this once when the application starts
 */
export const initializeApplicationLogging = (): void => {
  // Determine current page based on URL path
  const path = window.location.pathname;
  let pageName = 'unknown';
  
  if (path === '/' || path === '/index.html') {
    pageName = 'home';
  } else if (path.includes('/game')) {
    pageName = 'game';
  } else if (path.includes('/tournament')) {
    pageName = 'tournament';
  } else if (path.includes('/auth') || path.includes('/login')) {
    pageName = 'auth';
  } else if (path.includes('/profile')) {
    pageName = 'profile';
  }

  // Initialize page-level logging
  loggerIntegration.initializePageLogging(pageName);

  // Set up automatic logging for common UI elements
  setupCommonUILogging();

  // Set up game-specific logging if on game page
  if (pageName === 'game') {
    setupGameLogging();
  }

  // Set up auth-specific logging if on auth page
  if (pageName === 'auth') {
    setupAuthLogging();
  }

  // Set up tournament-specific logging if on tournament page
  if (pageName === 'tournament') {
    setupTournamentLogging();
  }

  logger.info(LogCategory.APPLICATION, `Logging initialized for page: ${pageName}`);
};

/**
 * Set up logging for common UI elements across all pages
 */
const setupCommonUILogging = (): void => {
  // Log all button clicks
  setupButtonLogging('button, .btn, [role="button"]');
  
  // Log all form submissions
  setupFormLogging('form');
  
  // Log all navigation links
  setupLinkLogging('a, .nav-link');

  // Log menu interactions
  const menuItems = document.querySelectorAll('.menu-item, .nav-item');
  menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      loggerIntegration.logButtonClick(`menu_item_${index}`, {
        text: item.textContent?.trim(),
        href: item.getAttribute('href'),
      });
    });
  });
};

/**
 * Set up game-specific logging
 */
const setupGameLogging = (): void => {
  // Log game start/end events
  const gameContainer = document.querySelector('#game-container, .game-area');
  if (gameContainer) {
    // Monitor for game state changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          // Log significant game state changes
          loggerIntegration.logGameEvent('game_state_change', {
            mutationType: mutation.type,
            targetElement: (mutation.target as Element).tagName,
          });
        }
      });
    });

    observer.observe(gameContainer, {
      childList: true,
      attributes: true,
      subtree: true,
    });
  }

  // Log game controls
  const gameControls = document.querySelectorAll('.game-control, [data-game-action]');
  gameControls.forEach((control) => {
    control.addEventListener('click', () => {
      const action = control.getAttribute('data-game-action') || 'unknown';
      loggerIntegration.logGameEvent('game_control_click', {
        action,
        controlId: control.id,
      });
    });
  });
};

/**
 * Set up authentication-specific logging
 */
const setupAuthLogging = (): void => {
  // Log login attempts
  const loginForm = document.querySelector('#login-form, .login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', () => {
      loggerIntegration.logAuthEvent('login_attempt');
    });
  }

  // Log registration attempts
  const registerForm = document.querySelector('#register-form, .register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', () => {
      loggerIntegration.logAuthEvent('registration_attempt');
    });
  }

  // Log OAuth button clicks
  const oauthButtons = document.querySelectorAll('.oauth-btn, [data-oauth-provider]');
  oauthButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const provider = button.getAttribute('data-oauth-provider') || 'unknown';
      loggerIntegration.logAuthEvent('oauth_login_attempt', { provider });
    });
  });

  // Log logout clicks
  const logoutButtons = document.querySelectorAll('.logout-btn, [data-action="logout"]');
  logoutButtons.forEach((button) => {
    button.addEventListener('click', () => {
      loggerIntegration.logAuthEvent('logout_attempt');
    });
  });
};

/**
 * Set up tournament-specific logging
 */
const setupTournamentLogging = (): void => {
  // Log tournament creation
  const createTournamentBtn = document.querySelector('#create-tournament, .create-tournament-btn');
  if (createTournamentBtn) {
    createTournamentBtn.addEventListener('click', () => {
      loggerIntegration.logUserAction('tournament_create_attempt');
    });
  }

  // Log tournament joining
  const joinButtons = document.querySelectorAll('.join-tournament-btn, [data-action="join-tournament"]');
  joinButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tournamentId = button.getAttribute('data-tournament-id');
      loggerIntegration.logUserAction('tournament_join_attempt', { tournamentId });
    });
  });
};

/**
 * Log successful authentication (call this from auth success callbacks)
 */
export const logAuthSuccess = (userId: string, method: string = 'unknown'): void => {
  loggerIntegration.logAuthEvent('login_success', { userId, method });
};

/**
 * Log authentication failure (call this from auth error callbacks)
 */
export const logAuthFailure = (reason: string, method: string = 'unknown'): void => {
  loggerIntegration.logAuthEvent('login_failure', { reason, method });
};

/**
 * Log game events (call this from game logic)
 */
export const logGameEvent = (event: string, data?: Record<string, any>): void => {
  loggerIntegration.logGameEvent(event, data);
};

/**
 * Initialize logging when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplicationLogging);
} else {
  initializeApplicationLogging();
}
