import { authApi } from '../api/auth';
import { createLink } from '../router/index';

export default function Login(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8';

  container.innerHTML = `
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Welcome back to ft_transcendence
        </p>
      </div>
      
      <div class="mt-8 space-y-6">
        <div class="card">
          <form id="loginForm" class="space-y-6">
            <div>
              <label for="login" class="form-label">
                Email or Username
              </label>
              <input
                id="login"
                name="login"
                type="text"
                required
                class="form-input"
                placeholder="Enter your email or username"
              />
            </div>
            
            <div>
              <label for="password" class="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                class="form-input"
                placeholder="Enter your password"
              />
            </div>
            
            <div id="errorMessage" class="hidden text-red-600 text-sm"></div>
            
            <div>
              <button
                type="submit"
                id="loginButton"
                class="w-full btn btn-primary"
              >
                Sign In
              </button>
            </div>
          </form>
          
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div class="mt-6">
              <button
                id="googleLoginButton"
                type="button"
                class="w-full btn btn-secondary flex items-center justify-center"
              >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <a href="/register" data-link class="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const form = container.querySelector('#loginForm') as HTMLFormElement;
  const loginButton = container.querySelector('#loginButton') as HTMLButtonElement;
  const googleLoginButton = container.querySelector('#googleLoginButton') as HTMLButtonElement;
  const errorMessage = container.querySelector('#errorMessage') as HTMLDivElement;

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData(form);
    const login = formData.get('login') as string;
    const password = formData.get('password') as string;

    if (!login || !password) {
      showError('Please fill in all fields');
      return;
    }

    try {
      loginButton.disabled = true;
      loginButton.textContent = 'Signing in...';
      hideError();

      const response = await authApi.login({ login, password });
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      showError(message);
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Sign In';
    }
  });

  // Handle Google login
  googleLoginButton.addEventListener('click', async () => {
    try {
      googleLoginButton.disabled = true;
      googleLoginButton.textContent = 'Redirecting...';
      
      const response = await authApi.getGoogleAuthUrl();
      window.location.href = response.authUrl;
    } catch (error: any) {
      console.error('Google login error:', error);
      showError('Google login failed. Please try again.');
      googleLoginButton.disabled = false;
      googleLoginButton.textContent = 'Sign in with Google';
    }
  });

  function showError(message: string) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  function hideError() {
    errorMessage.classList.add('hidden');
  }

  return container;
} 