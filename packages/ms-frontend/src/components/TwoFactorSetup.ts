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
    modalOverlay.className = 'fixed inset-0 z-50 overflow-y-auto flex items-center justify-center';
    
    modalOverlay.innerHTML = `
      <!-- Synthwave Background overlay -->
      <div class="fixed inset-0 bg-secondary-900/80 backdrop-blur-lg transition-opacity">
        <!-- Background Effects -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <!-- Animated Grid Background -->
          <div class="absolute inset-0 synthwave-grid opacity-10"></div>
          
          <!-- Neon Orbs -->
          <div class="absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,128,0.1) 0%, transparent 70%); animation-delay: -2s;"></div>
          <div class="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(255,0,255,0.08) 0%, transparent 70%); animation-delay: -4s;"></div>
          
          <!-- Scan Lines -->
          <div class="scan-line"></div>
        </div>
      </div>

      <div class="card backdrop-blur-xl shadow-glow max-w-lg w-full mx-4 animate-slide-up">
        <div class="p-8" id="modal-content">
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
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center">
            <div class="w-14 h-14 clip-cyberpunk bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center mr-4">
              <svg class="w-8 h-8 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div class="text-left">
              <h3 class="text-2xl font-bold text-gradient font-retro tracking-wider">2FA_SETUP.EXE</h3>
              <p class="text-sm text-neon-cyan/80 font-mono mt-1">
                <span class="text-neon-pink">$</span> Enable Two-Factor Authentication
              </p>
            </div>
          </div>
          <button id="cancel-btn" class="btn btn-ghost p-2 group">
            <svg class="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="mb-8">
          <p class="text-neon-cyan/80 font-mono leading-relaxed">
            <span class="text-neon-green">></span> Add an extra layer of security to your account using an authenticator app.
          </p>
        </div>

        <div class="space-y-4 text-left mb-8">
          <div class="p-4 bg-secondary-900/30 backdrop-blur-lg border border-neon-green/30 clip-cyber-button">
            <div class="flex items-start space-x-4">
              <div class="w-8 h-8 clip-cyberpunk bg-neon-green text-black flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p class="font-bold text-neon-cyan font-retro text-lg">INSTALL AUTHENTICATOR APP</p>
                <p class="text-sm text-neon-cyan/70 font-mono mt-1">Google Authenticator, Authy, or similar</p>
              </div>
            </div>
          </div>
          
          <div class="p-4 bg-secondary-900/30 backdrop-blur-lg border border-neon-cyan/30 clip-cyber-button">
            <div class="flex items-start space-x-4">
              <div class="w-8 h-8 clip-cyberpunk bg-neon-cyan/50 text-neon-cyan flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p class="font-bold text-neon-cyan font-retro text-lg">SCAN QR CODE</p>
                <p class="text-sm text-neon-cyan/70 font-mono mt-1">Add your account to the authenticator</p>
              </div>
            </div>
          </div>
          
          <div class="p-4 bg-secondary-900/30 backdrop-blur-lg border border-neon-pink/30 clip-cyber-button">
            <div class="flex items-start space-x-4">
              <div class="w-8 h-8 clip-cyberpunk bg-neon-pink/50 text-neon-pink flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p class="font-bold text-neon-cyan font-retro text-lg">VERIFY SETUP</p>
                <p class="text-sm text-neon-cyan/70 font-mono mt-1">Enter a code to confirm it works</p>
              </div>
            </div>
          </div>
        </div>

        ${this.state.error ? `
          <div class="mb-6 p-4 bg-danger-500/10 border border-danger-500/30 clip-cyber-button">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-danger-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm text-danger-500 font-mono">${this.state.error}</p>
            </div>
          </div>
        ` : ''}

        <div class="flex space-x-4">
          <button id="start-setup-btn" class="btn btn-primary flex-1 group" ${this.state.loading ? 'disabled' : ''}>
            <span class="font-retro tracking-wider">
              ${this.state.loading ? 'INITIALIZING...' : 'START_SETUP.EXE'}
            </span>
            ${!this.state.loading ? `
              <svg class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            ` : ''}
          </button>
        </div>
      </div>
    `;
  }

  private renderSetupStep() {
    return `
      <div class="text-center">
        <!-- Header -->
        <div class="mb-8">
          <h3 class="text-2xl font-bold text-gradient font-retro tracking-wider mb-4">QR_CODE_SCANNER.EXE</h3>
          <p class="text-neon-cyan/80 font-mono">
            <span class="text-neon-green">></span> Open your authenticator app and scan this QR code
          </p>
        </div>

        <!-- QR Code Display -->
        <div class="mb-8">
          <div id="qr-code-container" class="inline-block p-6 bg-secondary-900/50 backdrop-blur-lg border border-neon-green/40 clip-cyber-card">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.state.qrCodeUrl || '')}" 
                 alt="2FA QR Code" class="w-48 h-48 border-2 border-neon-green/30">
          </div>
        </div>

        <!-- Manual Code -->
        <div class="mb-8">
          <p class="text-sm text-neon-cyan/80 mb-4 font-mono">
            <span class="text-neon-pink">$</span> Can't scan? Enter this code manually:
          </p>
          <div class="p-4 bg-secondary-900/50 backdrop-blur-lg border border-neon-cyan/30 clip-cyber-button font-mono text-sm text-neon-cyan break-all">
            <span class="text-neon-green tracking-widest">${this.state.totpSecret}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button id="continue-verify-btn" class="btn btn-primary flex-1 group">
            <span class="font-retro tracking-wider">CONTINUE_VERIFY.EXE</span>
            <svg class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
          <button id="back-btn" class="btn btn-secondary">
            <svg class="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span class="font-retro tracking-wider">BACK.EXE</span>
          </button>
        </div>
      </div>
    `;
  }

  private renderVerifyStep() {
    return `
      <div class="text-center">
        <!-- Header -->
        <div class="mb-8">
          <h3 class="text-2xl font-bold text-gradient font-retro tracking-wider mb-4">CODE_VERIFICATION.EXE</h3>
          <p class="text-neon-cyan/80 font-mono">
            <span class="text-neon-green">></span> Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <!-- Code Input -->
        <div class="mb-8">
          <label for="verification-code" class="block text-sm font-bold text-neon-cyan font-retro tracking-wider mb-4">
            <span class="text-neon-pink">[</span>AUTHENTICATION_CODE<span class="text-neon-cyan">]</span>
          </label>
          <input 
            type="text" 
            id="verification-code" 
            placeholder="123456"
            maxlength="6"
            pattern="[0-9]{6}"
            class="form-input text-center text-2xl font-mono tracking-widest"
            autocomplete="off"
            inputmode="numeric"
          />
          <p class="text-xs text-neon-green/70 mt-3 font-mono">
            <span class="text-neon-pink">></span> Enter the current 6-digit code from your app
          </p>
        </div>

        ${this.state.error ? `
          <div class="mb-6 p-4 bg-danger-500/10 border border-danger-500/30 clip-cyber-button">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-danger-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm text-danger-500 font-mono">${this.state.error}</p>
            </div>
          </div>
        ` : ''}

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button id="verify-btn" class="btn btn-primary flex-1 group" ${this.state.loading ? 'disabled' : ''}>
            <span class="font-retro tracking-wider">
              ${this.state.loading ? 'VERIFYING...' : 'VERIFY_AND_ENABLE.EXE'}
            </span>
            ${!this.state.loading ? `
              <svg class="w-5 h-5 ml-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ` : ''}
          </button>
          <button id="back-to-setup-btn" class="btn btn-secondary">
            <svg class="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span class="font-retro tracking-wider">BACK.EXE</span>
          </button>
        </div>
      </div>
    `;
  }

  private renderCompleteStep() {
    return `
      <div class="text-center">
        <!-- Success Header -->
        <div class="mb-8">
          <div class="w-20 h-20 clip-cyberpunk bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gradient font-retro tracking-wider mb-4">2FA_ENABLED_SUCCESS.EXE</h3>
          <p class="text-neon-cyan/80 font-mono">
            <span class="text-neon-green">></span> Your account is now protected with two-factor authentication
            <span class="animate-pulse">_</span>
          </p>
        </div>

        <!-- Backup Codes Section -->
        <div class="mb-8">
          <div class="p-6 bg-warning-500/10 border border-warning-500/30 clip-cyber-card">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 clip-cyberpunk bg-warning-500 mr-3 flex items-center justify-center">
                <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h4 class="font-bold text-warning-500 font-retro text-lg tracking-wider">IMPORTANT: SAVE BACKUP CODES</h4>
            </div>
            <p class="text-sm text-warning-500 mb-4 font-mono">
              <span class="text-neon-pink">$</span> Store these codes in a safe place. You can use them to access your account if you lose your device.
            </p>
            <div class="p-4 bg-secondary-900/50 backdrop-blur-lg border border-neon-green/30 clip-cyber-button">
              <div class="grid grid-cols-2 gap-3 text-sm font-mono">
                ${this.state.backupCodes?.map(code => `
                  <div class="p-2 bg-secondary-900/50 border border-neon-green/40 clip-cyber-button text-center">
                    <span class="text-neon-green font-bold tracking-widest">${code}</span>
                  </div>
                `).join('') || ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Complete Button -->
        <button id="complete-btn" class="btn btn-success w-full group">
          <span class="font-retro tracking-wider">COMPLETE_SETUP.EXE</span>
          <svg class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
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