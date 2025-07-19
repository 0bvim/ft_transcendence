import { authApi } from "../api/auth";
import { startRegistration, startAuthentication } from "../utils/webauthn";

export default function Verify2FA(): HTMLElement {
  const container = document.createElement("div");
  container.className = "min-h-screen bg-mesh-gradient flex items-center justify-center p-4 relative overflow-hidden";

  container.innerHTML = `
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-warning-300/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-warning-400/20 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
      <div class="absolute top-1/3 right-1/3 w-60 h-60 bg-warning-200/20 rounded-full blur-3xl animate-float" style="animation-delay: -1.5s;"></div>
    </div>

    <div class="w-full max-w-md space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="text-center">
        <div class="mb-4">
          <button id="backButton" class="btn btn-ghost text-secondary-600 hover:text-primary-600 mb-4">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Login
          </button>
        </div>
        <div class="mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-700 rounded-2xl mx-auto flex items-center justify-center shadow-glow">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gradient mb-2">
          Two-Factor Authentication
        </h2>
        <p class="text-secondary-600 mb-6">
          Complete your login with two-factor authentication
        </p>
      </div>

      <!-- 2FA Options Card -->
      <div class="card-gradient p-8 space-y-6 animate-slide-up">
        <!-- WebAuthn Section -->
        <div id="webauthnSection" class="space-y-4">
          <div class="text-center">
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">Security Key / Biometric</h3>
            <p class="text-sm text-secondary-600 mb-4">Use your security key, fingerprint, or face recognition</p>
          </div>
          
          <button
            id="webauthnButton"
            type="button"
            class="btn btn-primary btn-lg w-full group"
          >
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
            <span id="webauthnButtonText">Use Security Key</span>
            <svg id="webauthnButtonIcon" class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
            <svg id="webauthnSpinner" class="w-5 h-5 ml-2 spinner hidden" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-secondary-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-secondary-500">Or use backup code</span>
          </div>
        </div>

        <!-- Backup Code Section -->
        <div id="backupCodeSection" class="space-y-4">
          <div class="text-center">
            <h3 class="text-lg font-semibold text-secondary-900 mb-2">Backup Code</h3>
            <p class="text-sm text-secondary-600 mb-4">Enter one of your backup codes</p>
          </div>

          <form id="backupCodeForm" class="space-y-4">
            <div class="floating-input">
              <input
                id="backupCode"
                name="backupCode"
                type="text"
                required
                placeholder="Enter backup code"
                maxlength="8"
                class="peer w-full px-4 pt-6 pb-2 border border-secondary-200 rounded-xl bg-white/50 backdrop-blur-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-center font-mono"
              />
              <label for="backupCode" class="absolute left-4 top-2 text-xs text-secondary-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600">
                Backup Code
              </label>
            </div>

            <button
              type="submit"
              id="backupCodeButton"
              class="btn btn-secondary btn-lg w-full group"
            >
              <span id="backupCodeButtonText">Verify Code</span>
              <svg id="backupCodeButtonIcon" class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg id="backupCodeSpinner" class="w-5 h-5 ml-2 spinner hidden" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </form>
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
              <span>Verification successful! Redirecting...</span>
            </div>
          </div>
        </div>

        <!-- Back to Login -->
        <div class="text-center">
          <a href="/login" data-link class="text-sm text-secondary-600 hover:text-primary-600 transition-colors">
            ← Back to login
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
  const webauthnButton = container.querySelector("#webauthnButton") as HTMLButtonElement;
  const backupCodeForm = container.querySelector("#backupCodeForm") as HTMLFormElement;
  const backupCodeButton = container.querySelector("#backupCodeButton") as HTMLButtonElement;
  const errorMessage = container.querySelector("#errorMessage") as HTMLElement;
  const successMessage = container.querySelector("#successMessage") as HTMLElement;
  const errorText = container.querySelector("#errorText") as HTMLElement;
  const backButton = container.querySelector("#backButton") as HTMLButtonElement;

  // Get user data from session storage
  const tempUserId = sessionStorage.getItem("tempUserId");
  const tempUserData = sessionStorage.getItem("tempUserData");

  if (!tempUserId || !tempUserData) {
    showError("Session expired. Please log in again.");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
    return;
  }

  const userData = JSON.parse(tempUserData);

  // Back button listener
  backButton.addEventListener("click", () => {
    window.location.href = "/login";
  });

  // WebAuthn authentication
  webauthnButton.addEventListener("click", async () => {
    try {
      setWebAuthnLoading(true);

      // Generate authentication options
      const { options, sessionId } = await authApi.generateWebAuthnAuthenticationOptions({
        userId: tempUserId,
      });

      // Start WebAuthn authentication
      const authenticationResponse = await startAuthentication(options);

      // Verify the authentication
      const verificationResult = await authApi.verifyWebAuthnAuthentication({
        sessionId,
        authenticationResponse,
      });

      if (verificationResult.verified) {
        // Complete 2FA verification
        const response = await authApi.verify2FA({
          userId: tempUserId,
          method: "webauthn",
          sessionId,
          authenticationResponse,
        });

        // Store tokens and redirect
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Clear temporary data
        sessionStorage.removeItem("tempUserId");
        sessionStorage.removeItem("tempUserData");

        showSuccess();
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        showError("Authentication verification failed");
      }
    } catch (error: any) {
      console.error("WebAuthn error:", error);
      const message = error.response?.data?.message || "WebAuthn verification failed";
      showError(message);
    } finally {
      setWebAuthnLoading(false);
    }
  });

  // Backup code form submission
  backupCodeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(backupCodeForm);
    const backupCode = formData.get("backupCode") as string;

    if (!backupCode.trim()) {
      showError("Please enter a backup code");
      return;
    }

    try {
      setBackupCodeLoading(true);

      // Complete 2FA verification with backup code
      const response = await authApi.verify2FA({
        userId: tempUserId,
        method: "backup_code",
        backupCode: backupCode.trim(),
      });

      // Store tokens and redirect
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Clear temporary data
      sessionStorage.removeItem("tempUserId");
      sessionStorage.removeItem("tempUserData");

      showSuccess();
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error: any) {
      console.error("Backup code error:", error);
      const message = error.response?.data?.message || "Invalid backup code";
      showError(message);
    } finally {
      setBackupCodeLoading(false);
    }
  });

  function setWebAuthnLoading(loading: boolean) {
    const buttonText = container.querySelector("#webauthnButtonText") as HTMLElement;
    const buttonIcon = container.querySelector("#webauthnButtonIcon") as HTMLElement;
    const spinner = container.querySelector("#webauthnSpinner") as HTMLElement;

    webauthnButton.disabled = loading;

    if (loading) {
      buttonText.textContent = "Waiting for device...";
      buttonIcon.classList.add("hidden");
      spinner.classList.remove("hidden");
      webauthnButton.classList.add("opacity-75");
    } else {
      buttonText.textContent = "Use Security Key";
      buttonIcon.classList.remove("hidden");
      spinner.classList.add("hidden");
      webauthnButton.classList.remove("opacity-75");
    }
  }

  function setBackupCodeLoading(loading: boolean) {
    const buttonText = container.querySelector("#backupCodeButtonText") as HTMLElement;
    const buttonIcon = container.querySelector("#backupCodeButtonIcon") as HTMLElement;
    const spinner = container.querySelector("#backupCodeSpinner") as HTMLElement;

    backupCodeButton.disabled = loading;

    if (loading) {
      buttonText.textContent = "Verifying...";
      buttonIcon.classList.add("hidden");
      spinner.classList.remove("hidden");
      backupCodeButton.classList.add("opacity-75");
    } else {
      buttonText.textContent = "Verify Code";
      buttonIcon.classList.remove("hidden");
      spinner.classList.add("hidden");
      backupCodeButton.classList.remove("opacity-75");
    }
  }

  function showError(message: string) {
    errorText.textContent = message;
    errorMessage.classList.remove("hidden");
    successMessage.classList.add("hidden");
    errorMessage.classList.add("animate-slide-down");

    setTimeout(() => {
      errorMessage.classList.add("hidden");
      errorMessage.classList.remove("animate-slide-down");
    }, 5000);
  }

  function showSuccess() {
    successMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    successMessage.classList.add("animate-slide-down");
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

  // Auto-format backup code input
  const backupCodeInput = container.querySelector("#backupCode") as HTMLInputElement;
  backupCodeInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    // Remove any non-alphanumeric characters and convert to uppercase
    target.value = target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  });
} 