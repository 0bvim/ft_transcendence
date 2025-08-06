import { authApi, User, UpdateProfileRequest } from '../api/auth';
import { tournamentApi } from '../api/tournament';
import { TwoFactorSetupModal } from '../components/TwoFactorSetup';
import { TwoFactorManageModal } from '../components/TwoFactorManageModal';

// Utility function to construct avatar URL
function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    return '/assets/wishes.png';
  }
  
  if (avatarUrl.startsWith('https')) {
    return avatarUrl;
  }
  
  const authServiceUrl = `https://${window.location.hostname}:3001`;
  const timestamp = new Date().getTime();
  const separator = avatarUrl.includes('?') ? '&' : '?';
  return `${authServiceUrl}${avatarUrl}${separator}t=${timestamp}`;
}

export default function Profile(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen relative overflow-hidden';

  container.innerHTML = `
    <!-- Synthwave Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Animated Grid Background -->
      <div class="absolute inset-0 synthwave-grid opacity-15"></div>
      
      <!-- Neon Orbs -->
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%); animation-delay: -2s;"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%); animation-delay: -4s;"></div>
      <div class="absolute top-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,128,0.08) 0%, transparent 70%); animation-delay: -3s;"></div>
      <div class="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(128,0,255,0.08) 0%, transparent 70%); animation-delay: -1s;"></div>
      
      <!-- Horizon Line -->
      <div class="horizon-line"></div>
      
      <!-- Scan Lines -->
      <div class="scan-line"></div>
    </div>

    <div class="relative z-10 container-fluid py-8">
      <!-- Header -->
      <div class="mb-12 animate-fade-in">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <button id="backButton" class="btn btn-ghost group">
              <svg class="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              BACK_TO_DASHBOARD
            </button>
            <div>
              <h1 class="text-5xl font-bold text-gradient font-retro tracking-wider">
                <span class="text-neon-cyan">USER</span> 
                <span class="text-neon-pink">PROFILE</span>
              </h1>
              <p class="text-neon-cyan/80 mt-2 font-mono">
                <span class="text-neon-pink">$</span> Manage your account settings and preferences
                <span class="animate-pulse">_</span>
              </p>
            </div>
          </div>
          <button id="editToggle" class="btn btn-primary group">
            <svg class="w-5 h-5 mr-3 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span id="editToggleText" class="font-retro tracking-wider">EDIT_PROFILE.EXE</span>
          </button>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Card -->
        <div class="lg:col-span-1 animate-slide-up">
          <div class="card p-8 space-y-8 sticky top-8">
            <!-- Avatar Section -->
            <div class="text-center">
              <div class="relative inline-block">
                <!-- Cyberpunk Avatar Frame -->
                <div class="relative">
                  <div class="w-32 h-32 clip-cyberpunk bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 p-1 mx-auto">
                    <img id="avatarImage" src="/assets/wishes.png" alt="Profile Avatar" 
                         class="w-full h-full object-cover clip-cyberpunk" />
                  </div>
                  <div class="absolute inset-0 w-32 h-32 clip-cyberpunk border-2 border-neon-pink animate-glow-pulse mx-auto"></div>
                  
                  <!-- Upload Overlay -->
                  <div id="avatarUploadOverlay" class="absolute inset-0 w-32 h-32 clip-cyberpunk bg-secondary-900/80 backdrop-blur-lg opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer hidden mx-auto">
                    <svg class="w-8 h-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <input type="file" id="avatarInput" accept="image/jpeg,image/png,image/webp" class="hidden" />
                </div>
                
                <!-- Avatar Actions (shown only in edit mode) -->
                <div id="avatarActions" class="mt-4 space-y-2 hidden">
                  <button id="removeAvatarButton" class="btn btn-danger btn-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span class="font-retro tracking-wider">REMOVE_AVATAR</span>
                  </button>
                </div>
                
                <div class="mt-6">
                  <h2 id="displayName" class="text-2xl font-bold text-neon-cyan font-retro">Loading...</h2>
                  <p id="username" class="text-neon-pink/70 mt-1 font-mono">@loading</p>
                </div>
                
                <div class="mt-4 flex items-center justify-center space-x-2">
                  <span class="w-2 h-2 bg-neon-green rounded-full animate-glow-pulse"></span>
                  <span class="text-sm text-neon-green font-mono uppercase">Online</span>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="border-t border-neon-cyan/30 pt-8 mt-8">
                <div class="grid grid-cols-2 gap-6">
                  <div class="p-4 bg-secondary-900/30 backdrop-blur-lg border border-neon-pink/30 clip-cyber-button text-center">
                    <div class="text-3xl font-bold text-neon-pink font-retro mb-2" id="totalGames">0</div>
                    <div class="text-xs text-neon-cyan/70 font-mono uppercase tracking-wider">Games Played</div>
                  </div>
                  <div class="p-4 bg-secondary-900/30 backdrop-blur-lg border border-neon-green/30 clip-cyber-button text-center">
                    <div class="text-3xl font-bold text-neon-green font-retro mb-2" id="winRate">0%</div>
                    <div class="text-xs text-neon-cyan/70 font-mono uppercase tracking-wider">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8 animate-slide-up" style="animation-delay: 0.2s;">
          <!-- Profile Information -->
          <div class="card p-8">
            <div class="flex items-center justify-between mb-8">
              <h3 class="text-2xl font-bold text-gradient font-retro tracking-wider">PROFILE INFORMATION</h3>
              <span id="lastUpdated" class="text-sm text-neon-cyan/60 font-mono border border-neon-cyan/30 px-3 py-1 clip-cyber-button">
                Last updated: Never
              </span>
            </div>

            <form id="profileForm" class="space-y-8">
              <!-- Display Name -->
              <div class="form-group">
                <label for="displayNameInput" class="form-label">
                  <span class="text-neon-cyan">[</span>DISPLAY_NAME<span class="text-neon-pink">]</span>
                </label>
                <input
                  id="displayNameInput"
                  name="displayName"
                  type="text"
                  class="form-input"
                  placeholder="Enter your display name..."
                  maxlength="50"
                  disabled
                />
                <p class="text-xs text-neon-green/70 mt-2 font-mono">
                  <span class="text-neon-pink">></span> This is how your name appears in tournaments
                </p>
              </div>

              <!-- Email (readonly) -->
              <div class="form-group">
                <label for="emailInput" class="form-label">
                  <span class="text-neon-pink">[</span>EMAIL_ADDRESS<span class="text-neon-cyan">]</span>
                </label>
                <input
                  id="emailInput"
                  name="email"
                  type="email"
                  class="form-input bg-secondary-900/30"
                  disabled
                  readonly
                />
                <p class="text-xs text-warning-500/70 mt-2 font-mono">
                  <span class="text-neon-cyan">></span> Email cannot be changed after registration
                </p>
              </div>

              <!-- Username (readonly) -->
              <div class="form-group">
                <label for="usernameInput" class="form-label">
                  <span class="text-neon-green">[</span>USERNAME<span class="text-neon-cyan">]</span>
                </label>
                <input
                  id="usernameInput"
                  name="username"
                  type="text"
                  class="form-input bg-secondary-900/30"
                  disabled
                  readonly
                />
                <p class="text-xs text-warning-500/70 mt-2 font-mono">
                  <span class="text-neon-pink">></span> Username cannot be changed after registration
                </p>
              </div>

              <!-- Bio -->
              <div class="form-group">
                <label for="bioInput" class="form-label">
                  <span class="text-neon-cyan">[</span>BIO<span class="text-neon-green">]</span>
                </label>
                <textarea
                  id="bioInput"
                  name="bio"
                  rows="4"
                  class="form-input resize-none"
                  placeholder="Tell us about yourself..."
                  maxlength="500"
                  disabled
                ></textarea>
                <div class="flex justify-between mt-2">
                  <p class="text-xs text-neon-green/70 font-mono">
                    <span class="text-neon-pink">></span> Share a bit about yourself with other players
                  </p>
                  <span id="bioCounter" class="text-xs text-neon-cyan/60 font-mono border border-neon-cyan/30 px-2 py-1 clip-cyber-button">0/500</span>
                </div>
              </div>

              <!-- Form Actions -->
              <div id="formActions" class="hidden">
                <div class="flex space-x-4">
                  <button
                    type="submit"
                    id="saveButton"
                    class="btn btn-primary group"
                  >
                    <span id="saveButtonText" class="font-retro tracking-wider">SAVE_CHANGES.EXE</span>
                    <svg id="saveSpinner" class="w-5 h-5 ml-3 spinner hidden" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    id="cancelButton"
                    class="btn btn-secondary"
                  >
                    <span class="font-retro tracking-wider">CANCEL.EXE</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Security Settings -->
          <div class="card p-6">
            <h3 class="text-2xl font-bold text-gradient mb-8 font-retro tracking-wider">SECURITY SETTINGS</h3>
            
            <div class="space-y-4">
              <!-- 2FA Status -->
              <div class="p-4 bg-secondary-900/30 backdrop-blur-lg border border-neon-cyan/30 clip-cyber-button hover:border-neon-cyan/50 transition-all duration-300">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 clip-cyberpunk bg-gradient-to-br from-warning-500/20 to-neon-pink/20 flex items-center justify-center">
                      <svg class="w-6 h-6 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-bold text-neon-cyan font-retro text-lg">TWO-FACTOR AUTHENTICATION</h4>
                      <p class="text-sm text-neon-cyan/70 font-mono">Secure your account with an additional layer of protection</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span id="twoFactorStatus" class="badge badge-warning">DISABLED</span>
                    <button id="twoFactorToggle" class="btn btn-sm btn-primary">
                      <span id="twoFactorToggleText" class="font-retro tracking-wider">ENABLE</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Account Created -->
              <div class="p-4 bg-secondary-900/30 backdrop-blur-lg border border-neon-green/30 clip-cyber-button">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 clip-cyberpunk bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center">
                    <svg class="w-6 h-6 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 6v2m0 0v2m0-2h.01M12 17h.01M3 11a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-neon-green font-retro text-lg">ACCOUNT CREATED</h4>
                    <p class="text-sm text-neon-cyan/70 font-mono" id="accountCreated">Loading...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="card p-6 border border-danger-500/50">
            <h3 class="text-2xl font-bold text-danger-500 mb-8 font-retro tracking-wider">DANGER ZONE</h3>
            
            <div class="p-4 bg-danger-500/10 backdrop-blur-lg border border-danger-500/30 clip-cyber-button">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 clip-cyberpunk bg-gradient-to-br from-danger-500/20 to-danger-500/30 flex items-center justify-center">
                    <svg class="w-6 h-6 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-danger-500 font-retro text-lg">DELETE ACCOUNT</h4>
                    <p class="text-sm text-danger-400/70 font-mono">Permanently delete your account and all associated data</p>
                  </div>
                </div>
                <button id="deleteAccountButton" class="btn btn-danger">
                  <span class="font-retro tracking-wider">DELETE_ACCOUNT.EXE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Terminal Footer -->
      <div class="mt-12 text-center animate-fade-in" style="animation-delay: 0.6s;">
        <div class="inline-block bg-secondary-900/50 backdrop-blur-lg border border-neon-cyan/30 px-6 py-3 clip-cyber-button">
          <p class="text-neon-cyan/60 font-mono text-sm">
            <span class="text-neon-pink">profile@ft_transcendence:~$</span> 
            <span class="animate-pulse">echo "User data secured"</span>
            <span class="animate-pulse text-neon-green ml-2">_</span>
          </p>
        </div>
      </div>

      <!-- Messages -->
      <div id="errorMessage" class="hidden fixed top-4 right-4 z-50">
        <div class="alert alert-danger max-w-md">
          <div class="flex">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <span id="errorText"></span>
          </div>
        </div>
      </div>

      <div id="successMessage" class="hidden fixed top-4 right-4 z-50">
        <div class="alert alert-success max-w-md">
          <div class="flex">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>Profile updated successfully!</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup the component
  setupEventListeners(container);
  loadProfileData(container);

  return container;
}

async function loadProfileData(container: HTMLElement) {
  try {
    const { user } = await authApi.getProfile();
    updateProfileDisplay(container, user);
    
    // Also load user stats
    await loadUserStats(container, user.id);
  } catch (error) {
    console.error('Failed to load profile:', error);
    showError(container, 'Failed to load profile data');
  }
}

async function loadUserStats(container: HTMLElement, userId: string) {
  try {
    // Use the proper stats API
    const stats = await tournamentApi.getUserStats(userId);
    
    console.log('📊 Loaded user stats for profile:', stats);

    // Update UI with real stats
    const totalGamesEl = container.querySelector('#totalGames') as HTMLElement;
    const winRateEl = container.querySelector('#winRate') as HTMLElement;

    if (totalGamesEl) totalGamesEl.textContent = (stats.wins + stats.losses).toString();
    if (winRateEl) winRateEl.textContent = `${Math.round(stats.winRate || 0)}%`;

  } catch (error) {
    console.error('Failed to load user stats:', error);
    // Set fallback values
    const totalGamesEl = container.querySelector('#totalGames') as HTMLElement;
    const winRateEl = container.querySelector('#winRate') as HTMLElement;
    
    if (totalGamesEl) totalGamesEl.textContent = '0';
    if (winRateEl) winRateEl.textContent = '0%';
  }
}

function updateProfileDisplay(container: HTMLElement, user: User) {
  // Update avatar
  const avatarImage = container.querySelector('#avatarImage') as HTMLImageElement;
  const avatarUrl = getAvatarUrl(user.avatarUrl);
  
  // Add error handler to fall back to default avatar if image fails to load
  avatarImage.onerror = () => {
    console.warn('Failed to load avatar image, falling back to default');
    avatarImage.src = '/assets/wishes.png';
  };
  
  avatarImage.src = avatarUrl;

  // Update display info
  const displayName = container.querySelector('#displayName') as HTMLElement;
  const username = container.querySelector('#username') as HTMLElement;
  displayName.textContent = user.displayName || user.username;
  username.textContent = `@${user.username}`;

  // Update form fields
  const displayNameInput = container.querySelector('#displayNameInput') as HTMLInputElement;
  const emailInput = container.querySelector('#emailInput') as HTMLInputElement;
  const usernameInput = container.querySelector('#usernameInput') as HTMLInputElement;
  const bioInput = container.querySelector('#bioInput') as HTMLTextAreaElement;

  displayNameInput.value = user.displayName || '';
  emailInput.value = user.email;
  usernameInput.value = user.username;
  bioInput.value = user.bio || '';

  // Update bio counter
  updateBioCounter(container);

  // Update 2FA status
  const twoFactorStatus = container.querySelector('#twoFactorStatus') as HTMLElement;
  const twoFactorToggleText = container.querySelector('#twoFactorToggleText') as HTMLElement;
  
  if (user.twoFactorEnabled) {
    twoFactorStatus.textContent = 'Enabled';
    twoFactorStatus.className = 'badge badge-success';
    twoFactorToggleText.textContent = 'Manage';
  } else {
    twoFactorStatus.textContent = 'Disabled';
    twoFactorStatus.className = 'badge badge-warning';
    twoFactorToggleText.textContent = 'Enable';
  }

  // Update account created date
  const accountCreated = container.querySelector('#accountCreated') as HTMLElement;
  const createdDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  accountCreated.textContent = createdDate;

  // Update last updated
  const lastUpdated = container.querySelector('#lastUpdated') as HTMLElement;
  const updatedDate = new Date(user.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  lastUpdated.textContent = `Last updated: ${updatedDate}`;
}

function setupEventListeners(container: HTMLElement) {
  const editToggle = container.querySelector('#editToggle') as HTMLButtonElement;
  const editToggleText = container.querySelector('#editToggleText') as HTMLElement;
  const formActions = container.querySelector('#formActions') as HTMLElement;
  const profileForm = container.querySelector('#profileForm') as HTMLFormElement;
  const avatarInput = container.querySelector('#avatarInput') as HTMLInputElement;
  const avatarUploadOverlay = container.querySelector('#avatarUploadOverlay') as HTMLElement;
  const bioInput = container.querySelector('#bioInput') as HTMLTextAreaElement;
  const saveButton = container.querySelector('#saveButton') as HTMLButtonElement;
  const cancelButton = container.querySelector('#cancelButton') as HTMLButtonElement;
  const backButton = container.querySelector('#backButton') as HTMLButtonElement;
  const removeAvatarButton = container.querySelector('#removeAvatarButton') as HTMLButtonElement;
  const avatarActions = container.querySelector('#avatarActions') as HTMLElement;

  let isEditing = false;
  let originalData: any = {};

  // Edit toggle
  editToggle.addEventListener('click', () => {
    isEditing = !isEditing;
    toggleEditMode(container, isEditing);
    
    if (isEditing) {
      // Store original data for cancel functionality
      originalData = {
        displayName: (container.querySelector('#displayNameInput') as HTMLInputElement).value,
        bio: bioInput.value,
      };
      
      editToggleText.textContent = 'Cancel Edit';
      formActions.classList.remove('hidden');
      avatarUploadOverlay.classList.remove('hidden');
      avatarActions.classList.remove('hidden');
    } else {
      // Restore original data
      (container.querySelector('#displayNameInput') as HTMLInputElement).value = originalData.displayName;
      bioInput.value = originalData.bio;
      updateBioCounter(container);
      
      editToggleText.textContent = 'Edit Profile';
      formActions.classList.add('hidden');
      avatarUploadOverlay.classList.add('hidden');
      avatarActions.classList.add('hidden');
    }
  });

  // Cancel button
  cancelButton.addEventListener('click', () => {
    editToggle.click(); // Trigger edit toggle to cancel
  });

  // Avatar upload
  avatarUploadOverlay.addEventListener('click', () => {
    if (isEditing) {
      avatarInput.click();
    }
  });

  avatarInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      showError(container, 'Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showError(container, 'Image size must be less than 5MB');
      return;
    }

    try {
      setLoading(container, true);
      const { user, avatarUrl } = await authApi.uploadAvatar(file);
      
      // Update avatar display with correct URL and force refresh
      const avatarImage = container.querySelector('#avatarImage') as HTMLImageElement;
      const newAvatarUrl = getAvatarUrl(user.avatarUrl);
      
      // Force image refresh by creating a new image element first
      const tempImg = new Image();
      tempImg.onload = () => {
        avatarImage.src = newAvatarUrl;
      };
      tempImg.onerror = () => {
        console.error('Failed to load new avatar image');
        showError(container, 'Failed to load new avatar image. Please try refreshing the page.');
      };
      tempImg.src = newAvatarUrl;
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(user));
      
      showSuccess(container);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      showError(container, 'Failed to upload avatar');
    } finally {
      setLoading(container, false);
    }
  });

  // Bio counter
  bioInput.addEventListener('input', () => {
    updateBioCounter(container);
  });

  // Form submission
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!isEditing) return;

    const formData = new FormData(profileForm);
    const updateData: UpdateProfileRequest = {
      displayName: formData.get('displayName') as string || undefined,
      bio: formData.get('bio') as string || undefined,
    };

    // Remove empty strings
    if (updateData.displayName === '') updateData.displayName = undefined;
    if (updateData.bio === '') updateData.bio = undefined;

    try {
      setLoading(container, true);
      const { user } = await authApi.updateProfile(updateData);
      
      updateProfileDisplay(container, user);
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(user));
      
      // Exit edit mode
      isEditing = false;
      toggleEditMode(container, false);
      editToggleText.textContent = 'Edit Profile';
      formActions.classList.add('hidden');
      avatarUploadOverlay.classList.add('hidden');
      avatarActions.classList.add('hidden');
      
      showSuccess(container);
    } catch (error: any) {
      console.error('Profile update failed:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      showError(container, message);
    } finally {
      setLoading(container, false);
    }
  });

  // 2FA toggle
  const twoFactorToggle = container.querySelector('#twoFactorToggle') as HTMLButtonElement;
  twoFactorToggle.addEventListener('click', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.twoFactorEnabled) {
      // If 2FA is enabled, show management modal
      const manageModal = new TwoFactorManageModal(user, container, (updatedUser) => {
        console.log('✅ 2FA management completed, updating profile display');
        updateProfileDisplay(container, updatedUser);
      });
      manageModal.show();
    } else {
      // If 2FA is disabled, directly setup TOTP
      if (confirm('Enable Two-Factor Authentication with an authenticator app? This will add an extra layer of security to your account.')) {
        setupTOTP(container, user);
      }
    }
  });

  // Remove Avatar button
  removeAvatarButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to remove your avatar? This action cannot be undone.')) {
      try {
        setLoading(container, true);
        const { user } = await authApi.removeAvatar();
        
        // Force immediate update to default avatar
        const avatarImage = container.querySelector('#avatarImage') as HTMLImageElement;
        avatarImage.src = '/assets/wishes.png';
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(user));
        
        showSuccess(container);
      } catch (error) {
        console.error('Failed to remove avatar:', error);
        showError(container, 'Failed to remove avatar');
      } finally {
        setLoading(container, false);
      }
    }
  });

  // Delete account
  const deleteAccountButton = container.querySelector('#deleteAccountButton') as HTMLButtonElement;
  deleteAccountButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('Type "DELETE" to confirm account deletion:')) {
        // Implement account deletion
        console.log('Account deletion would be implemented here');
      }
    }
  });

  // Back button
  backButton.addEventListener('click', () => {
    window.location.href = '/dashboard';
  });
}

function toggleEditMode(container: HTMLElement, editing: boolean) {
  const inputs = container.querySelectorAll('input:not([readonly]), textarea');
  const avatarUploadOverlay = container.querySelector('#avatarUploadOverlay') as HTMLElement;
  const avatarActions = container.querySelector('#avatarActions') as HTMLElement;
  
  inputs.forEach(input => {
    (input as HTMLInputElement | HTMLTextAreaElement).disabled = !editing;
  });

  if (editing) {
    avatarUploadOverlay.classList.remove('hidden');
    avatarActions.classList.remove('hidden');
  } else {
    avatarUploadOverlay.classList.add('hidden');
    avatarActions.classList.add('hidden');
  }
}

function updateBioCounter(container: HTMLElement) {
  const bioInput = container.querySelector('#bioInput') as HTMLTextAreaElement;
  const bioCounter = container.querySelector('#bioCounter') as HTMLElement;
  const length = bioInput.value.length;
  bioCounter.textContent = `${length}/500`;
  
  if (length > 450) {
    bioCounter.className = 'text-xs text-warning-600';
  } else if (length > 480) {
    bioCounter.className = 'text-xs text-danger-600';
  } else {
    bioCounter.className = 'text-xs text-secondary-400';
  }
}

function setLoading(container: HTMLElement, loading: boolean) {
  const editToggle = container.querySelector('#editToggle') as HTMLButtonElement;
  const saveButton = container.querySelector('#saveButton') as HTMLButtonElement;
  const twoFactorToggle = container.querySelector('#twoFactorToggle') as HTMLButtonElement;
  const removeAvatarButton = container.querySelector('#removeAvatarButton') as HTMLButtonElement;

  // Disable buttons during loading
  if (editToggle) editToggle.disabled = loading;
  if (saveButton) saveButton.disabled = loading;
  if (twoFactorToggle) twoFactorToggle.disabled = loading;
  if (removeAvatarButton) removeAvatarButton.disabled = loading;

  // Add visual feedback
  const buttons = [editToggle, saveButton, twoFactorToggle, removeAvatarButton].filter(Boolean);
  buttons.forEach(button => {
    if (loading) {
      button?.classList.add('opacity-75');
    } else {
      button?.classList.remove('opacity-75');
    }
  });
}

function showError(container: HTMLElement, message: string) {
  const errorMessage = container.querySelector('#errorMessage') as HTMLElement;
  const errorText = container.querySelector('#errorText') as HTMLElement;
  
  errorText.textContent = message;
  errorMessage.classList.remove('hidden');
  errorMessage.classList.add('animate-slide-down');
  
  setTimeout(() => {
    errorMessage.classList.add('hidden');
    errorMessage.classList.remove('animate-slide-down');
  }, 5000);
}

function showSuccess(container: HTMLElement) {
  const successMessage = container.querySelector('#successMessage') as HTMLElement;
  
  successMessage.classList.remove('hidden');
  successMessage.classList.add('animate-slide-down');
  
  setTimeout(() => {
    successMessage.classList.add('hidden');
    successMessage.classList.remove('animate-slide-down');
  }, 3000);
}

async function setupTOTP(container: HTMLElement, user: any) {
  console.log('🔄 Starting new 2FA setup flow for user:', user.id);
  
  // Use the new TwoFactorSetupModal
  const modal = new TwoFactorSetupModal(user, container, (updatedUser) => {
    console.log('✅ 2FA setup completed, updating profile display');
    updateProfileDisplay(container, updatedUser);
    showSuccess(container);
  });
  
  modal.show();
}
