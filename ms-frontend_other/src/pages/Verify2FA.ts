import { authApi } from "../api/auth";
import { startRegistration, startAuthentication } from "../utils/webauthn";

export default function Verify2FA(): HTMLElement {
  console.log("🔍 Verify2FA component loading...");
  
  try {
    const container = document.createElement("div");
    container.className = "min-h-screen bg-mesh-gradient flex items-center justify-center p-4 relative overflow-hidden";

    container.innerHTML = `
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-warning-300/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-warning-400/20 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
      <div class="absolute top-1/3 right-1/3 w-60 h-60 bg-warning-200/20 rounded-full blur-3xl animate-float" style="animation-delay: -1.5s;"></div>
    </div>

    <div class="card-gradient p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9a12.02 12.02 0 00-.382-3.016z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-secondary-900 mb-2">Two-Factor Authentication</h1>
        <p class="text-secondary-600">Please complete your authentication to continue</p>
      </div>

      <!-- 2FA Method Tabs -->
      <div class="mb-6">
        <div class="flex border-b border-secondary-200">
          <button id="totp-tab" class="flex-1 py-2 px-4 text-sm font-medium text-center border-b-2 border-primary-600 text-primary-600">
            Authenticator App
          </button>
          <button id="backup-tab" class="flex-1 py-2 px-4 text-sm font-medium text-center border-b-2 border-transparent text-secondary-500 hover:text-secondary-700">
            Backup Code
          </button>
        </div>
      </div>

      <!-- TOTP Method -->
      <div id="totp-method" class="2fa-method">
        <div class="text-center mb-6">
          <svg class="w-12 h-12 text-primary-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <h3 class="text-lg font-medium text-secondary-900 mb-2">Enter Authenticator Code</h3>
          <p class="text-secondary-600">Open your authenticator app and enter the 6-digit code</p>
        </div>
        
        <form id="totp-form" class="space-y-4">
          <div>
            <label for="totp-code" class="block text-sm font-medium text-secondary-700 mb-2">
              Authentication Code
            </label>
            <input 
              type="text" 
              id="totp-code"
              name="totpCode"
              placeholder="123456"
              maxlength="6"
              pattern="[0-9]{6}"
              class="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-lg font-mono"
              required
            />
          </div>
          
          <button type="submit" id="verify-totp-btn" class="w-full btn btn-primary">
            Verify Code
          </button>
        </form>
      </div>



      <!-- Backup Code Method -->
      <div id="backup-method" class="2fa-method hidden">
        <div class="text-center mb-6">
          <svg class="w-12 h-12 text-primary-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="text-lg font-medium text-secondary-900 mb-2">Use Backup Code</h3>
          <p class="text-secondary-600">Enter one of your saved backup codes</p>
        </div>
        
        <form id="backup-form" class="space-y-4">
          <div>
            <label for="backup-code" class="block text-sm font-medium text-secondary-700 mb-2">
              Backup Code
            </label>
            <input 
              type="text" 
              id="backup-code"
              name="backupCode"
              placeholder="Enter backup code"
              class="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <button type="submit" id="verify-backup-btn" class="w-full btn btn-primary">
            Verify Backup Code
          </button>
        </form>
      </div>

      <!-- Error Message -->
      <div id="error-message" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md hidden">
        <div class="flex">
          <svg class="flex-shrink-0 h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <p class="text-sm text-red-800" id="error-text"></p>
          </div>
        </div>
      </div>

      <!-- Login Link -->
      <div class="mt-6 text-center">
        <a href="/login" id="backButton" class="text-sm text-primary-600 hover:text-primary-500">
          ← Back to Login
        </a>
      </div>
    </div>
  `;

    // Add event listeners
    setupEventListeners(container);

    console.log("✅ Verify2FA component loaded successfully");
    return container;
    
  } catch (error) {
    console.error("❌ Error loading Verify2FA component:", error);
    
    // Create fallback error container
    const errorContainer = document.createElement("div");
    errorContainer.className = "min-h-screen bg-mesh-gradient flex items-center justify-center p-4";
    errorContainer.innerHTML = `
      <div class="card-gradient p-8 text-center">
        <h2 class="text-xl font-bold text-red-600 mb-4">Error Loading 2FA Verification</h2>
        <p class="text-secondary-600 mb-4">There was an error loading the verification page.</p>
        <a href="/login" class="btn btn-primary">Back to Login</a>
      </div>
    `;
    return errorContainer;
  }
}

function setupEventListeners(container: HTMLElement) {
  console.log("🔍 Setting up event listeners for Verify2FA...");
  
  try {
    const totpTab = container.querySelector("#totp-tab") as HTMLButtonElement;
    const backupTab = container.querySelector("#backup-tab") as HTMLButtonElement;
    const totpMethod = container.querySelector("#totp-method") as HTMLElement;
    const backupMethod = container.querySelector("#backup-method") as HTMLElement;
    const verifyTotpBtn = container.querySelector("#verify-totp-btn") as HTMLButtonElement;
    const verifyBackupBtn = container.querySelector("#verify-backup-btn") as HTMLButtonElement;
    const errorMessage = container.querySelector("#error-message") as HTMLElement;
    const errorText = container.querySelector("#error-text") as HTMLElement;
    const backButton = container.querySelector("#backButton") as HTMLAnchorElement;
    
    console.log("🔍 Element check:", {
      totpTab: !!totpTab,
      backButton: !!backButton,
      verifyTotpBtn: !!verifyTotpBtn
    });

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

  // Back button listener (prevent default to handle navigation programmatically)
  if (backButton) {
    backButton.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/login";
    });
  }

  // Tab listeners
  totpTab.addEventListener("click", () => {
    totpTab.classList.add("border-primary-600");
    backupTab.classList.remove("border-primary-600");
    totpMethod.classList.remove("hidden");
    backupMethod.classList.add("hidden");
  });

  backupTab.addEventListener("click", () => {
    backupTab.classList.add("border-primary-600");
    totpTab.classList.remove("border-primary-600");
    backupMethod.classList.remove("hidden");
    totpMethod.classList.add("hidden");
  });

  // TOTP verification
  verifyTotpBtn.addEventListener("click", async () => {
    const totpCode = container.querySelector("#totp-code") as HTMLInputElement;
    const totpForm = container.querySelector("#totp-form") as HTMLFormElement;

    if (!totpCode.value.trim()) {
      showError("Please enter an authentication code.");
      return;
    }

    try {
      setTotpLoading(true);

      // Complete 2FA verification with TOTP code
      const response = await authApi.verify2FA({
        userId: tempUserId,
        method: "totp",
        totpCode: totpCode.value.trim(),
      });

      // Store tokens and redirect
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Clear temporary data
      sessionStorage.removeItem("tempUserId");
      sessionStorage.removeItem("tempUserData");

      showSuccess();
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error: any) {
      console.error("TOTP error:", error);
      const message = error.response?.data?.message || "Invalid authentication code";
      showError(message);
    } finally {
      setTotpLoading(false);
    }
  });



  // Backup code form submission
  verifyBackupBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const backupCode = container.querySelector("#backup-code") as HTMLInputElement;
    const backupForm = container.querySelector("#backup-form") as HTMLFormElement;

    if (!backupCode.value.trim()) {
      showError("Please enter a backup code.");
      return;
    }

    try {
      setBackupCodeLoading(true);

      // Complete 2FA verification with backup code
      const response = await authApi.verify2FA({
        userId: tempUserId,
        method: "backup_code",
        backupCode: backupCode.value.trim(),
      });

      // Store tokens and redirect
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

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

  function setTotpLoading(loading: boolean) {
    const button = container.querySelector("#verify-totp-btn") as HTMLButtonElement;
    button.disabled = loading;
    if (loading) {
      button.textContent = "Verifying...";
      button.classList.add("opacity-75");
    } else {
      button.textContent = "Verify Code";
      button.classList.remove("opacity-75");
    }
  }



  function setBackupCodeLoading(loading: boolean) {
    const button = container.querySelector("#verify-backup-btn") as HTMLButtonElement;
    button.disabled = loading;
    if (loading) {
      button.textContent = "Verifying...";
      button.classList.add("opacity-75");
    } else {
      button.textContent = "Verify Backup Code";
      button.classList.remove("opacity-75");
    }
  }

  function showError(message: string) {
    errorText.textContent = message;
    errorMessage.classList.remove("hidden");
    // No success message to show for TOTP/WebAuthn/Backup Code
  }

  function showSuccess() {
    // No specific success message for TOTP/WebAuthn/Backup Code
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
    const backupCodeInput = container.querySelector("#backup-code") as HTMLInputElement;
    backupCodeInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      // Remove any non-alphanumeric characters and convert to uppercase
      target.value = target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    });
    
    console.log("✅ Verify2FA event listeners setup complete");
    
  } catch (error) {
    console.error("❌ Error setting up event listeners:", error);
    throw error; // Re-throw to be caught by parent
  }
} 