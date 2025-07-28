import { authApi } from "../api/auth";

export default function Login(): HTMLElement {
  const container = document.createElement("div");
  container.className = "min-h-screen flex items-center justify-center p-4 relative overflow-hidden";

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

    <!-- Main Login Container -->
    <div class="w-full max-w-md space-y-8 animate-fade-in relative z-10">
      <!-- Header -->
      <div class="text-center">        
        <h2 class="text-4xl font-bold text-gradient mb-4 font-retro tracking-wider">
          <span class="text-neon-pink">&lt;</span>ACCESS_GRANTED<span class="text-neon-cyan">/&gt;</span>
        </h2>
        <p class="text-neon-cyan/80 font-mono">
          <span class="text-neon-pink">$</span> Initialize authentication protocol...
        </p>
      </div>

      <!-- Login Form Card -->
      <div class="card p-8 space-y-6 animate-slide-up relative overflow-hidden">
        <!-- Terminal Header -->
        <div class="border-b border-neon-pink/30 pb-4 mb-6">
          <div class="flex items-center space-x-2 text-sm font-mono text-neon-cyan">
            <div class="w-3 h-3 rounded-full bg-danger-500"></div>
            <div class="w-3 h-3 rounded-full bg-warning-500"></div>
            <div class="w-3 h-3 rounded-full bg-neon-green"></div>
            <span class="ml-4 text-neon-pink">root@ft_transcendence:~$ login</span>
          </div>
        </div>

        <form id="loginForm" class="space-y-6">
          <!-- Email/Username Input -->
          <div class="form-group">
            <label for="login" class="form-label">
              <span class="text-neon-pink">[</span>USER_ID<span class="text-neon-cyan">]</span>
            </label>
            <input
              id="login"
              name="login"
              type="text"
              required
              placeholder="Enter username or email..."
              class="form-input"
            />
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label for="password" class="form-label">
              <span class="text-neon-cyan">[</span>PASSWORD<span class="text-neon-pink">]</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter access code..."
              class="form-input"
            />
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

          <!-- Login Button -->
          <button
            type="submit"
            id="loginButton"
            class="btn btn-primary w-full group relative overflow-hidden"
          >
            <span id="loginButtonText" class="relative z-10 flex items-center justify-center">
              EXECUTE_LOGIN.EXE
              <svg id="loginButtonIcon" class="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
            <div id="loginSpinner" class="hidden absolute inset-0 flex items-center justify-center">
              <div class="spinner"></div>
              <span class="ml-2 font-mono text-sm">AUTHENTICATING...</span>
            </div>
          </button>
        </form>

        <!-- Divider with Neon Effect -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full h-px bg-gradient-to-r from-transparent via-neon-pink to-transparent"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="px-4 bg-secondary-900 text-neon-cyan font-mono text-sm border border-neon-cyan/30 clip-cyber-button">
              OR_CONTINUE_WITH
            </span>
          </div>
        </div>

        <!-- Google Sign In -->
        <button
          type="button"
          id="googleSignInButton"
          class="btn btn-secondary w-full group relative overflow-hidden"
        >
          <span class="relative z-10 flex items-center justify-center">
            <svg class="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            GOOGLE_AUTH.EXE
            <svg class="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </span>
        </button>

        <!-- Register Link -->
        <div class="text-center pt-4 border-t border-neon-cyan/30">
          <p class="text-neon-cyan/70 font-mono text-sm mb-2">
            <span class="text-neon-pink">$</span> Need an account?
          </p>
          <a href="/register" data-link class="text-neon-green hover:text-neon-pink transition-colors font-mono font-semibold uppercase tracking-wider">
            CREATE_NEW_USER &gt;&gt;
          </a>
        </div>
      </div>

      <!-- Command Line Footer -->
      <div class="text-center text-xs text-neon-cyan/50 font-mono">
        <p>
          <span class="text-neon-pink">ft_transcendence@cyber:~$</span> 
          echo "Secure authentication required"
        </p>
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
      showError("All fields are required");
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.login(data);
      
      if (response.requiresTwoFactor) {
        // Store temporary user data for 2FA verification
        sessionStorage.setItem("tempUserId", response.user.id);
        sessionStorage.setItem("tempUserData", JSON.stringify(response.user));
        
        // Success animation
        loginButtonText.innerHTML = `
          <span class="text-neon-green">✓ ACCESS_GRANTED</span>
          <span class="ml-2 text-neon-cyan">→ 2FA_REQUIRED</span>
        `;
        
        setTimeout(() => {
          window.location.href = "/verify-2fa";
        }, 1000);
      } else {
        // Store tokens and redirect
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Success animation
        loginButtonText.innerHTML = `
          <span class="text-neon-green">✓ AUTHENTICATION_COMPLETE</span>
        `;
        
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Authentication failed. Please try again.";
      showError(message);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  });

  // Google Sign In
  googleButton.addEventListener("click", async () => {
    try {
      const { authUrl } = await authApi.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Google auth error:", error);
      showError("Failed to initiate Google authentication");
    }
  });

  function setLoading(loading: boolean) {
    loginButton.disabled = loading;
    googleButton.disabled = loading;
    
    if (loading) {
      loginButtonText.classList.add("hidden");
      loginSpinner.classList.remove("hidden");
      loginButton.classList.add("opacity-75");
    } else {
      loginButtonText.classList.remove("hidden");
      loginSpinner.classList.add("hidden");
      loginButton.classList.remove("opacity-75");
      
      // Reset button text
      loginButtonText.innerHTML = `
        EXECUTE_LOGIN.EXE
        <svg class="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
      `;
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

  // Input focus effects
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
