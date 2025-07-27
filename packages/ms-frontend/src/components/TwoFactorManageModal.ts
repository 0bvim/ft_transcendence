import { authApi, User } from '../api/auth';

export class TwoFactorManageModal {
  private modal: HTMLElement;
  private isVisible: boolean = false;
  private user: any;
  private container: HTMLElement;
  private onUpdate: (updatedUser: User) => void;

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
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Manage Two-Factor Authentication
                  </h3>
                  <p class="text-sm text-gray-500">
                    Manage your 2FA settings and backup codes
                  </p>
                </div>
              </div>
              <button id="closeModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="space-y-4">
              <!-- Current Status -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-sm font-medium text-green-800">Two-Factor Authentication is enabled</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="space-y-3">
                <!-- Generate Backup Codes -->
                <button id="generateCodesBtn" class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Generate New Backup Codes</h4>
                      <p class="text-xs text-gray-500">Create new backup codes to access your account</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>

                <!-- Disable 2FA -->
                <button id="disable2faBtn" class="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-sm font-medium text-red-900">Disable Two-Factor Authentication</h4>
                      <p class="text-xs text-red-600">Remove 2FA protection from your account</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div id="loadingState" class="hidden bg-white px-4 pt-5 pb-4 sm:p-6">
            <div class="text-center">
              <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-sm text-gray-600">Processing...</p>
            </div>
          </div>

          <!-- Backup Codes Display -->
          <div id="backupCodesDisplay" class="hidden bg-white px-4 pt-5 pb-4 sm:p-6">
            <div class="mb-4">
              <h4 class="text-lg font-medium text-gray-900 mb-2">Your New Backup Codes</h4>
              <p class="text-sm text-gray-600 mb-4">
                Save these backup codes in a secure location. Each code can only be used once.
              </p>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span class="text-sm text-yellow-800">These codes replace any previous backup codes</span>
                </div>
              </div>
            </div>
            
            <div id="backupCodesList" class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <!-- Codes will be inserted here -->
            </div>
            
            <div class="flex space-x-3">
              <button id="copyCodesBtn" class="flex-1 btn btn-secondary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Copy Codes
              </button>
              <button id="downloadCodesBtn" class="flex-1 btn btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download
              </button>
              <button id="doneBtn" class="flex-1 btn btn-success">Done</button>
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
    const copyCodesBtn = this.modal.querySelector('#copyCodesBtn') as HTMLButtonElement;
    const downloadCodesBtn = this.modal.querySelector('#downloadCodesBtn') as HTMLButtonElement;
    const doneBtn = this.modal.querySelector('#doneBtn') as HTMLButtonElement;

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

    // Copy codes
    copyCodesBtn?.addEventListener('click', () => this.copyBackupCodes());

    // Download codes
    downloadCodesBtn?.addEventListener('click', () => this.downloadBackupCodes());

    // Done button
    doneBtn?.addEventListener('click', () => this.hide());

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
    const mainContent = this.modal.querySelector('.bg-white.px-4.pt-5.pb-4.sm\\:p-6.sm\\:pb-4');
    const loadingState = this.modal.querySelector('#loadingState') as HTMLElement;
    const backupCodesDisplay = this.modal.querySelector('#backupCodesDisplay') as HTMLElement;
    
    mainContent?.classList.remove('hidden');
    loadingState?.classList.add('hidden');
    backupCodesDisplay?.classList.add('hidden');
  }

  private showLoadingState(): void {
    const mainContent = this.modal.querySelector('.bg-white.px-4.pt-5.pb-4.sm\\:p-6.sm\\:pb-4');
    const loadingState = this.modal.querySelector('#loadingState') as HTMLElement;
    const backupCodesDisplay = this.modal.querySelector('#backupCodesDisplay') as HTMLElement;
    
    mainContent?.classList.add('hidden');
    loadingState?.classList.remove('hidden');
    backupCodesDisplay?.classList.add('hidden');
  }

  private showBackupCodes(codes: string[]): void {
    const mainContent = this.modal.querySelector('.bg-white.px-4.pt-5.pb-4.sm\\:p-6.sm\\:pb-4');
    const loadingState = this.modal.querySelector('#loadingState') as HTMLElement;
    const backupCodesDisplay = this.modal.querySelector('#backupCodesDisplay') as HTMLElement;
    const backupCodesList = this.modal.querySelector('#backupCodesList') as HTMLElement;
    
    mainContent?.classList.add('hidden');
    loadingState?.classList.add('hidden');
    backupCodesDisplay?.classList.remove('hidden');
    
    // Display the codes
    backupCodesList.innerHTML = `
      <div class="grid grid-cols-2 gap-2 font-mono text-sm">
        ${codes.map((code, index) => `
          <div class="bg-white border border-gray-300 rounded px-3 py-2 text-center">
            ${code}
          </div>
        `).join('')}
      </div>
    `;
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

  private copyBackupCodes(): void {
    const backupCodesList = this.modal.querySelector('#backupCodesList') as HTMLElement;
    const codes = Array.from(backupCodesList.querySelectorAll('.bg-white')).map(el => el.textContent?.trim()).filter(Boolean);
    
    const codesText = codes.join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      console.log('✅ Backup codes copied to clipboard');
      this.showSuccess('Backup codes copied to clipboard');
    }).catch(() => {
      console.log('❌ Failed to copy backup codes');
      this.showError('Failed to copy backup codes');
    });
  }

  private downloadBackupCodes(): void {
    const backupCodesList = this.modal.querySelector('#backupCodesList') as HTMLElement;
    const codes = Array.from(backupCodesList.querySelectorAll('.bg-white')).map(el => el.textContent?.trim()).filter(Boolean);
    
    const codesText = `Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\nAccount: ${this.user.email}\n\nBackup Codes:\n${codes.join('\n')}\n\nImportant:\n- Each code can only be used once\n- Store these codes in a secure location\n- Generate new codes if you lose these`;
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup codes downloaded');
    this.showSuccess('Backup codes downloaded');
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