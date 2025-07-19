import { authApi } from '../api/auth';

export default function Register(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-mesh-gradient flex items-center justify-center p-4 relative overflow-hidden';

  container.innerHTML = `
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
      <div class="absolute top-1/3 right-1/3 w-60 h-60 bg-primary-200/20 rounded-full blur-3xl animate-float" style="animation-delay: -1.5s;"></div>
    </div>

    <div class="w-full max-w-md space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-success-500 to-success-700 rounded-2xl mx-auto flex items-center justify-center shadow-glow">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gradient mb-2">
          Join ft_transcendence
        </h2>
        <p class="text-secondary-600">
          Create your account and start your pong journey
        </p>
      </div>

      <!-- Register Form Card -->
      <div class="card-gradient p-8 space-y-6 animate-slide-up">
        <form id="registerForm" class="space-y-6">
          <!-- Username Input -->
          <div class="floating-input">
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Choose a username"
              minlength="3"
              class="peer w-full px-4 pt-6 pb-2 border border-secondary-200 rounded-xl bg-white/50 backdrop-blur-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <label for="username" class="absolute left-4 top-2 text-xs text-secondary-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600">
              Username
            </label>
            <div class="mt-1 text-xs text-secondary-500">At least 3 characters</div>
          </div>

          <!-- Email Input -->
          <div class="floating-input">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              class="peer w-full px-4 pt-6 pb-2 border border-secondary-200 rounded-xl bg-white/50 backdrop-blur-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <label for="email" class="absolute left-4 top-2 text-xs text-secondary-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600">
              Email Address
            </label>
          </div>

          <!-- Password Input -->
          <div class="floating-input">
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Create a password"
              minlength="8"
              class="peer w-full px-4 pt-6 pb-2 border border-secondary-200 rounded-xl bg-white/50 backdrop-blur-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <label for="password" class="absolute left-4 top-2 text-xs text-secondary-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600">
              Password
            </label>
            <div class="mt-1 text-xs text-secondary-500">At least 8 characters</div>
          </div>

          <!-- Confirm Password Input -->
          <div class="floating-input">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm your password"
              minlength="8"
              class="peer w-full px-4 pt-6 pb-2 border border-secondary-200 rounded-xl bg-white/50 backdrop-blur-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <label for="confirmPassword" class="absolute left-4 top-2 text-xs text-secondary-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600">
              Confirm Password
            </label>
          </div>

          <!-- Password Strength Indicator -->
          <div id="passwordStrength" class="space-y-2">
            <div class="text-xs text-secondary-600">Password strength:</div>
            <div class="flex space-x-1">
              <div class="h-1 bg-secondary-200 rounded-full flex-1"></div>
              <div class="h-1 bg-secondary-200 rounded-full flex-1"></div>
              <div class="h-1 bg-secondary-200 rounded-full flex-1"></div>
              <div class="h-1 bg-secondary-200 rounded-full flex-1"></div>
            </div>
            <div class="text-xs text-secondary-500" id="strengthText">Enter a password</div>
          </div>

          <!-- Error Message -->
          <div id="errorMessage" class="hidden">
            <div class="alert alert-danger">
              <div class="flex">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <span id="errorText"></span>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div id="successMessage" class="hidden">
            <div class="alert alert-success">
              <div class="flex">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span>Account created successfully! Redirecting to login...</span>
              </div>
            </div>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            id="registerButton"
            class="btn btn-success btn-lg w-full group"
          >
            <span id="registerButtonText">Create Account</span>
            <svg id="registerButtonIcon" class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
            <svg id="registerSpinner" class="w-5 h-5 ml-2 spinner hidden" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-secondary-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-secondary-500">Or sign up with</span>
          </div>
        </div>

        <!-- Google Sign Up -->
        <button
          type="button"
          id="googleSignUpButton"
          class="btn btn-secondary w-full group"
        >
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
          <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <!-- Login Link -->
        <div class="text-center">
          <span class="text-sm text-secondary-600">Already have an account? </span>
          <a href="/login" data-link class="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
            Sign in
          </a>
        </div>
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
  const strengthBars = container.querySelectorAll('#passwordStrength .h-1');
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
  const colors = ['bg-secondary-200', 'bg-danger-400', 'bg-warning-400', 'bg-primary-400', 'bg-success-400'];
  const texts = ['Enter a password', 'Very Weak', 'Weak', 'Good', 'Strong'];
  
  bars.forEach((bar, index) => {
    bar.className = `h-1 rounded-full flex-1 ${index < strength ? colors[strength] : 'bg-secondary-200'}`;
  });
  
  text.textContent = texts[strength] || 'Enter a password';
} 