import { Component } from '../types/Component';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalWins: number;
  totalLosses: number;
  totalTournaments: number;
  winRate: number;
  averagePosition: number;
  recentTournaments: {
    id: string;
    name: string;
    position: number;
    completedAt: string;
  }[];
}

export class Profile implements Component {
  private profile: UserProfile | null = null;
  private stats: UserStats | null = null;
  private isEditing: boolean = false;
  private isLoading: boolean = false;

  async render(): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = 'min-h-screen bg-gray-50 py-8';

    // Load user profile and stats
    await this.loadUserData();

    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Profile Header -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <div class="px-6 py-8">
            <div class="flex items-center space-x-6">
              <div class="relative">
                <img 
                  id="avatar-display"
                  src="${this.profile?.avatarUrl || '/default-avatar.png'}" 
                  alt="Profile Avatar"
                  class="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
                <button 
                  id="change-avatar-btn"
                  class="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                  ${this.isEditing ? '' : 'style="display: none;"'}
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
                <input 
                  type="file" 
                  id="avatar-file-input" 
                  accept="image/jpeg,image/png,image/webp" 
                  class="hidden"
                />
              </div>
              
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <h1 class="text-2xl font-bold text-gray-900">${this.profile?.displayName || this.profile?.username || 'Unknown User'}</h1>
                    <p class="text-gray-500">@${this.profile?.username || 'unknown'}</p>
                  </div>
                  <button 
                    id="edit-profile-btn"
                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    ${this.isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
                
                <div class="mt-4">
                  <p class="text-gray-700 ${this.isEditing ? 'hidden' : ''}" id="bio-display">
                    ${this.profile?.bio || 'No bio available'}
                  </p>
                  <textarea 
                    id="bio-input"
                    class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${this.isEditing ? '' : 'hidden'}"
                    placeholder="Tell us about yourself..."
                    maxlength="500"
                  >${this.profile?.bio || ''}</textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Form -->
        <div id="edit-form" class="bg-white rounded-lg shadow-sm mb-6 ${this.isEditing ? '' : 'hidden'}">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Edit Profile</h2>
          </div>
          <div class="px-6 py-4">
            <form id="profile-form" class="space-y-6">
              <div>
                <label for="display-name" class="block text-sm font-medium text-gray-700">Display Name</label>
                <input 
                  type="text" 
                  id="display-name"
                  value="${this.profile?.displayName || ''}"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your display name"
                  maxlength="50"
                />
              </div>

              <div>
                <label for="avatar-url" class="block text-sm font-medium text-gray-700">Avatar URL</label>
                <input 
                  type="url" 
                  id="avatar-url"
                  value="${this.profile?.avatarUrl || ''}"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div class="flex space-x-4">
                <button 
                  type="submit"
                  class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  ${this.isLoading ? 'disabled' : ''}
                >
                  ${this.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button"
                  id="cancel-edit-btn"
                  class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Tournament Statistics</h2>
          </div>
          <div class="px-6 py-4">
            ${this.renderStats()}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners(container);
    return container;
  }

  private renderStats(): string {
    if (!this.stats) {
      return '<p class="text-gray-500">No tournament statistics available</p>';
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">${this.stats.totalWins}</div>
          <div class="text-sm text-gray-500">Total Wins</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-red-600">${this.stats.totalLosses}</div>
          <div class="text-sm text-gray-500">Total Losses</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">${this.stats.totalTournaments}</div>
          <div class="text-sm text-gray-500">Tournaments Played</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">${(this.stats.winRate * 100).toFixed(1)}%</div>
          <div class="text-sm text-gray-500">Win Rate</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-600">${this.stats.averagePosition.toFixed(1)}</div>
          <div class="text-sm text-gray-500">Average Position</div>
        </div>
      </div>

      ${this.stats.recentTournaments.length > 0 ? `
        <div>
          <h3 class="text-md font-semibold text-gray-900 mb-4">Recent Tournaments</h3>
          <div class="space-y-2">
            ${this.stats.recentTournaments.map(tournament => `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <div class="font-medium text-gray-900">${tournament.name}</div>
                  <div class="text-sm text-gray-500">${new Date(tournament.completedAt).toLocaleDateString()}</div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-gray-900">#${tournament.position}</div>
                  <div class="text-sm text-gray-500">Position</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  private attachEventListeners(container: HTMLElement): void {
    const editButton = container.querySelector('#edit-profile-btn') as HTMLButtonElement;
    const cancelButton = container.querySelector('#cancel-edit-btn') as HTMLButtonElement;
    const profileForm = container.querySelector('#profile-form') as HTMLFormElement;
    const changeAvatarBtn = container.querySelector('#change-avatar-btn') as HTMLButtonElement;
    const avatarFileInput = container.querySelector('#avatar-file-input') as HTMLInputElement;

    editButton?.addEventListener('click', () => {
      this.isEditing = !this.isEditing;
      this.render().then(newContainer => {
        container.replaceWith(newContainer);
      });
    });

    cancelButton?.addEventListener('click', () => {
      this.isEditing = false;
      this.render().then(newContainer => {
        container.replaceWith(newContainer);
      });
    });

    profileForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleProfileUpdate(container);
    });

    // Avatar upload functionality
    changeAvatarBtn?.addEventListener('click', () => {
      avatarFileInput?.click();
    });

    avatarFileInput?.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await this.handleAvatarUpload(file, container);
      }
    });
  }

  private async loadUserData(): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      // Load user profile
      const profileResponse = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to load profile');
      }

      const profileData = await profileResponse.json();
      this.profile = profileData.user;

      // Load user stats
      const statsResponse = await fetch(`/api/tournament/users/${this.profile.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        this.stats = statsData.stats;
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  private async handleProfileUpdate(container: HTMLElement): Promise<void> {
    const form = container.querySelector('#profile-form') as HTMLFormElement;
    const displayNameInput = form.querySelector('#display-name') as HTMLInputElement;
    const avatarUrlInput = form.querySelector('#avatar-url') as HTMLInputElement;
    const bioInput = container.querySelector('#bio-input') as HTMLTextAreaElement;

    this.isLoading = true;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: displayNameInput.value.trim() || null,
          avatarUrl: avatarUrlInput.value.trim() || null,
          bio: bioInput.value.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      this.profile = data.user;
      this.isEditing = false;
      
      // Re-render the component
      const newContainer = await this.render();
      container.replaceWith(newContainer);

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  private async handleAvatarUpload(file: File, container: HTMLElement): Promise<void> {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      this.showErrorMessage('File size too large. Please select an image under 5MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.showErrorMessage('Invalid file type. Please select a JPEG, PNG, or WebP image.');
      return;
    }

    try {
      this.showLoadingMessage('Uploading avatar...');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/auth/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload avatar');
      }

      const data = await response.json();
      this.profile = data.user;
      
      // Update avatar in the UI immediately
      const avatarImg = container.querySelector('#profile-avatar') as HTMLImageElement;
      if (avatarImg) {
        avatarImg.src = data.avatarUrl;
      }
      
      this.showSuccessMessage('Avatar updated successfully!');
      
      // Re-render the component to reflect changes
      const newContainer = await this.render();
      container.replaceWith(newContainer);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      this.showErrorMessage('Failed to upload avatar. Please try again.');
    }
  }

  private showErrorMessage(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  private showSuccessMessage(message: string): void {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  private showLoadingMessage(message: string): void {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'avatar-loading';
    loadingDiv.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    loadingDiv.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(loadingDiv);
    
    // Remove loading message after 10 seconds as fallback
    setTimeout(() => {
      const existingDiv = document.getElementById('avatar-loading');
      if (existingDiv) {
        existingDiv.remove();
      }
    }, 10000);
  }

  destroy(): void {
    // Cleanup if needed
  }
}

export default function createProfile(): HTMLElement {
  const profile = new Profile();
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-50';
  
  // Load profile data asynchronously and update the container
  profile.render().then(element => {
    container.replaceWith(element);
  });
  
  return container;
}
