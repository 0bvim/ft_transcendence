import { authApi } from '../api/auth';

interface TwoFactorSetupState {
  step: 'start' | 'setup' | 'verify' | 'complete';
  qrCodeUrl?: string;
  totpSecret?: string;
  backupCodes?: string[];
  error?: string;
  loading: boolean;
}

export class TwoFactorSetupModal {
  private state: TwoFactorSetupState = {
    step: 'start',
    loading: false
  };
  
  private user: any;
  private container: HTMLElement;
  private onComplete: (user: any) => void;

  constructor(user: any, container: HTMLElement, onComplete: (user: any) => void) {
    this.user = user;
    this.container = container;
    this.onComplete = onComplete;
  }

  show() {
    this.createModal();
    this.render();
  }

  private createModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'twofa-modal';
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    modalOverlay.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div class="p-6" id="modal-content">
          <!-- Content will be rendered here -->
        </div>
      </div>
    `;
    
    document.body.appendChild(modalOverlay);
    this.setupEventListeners();
  }

  private render() {
    const content = document.getElementById('modal-content');
    if (!content) return;

    switch (this.state.step) {
      case 'start':
        content.innerHTML = this.renderStartStep();
        break;
      case 'setup':
        content.innerHTML = this.renderSetupStep();
        break;
      case 'verify':
        content.innerHTML = this.renderVerifyStep();
        break;
      case 'complete':
        content.innerHTML = this.renderCompleteStep();
        break;
    }

    this.setupStepEventListeners();
  }

  private renderStartStep() {
    return `
      <div class="text-center">
        <div class="mb-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Enable Two-Factor Authentication</h3>
          <p class="text-gray-600">Add an extra layer of security to your account using an authenticator app.</p>
        </div>

        <div class="space-y-3 text-left mb-6">
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <p class="font-medium text-gray-900">Install an authenticator app</p>
              <p class="text-sm text-gray-600">Google Authenticator, Authy, or similar</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <p class="font-medium text-gray-900">Scan QR code</p>
              <p class="text-sm text-gray-600">Add your account to the authenticator</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <p class="font-medium text-gray-900">Verify setup</p>
              <p class="text-sm text-gray-600">Enter a code to confirm it works</p>
            </div>
          </div>
        </div>

        ${this.state.error ? `
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-800">${this.state.error}</p>
          </div>
        ` : ''}

        <div class="flex space-x-3">
          <button id="start-setup-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" ${this.state.loading ? 'disabled' : ''}>
            ${this.state.loading ? 'Setting up...' : 'Start Setup'}
          </button>
          <button id="cancel-btn" class="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none">
            Cancel
          </button>
        </div>
      </div>
    `;
  }

  private renderSetupStep() {
    return `
      <div class="text-center">
        <div class="mb-4">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Scan QR Code</h3>
          <p class="text-gray-600">Open your authenticator app and scan this QR code</p>
        </div>

        <div class="mb-6">
          <div id="qr-code-container" class="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.state.qrCodeUrl || '')}" 
                 alt="2FA QR Code" class="w-48 h-48">
          </div>
        </div>

        <div class="mb-6">
          <p class="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
          <div class="bg-gray-100 p-3 rounded border font-mono text-sm break-all">
            ${this.state.totpSecret}
          </div>
        </div>

        <div class="flex space-x-3">
          <button id="continue-verify-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Continue to Verification
          </button>
          <button id="back-btn" class="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none">
            Back
          </button>
        </div>
      </div>
    `;
  }

  private renderVerifyStep() {
    return `
      <div class="text-center">
        <div class="mb-4">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Verify Setup</h3>
          <p class="text-gray-600">Enter the 6-digit code from your authenticator app</p>
        </div>

        <div class="mb-6">
          <label for="verification-code" class="block text-sm font-medium text-gray-700 mb-2">
            Authentication Code
          </label>
          <input 
            type="text" 
            id="verification-code" 
            placeholder="123456"
            maxlength="6"
            pattern="[0-9]{6}"
            class="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autocomplete="off"
            inputmode="numeric"
          />
          <p class="text-xs text-gray-500 mt-1">Enter the current 6-digit code from your app</p>
        </div>

        ${this.state.error ? `
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-800">${this.state.error}</p>
          </div>
        ` : ''}

        <div class="flex space-x-3">
          <button id="verify-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" ${this.state.loading ? 'disabled' : ''}>
            ${this.state.loading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </button>
          <button id="back-to-setup-btn" class="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none">
            Back
          </button>
        </div>
      </div>
    `;
  }

  private renderCompleteStep() {
    return `
      <div class="text-center">
        <div class="mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">2FA Successfully Enabled!</h3>
          <p class="text-gray-600">Your account is now protected with two-factor authentication</p>
        </div>

        <div class="mb-6">
          <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 class="font-medium text-yellow-800 mb-2">Important: Save Your Backup Codes</h4>
            <p class="text-sm text-yellow-700 mb-3">
              Store these codes in a safe place. You can use them to access your account if you lose your device.
            </p>
            <div class="bg-white p-3 rounded border">
              <div class="grid grid-cols-2 gap-2 text-sm font-mono">
                ${this.state.backupCodes?.map(code => `<div class="p-1">${code}</div>`).join('') || ''}
              </div>
            </div>
          </div>
        </div>

        <button id="complete-btn" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          Complete Setup
        </button>
      </div>
    `;
  }

  private setupEventListeners() {
    // Close modal when clicking outside
    const modal = document.getElementById('twofa-modal');
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });
  }

  private setupStepEventListeners() {
    // Start step
    document.getElementById('start-setup-btn')?.addEventListener('click', () => this.startSetup());
    document.getElementById('cancel-btn')?.addEventListener('click', () => this.close());

    // Setup step
    document.getElementById('continue-verify-btn')?.addEventListener('click', () => this.goToVerify());
    document.getElementById('back-btn')?.addEventListener('click', () => this.goToStart());

    // Verify step
    document.getElementById('verify-btn')?.addEventListener('click', () => this.verifyCode());
    document.getElementById('back-to-setup-btn')?.addEventListener('click', () => this.goToSetup());

    // Complete step
    document.getElementById('complete-btn')?.addEventListener('click', () => this.complete());

    // Auto-focus and format verification code input
    const codeInput = document.getElementById('verification-code') as HTMLInputElement;
    if (codeInput) {
      codeInput.focus();
      codeInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        // Only allow digits
        target.value = target.value.replace(/\D/g, '');
        // Auto-submit when 6 digits entered
        if (target.value.length === 6) {
          setTimeout(() => this.verifyCode(), 100);
        }
      });
    }
  }

  private async startSetup() {
    console.log('🔄 Starting 2FA setup for user:', this.user.id);
    
    this.setState({ loading: true, error: undefined });

    try {
      const response = await authApi.enableTwoFactor(this.user.id);
      console.log('✅ 2FA setup response:', response);

      this.setState({
        step: 'setup',
        qrCodeUrl: response.qrCodeUrl,
        totpSecret: response.totpSecret,
        backupCodes: response.backupCodes,
        loading: false
      });
    } catch (error: any) {
      console.error('❌ 2FA setup failed:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.error || 'Failed to setup 2FA. Please try again.'
      });
    }
  }

  private goToVerify() {
    this.setState({ step: 'verify', error: undefined });
  }

  private goToSetup() {
    this.setState({ step: 'setup', error: undefined });
  }

  private goToStart() {
    this.setState({ step: 'start', error: undefined });
  }

  private async verifyCode() {
    const codeInput = document.getElementById('verification-code') as HTMLInputElement;
    const code = codeInput?.value?.trim();

    if (!code || code.length !== 6) {
      this.setState({ error: 'Please enter a valid 6-digit code' });
      return;
    }

    console.log('🔐 Verifying 2FA code:', {
      userId: this.user.id,
      code: code,
      codeLength: code.length,
      time: new Date().toISOString()
    });

    this.setState({ loading: true, error: undefined });

    try {
      const response = await authApi.completeTwoFactorSetup(this.user.id, code);
      console.log('✅ 2FA verification successful:', response);

      this.setState({
        step: 'complete',
        loading: false
      });

      // Update user data
      this.user = { ...this.user, twoFactorEnabled: true };
      localStorage.setItem('user', JSON.stringify(this.user));
      
    } catch (error: any) {
      console.error('❌ 2FA verification failed:', error);
      console.log('❌ Failed code details:', {
        code: code,
        codeLength: code.length,
        time: new Date().toISOString(),
        error: error.response?.data || error.message
      });
      
      this.setState({
        loading: false,
        error: error.response?.data?.error || 'Invalid code. Please try again with a fresh code from your authenticator app.'
      });
    }
  }

  private complete() {
    this.onComplete(this.user);
    this.close();
  }

  private close() {
    const modal = document.getElementById('twofa-modal');
    if (modal) {
      document.body.removeChild(modal);
    }
  }

  private setState(newState: Partial<TwoFactorSetupState>) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
} 