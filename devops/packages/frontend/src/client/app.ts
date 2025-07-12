// ft_transcendence SPA - Simple Login Flow (TypeScript)

interface User {
  username: string;
  loginTime: string;
}

interface LogEntry {
  timestamp: string;
  action: string;
  data: Record<string, any>;
  userAgent: string;
  url: string;
}

class App {
  private currentUser: User | null = null;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Check if user is already logged in (basic localStorage check)
    const savedUser = localStorage.getItem('ft_transcendence_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser) as User;
        this.showWelcomePage();
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('ft_transcendence_user');
        this.showLoginPage();
      }
    } else {
      this.showLoginPage();
    }

    // Bind event listeners
    this.bindEvents();
  }

  private bindEvents(): void {
    // Login form submission
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    if (loginForm) {
      loginForm.addEventListener('submit', (e: Event) => this.handleLogin(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Sign up link (placeholder for now)
    const signupLink = document.getElementById('signup-link') as HTMLAnchorElement;
    if (signupLink) {
      signupLink.addEventListener('click', (e: Event) => {
        e.preventDefault();
        alert('Sign up functionality coming soon!');
      });
    }
  }

  private handleLogin(event: Event): void {
    event.preventDefault();
    
    const usernameElement = document.getElementById('username') as HTMLInputElement;
    const passwordElement = document.getElementById('password') as HTMLInputElement;
    
    if (!usernameElement || !passwordElement) {
      this.showError('Form elements not found');
      return;
    }

    const username = usernameElement.value.trim();
    const password = passwordElement.value.trim();

    // Basic validation
    if (!username || !password) {
      this.showError('Please fill in all fields');
      return;
    }

    // Simple demo login (no real authentication yet)
    // For now, any non-empty username/password combination works
    if (username.length >= 3 && password.length >= 4) {
      this.currentUser = {
        username: username,
        loginTime: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('ft_transcendence_user', JSON.stringify(this.currentUser));
      
      this.showWelcomePage();
      this.logAction('login_success', { username });
    } else {
      this.showError('Username must be at least 3 characters, password at least 4 characters');
    }
  }

  private handleLogout(): void {
    if (this.currentUser) {
      this.logAction('logout', { username: this.currentUser.username });
    }
    
    this.currentUser = null;
    localStorage.removeItem('ft_transcendence_user');
    this.showLoginPage();
  }

  private showLoginPage(): void {
    const loginPage = document.getElementById('login-page') as HTMLDivElement;
    const welcomePage = document.getElementById('welcome-page') as HTMLDivElement;
    
    if (loginPage) loginPage.classList.remove('hidden');
    if (welcomePage) welcomePage.classList.add('hidden');
    
    // Clear any previous error messages
    this.clearErrors();
  }

  private showWelcomePage(): void {
    const loginPage = document.getElementById('login-page') as HTMLDivElement;
    const welcomePage = document.getElementById('welcome-page') as HTMLDivElement;
    
    if (loginPage) loginPage.classList.add('hidden');
    if (welcomePage) welcomePage.classList.remove('hidden');
    
    // Update welcome message with username
    if (this.currentUser) {
      const welcomeText = welcomePage.querySelector('p') as HTMLParagraphElement;
      if (welcomeText) {
        welcomeText.textContent = `Welcome back, ${this.currentUser.username}! You have successfully logged in to ft_transcendence.`;
      }
    }
  }

  private showError(message: string): void {
    // Remove any existing error messages
    this.clearErrors();
    
    // Create error message element
    const errorDiv = document.createElement('div') as HTMLDivElement;
    errorDiv.id = 'error-message';
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
    errorDiv.textContent = message;
    
    // Insert error message at the top of the login form
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    if (loginForm && loginForm.firstChild) {
      loginForm.insertBefore(errorDiv, loginForm.firstChild);
    }
  }

  private clearErrors(): void {
    const existingError = document.getElementById('error-message') as HTMLDivElement;
    if (existingError) {
      existingError.remove();
    }
  }

  // Simple logging function for development
  private logAction(action: string, data: Record<string, any> = {}): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      data: data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.log('ft_transcendence Log:', logEntry);
    
    // In a real application, this would send to the backend
    // For now, we'll just log to console for development
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
