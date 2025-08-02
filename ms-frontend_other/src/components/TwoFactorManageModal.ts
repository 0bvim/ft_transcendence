import { authApi, User } from '../api/auth';

export class TwoFactorManageModal {
  private modal: HTMLElement;
  private isVisible: boolean = false;
  private user: any;
  private container: HTMLElement;
  private onUpdate: (updatedUser: User) => void;
  private currentBackupCodes: string[] = [];

  constructor(user: any, container: HTMLElement, onUpdate: (updatedUser: User) => void) {
    this.user = user;
    this.container = container;
    this.onUpdate = onUpdate;
    this.modal = this.createModal();
    this.setupEventListeners();
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 overflow-y-auto hidden';
    modal.innerHTML = `
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Synthwave Background overlay -->
        <div class="fixed inset-0 bg-secondary-900/80 backdrop-blur-lg transition-opacity">
          <!-- Background Effects -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <!-- Animated Grid Background -->
            <div class="absolute inset-0 synthwave-grid opacity-10"></div>
            
            <!-- Neon Orbs -->
            <div class="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%); animation-delay: -2s;"></div>
            <div class="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%); animation-delay: -4s;"></div>
            
            <!-- Scan Lines -->
            <div class="scan-line"></div>
          </div>
        </div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom card backdrop-blur-xl text-left overflow-hidden shadow-glow transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-up">
          <div class="p-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center">
                <div class="w-14 h-14 clip-cyberpunk bg-gradient-to-br from-warning-500/20 to-neon-pink/20 flex items-center justify-center mr-4">
                  <svg class="h-8 w-8 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-gradient font-retro tracking-wider">
                    2FA_MANAGEMENT.EXE
                  </h3>
                  <p class="text-sm text-neon-cyan/80 font-mono mt-1">
                    <span class="text-neon-pink">$</span> Manage your 2FA settings and backup codes
                  </p>
                </div>
              </div>
              <button id="closeModal" class="btn btn-ghost p-2 group">
                <svg class="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="space-y-6">
              <!-- Current Status -->
              <div class="p-6 bg-secondary-900/30 backdrop-blur-lg border border-neon-green/30 clip-cyber-button">
                <div class="flex items-center">
                  <div class="w-6 h-6 clip-cyberpunk bg-neon-green mr-3">
                    <svg class="w-4 h-4 text-black m-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span class="text-sm font-bold text-neon-green font-retro tracking-wider">
                    TWO-FACTOR AUTHENTICATION IS ENABLED
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="space-y-4">
                <!-- Generate Backup Codes -->
                <button id="generateCodesBtn" class="w-full p-6 bg-secondary-900/30 backdrop-blur-lg border border-neon-cyan/30 clip-cyber-button hover:border-neon-cyan/50 hover:scale-[1.02] transition-all duration-300 group">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-12 h-12 clip-cyberpunk bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 flex items-center justify-center mr-4">
                        <svg class="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 class="text-lg font-bold text-neon-cyan font-retro tracking-wider">GENERATE NEW BACKUP CODES</h4>
                        <p class="text-sm text-neon-cyan/70 font-mono mt-1">
                          <span class="text-neon-pink">></span> Create new backup codes to access your account
                        </p>
                      </div>
                    </div>
                    <svg class="w-6 h-6 text-neon-cyan transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </button>

                <!-- Disable 2FA -->
                <button id="disable2faBtn" class="w-full p-6 bg-danger-500/10 backdrop-blur-lg border border-danger-500/30 clip-cyber-button hover:border-danger-500/50 hover:scale-[1.02] transition-all duration-300 group">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-12 h-12 clip-cyberpunk bg-gradient-to-br from-danger-500/20 to-danger-500/30 flex items-center justify-center mr-4">
                        <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 class="text-lg font-bold text-danger-500 font-retro tracking-wider">DISABLE TWO-FACTOR AUTH</h4>
                        <p class="text-sm text-danger-400/70 font-mono mt-1">
                          <span class="text-neon-pink">></span> Remove 2FA protection from your account
                        </p>
                      </div>
                    </div>
                    <svg class="w-6 h-6 text-danger-500 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div id="loadingState" class="hidden p-8">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-6 relative">
                <div class="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
                <div class="absolute inset-0 w-16 h-16 border-4 border-neon-cyan border-b-transparent rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
              </div>
              <p class="text-lg text-neon-cyan font-retro tracking-wider">PROCESSING...</p>
              <p class="text-sm text-neon-pink/70 font-mono mt-2">Please wait while we secure your data</p>
            </div>
          </div>

          <!-- Backup Codes Display -->
          <div id="backupCodesDisplay" class="hidden p-8">
            <div class="mb-6">
              <h4 class="text-2xl font-bold text-gradient font-retro tracking-wider mb-4">
                NEW_BACKUP_CODES.DAT
              </h4>
              <p class="text-sm text-neon-cyan/80 font-mono mb-4">
                <span class="text-neon-pink">$</span> Save these backup codes in a secure location. Each code can only be used once.
              </p>
              <div class="p-4 bg-warning-500/10 border border-warning-500/30 clip-cyber-button mb-6">
                <div class="flex items-center">
                  <div class="w-6 h-6 clip-cyberpunk bg-warning-500 mr-3 flex items-center justify-center">
                    <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <span class="text-sm text-warning-500 font-mono font-bold">⚠ These codes replace any previous backup codes</span>
                </div>
              </div>
            </div>
            
            <div id="backupCodesList" class="p-6 bg-secondary-900/50 backdrop-blur-lg border border-neon-green/30 clip-cyber-button mb-6">
              <!-- Codes will be inserted here -->
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button id="copyCodesBtn" class="btn btn-secondary group">
                <svg class="w-5 h-5 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span class="font-retro tracking-wider">COPY.EXE</span>
              </button>
              <button id="downloadCodesBtn" class="btn btn-primary group">
                <svg class="w-5 h-5 mr-2 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span class="font-retro tracking-wider">DOWNLOAD.EXE</span>
              </button>
              <button id="doneBtn" class="btn btn-success group">
                <span class="font-retro tracking-wider">COMPLETE.EXE</span>
                <svg class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
  }

  private setupEventListeners(): void {
    const closeModal = this.modal.querySelector('#closeModal') as HTMLButtonElement;
    const generateCodesBtn = this.modal.querySelector('#generateCodesBtn') as HTMLButtonElement;
    const disable2faBtn = this.modal.querySelector('#disable2faBtn') as HTMLButtonElement;

    // Close modal
    closeModal?.addEventListener('click', () => this.hide());
    
    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Generate backup codes
    generateCodesBtn?.addEventListener('click', () => this.generateBackupCodes());

    // Disable 2FA
    disable2faBtn?.addEventListener('click', () => this.disable2FA());

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  public show(): void {
    this.isVisible = true;
    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Reset to main view
    this.showMainView();
  }

  public hide(): void {
    this.isVisible = false;
    this.modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  private showMainView(): void {
    const mainContent = this.modal.querySelector('.p-8');
    const loadingState = this.modal.querySelector('#loadingState') as HTMLElement;
    const backupCodesDisplay = this.modal.querySelector('#backupCodesDisplay') as HTMLElement;
    
    mainContent?.classList.remove('hidden');
    loadingState?.classList.add('hidden');
    backupCodesDisplay?.classList.add('hidden');
  }

  private showLoadingState(): void {
    const mainContent = this.modal.querySelector('.p-8');
    const loadingState = this.modal.querySelector('#loadingState') as HTMLElement;
    const backupCodesDisplay = this.modal.querySelector('#backupCodesDisplay') as HTMLElement;
    
    mainContent?.classList.add('hidden');
    loadingState?.classList.remove('hidden');
    backupCodesDisplay?.classList.add('hidden');
  }

  private showBackupCodes(codes: string[]): void {
    const mainContent = this.modal.querySelector('.p-8');
    const loadingState = this.modal.querySelector('#loadingState') as HTMLElement;
    const backupCodesDisplay = this.modal.querySelector('#backupCodesDisplay') as HTMLElement;
    const backupCodesList = this.modal.querySelector('#backupCodesList') as HTMLElement;
    
    mainContent?.classList.add('hidden');
    loadingState?.classList.add('hidden');
    backupCodesDisplay?.classList.remove('hidden');
    
    // Store codes for later use
    this.currentBackupCodes = codes;
    
    // Display the codes with cyberpunk styling
    backupCodesList.innerHTML = `
      <div class="grid grid-cols-2 gap-3 font-mono text-sm">
        ${codes.map((code, index) => `
          <div class="backup-code-item p-3 bg-secondary-900/50 backdrop-blur-lg border border-neon-green/40 clip-cyber-button text-center hover:border-neon-green/60 transition-all duration-300">
            <span class="text-neon-green font-bold tracking-widest">${code}</span>
          </div>
        `).join('')}
      </div>
      <div class="mt-4 p-3 bg-secondary-900/30 backdrop-blur-lg border border-neon-cyan/30 clip-cyber-button">
        <p class="text-xs text-neon-cyan/80 font-mono text-center">
          <span class="text-neon-pink">></span> Store these codes securely - each can only be used once
        </p>
      </div>
    `;
    
    // Set up event listeners for backup codes buttons
    this.setupBackupCodesEventListeners();
  }

  private async generateBackupCodes(): Promise<void> {
    try {
      this.showLoadingState();
      
      console.log('🔄 Generating backup codes for user:', this.user.id);
      const response = await authApi.generateBackupCodes(this.user.id);
      
      console.log('✅ Backup codes generated:', response);
      
      if (response.backupCodes && Array.isArray(response.backupCodes)) {
        this.showBackupCodes(response.backupCodes);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Failed to generate backup codes:', error);
      this.showMainView();
      this.showError('Failed to generate backup codes. Please try again.');
    }
  }

  private async disable2FA(): Promise<void> {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
      return;
    }

    try {
      this.showLoadingState();
      
      console.log('🔄 Disabling 2FA for user:', this.user.id);
      await authApi.disableTwoFactor(this.user.id);
      
      // Update user object
      const updatedUser = { ...this.user, twoFactorEnabled: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ 2FA disabled successfully');
      
      this.hide();
      this.onUpdate(updatedUser);
      this.showSuccess('Two-Factor Authentication has been disabled');
    } catch (error) {
      console.error('❌ Failed to disable 2FA:', error);
      this.showMainView();
      this.showError('Failed to disable 2FA. Please try again.');
    }
  }

  private setupBackupCodesEventListeners(): void {
    const copyCodesBtn = this.modal.querySelector('#copyCodesBtn') as HTMLButtonElement;
    const downloadCodesBtn = this.modal.querySelector('#downloadCodesBtn') as HTMLButtonElement;
    const doneBtn = this.modal.querySelector('#doneBtn') as HTMLButtonElement;

    // Copy backup codes
    copyCodesBtn?.addEventListener('click', () => this.copyBackupCodes());

    // Download backup codes
    downloadCodesBtn?.addEventListener('click', () => this.downloadBackupCodes());

    // Done button
    doneBtn?.addEventListener('click', () => this.hide());
  }

  private copyBackupCodes(): void {
    if (this.currentBackupCodes.length === 0) {
      this.showError('No backup codes available to copy');
      return;
    }
    
    const codesText = this.currentBackupCodes.join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      console.log('✅ Backup codes copied to clipboard');
      this.showSuccess('Backup codes copied to clipboard! 📋');
    }).catch(() => {
      console.log('❌ Failed to copy backup codes');
      this.showError('Failed to copy backup codes. Please try selecting and copying manually.');
    });
  }

  private downloadBackupCodes(): void {
    if (this.currentBackupCodes.length === 0) {
      this.showError('No backup codes available to download');
      return;
    }
    
    const codesText = `🔐 TWO-FACTOR AUTHENTICATION BACKUP CODES
══════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Account: ${this.user.email || this.user.username || 'Unknown'}

🔑 BACKUP CODES:
${this.currentBackupCodes.map((code, index) => `${String(index + 1).padStart(2, '0')}. ${code}`).join('\n')}

⚠️  IMPORTANT SECURITY NOTICE:
• Each code can only be used once
• Store these codes in a secure location
• Generate new codes if you lose these
• These codes replace any previous backup codes
• Keep them separate from your device

Generated by FT_TRANSCENDENCE Security System`;
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ft-transcendence-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup codes downloaded');
    this.showSuccess('Backup codes downloaded successfully! 💾');
  }

  private showError(message: string): void {
    // Use the same error display mechanism as the Profile page
    const errorMessage = this.container.querySelector('#errorMessage') as HTMLElement;
    const errorText = this.container.querySelector('#errorText') as HTMLElement;
    
    if (errorText && errorMessage) {
      errorText.textContent = message;
      errorMessage.classList.remove('hidden');
      errorMessage.classList.add('animate-slide-down');
      
      setTimeout(() => {
        errorMessage.classList.add('hidden');
        errorMessage.classList.remove('animate-slide-down');
      }, 5000);
    }
  }

  private showSuccess(message: string): void {
    // Use the same success display mechanism as the Profile page
    const successMessage = this.container.querySelector('#successMessage') as HTMLElement;
    const successSpan = successMessage?.querySelector('span');
    
    if (successSpan && successMessage) {
      successSpan.textContent = message;
      successMessage.classList.remove('hidden');
      successMessage.classList.add('animate-slide-down');
      
      setTimeout(() => {
        successMessage.classList.add('hidden');
        successMessage.classList.remove('animate-slide-down');
      }, 3000);
    }
  }

  public destroy(): void {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }
} 