import { authApi, User } from '../api/auth';

export default function Dashboard(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50';

  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  let user: User | null = null;
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  if (!user) {
    window.location.href = '/login';
    return container;
  }

  container.innerHTML = `
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">ft_transcendence</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">Welcome, ${user.username}!</span>
            <button
              id="logoutButton"
              class="btn btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Profile Information -->
          <div class="card">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            <div class="space-y-4">
              <div>
                <label class="form-label">Username</label>
                <p class="text-sm text-gray-900">${user.username}</p>
              </div>
              <div>
                <label class="form-label">Email</label>
                <p class="text-sm text-gray-900">${user.email}</p>
              </div>
              <div>
                <label class="form-label">Account Type</label>
                <p class="text-sm text-gray-900">
                  ${user.googleId ? 'Google Account' : 'Email/Password Account'}
                </p>
              </div>
              <div>
                <label class="form-label">Member Since</label>
                <p class="text-sm text-gray-900">${new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div class="card">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p class="text-sm text-gray-500">
                    ${user.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security to your account'}
                  </p>
                </div>
                <button
                  id="toggle2FAButton"
                  class="btn ${user.twoFactorEnabled ? 'btn-secondary' : 'btn-primary'}"
                >
                  ${user.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                </button>
              </div>
              
              ${user.twoFactorEnabled ? `
                <div class="space-y-2">
                  <button
                    id="generateBackupCodesButton"
                    class="btn btn-secondary w-full"
                  >
                    Generate Backup Codes
                  </button>
                  <button
                    id="addWebAuthnButton"
                    class="btn btn-secondary w-full"
                  >
                    Add Security Key
                  </button>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Account Actions -->
          <div class="card">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
            <div class="space-y-4">
              <button
                id="deleteAccountButton"
                class="btn bg-red-600 text-white hover:bg-red-700 w-full"
              >
                Delete Account
              </button>
              <p class="text-sm text-gray-500">
                This action cannot be undone. This will permanently delete your account.
              </p>
            </div>
          </div>

          <!-- Messages -->
          <div class="card">
            <div id="messageContainer" class="space-y-2">
              <!-- Messages will be displayed here -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Backup Codes Modal -->
    <div id="backupCodesModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Backup Codes</h3>
          <p class="text-sm text-gray-600 mb-4">
            Save these codes in a secure place. Each code can only be used once.
          </p>
          <div id="backupCodesList" class="space-y-2 mb-4">
            <!-- Backup codes will be displayed here -->
          </div>
          <button
            id="closeBackupCodesModal"
            class="btn btn-primary w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const logoutButton = container.querySelector('#logoutButton') as HTMLButtonElement;
  const toggle2FAButton = container.querySelector('#toggle2FAButton') as HTMLButtonElement;
  const generateBackupCodesButton = container.querySelector('#generateBackupCodesButton') as HTMLButtonElement;
  const addWebAuthnButton = container.querySelector('#addWebAuthnButton') as HTMLButtonElement;
  const deleteAccountButton = container.querySelector('#deleteAccountButton') as HTMLButtonElement;
  const messageContainer = container.querySelector('#messageContainer') as HTMLDivElement;
  const backupCodesModal = container.querySelector('#backupCodesModal') as HTMLDivElement;
  const closeBackupCodesModal = container.querySelector('#closeBackupCodesModal') as HTMLButtonElement;

  // Logout functionality
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  });

  // Toggle 2FA
  toggle2FAButton.addEventListener('click', async () => {
    try {
      toggle2FAButton.disabled = true;
      toggle2FAButton.textContent = 'Processing...';

      if (user!.twoFactorEnabled) {
        await authApi.disableTwoFactor(user!.id);
        showMessage('Two-factor authentication disabled successfully', 'success');
        user!.twoFactorEnabled = false;
      } else {
        const response = await authApi.enableTwoFactor(user!.id);
        showMessage('Two-factor authentication enabled successfully', 'success');
        user!.twoFactorEnabled = true;
        
        // Show backup codes if generated
        if (response.backupCodes && response.backupCodes.length > 0) {
          showBackupCodes(response.backupCodes);
        }
      }

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Refresh page to update UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('2FA toggle error:', error);
      showMessage(error.response?.data?.error || 'Failed to toggle 2FA', 'error');
    } finally {
      toggle2FAButton.disabled = false;
      toggle2FAButton.textContent = user!.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA';
    }
  });

  // Generate backup codes
  if (generateBackupCodesButton) {
    generateBackupCodesButton.addEventListener('click', async () => {
      try {
        generateBackupCodesButton.disabled = true;
        generateBackupCodesButton.textContent = 'Generating...';

        const response = await authApi.generateBackupCodes(user!.id);
        showBackupCodes(response.backupCodes);
        showMessage('New backup codes generated successfully', 'success');
      } catch (error: any) {
        console.error('Backup codes generation error:', error);
        showMessage(error.response?.data?.error || 'Failed to generate backup codes', 'error');
      } finally {
        generateBackupCodesButton.disabled = false;
        generateBackupCodesButton.textContent = 'Generate Backup Codes';
      }
    });
  }

  // Add WebAuthn credential
  if (addWebAuthnButton) {
    addWebAuthnButton.addEventListener('click', async () => {
      try {
        // This would typically involve WebAuthn API calls
        // For now, show a placeholder message
        showMessage('WebAuthn setup would be implemented here', 'info');
      } catch (error: any) {
        console.error('WebAuthn setup error:', error);
        showMessage('Failed to set up security key', 'error');
      }
    });
  }

  // Delete account
  deleteAccountButton.addEventListener('click', async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      deleteAccountButton.disabled = true;
      deleteAccountButton.textContent = 'Deleting...';

      await authApi.deleteUser(user!.id);
      
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      alert('Account deleted successfully');
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Account deletion error:', error);
      showMessage(error.response?.data?.error || 'Failed to delete account', 'error');
      deleteAccountButton.disabled = false;
      deleteAccountButton.textContent = 'Delete Account';
    }
  });

  // Close backup codes modal
  closeBackupCodesModal.addEventListener('click', () => {
    backupCodesModal.classList.add('hidden');
  });

  function showMessage(message: string, type: 'success' | 'error' | 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `p-3 rounded-md ${
      type === 'success' ? 'bg-green-100 text-green-700' :
      type === 'error' ? 'bg-red-100 text-red-700' :
      'bg-blue-100 text-blue-700'
    }`;
    messageElement.textContent = message;

    messageContainer.appendChild(messageElement);

    // Remove message after 5 seconds
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }

  function showBackupCodes(codes: string[]) {
    const backupCodesList = container.querySelector('#backupCodesList') as HTMLDivElement;
    backupCodesList.innerHTML = '';

    codes.forEach(code => {
      const codeElement = document.createElement('div');
      codeElement.className = 'bg-gray-100 p-2 rounded font-mono text-sm';
      codeElement.textContent = code;
      backupCodesList.appendChild(codeElement);
    });

    backupCodesModal.classList.remove('hidden');
  }

  return container;
} 