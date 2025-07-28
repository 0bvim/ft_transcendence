import { authApi } from '../api/auth';

export default function Register(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen flex items-center justify-center p-4 relative overflow-hidden';

  container.innerHTML = `
    <!-- Synthwave Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Animated Grid Background -->
      <div class="absolute inset-0 synthwave-grid opacity-20"></div>
      
      <!-- Neon Orbs -->
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%); animation-delay: -2s;"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%); animation-delay: -4s;"></div>
      
      <!-- Scan Lines -->
      <div class="scan-line"></div>
    </div>

    <!-- Back to Home Link -->
    <div class="absolute top-6 left-6 z-20">
      <a href="/" data-link class="nav-link group">
        <svg class="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        BACK_TO_HOME
      </a>
    </div>

    <!-- Main Register Container -->
    <div class="w-full max-w-md space-y-8 animate-fade-in relative z-10">
      <!-- Header -->
      <div class="text-center">
        <div class="mb-8">
          <!-- Cyberpunk Logo -->
          <div class="relative mx-auto w-20 h-20">
            <div class="w-20 h-20 clip-cyberpunk bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center shadow-neon-green">
              <svg class="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <div class="absolute inset-0 w-20 h-20 clip-cyberpunk bg-gradient-to-br from-neon-green to-neon-cyan animate-glow-pulse opacity-50"></div>
          </div>
        </div>
        
        <h2 class="text-4xl font-bold text-gradient mb-4 font-retro tracking-wider">
          <span class="text-neon-green">&lt;</span>USER_CREATION<span class="text-neon-cyan">/&gt;</span>
        </h2>
        <p class="text-neon-cyan/80 font-mono">
          <span class="text-neon-green">$</span> Initialize new user protocol...
        </p>
      </div>

      <!-- Register Form Card -->
      <div class="card p-8 space-y-6 animate-slide-up relative overflow-hidden">
        <!-- Terminal Header -->
        <div class="border-b border-neon-green/30 pb-4 mb-6">
          <div class="flex items-center space-x-2 text-sm font-mono text-neon-cyan">
            <div class="w-3 h-3 rounded-full bg-danger-500"></div>
            <div class="w-3 h-3 rounded-full bg-warning-500"></div>
            <div class="w-3 h-3 rounded-full bg-neon-green"></div>
            <span class="ml-4 text-neon-green">root@ft_transcendence:~$ create_user</span>
          </div>
        </div>

        <form id="registerForm" class="space-y-6">
          <!-- Username Input -->
          <div class="form-group">
            <label for="username" class="form-label">
              <span class="text-neon-green">[</span>USERNAME<span class="text-neon-cyan">]</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Enter username..."
              minlength="3"
              class="form-input"
            />
            <div class="mt-1 text-xs text-neon-green/60 font-mono">
              <span class="text-neon-pink">></span> minimum 3 characters
            </div>
          </div>

          <!-- Email Input -->
          <div class="form-group">
            <label for="email" class="form-label">
              <span class="text-neon-cyan">[</span>EMAIL_ADDRESS<span class="text-neon-green">]</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter email address..."
              class="form-input"
            />
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label for="password" class="form-label">
              <span class="text-neon-pink">[</span>PASSWORD<span class="text-neon-cyan">]</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter secure password..."
              minlength="8"
              class="form-input"
            />
            <div class="mt-1 text-xs text-neon-pink/60 font-mono">
              <span class="text-neon-cyan">></span> minimum 8 characters
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              <span class="text-neon-cyan">[</span>CONFIRM_PASSWORD<span class="text-neon-pink">]</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm password..."
              minlength="8"
              class="form-input"
            />
          </div>

          <!-- Password Strength Indicator -->
          <div id="passwordStrength" class="hidden">
            <div class="text-sm font-mono mb-2 text-neon-cyan">Password strength:</div>
            <div class="flex space-x-1">
              <div class="h-2 flex-1 bg-secondary-700 rounded-sm strength-bar"></div>
              <div class="h-2 flex-1 bg-secondary-700 rounded-sm strength-bar"></div>
              <div class="h-2 flex-1 bg-secondary-700 rounded-sm strength-bar"></div>
              <div class="h-2 flex-1 bg-secondary-700 rounded-sm strength-bar"></div>
            </div>
            <div class="text-xs font-mono mt-1 strength-text text-neon-cyan/60"></div>
          </div>

          <!-- Error Message -->
          <div id="errorMessage" class="hidden">
            <div class="alert alert-danger">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <span class="font-mono text-sm">ERROR:</span>
                <span id="errorText" class="ml-2"></span>
              </div>
            </div>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            id="registerButton"
            class="btn btn-primary w-full group relative overflow-hidden"
          >
            <span id="registerButtonText" class="relative z-10 flex items-center justify-center">
              CREATE_ACCOUNT.EXE
              <svg id="registerButtonIcon" class="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
            <div id="registerSpinner" class="hidden absolute inset-0 flex items-center justify-center">
              <div class="spinner"></div>
              <span class="ml-2 font-mono text-sm">CREATING_USER...</span>
            </div>
          </button>
        </form>

        <!-- Divider with Neon Effect -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full h-px bg-gradient-to-r from-transparent via-neon-green to-transparent"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="px-4 bg-secondary-900 text-neon-cyan font-mono text-sm border border-neon-cyan/30 clip-cyber-button">
              OR_CONTINUE_WITH
            </span>
          </div>
        </div>

        <!-- Google Sign Up -->
        <button
          type="button"
          id="googleSignUpButton"
          class="btn btn-secondary w-full group relative overflow-hidden"
        >
          <span class="relative z-10 flex items-center justify-center">
            <svg class="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            GOOGLE_REGISTER.EXE
            <svg class="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </span>
        </button>

        <!-- Login Link -->
        <div class="text-center pt-4 border-t border-neon-green/30">
          <p class="text-neon-cyan/70 font-mono text-sm mb-2">
            <span class="text-neon-green">$</span> Already have access?
          </p>
          <a href="/login" data-link class="text-neon-pink hover:text-neon-cyan transition-colors font-mono font-semibold uppercase tracking-wider">
            LOGIN_INSTEAD &gt;&gt;
          </a>
        </div>
      </div>

      <!-- Command Line Footer -->
      <div class="text-center text-xs text-neon-cyan/50 font-mono">
        <p>
          <span class="text-neon-green">ft_transcendence@registration:~$</span> 
          echo "Account creation protocol initialized"
        </p>
      </div>
    </div>
  `;

  // Add event listeners
  setupEventListeners(container);

  return container;
}

function setupEventListeners(container: HTMLElement) {
  const form = container.querySelector('#registerForm') as HTMLFormElement;
  const registerButton = container.querySelector('#registerButton') as HTMLButtonElement;
  const googleButton = container.querySelector('#googleSignUpButton') as HTMLButtonElement;
  const errorMessage = container.querySelector('#errorMessage') as HTMLElement;
  const successMessage = container.querySelector('#successMessage') as HTMLElement;
  const errorText = container.querySelector('#errorText') as HTMLElement;
  const registerButtonText = container.querySelector('#registerButtonText') as HTMLElement;
  const registerButtonIcon = container.querySelector('#registerButtonIcon') as HTMLElement;
  const registerSpinner = container.querySelector('#registerSpinner') as HTMLElement;
  
  const passwordInput = container.querySelector('#password') as HTMLInputElement;
  const confirmPasswordInput = container.querySelector('#confirmPassword') as HTMLInputElement;
  const strengthBars = container.querySelectorAll('#passwordStrength .h-2');
  const strengthText = container.querySelector('#strengthText') as HTMLElement;

  // Password strength checker
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const strength = calculatePasswordStrength(password);
    updatePasswordStrength(strength, strengthBars, strengthText);
  });

  // Password confirmation validation
  confirmPasswordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && password !== confirmPassword) {
      confirmPasswordInput.classList.add('error');
    } else {
      confirmPasswordInput.classList.remove('error');
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    // Validate input
    if (!validateForm(data)) {
      return;
    }

    setLoading(true);
    
    try {
      await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      
      // Show success message
      showSuccess();
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      showError(message);
    } finally {
      setLoading(false);
    }
  });

  // Google Sign Up
  googleButton.addEventListener('click', async () => {
    try {
      const { authUrl } = await authApi.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google auth error:', error);
      showError('Failed to initiate Google sign-up');
    }
  });

  function validateForm(data: any): boolean {
    if (!data.username.trim() || !data.email.trim() || !data.password.trim()) {
      showError('Please fill in all fields');
      return false;
    }

    if (data.username.length < 3) {
      showError('Username must be at least 3 characters long');
      return false;
    }

    if (data.password.length < 8) {
      showError('Password must be at least 8 characters long');
      return false;
    }

    if (data.password !== data.confirmPassword) {
      showError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showError('Please enter a valid email address');
      return false;
    }

    return true;
  }

  function setLoading(loading: boolean) {
    registerButton.disabled = loading;
    googleButton.disabled = loading;
    
    if (loading) {
      registerButtonText.textContent = 'Creating Account...';
      registerButtonIcon.classList.add('hidden');
      registerSpinner.classList.remove('hidden');
      registerButton.classList.add('opacity-75');
    } else {
      registerButtonText.textContent = 'Create Account';
      registerButtonIcon.classList.remove('hidden');
      registerSpinner.classList.add('hidden');
      registerButton.classList.remove('opacity-75');
    }
  }

  function showError(message: string) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    successMessage.classList.add('hidden');
    errorMessage.classList.add('animate-slide-down');
    
    setTimeout(() => {
      errorMessage.classList.add('hidden');
      errorMessage.classList.remove('animate-slide-down');
    }, 5000);
  }

  function showSuccess() {
    successMessage.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    successMessage.classList.add('animate-slide-down');
  }

  // Input focus animations
  const inputs = container.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement?.classList.add('scale-in');
    });
    
    input.addEventListener('blur', () => {
      input.parentElement?.classList.remove('scale-in');
    });
  });
}

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return strength;
}

function updatePasswordStrength(strength: number, bars: NodeListOf<Element>, text: HTMLElement) {
  const colors = ['bg-secondary-700', 'bg-danger-400', 'bg-warning-400', 'bg-primary-400', 'bg-success-400'];
  const texts = ['Enter a password', 'Very Weak', 'Weak', 'Good', 'Strong'];
  
  bars.forEach((bar, index) => {
    bar.className = `h-2 rounded-sm flex-1 ${index < strength ? colors[strength] : 'bg-secondary-700'}`;
  });
  
  text.textContent = texts[strength] || 'Enter a password';
} 