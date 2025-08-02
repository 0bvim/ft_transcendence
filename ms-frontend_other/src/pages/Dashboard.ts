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
  
  // Use HTTPS instead of HTTP since the auth service uses SSL certificates
  const authServiceUrl = `https://${window.location.hostname}:3001`;
  // Add cache busting parameter to prevent browser caching old avatars
  const timestamp = new Date().getTime();
  const separator = avatarUrl.includes('?') ? '&' : '?';
  return `${authServiceUrl}${avatarUrl}${separator}t=${timestamp}`;
}

export default function Dashboard(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen relative overflow-hidden';

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
    <!-- Synthwave Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Animated Grid Background -->
      <div class="absolute inset-0 synthwave-grid opacity-15"></div>
      
      <!-- Neon Orbs -->
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%); animation-delay: -2s;"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%); animation-delay: -4s;"></div>
      <div class="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(128,0,255,0.1) 0%, transparent 70%); animation-delay: -3s;"></div>
      
      <!-- Horizon Line -->
      <div class="horizon-line"></div>
      
      <!-- Scan Lines -->
      <div class="scan-line"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-20 bg-secondary-900/20 backdrop-blur-lg border-b border-neon-pink/20 sticky top-0">
      <div class="container-fluid">
        <div class="flex justify-between items-center h-16">
          <!-- Logo (without icon) -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gradient font-retro tracking-wider">
              FT_TRANSCENDENCE
            </h1>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-1">
            <a href="/dashboard" data-link class="nav-link active">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3z"></path>
              </svg>
              Dashboard
            </a>
            <a href="/game?section=tournament" data-link class="nav-link">
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
          <div class="flex items-center space-x-4">
            <div class="hidden sm:block text-right">
              <p class="text-sm font-medium text-neon-cyan font-retro">${user.displayName || user.username}</p>
              <p class="text-xs text-neon-pink/70 font-mono">@${user.username}</p>
            </div>
            <div class="relative">
              <div class="w-10 h-10 clip-cyberpunk bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 p-0.5">
                <img id="navAvatar" src="${getAvatarUrl(user.avatarUrl)}" alt="Avatar" 
                     class="w-full h-full object-cover clip-cyberpunk" />
              </div>
              <div class="absolute inset-0 w-10 h-10 clip-cyberpunk border border-neon-pink animate-glow-pulse"></div>
            </div>
            <button id="logoutButton" class="btn btn-ghost p-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 container-fluid py-12 space-y-12">
      <!-- Welcome Section -->
      <div class="text-center animate-fade-in">
        <h1 class="text-5xl font-bold text-gradient mb-4 font-retro tracking-wider">
          <span class="text-neon-cyan">Welcome back,</span> 
          <span class="text-neon-pink">${user.displayName || user.username}</span>
        </h1>
        <p class="text-neon-cyan/80 font-mono text-lg">
          <span class="text-neon-pink">$</span> Ready to play some pong?
          <span class="animate-pulse">_</span>
        </p>
      </div>

      <!-- Quick Actions (without Statistics) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-slide-up">
        <button class="card p-8 text-center group hover:scale-105 transition-all duration-500" id="quickMatchBtn">
          <div class="w-16 h-16 bg-gradient-to-br from-neon-pink to-neon-purple clip-cyberpunk mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="font-bold text-neon-cyan mb-3 font-retro text-lg">QUICK MATCH</h3>
          <p class="text-sm text-neon-cyan/70 font-mono">Start a game right now</p>
        </button>

        <button class="card p-8 text-center group hover:scale-105 transition-all duration-500" id="joinTournamentBtn">
          <div class="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan clip-cyberpunk mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
          </div>
          <h3 class="font-bold text-neon-cyan mb-3 font-retro text-lg">JOIN TOURNAMENT</h3>
          <p class="text-sm text-neon-cyan/70 font-mono">Compete with others</p>
        </button>

        <button class="card p-8 text-center group hover:scale-105 transition-all duration-500" id="createTournamentBtn">
          <div class="w-16 h-16 bg-gradient-to-br from-warning-500 to-neon-purple clip-cyberpunk mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h3 class="font-bold text-neon-cyan mb-3 font-retro text-lg">CREATE TOURNAMENT</h3>
          <p class="text-sm text-neon-cyan/70 font-mono">Host your own event</p>
        </button>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style="animation-delay: 0.2s;">
        <!-- Main Stats -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Performance Overview -->
          <div class="card p-8">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-bold text-gradient font-retro">Performance Overview</h2>
              <div class="text-xs text-neon-cyan/60 font-mono border border-neon-cyan/30 px-3 py-1 clip-cyber-button" id="statsLastUpdated">Loading...</div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center p-6 bg-secondary-900/30 backdrop-blur-lg border border-neon-pink/30 clip-cyber-button">
                <div class="text-4xl font-bold text-neon-pink mb-2 font-retro" id="totalGames">
                  <div class="animate-pulse bg-neon-pink/20 h-10 w-20 mx-auto rounded clip-cyber-button"></div>
                </div>
                <div class="text-sm text-neon-cyan/70 font-mono uppercase tracking-wider">Games Played</div>
              </div>
              <div class="text-center p-6 bg-secondary-900/30 backdrop-blur-lg border border-neon-green/30 clip-cyber-button">
                <div class="text-4xl font-bold text-neon-green mb-2 font-retro" id="winRate">
                  <div class="animate-pulse bg-neon-green/20 h-10 w-20 mx-auto rounded clip-cyber-button"></div>
                </div>
                <div class="text-sm text-neon-cyan/70 font-mono uppercase tracking-wider">Win Rate</div>
              </div>
              <div class="text-center p-6 bg-secondary-900/30 backdrop-blur-lg border border-warning-500/30 clip-cyber-button">
                <div class="text-4xl font-bold text-warning-500 mb-2 font-retro" id="totalTournaments">
                  <div class="animate-pulse bg-warning-500/20 h-10 w-20 mx-auto rounded clip-cyber-button"></div>
                </div>
                <div class="text-sm text-neon-cyan/70 font-mono uppercase tracking-wider">Tournaments</div>
              </div>
            </div>
          </div>

          <!-- Recent Tournaments -->
          <div class="card p-8">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-bold text-gradient font-retro">Recent Tournaments</h2>
              <a href="/game?section=tournament" data-link class="text-sm text-neon-pink hover:text-neon-cyan transition-colors font-mono uppercase tracking-wider">
                View all >>
              </a>
            </div>

            <div class="space-y-4" id="recentTournaments">
              <!-- Loading state -->
              <div class="flex items-center justify-between p-6 bg-secondary-900/20 backdrop-blur-lg border border-neon-cyan/20 clip-cyber-button animate-pulse">
                <div class="flex items-center space-x-4">
                  <div class="w-3 h-3 bg-neon-cyan rounded-full animate-glow-pulse"></div>
                  <div>
                    <div class="bg-neon-cyan/20 h-5 w-40 rounded mb-2 clip-cyber-button"></div>
                    <div class="bg-neon-pink/20 h-4 w-24 rounded clip-cyber-button"></div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="bg-neon-green/20 h-5 w-20 rounded mb-2 clip-cyber-button"></div>
                  <div class="bg-neon-cyan/20 h-4 w-16 rounded clip-cyber-button"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Profile Card -->
          <div class="card p-8 text-center">
            <div class="relative mx-auto mb-6">
              <div class="w-24 h-24 clip-cyberpunk bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 p-1 mx-auto">
                <img id="profileAvatar" src="${getAvatarUrl(user.avatarUrl)}" alt="Avatar" 
                     class="w-full h-full object-cover clip-cyberpunk" />
              </div>
              <div class="absolute inset-0 w-24 h-24 clip-cyberpunk border-2 border-neon-pink animate-glow-pulse mx-auto"></div>
            </div>
            <h3 class="text-xl font-bold text-neon-cyan mb-2 font-retro">${user.displayName || user.username}</h3>
            <p class="text-neon-pink/70 mb-4 font-mono">@${user.username}</p>
            <div class="flex items-center justify-center space-x-2 mb-6">
              <span class="w-2 h-2 bg-neon-green rounded-full animate-glow-pulse"></span>
              <span class="text-sm text-neon-green font-mono uppercase">Online</span>
            </div>
            <a href="/profile" data-link class="btn btn-primary w-full">
              EDIT_PROFILE.EXE
            </a>
          </div>

          <!-- Active Tournaments -->
          <div class="card p-8">
            <h3 class="text-xl font-bold text-gradient mb-6 font-retro">Active Tournaments</h3>
            <div class="space-y-4" id="activeTournaments">
              <!-- Loading state -->
              <div class="animate-pulse space-y-3">
                <div class="bg-neon-pink/10 h-16 rounded-lg clip-cyber-button border border-neon-pink/20"></div>
                <div class="bg-neon-cyan/10 h-12 rounded-lg clip-cyber-button border border-neon-cyan/20"></div>
              </div>
            </div>
          </div>

          <!-- Security Status -->
          <div class="card p-8">
            <h3 class="text-xl font-bold text-gradient mb-6 font-retro">Security Status</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-secondary-900/20 backdrop-blur-lg border border-${user.twoFactorEnabled ? 'neon-green' : 'warning-500'}/30 clip-cyber-button">
                <div class="flex items-center space-x-3">
                  <svg class="w-5 h-5 text-${user.twoFactorEnabled ? 'neon-green' : 'warning-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span class="text-sm text-neon-cyan font-mono">Two-Factor Auth</span>
                </div>
                <span class="badge badge-${user.twoFactorEnabled ? 'success' : 'warning'}">
                  ${user.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-secondary-900/20 backdrop-blur-lg border border-neon-green/30 clip-cyber-button">
                <div class="flex items-center space-x-3">
                  <svg class="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-sm text-neon-cyan font-mono">Account Verified</span>
                </div>
                <span class="badge badge-success">ACTIVE</span>
              </div>

              ${!user.twoFactorEnabled ? `
              <div class="p-4 bg-warning-500/10 border border-warning-500/30 clip-cyber-button">
                <p class="text-xs text-warning-500 mb-2 font-mono uppercase">⚠ ENHANCE SECURITY</p>
                <a href="/profile" data-link class="text-xs text-neon-cyan hover:text-neon-pink transition-colors font-mono uppercase underline">
                  Enable 2FA >>
                </a>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- User Stats -->
          <div class="card p-8">
            <h3 class="text-xl font-bold text-gradient mb-6 font-retro">Quick Stats</h3>
            <div class="space-y-4" id="quickStats">
              <!-- Loading states -->
              <div class="flex justify-between items-center p-3 bg-secondary-900/20 backdrop-blur-lg border border-neon-cyan/20 clip-cyber-button">
                <span class="text-sm text-neon-cyan font-mono">RANK</span>
                <div class="bg-neon-pink/20 h-4 w-8 rounded clip-cyber-button animate-pulse"></div>
              </div>
              <div class="flex justify-between items-center p-3 bg-secondary-900/20 backdrop-blur-lg border border-neon-green/20 clip-cyber-button">
                <span class="text-sm text-neon-cyan font-mono">TOURNAMENTS WON</span>
                <div class="bg-neon-green/20 h-4 w-6 rounded clip-cyber-button animate-pulse"></div>
              </div>
              <div class="flex justify-between items-center p-3 bg-secondary-900/20 backdrop-blur-lg border border-warning-500/20 clip-cyber-button">
                <span class="text-sm text-neon-cyan font-mono">BEST POSITION</span>
                <div class="bg-warning-500/20 h-4 w-10 rounded clip-cyber-button animate-pulse"></div>
              </div>
              <div class="flex justify-between items-center p-3 bg-secondary-900/20 backdrop-blur-lg border border-neon-pink/20 clip-cyber-button">
                <span class="text-sm text-neon-cyan font-mono">MEMBER SINCE</span>
                <span class="text-sm font-medium text-neon-pink font-mono">${new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;

  // Add error handlers for avatar images after HTML is rendered
  const navAvatar = container.querySelector('#navAvatar') as HTMLImageElement;
  const profileAvatar = container.querySelector('#profileAvatar') as HTMLImageElement;
  
  if (navAvatar) {
    navAvatar.onerror = () => {
      console.warn('Failed to load navigation avatar image, falling back to default');
      navAvatar.src = '/assets/wishes.png';
    };
  }
  
  if (profileAvatar) {
    profileAvatar.onerror = () => {
      console.warn('Failed to load profile card avatar image, falling back to default');
      profileAvatar.src = '/assets/wishes.png';
    };
  }
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

  // Quick action buttons (without statistics)
  const quickMatchBtn = container.querySelector('#quickMatchBtn') as HTMLElement;
  const joinTournamentBtn = container.querySelector('#joinTournamentBtn') as HTMLElement;
  const createTournamentBtn = container.querySelector('#createTournamentBtn') as HTMLElement;

  quickMatchBtn.addEventListener('click', () => {
    // Navigate to game page - quick match section
    window.location.href = '/game';
  });

  joinTournamentBtn.addEventListener('click', () => {
    // Navigate to game page - tournament section
    window.location.href = '/game?section=tournament';
  });

  createTournamentBtn.addEventListener('click', () => {
    // Navigate to game page - tournament section with create modal
    window.location.href = '/game?section=tournament&action=create';
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
    if (statsLastUpdatedEl) statsLastUpdatedEl.textContent = 'UPDATED: ' + new Date().toLocaleTimeString();

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
        <div class="text-center py-8 text-neon-cyan/50">
          <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <p class="text-sm font-mono uppercase">No tournaments found. Create one!</p>
        </div>
      `;
    } else {
      // Show recent tournaments (limit to 3)
      tournaments.slice(0, 3).forEach((tournament: any) => {
        const statusColor = tournament.status === 'ACTIVE' ? 'neon-green' : 
                           tournament.status === 'WAITING' ? 'warning-500' : 'neon-cyan';
        const statusDot = tournament.status === 'ACTIVE' ? 'bg-neon-green' : 
                         tournament.status === 'WAITING' ? 'bg-warning-500' : 'bg-neon-cyan';
        
        recentTournamentsEl.innerHTML += `
          <div class="flex items-center justify-between p-6 bg-secondary-900/20 backdrop-blur-lg border border-${statusColor}/30 clip-cyber-button hover:border-${statusColor}/50 transition-all duration-300">
            <div class="flex items-center space-x-4">
              <div class="w-3 h-3 ${statusDot} rounded-full animate-glow-pulse"></div>
              <div>
                <p class="font-medium text-neon-cyan font-retro">${tournament.name}</p>
                <p class="text-sm text-neon-pink/70 font-mono">${new Date(tournament.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-${statusColor} font-mono uppercase">${tournament.status}</div>
              <div class="text-sm text-neon-cyan/70 font-mono">${tournament.currentPlayers}/${tournament.maxPlayers}</div>
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
        <div class="text-center py-8 text-danger-500">
          <p class="text-sm font-mono uppercase">Failed to load tournaments</p>
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
        <div class="text-center py-8 text-neon-cyan/50">
          <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <p class="text-sm font-mono uppercase">No active tournaments</p>
        </div>
      `;
    } else {
      // Show active tournaments
      tournaments.slice(0, 2).forEach((tournament: any) => {
        activeTournamentsEl.innerHTML += `
          <div class="p-4 bg-secondary-900/20 backdrop-blur-lg border border-neon-green/30 clip-cyber-button hover:border-neon-green/50 transition-all duration-300">
            <div class="flex items-center justify-between mb-3">
              <p class="font-medium text-neon-cyan font-retro">${tournament.name}</p>
              <span class="badge badge-success">ACTIVE</span>
            </div>
            <p class="text-xs text-neon-pink/70 font-mono uppercase">Players: ${tournament.currentPlayers}/${tournament.maxPlayers}</p>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Failed to load active tournaments:', error);
    const activeTournamentsEl = container.querySelector('#activeTournaments') as HTMLElement;
    if (activeTournamentsEl) {
      activeTournamentsEl.innerHTML = `
        <div class="text-center py-8 text-danger-500">
          <p class="text-sm font-mono uppercase">Failed to load active tournaments</p>
        </div>
      `;
    }
  }
} 