export default function GoogleCallback(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen flex items-center justify-center bg-gray-50';

  container.innerHTML = `
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Processing Google Sign-In
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Please wait while we complete your authentication...
        </p>
        <div class="mt-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
      
      <div id="errorMessage" class="hidden text-red-600 text-sm text-center"></div>
    </div>
  `;

  // Process the OAuth callback
  processGoogleCallback();

  async function processGoogleCallback() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        showError(`Google authentication failed: ${error}`);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
        return;
      }

      if (!code) {
        showError('No authorization code received from Google');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
        return;
      }

      // Make request to our backend to complete the OAuth flow
      const hostname = window.location.hostname;
      const authServiceUrl = `http://${hostname}:3001`;
      const response = await fetch(`${authServiceUrl}/auth/google/callback?` + urlParams.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.requiresTwoFactor) {
        // Store temporary user data for 2FA verification
        sessionStorage.setItem("tempUserId", data.user.id);
        sessionStorage.setItem("tempUserData", JSON.stringify(data.user));
        window.location.href = "/verify-2fa";
      } else {
        // Store tokens and user data
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Google callback error:', error);
      showError(error.message || 'Authentication failed');
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    }
  }

  function showError(message: string) {
    const errorElement = container.querySelector('#errorMessage') as HTMLDivElement;
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
  }

  return container;
} 