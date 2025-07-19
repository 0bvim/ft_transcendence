import { authApi, User } from '../api/auth';

// Utility function to construct avatar URL
function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    return '/default-avatar.png';
  }
  
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  const authServiceUrl = `http://${window.location.hostname}:3001`;
  return `${authServiceUrl}${avatarUrl}`;
}

export default function Dashboard(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-secondary-50';

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
    <!-- Navigation -->
    <nav class="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
      <div class="container-fluid">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-glow">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
              </svg>
            </div>
            <h1 class="text-xl font-bold text-gradient">ft_transcendence</h1>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-1">
            <a href="/dashboard" data-link class="nav-link active">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3z"></path>
              </svg>
              Dashboard
            </a>
            <a href="/tournament" data-link class="nav-link">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              Tournaments
            </a>
            <a href="/profile" data-link class="nav-link">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Profile
            </a>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-3">
            <div class="hidden sm:block text-right">
              <p class="text-sm font-medium text-secondary-900">${user.displayName || user.username}</p>
              <p class="text-xs text-secondary-500">@${user.username}</p>
            </div>
            <div class="avatar avatar-md">
              <img src="${getAvatarUrl(user.avatarUrl)}" alt="Avatar" class="avatar-img border-2 border-white shadow-soft" />
            </div>
            <button id="logoutButton" class="btn btn-ghost btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container-fluid py-8 space-y-8">
      <!-- Welcome Section -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gradient mb-2">
          Welcome back, ${user.displayName || user.username}!
        </h1>
        <p class="text-secondary-600">Ready to play some pong?</p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button class="card-hover p-6 text-center group">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-secondary-900 mb-2">Quick Match</h3>
          <p class="text-sm text-secondary-600">Start a game right now</p>
        </button>

        <button class="card-hover p-6 text-center group">
          <div class="w-12 h-12 bg-gradient-to-br from-success-500 to-success-700 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-secondary-900 mb-2">Join Tournament</h3>
          <p class="text-sm text-secondary-600">Compete with others</p>
        </button>

        <button class="card-hover p-6 text-center group">
          <div class="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-700 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-secondary-900 mb-2">Create Tournament</h3>
          <p class="text-sm text-secondary-600">Host your own event</p>
        </button>

        <button class="card-hover p-6 text-center group">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-secondary-900 mb-2">Statistics</h3>
          <p class="text-sm text-secondary-600">View your performance</p>
        </button>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Stats -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Performance Overview -->
          <div class="card-gradient p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-secondary-900">Performance Overview</h2>
              <select class="btn btn-secondary btn-sm">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>All time</option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center p-4 bg-secondary-50/50 rounded-xl">
                <div class="text-3xl font-bold text-primary-600 mb-1" id="totalGames">0</div>
                <div class="text-sm text-secondary-600">Games Played</div>
                <div class="text-xs text-success-600 mt-1">+2 this week</div>
              </div>
              <div class="text-center p-4 bg-secondary-50/50 rounded-xl">
                <div class="text-3xl font-bold text-success-600 mb-1" id="winRate">0%</div>
                <div class="text-sm text-secondary-600">Win Rate</div>
                <div class="text-xs text-success-600 mt-1">+5% this week</div>
              </div>
              <div class="text-center p-4 bg-secondary-50/50 rounded-xl">
                <div class="text-3xl font-bold text-warning-600 mb-1" id="currentStreak">0</div>
                <div class="text-sm text-secondary-600">Current Streak</div>
                <div class="text-xs text-secondary-500 mt-1">Personal best: 7</div>
              </div>
            </div>
          </div>

          <!-- Recent Matches -->
          <div class="card-gradient p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-secondary-900">Recent Matches</h2>
              <a href="/matches" data-link class="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                View all
              </a>
            </div>

            <div class="space-y-4" id="recentMatches">
              <!-- Match items will be populated here -->
              <div class="flex items-center justify-between p-4 bg-secondary-50/50 rounded-xl">
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                  <div>
                    <p class="font-medium text-secondary-900">vs. AI Bot</p>
                    <p class="text-sm text-secondary-600">2 hours ago</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-success-600">Win</div>
                  <div class="text-sm text-secondary-600">11-7</div>
                </div>
              </div>

              <div class="flex items-center justify-between p-4 bg-secondary-50/50 rounded-xl">
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-danger-500 rounded-full"></div>
                  <div>
                    <p class="font-medium text-secondary-900">vs. alice_gamer</p>
                    <p class="text-sm text-secondary-600">1 day ago</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-danger-600">Loss</div>
                  <div class="text-sm text-secondary-600">8-11</div>
                </div>
              </div>

              <div class="flex items-center justify-between p-4 bg-secondary-50/50 rounded-xl">
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-success-500 rounded-full"></div>
                  <div>
                    <p class="font-medium text-secondary-900">vs. bob_player</p>
                    <p class="text-sm text-secondary-600">2 days ago</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-success-600">Win</div>
                  <div class="text-sm text-secondary-600">11-5</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Profile Card -->
          <div class="card-gradient p-6 text-center">
            <div class="avatar avatar-xl mx-auto mb-4">
              <img src="${getAvatarUrl(user.avatarUrl)}" alt="Avatar" class="avatar-img border-4 border-white shadow-medium" />
            </div>
            <h3 class="text-lg font-semibold text-secondary-900 mb-1">${user.displayName || user.username}</h3>
            <p class="text-secondary-600 mb-2">@${user.username}</p>
            <div class="flex items-center justify-center space-x-2 mb-4">
              <span class="status-dot status-online"></span>
              <span class="text-sm text-secondary-600">Online</span>
            </div>
            <a href="/profile" data-link class="btn btn-primary btn-sm w-full">
              Edit Profile
            </a>
          </div>

          <!-- Active Tournaments -->
          <div class="card-gradient p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Active Tournaments</h3>
            <div class="space-y-3" id="activeTournaments">
              <div class="p-3 bg-secondary-50/50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <p class="font-medium text-secondary-900">Summer Championship</p>
                  <span class="badge badge-warning">Round 2</span>
                </div>
                <p class="text-xs text-secondary-600">Next match: Tomorrow 3:00 PM</p>
              </div>
              
              <div class="text-center py-4 text-secondary-500">
                <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <p class="text-sm">Join more tournaments</p>
              </div>
            </div>
          </div>

          <!-- Security Status -->
          <div class="card-gradient p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Security Status</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-${user.twoFactorEnabled ? 'success' : 'warning'}-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span class="text-sm text-secondary-900">Two-Factor Auth</span>
                </div>
                <span class="badge badge-${user.twoFactorEnabled ? 'success' : 'warning'}">
                  ${user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-sm text-secondary-900">Account Verified</span>
                </div>
                <span class="badge badge-success">Active</span>
              </div>

              ${!user.twoFactorEnabled ? `
              <div class="mt-3 p-3 bg-warning-50 rounded-lg border border-warning-200">
                <p class="text-xs text-warning-700 mb-2">Enhance your security</p>
                <a href="/profile" data-link class="text-xs text-warning-600 hover:text-warning-700 underline">
                  Enable 2FA
                </a>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="card-gradient p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Quick Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-secondary-600">Rank</span>
                <span class="text-sm font-medium text-secondary-900">#42</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-600">Total Tournaments</span>
                <span class="text-sm font-medium text-secondary-900">3</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-600">Best Position</span>
                <span class="text-sm font-medium text-secondary-900">2nd</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-600">Member Since</span>
                <span class="text-sm font-medium text-secondary-900">${new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  // Setup event listeners
  setupEventListeners(container);

  return container;
}

function setupEventListeners(container: HTMLElement) {
  // Logout functionality
  const logoutButton = container.querySelector('#logoutButton') as HTMLButtonElement;
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  });

  // Quick action buttons
  const quickMatchBtn = container.querySelector('.card-hover:nth-child(1)') as HTMLElement;
  const joinTournamentBtn = container.querySelector('.card-hover:nth-child(2)') as HTMLElement;
  const createTournamentBtn = container.querySelector('.card-hover:nth-child(3)') as HTMLElement;
  const statisticsBtn = container.querySelector('.card-hover:nth-child(4)') as HTMLElement;

  quickMatchBtn.addEventListener('click', () => {
    // Navigate to game
    window.location.href = '/game';
  });

  joinTournamentBtn.addEventListener('click', () => {
    window.location.href = '/tournament';
  });

  createTournamentBtn.addEventListener('click', () => {
    window.location.href = '/tournament/create';
  });

  statisticsBtn.addEventListener('click', () => {
    window.location.href = '/profile#stats';
  });

  // Load user stats
  loadUserStats(container);
}

async function loadUserStats(container: HTMLElement) {
  // This would typically load from an API
  // For now, we'll simulate some data
  const totalGamesEl = container.querySelector('#totalGames') as HTMLElement;
  const winRateEl = container.querySelector('#winRate') as HTMLElement;
  const currentStreakEl = container.querySelector('#currentStreak') as HTMLElement;

  // Simulate loading stats
  totalGamesEl.textContent = '12';
  winRateEl.textContent = '67%';
  currentStreakEl.textContent = '3';
} 