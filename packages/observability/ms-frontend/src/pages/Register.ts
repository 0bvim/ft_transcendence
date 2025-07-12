import { authApi } from '../api/auth';

export default function Register(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8';

  container.innerHTML = `
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Join ft_transcendence and start playing!
        </p>
      </div>
      
      <div class="mt-8 space-y-6">
        <div class="card">
          <form id="registerForm" class="space-y-6">
            <div>
              <label for="username" class="form-label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                class="form-input"
                placeholder="Choose a username"
                minlength="3"
              />
              <p class="mt-1 text-sm text-gray-500">At least 3 characters</p>
            </div>
            
            <div>
              <label for="email" class="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                class="form-input"
                placeholder="Enter your email"
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
                placeholder="Create a password"
                minlength="8"
              />
              <p class="mt-1 text-sm text-gray-500">At least 8 characters</p>
            </div>
            
            <div>
              <label for="confirmPassword" class="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                class="form-input"
                placeholder="Confirm your password"
              />
            </div>
            
            <div id="errorMessage" class="hidden text-red-600 text-sm"></div>
            <div id="successMessage" class="hidden text-green-600 text-sm"></div>
            
            <div>
              <button
                type="submit"
                id="registerButton"
                class="w-full btn btn-primary"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
        
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <a href="/login" data-link class="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const form = container.querySelector('#registerForm') as HTMLFormElement;
  const registerButton = container.querySelector('#registerButton') as HTMLButtonElement;
  const errorMessage = container.querySelector('#errorMessage') as HTMLDivElement;
  const successMessage = container.querySelector('#successMessage') as HTMLDivElement;

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate form
    if (!validateForm(username, email, password, confirmPassword)) {
      return;
    }

    try {
      registerButton.disabled = true;
      registerButton.textContent = 'Creating account...';
      hideMessages();

      await authApi.register({ username, email, password });
      
      showSuccess('Account created successfully! You can now sign in.');
      
      // Reset form
      form.reset();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      showError(message);
    } finally {
      registerButton.disabled = false;
      registerButton.textContent = 'Create Account';
    }
  });

  // Add real-time validation
  const passwordInput = container.querySelector('#password') as HTMLInputElement;
  const confirmPasswordInput = container.querySelector('#confirmPassword') as HTMLInputElement;

  confirmPasswordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword && password !== confirmPassword) {
      confirmPasswordInput.setCustomValidity('Passwords do not match');
    } else {
      confirmPasswordInput.setCustomValidity('');
    }
  });

  function validateForm(username: string, email: string, password: string, confirmPassword: string): boolean {
    // Check if all fields are filled
    if (!username || !email || !password || !confirmPassword) {
      showError('Please fill in all fields');
      return false;
    }

    // Check username length
    if (username.length < 3) {
      showError('Username must be at least 3 characters long');
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return false;
    }

    // Check password length
    if (password.length < 8) {
      showError('Password must be at least 8 characters long');
      return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return false;
    }

    return true;
  }

  function showError(message: string) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    successMessage.classList.add('hidden');
  }

  function showSuccess(message: string) {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
    errorMessage.classList.add('hidden');
  }

  function hideMessages() {
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
  }

  return container;
} 