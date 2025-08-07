import { authApi } from '../api/auth';

interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export class FriendsList {
  private container: HTMLElement;
  private friends: Friend[] = [];
  private pollInterval: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async mount(): Promise<void> {
    this.render();
    this.setupEventListeners();
    await this.loadFriends();
    this.startPolling();
  }

  unmount(): void {
    this.stopPolling();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gradient font-retro">Friends</h3>
          <div class="text-xs text-neon-cyan/60 font-mono border border-neon-cyan/30 px-3 py-1 clip-cyber-button" id="friendsStatus">
            Loading...
          </div>
        </div>

        <!-- Add Friend Section -->
        <div class="mb-6">
          <div class="flex space-x-2">
            <input
              type="text"
              id="friendUsername"
              placeholder="Enter username..."
              class="flex-1 px-3 py-2 bg-secondary-900/50 border border-neon-cyan/30 text-neon-cyan placeholder-neon-cyan/50 font-mono text-sm clip-cyber-button focus:outline-none focus:border-neon-pink/50"
            />
            <button
              id="addFriendBtn"
              class="btn btn-primary px-4 py-2 text-sm"
            >
              ADD
            </button>
          </div>
          <div id="addFriendError" class="text-xs text-red-400 mt-2 font-mono hidden"></div>
        </div>

        <!-- Friends List -->
        <div class="space-y-3" id="friendsList">
          <div class="text-center text-neon-cyan/50 font-mono text-sm py-6">
            No friends added yet
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    const addFriendBtn = this.container.querySelector('#addFriendBtn') as HTMLButtonElement;
    const friendUsernameInput = this.container.querySelector('#friendUsername') as HTMLInputElement;
    const addFriendError = this.container.querySelector('#addFriendError') as HTMLElement;

    // Add friend button click
    addFriendBtn?.addEventListener('click', async () => {
      const username = friendUsernameInput.value.trim();
      if (!username) return;

      addFriendBtn.disabled = true;
      addFriendBtn.textContent = 'ADDING...';
      addFriendError.classList.add('hidden');

      try {
        const result = await authApi.addFriend(username);
        
        if (result.success) {
          friendUsernameInput.value = '';
          await this.loadFriends(); // Refresh friends list
        } else {
          addFriendError.textContent = result.error || 'Failed to add friend';
          addFriendError.classList.remove('hidden');
        }
      } catch (error) {
        console.error('Error adding friend:', error);
        addFriendError.textContent = 'Network error. Please try again.';
        addFriendError.classList.remove('hidden');
      } finally {
        addFriendBtn.disabled = false;
        addFriendBtn.textContent = 'ADD';
      }
    });

    // Enter key to add friend
    friendUsernameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addFriendBtn?.click();
      }
    });
  }

  private async loadFriends(): Promise<void> {
    try {
      const result = await authApi.getFriends();
      
      if (result.success) {
        this.friends = result.friends;
        this.renderFriends();
        this.updateStatus(`${this.friends.length} friends`);
      } else {
        console.error('Failed to load friends');
        this.updateStatus('Error loading');
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      this.updateStatus('Network error');
    }
  }

  private renderFriends(): void {
    const friendsList = this.container.querySelector('#friendsList') as HTMLElement;
    
    if (this.friends.length === 0) {
      friendsList.innerHTML = `
        <div class="text-center text-neon-cyan/50 font-mono text-sm py-6">
          No friends added yet
        </div>
      `;
      return;
    }

    friendsList.innerHTML = this.friends.map(friend => `
      <div class="flex items-center justify-between p-4 bg-secondary-900/20 backdrop-blur-lg border border-neon-cyan/20 clip-cyber-button hover:border-neon-pink/30 transition-colors">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <div class="w-10 h-10 clip-cyberpunk bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 p-0.5">
              <img src="${friend.avatarUrl || '/assets/wishes.png'}" alt="Avatar" 
                   class="w-full h-full object-cover clip-cyberpunk" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-3 h-3 ${friend.isOnline ? 'bg-neon-green' : 'bg-red-500'} rounded-full border border-secondary-900 animate-glow-pulse"></div>
          </div>
          <div>
            <div class="text-neon-cyan font-retro text-sm font-medium">${friend.displayName}</div>
            <div class="text-neon-pink/70 font-mono text-xs">@${friend.username}</div>
            ${friend.lastSeen ? `<div class="text-neon-cyan/50 font-mono text-xs">${this.formatLastSeen(friend.lastSeen)}</div>` : ''}
          </div>
        </div>
        <button 
          onclick="removeFriend('${friend.id}')"
          class="text-neon-pink/70 hover:text-red-400 transition-colors text-sm px-3 py-1 hover:bg-red-500/10 clip-cyber-button"
          title="Remove friend"
        >
          ✕
        </button>
      </div>
    `).join('');
  }

  private getAvatarUrl(avatarUrl?: string): string {
    if (!avatarUrl) {
      return '/assets/wishes.png';
    }
    
    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    
    const authServiceUrl = `https://${window.location.hostname}:3001`;
    const timestamp = new Date().getTime();
    const separator = avatarUrl.includes('?') ? '&' : '?';
    return `${authServiceUrl}${avatarUrl}${separator}t=${timestamp}`;
  }

  private formatLastSeen(lastSeen: string): string {
    // Implement last seen formatting logic here
    return lastSeen;
  }

  private updateStatus(status: string): void {
    const statusElement = this.container.querySelector('#friendsStatus') as HTMLElement;
    if (statusElement) {
      statusElement.textContent = status;
    }
  }

  private startPolling(): void {
    // Poll every 15 seconds as requested
    this.pollInterval = window.setInterval(() => {
      this.loadFriends();
    }, 15000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Public method to remove friend (called from global scope)
  async removeFriend(friendId: string): Promise<void> {
    try {
      const result = await authApi.removeFriend(friendId);
      
      if (result.success) {
        await this.loadFriends(); // Refresh friends list
      } else {
        console.error('Failed to remove friend:', result.error);
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  }
}

// Global function for remove friend (accessible from onclick)
(window as any).removeFriend = async (friendId: string) => {
  // Find the FriendsList instance and call removeFriend
  const friendsListInstance = (window as any).friendsListInstance;
  if (friendsListInstance) {
    await friendsListInstance.removeFriend(friendId);
  }
};
