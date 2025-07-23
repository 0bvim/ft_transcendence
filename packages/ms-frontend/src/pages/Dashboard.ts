import { authApi, User } from '../api/auth';
import { tournamentApi } from '../api/tournament';

// Utility function to construct avatar URL
function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    // Use the wishes.png image from assets folder
    return '/assets/wishes.png';
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

  // Get user from localStorage first (for initial render)
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

  // Render initial content with localStorage data
  renderDashboardContent(container, user);

  // Setup event listeners
  setupEventListeners(container);

  // Load real data from APIs
  loadRealData(container, user);

  return container;
}

async function loadRealData(container: HTMLElement, user: User) {
  try {
    // Load user stats and tournaments in parallel
    await Promise.all([
      loadUserStats(container),
      loadRecentTournaments(container, user.id),
      loadActiveTournaments(container, user.id),
      refreshUserData(container)
    ]);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

async function refreshUserData(container: HTMLElement) {
  try {
    const { user } = await authApi.getProfile();
    // Update localStorage with fresh data
    localStorage.setItem('user', JSON.stringify(user));
    // Re-render with fresh data
    renderDashboardContent(container, user);
    // Re-setup event listeners after re-render
    setupEventListeners(container);
  } catch (error) {
    console.error('Failed to refresh user data:', error);
    // If API call fails, keep using localStorage data
  }
}

function renderDashboardContent(container: HTMLElement, user: User) {
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
          Welcome back, ${user.displayName || user.username}
        </h1>
        <p class="text-secondary-600">Ready to play some pong?</p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button class="card-hover p-6 text-center group" id="quickMatchBtn">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-secondary-900 mb-2">Quick Match</h3>
          <p class="text-sm text-secondary-600">Start a game right now</p>
        </button>

        <button class="card-hover p-6 text-center group" id="joinTournamentBtn">
          <div class="w-12 h-12 bg-gradient-to-br from-success-500 to-success-700 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-secondary-900 mb-2">Join Tournament</h3>
          <p class="text-sm text-secondary-600">Compete with others</p>
        </button>

        <button class="card-hover p-6 text-center group" id="createTournamentBtn">
          <div class="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-700 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h3 class="font-semibold text-secondary-900 mb-2">Create Tournament</h3>
          <p class="text-sm text-secondary-600">Host your own event</p>
        </button>

        <button class="card-hover p-6 text-center group" id="statisticsBtn">
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
              <div class="text-xs text-secondary-500" id="statsLastUpdated">Loading...</div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center p-4 bg-secondary-50/50 rounded-xl">
                <div class="text-3xl font-bold text-primary-600 mb-1" id="totalGames">
                  <div class="animate-pulse bg-secondary-200 h-8 w-16 mx-auto rounded"></div>
                </div>
                <div class="text-sm text-secondary-600">Games Played</div>
              </div>
              <div class="text-center p-4 bg-secondary-50/50 rounded-xl">
                <div class="text-3xl font-bold text-success-600 mb-1" id="winRate">
                  <div class="animate-pulse bg-secondary-200 h-8 w-16 mx-auto rounded"></div>
                </div>
                <div class="text-sm text-secondary-600">Win Rate</div>
              </div>
              <div class="text-center p-4 bg-secondary-50/50 rounded-xl">
                <div class="text-3xl font-bold text-warning-600 mb-1" id="totalTournaments">
                  <div class="animate-pulse bg-secondary-200 h-8 w-16 mx-auto rounded"></div>
                </div>
                <div class="text-sm text-secondary-600">Tournaments</div>
              </div>
            </div>
          </div>

          <!-- Recent Tournaments -->
          <div class="card-gradient p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-secondary-900">Recent Tournaments</h2>
              <a href="/tournament" data-link class="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                View all
              </a>
            </div>

            <div class="space-y-4" id="recentTournaments">
              <!-- Loading state -->
              <div class="flex items-center justify-between p-4 bg-secondary-50/50 rounded-xl animate-pulse">
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-secondary-300 rounded-full"></div>
                  <div>
                    <div class="bg-secondary-300 h-4 w-32 rounded mb-1"></div>
                    <div class="bg-secondary-200 h-3 w-20 rounded"></div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="bg-secondary-300 h-4 w-16 rounded mb-1"></div>
                  <div class="bg-secondary-200 h-3 w-12 rounded"></div>
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
              <!-- Loading state -->
              <div class="animate-pulse">
                <div class="bg-secondary-200 h-16 rounded-lg mb-2"></div>
                <div class="bg-secondary-100 h-12 rounded-lg"></div>
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

          <!-- User Stats -->
          <div class="card-gradient p-6">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">Quick Stats</h3>
            <div class="space-y-3" id="quickStats">
              <!-- Loading states -->
              <div class="flex justify-between">
                <span class="text-sm text-secondary-600">Rank</span>
                <div class="bg-secondary-200 h-4 w-8 rounded animate-pulse"></div>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-600">Tournaments Won</span>
                <div class="bg-secondary-200 h-4 w-6 rounded animate-pulse"></div>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-secondary-600">Best Position</span>
                <div class="bg-secondary-200 h-4 w-10 rounded animate-pulse"></div>
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
}

async function setupEventListeners(container: HTMLElement) {
  // Logout functionality
  const logoutButton = container.querySelector('#logoutButton') as HTMLButtonElement;
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  });

  // Quick action buttons
  const quickMatchBtn = container.querySelector('#quickMatchBtn') as HTMLElement;
  const joinTournamentBtn = container.querySelector('#joinTournamentBtn') as HTMLElement;
  const createTournamentBtn = container.querySelector('#createTournamentBtn') as HTMLElement;
  const statisticsBtn = container.querySelector('#statisticsBtn') as HTMLElement;

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
}

async function loadUserStats(container: HTMLElement) {
  try {
    // Use existing user data and tournament API to get some stats
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await tournamentApi.getTournaments({ limit: 50 });
    const tournaments = response.tournaments || [];
    
    // Calculate basic stats from available data
    const userTournaments = tournaments.filter(t => t.createdBy === user.id);
    const totalTournaments = userTournaments.length;
    
    // Update UI with calculated stats
    const totalGamesEl = container.querySelector('#totalGames') as HTMLElement;
    const winRateEl = container.querySelector('#winRate') as HTMLElement;
    const totalTournamentsEl = container.querySelector('#totalTournaments') as HTMLElement;
    const statsLastUpdatedEl = container.querySelector('#statsLastUpdated') as HTMLElement;

    if (totalGamesEl) totalGamesEl.textContent = totalTournaments.toString();
    if (winRateEl) winRateEl.textContent = '0%'; // Will be calculated when match system is implemented
    if (totalTournamentsEl) totalTournamentsEl.textContent = totalTournaments.toString();
    if (statsLastUpdatedEl) statsLastUpdatedEl.textContent = 'Updated: ' + new Date().toLocaleTimeString();

  } catch (error) {
    console.error('Failed to load user stats:', error);
    // Set fallback values
    const totalGamesEl = container.querySelector('#totalGames') as HTMLElement;
    const winRateEl = container.querySelector('#winRate') as HTMLElement;
    const totalTournamentsEl = container.querySelector('#totalTournaments') as HTMLElement;
    
    if (totalGamesEl) totalGamesEl.textContent = '0';
    if (winRateEl) winRateEl.textContent = '0%';
    if (totalTournamentsEl) totalTournamentsEl.textContent = '0';
  }
}

async function loadRecentTournaments(container: HTMLElement, userId: string) {
  try {
    const response = await tournamentApi.getTournaments({ limit: 10 });
    const tournaments = response.tournaments || [];
    const recentTournamentsEl = container.querySelector('#recentTournaments') as HTMLElement;
    
    if (!recentTournamentsEl) return;
    
    recentTournamentsEl.innerHTML = ''; // Clear loading state

    if (tournaments.length === 0) {
      recentTournamentsEl.innerHTML = `
        <div class="text-center py-4 text-secondary-500">
          <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <p class="text-sm">No tournaments found. Create one!</p>
        </div>
      `;
    } else {
      // Show recent tournaments (limit to 3)
      tournaments.slice(0, 3).forEach((tournament: any) => {
        const statusColor = tournament.status === 'ACTIVE' ? 'success' : 
                           tournament.status === 'WAITING' ? 'warning' : 'secondary';
        const statusDot = tournament.status === 'ACTIVE' ? 'bg-success-500' : 
                         tournament.status === 'WAITING' ? 'bg-warning-500' : 'bg-secondary-500';
        
        recentTournamentsEl.innerHTML += `
          <div class="flex items-center justify-between p-4 bg-secondary-50/50 rounded-xl">
            <div class="flex items-center space-x-3">
              <div class="w-2 h-2 ${statusDot} rounded-full"></div>
              <div>
                <p class="font-medium text-secondary-900">${tournament.name}</p>
                <p class="text-sm text-secondary-600">${new Date(tournament.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-${statusColor}-600">${tournament.status}</div>
              <div class="text-sm text-secondary-600">${tournament.currentPlayers}/${tournament.maxPlayers}</div>
            </div>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Failed to load recent tournaments:', error);
    const recentTournamentsEl = container.querySelector('#recentTournaments') as HTMLElement;
    if (recentTournamentsEl) {
      recentTournamentsEl.innerHTML = `
        <div class="text-center py-4 text-red-500">
          <p class="text-sm">Failed to load tournaments</p>
        </div>
      `;
    }
  }
}

async function loadActiveTournaments(container: HTMLElement, userId: string) {
  try {
    const response = await tournamentApi.getTournaments({ status: 'ACTIVE', limit: 5 });
    const tournaments = response.tournaments || [];
    const activeTournamentsEl = container.querySelector('#activeTournaments') as HTMLElement;
    
    if (!activeTournamentsEl) return;
    
    activeTournamentsEl.innerHTML = ''; // Clear loading state

    if (tournaments.length === 0) {
      activeTournamentsEl.innerHTML = `
        <div class="text-center py-4 text-secondary-500">
          <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <p class="text-sm">No active tournaments</p>
        </div>
      `;
    } else {
      // Show active tournaments
      tournaments.slice(0, 2).forEach((tournament: any) => {
        activeTournamentsEl.innerHTML += `
          <div class="p-3 bg-secondary-50/50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <p class="font-medium text-secondary-900">${tournament.name}</p>
              <span class="badge badge-success">Active</span>
            </div>
            <p class="text-xs text-secondary-600">Players: ${tournament.currentPlayers}/${tournament.maxPlayers}</p>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Failed to load active tournaments:', error);
    const activeTournamentsEl = container.querySelector('#activeTournaments') as HTMLElement;
    if (activeTournamentsEl) {
      activeTournamentsEl.innerHTML = `
        <div class="text-center py-4 text-red-500">
          <p class="text-sm">Failed to load active tournaments</p>
        </div>
      `;
    }
  }
} 