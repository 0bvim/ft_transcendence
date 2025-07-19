import { authApi } from "../api/auth";

export default function Login(): HTMLElement {
  const container = document.createElement("div");
  container.className = "min-h-screen bg-mesh-gradient flex items-center justify-center p-4 relative overflow-hidden";

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
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mx-auto flex items-center justify-center shadow-glow">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
            </svg>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gradient mb-2">
          Welcome back
        </h2>
        <p class="text-secondary-600">
          Sign in to continue your ft_transcendence journey
        </p>
      </div>

      <!-- Login Form Card -->
      <div class="card-gradient p-8 space-y-6 animate-slide-up">
        <form id="loginForm" class="space-y-6">
          <!-- Email/Username Input -->
          <div class="floating-input">
            <input
              id="login"
              name="login"
              type="text"
              required
              placeholder="Enter your email or username"
              class="peer w-full px-4 pt-6 pb-2 border border-secondary-200 rounded-xl bg-white/50 backdrop-blur-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <label for="login" class="absolute left-4 top-2 text-xs text-secondary-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600">
              Email or Username
            </label>
          </div>

          <!-- Password Input -->
          <div class="floating-input">
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              class="peer w-full px-4 pt-6 pb-2 border border-secondary-200 rounded-xl bg-white/50 backdrop-blur-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <label for="password" class="absolute left-4 top-2 text-xs text-secondary-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600">
              Password
            </label>
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

          <!-- Login Button -->
          <button
            type="submit"
            id="loginButton"
            class="btn btn-primary btn-lg w-full group"
          >
            <span id="loginButtonText">Sign In</span>
            <svg id="loginButtonIcon" class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
            <svg id="loginSpinner" class="w-5 h-5 ml-2 spinner hidden" fill="none" viewBox="0 0 24 24">
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
            <span class="px-2 bg-white text-secondary-500">Or continue with</span>
          </div>
        </div>

        <!-- Google Sign In -->
        <button
          type="button"
          id="googleSignInButton"
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

        <!-- Register Link -->
        <div class="text-center">
          <span class="text-sm text-secondary-600">Don't have an account? </span>
          <a href="/register" data-link class="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
            Sign up
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
  const form = container.querySelector("#loginForm") as HTMLFormElement;
  const loginButton = container.querySelector("#loginButton") as HTMLButtonElement;
  const googleButton = container.querySelector("#googleSignInButton") as HTMLButtonElement;
  const errorMessage = container.querySelector("#errorMessage") as HTMLElement;
  const errorText = container.querySelector("#errorText") as HTMLElement;
  const loginButtonText = container.querySelector("#loginButtonText") as HTMLElement;
  const loginButtonIcon = container.querySelector("#loginButtonIcon") as HTMLElement;
  const loginSpinner = container.querySelector("#loginSpinner") as HTMLElement;

  // Regular login form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = {
      login: formData.get("login") as string,
      password: formData.get("password") as string,
    };

    // Validate input
    if (!data.login.trim() || !data.password.trim()) {
      showError("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.login(data);
      
      if (response.user.twoFactorEnabled) {
        // Store temporary user data for 2FA verification
        sessionStorage.setItem("tempUserId", response.user.id);
        sessionStorage.setItem("tempUserData", JSON.stringify(response.user));
        window.location.href = "/verify-2fa";
      } else {
        // Store tokens and redirect
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Success animation
        loginButtonText.textContent = "Success!";
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Login failed. Please try again.";
      showError(message);
    } finally {
      setLoading(false);
    }
  });

  // Google Sign In
  googleButton.addEventListener("click", async () => {
    try {
      const { authUrl } = await authApi.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Google auth error:", error);
      showError("Failed to initiate Google sign-in");
    }
  });

  function setLoading(loading: boolean) {
    loginButton.disabled = loading;
    googleButton.disabled = loading;
    
    if (loading) {
      loginButtonText.textContent = "Signing in...";
      loginButtonIcon.classList.add("hidden");
      loginSpinner.classList.remove("hidden");
      loginButton.classList.add("opacity-75");
    } else {
      loginButtonText.textContent = "Sign In";
      loginButtonIcon.classList.remove("hidden");
      loginSpinner.classList.add("hidden");
      loginButton.classList.remove("opacity-75");
    }
  }

  function showError(message: string) {
    errorText.textContent = message;
    errorMessage.classList.remove("hidden");
    errorMessage.classList.add("animate-slide-down");
    
    setTimeout(() => {
      errorMessage.classList.add("hidden");
      errorMessage.classList.remove("animate-slide-down");
    }, 5000);
  }

  // Input focus animations
  const inputs = container.querySelectorAll("input");
  inputs.forEach(input => {
    input.addEventListener("focus", () => {
      input.parentElement?.classList.add("scale-in");
    });
    
    input.addEventListener("blur", () => {
      input.parentElement?.classList.remove("scale-in");
    });
  });
}
