import { authApi, User } from "../api/auth";
import { isWebAuthnSupported, getWebAuthnAssertion } from "../utils/webauthn";

export default function Verify2FA(): HTMLElement {
  const container = document.createElement("div");
  container.className =
    "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8";

  // Get user data from session storage (passed from login)
  const userDataStr = sessionStorage.getItem("pendingUser");
  let pendingUser: User | null = null;
  
  if (userDataStr) {
    try {
      pendingUser = JSON.parse(userDataStr);
    } catch (error) {
      console.error("Error parsing pending user data:", error);
    }
  }

  if (!pendingUser) {
    window.location.href = "/login";
    return container;
  }

  const webAuthnSupported = isWebAuthnSupported();

  container.innerHTML = `
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Two-Factor Authentication
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Please verify your identity using one of the methods below
        </p>
      </div>

      <div class="mt-8 space-y-6">
        <!-- WebAuthn Security Key -->
        ${webAuthnSupported ? `
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Security Key</h3>
            <p class="text-sm text-gray-600 mb-4">
              Use your security key or built-in authenticator to verify your identity.
            </p>
            <button
              id="webauthnButton"
              class="w-full btn btn-primary"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Use Security Key
            </button>
          </div>
        ` : `
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Security Key</h3>
            <p class="text-sm text-red-600 mb-4">
              WebAuthn is not supported in this browser.
            </p>
          </div>
        `}

        <!-- Backup Code -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Backup Code</h3>
          <p class="text-sm text-gray-600 mb-4">
            Enter one of your backup codes if you can't access your security key.
          </p>
          <form id="backupCodeForm" class="space-y-4">
            <div>
              <label for="backupCode" class="form-label">
                Backup Code
              </label>
              <input
                id="backupCode"
                name="backupCode"
                type="text"
                class="form-input"
                placeholder="Enter your backup code"
                pattern="[A-Za-z0-9]{8}"
                maxlength="8"
                style="text-transform: uppercase;"
              />
              <p class="mt-1 text-sm text-gray-500">8-character code</p>
            </div>
            <button
              type="submit"
              id="backupCodeButton"
              class="w-full btn btn-secondary"
            >
              Verify Backup Code
            </button>
          </form>
        </div>

        <!-- Error Messages -->
        <div id="errorMessage" class="hidden text-red-600 text-sm text-center"></div>
        <div id="successMessage" class="hidden text-green-600 text-sm text-center"></div>

        <!-- Back to Login -->
        <div class="text-center">
          <a href="/login" data-link class="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const webauthnButton = container.querySelector("#webauthnButton") as HTMLButtonElement;
  const backupCodeForm = container.querySelector("#backupCodeForm") as HTMLFormElement;
  const backupCodeButton = container.querySelector("#backupCodeButton") as HTMLButtonElement;
  const errorMessage = container.querySelector("#errorMessage") as HTMLDivElement;
  const successMessage = container.querySelector("#successMessage") as HTMLDivElement;

  // WebAuthn verification
  if (webauthnButton) {
    webauthnButton.addEventListener("click", async () => {
      try {
        webauthnButton.disabled = true;
        webauthnButton.textContent = "Preparing...";
        hideMessages();

        // Get authentication options
        const optionsResponse = await authApi.generateWebAuthnAuthenticationOptions({
          userId: pendingUser!.id,
        });

        webauthnButton.textContent = "Touch your security key...";

        // Get WebAuthn assertion
        const assertion = await getWebAuthnAssertion(optionsResponse.options);

        webauthnButton.textContent = "Verifying...";

        // Verify with backend
        const verificationResponse = await authApi.verify2FA({
          userId: pendingUser!.id,
          method: "webauthn",
          sessionId: optionsResponse.sessionId,
          authenticationResponse: assertion,
        });

        // Store tokens and redirect
        localStorage.setItem("accessToken", verificationResponse.accessToken);
        localStorage.setItem("refreshToken", verificationResponse.refreshToken);
        localStorage.setItem("user", JSON.stringify(verificationResponse.user));
        
        // Clean up session storage
        sessionStorage.removeItem("pendingUser");
        
        showSuccess("2FA verification successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } catch (error: any) {
        console.error("WebAuthn verification error:", error);
        const message = error.response?.data?.error || error.message || "WebAuthn verification failed";
        showError(message);
        webauthnButton.disabled = false;
        webauthnButton.textContent = "Use Security Key";
      }
    });
  }

  // Backup code verification
  backupCodeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(backupCodeForm);
    const backupCode = formData.get("backupCode") as string;

    if (!backupCode || backupCode.length !== 8) {
      showError("Please enter a valid 8-character backup code");
      return;
    }

    try {
      backupCodeButton.disabled = true;
      backupCodeButton.textContent = "Verifying...";
      hideMessages();

      const verificationResponse = await authApi.verify2FA({
        userId: pendingUser!.id,
        method: "backup_code",
        backupCode: backupCode.toUpperCase(),
      });

      // Store tokens and redirect
      localStorage.setItem("accessToken", verificationResponse.accessToken);
      localStorage.setItem("refreshToken", verificationResponse.refreshToken);
      localStorage.setItem("user", JSON.stringify(verificationResponse.user));
      
      // Clean up session storage
      sessionStorage.removeItem("pendingUser");
      
      showSuccess("2FA verification successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error: any) {
      console.error("Backup code verification error:", error);
      const message = error.response?.data?.error || "Backup code verification failed";
      showError(message);
      backupCodeButton.disabled = false;
      backupCodeButton.textContent = "Verify Backup Code";
    }
  });

  // Auto-uppercase backup code input
  const backupCodeInput = container.querySelector("#backupCode") as HTMLInputElement;
  backupCodeInput.addEventListener("input", (event) => {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  });

  function showError(message: string) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
    successMessage.classList.add("hidden");
  }

  function showSuccess(message: string) {
    successMessage.textContent = message;
    successMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");
  }

  function hideMessages() {
    errorMessage.classList.add("hidden");
    successMessage.classList.add("hidden");
  }

  return container;
} 