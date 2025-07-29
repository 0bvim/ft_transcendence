export default function Game(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen relative overflow-hidden';

  container.innerHTML = `
    <!-- Synthwave Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Animated Grid Background -->
      <div class="absolute inset-0 synthwave-grid opacity-15"></div>
      
      <!-- Neon Orbs -->
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(255,0,255,0.12) 0%, transparent 70%); animation-delay: -2s;"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,255,0.12) 0%, transparent 70%); animation-delay: -4s;"></div>
      <div class="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,128,0.1) 0%, transparent 70%); animation-delay: -3s;"></div>
      <div class="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(128,0,255,0.1) 0%, transparent 70%); animation-delay: -1s;"></div>
      
      <!-- Horizon Line -->
      <div class="horizon-line"></div>
      
      <!-- Scan Lines -->
      <div class="scan-line"></div>
    </div>

    <div class="relative z-10 container-fluid py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-12 animate-fade-in">
        <div class="flex items-center space-x-6">
          <button id="backButton" class="btn btn-ghost group">
            <svg class="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            BACK_TO_DASHBOARD
          </button>
          <h1 class="text-5xl font-bold text-gradient font-retro tracking-wider">
            <span class="text-neon-pink">GAME</span> 
            <span class="text-neon-cyan">OPTIONS</span>
          </h1>
        </div>
      </div>

      <!-- Game Mode Selection -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-slide-up">
        <!-- AI Opponent -->
        <div class="card p-8 text-center group hover:scale-105 transition-all duration-500" id="aiGameCard">
          <div class="w-24 h-24 bg-gradient-to-br from-neon-green to-neon-cyan clip-cyberpunk mx-auto mb-8 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-neon-green mb-4 font-retro tracking-wider">PLAY VS AI</h3>
          <p class="text-neon-cyan/80 mb-8 font-mono leading-relaxed">
            <span class="text-neon-pink">></span> Challenge an AI opponent in a classic Pong match. 
            <br/>Perfect for practice or quick games.
            <span class="animate-pulse">_</span>
          </p>
          <button id="playAiButton" class="btn btn-primary w-full group">
            <span class="relative z-10 flex items-center justify-center font-retro tracking-wider">
              START_AI_GAME.EXE
              <svg class="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </button>
        </div>

        <!-- Tournament/Multiplayer -->
        <div class="card p-8 text-center group hover:scale-105 transition-all duration-500" id="tournamentCard">
          <div class="w-24 h-24 bg-gradient-to-br from-neon-purple to-neon-pink clip-cyberpunk mx-auto mb-8 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-neon-pink mb-4 font-retro tracking-wider">TOURNAMENT PLAY</h3>
          <p class="text-neon-cyan/80 mb-8 font-mono leading-relaxed">
            <span class="text-neon-green">></span> Join or create tournaments to compete 
            <br/>against other players in organized matches.
            <span class="animate-pulse">_</span>
          </p>
          <button id="playTournamentButton" class="btn btn-secondary w-full group">
            <span class="relative z-10 flex items-center justify-center font-retro tracking-wider">
              BROWSE_TOURNAMENTS.EXE
              <svg class="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </button>
        </div>
      </div>

      <!-- Quick Match -->
      <div class="card p-8 mb-12 animate-slide-up" style="animation-delay: 0.2s;">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h2 class="text-3xl font-bold text-gradient mb-4 font-retro tracking-wider">QUICK MATCH</h2>
            <div class="space-y-2">
              <p class="text-neon-cyan/80 font-mono">
                <span class="text-neon-pink">$</span> Looking for a quick game? Join a random match!
              </p>
              <p class="text-sm text-warning-500 font-mono border border-warning-500/30 px-3 py-1 clip-cyber-button inline-block">
                ⚠ FEATURE_STATUS: COMING_SOON
              </p>
            </div>
          </div>
          <div class="ml-8">
            <button id="quickMatchButton" class="btn btn-ghost opacity-50 cursor-not-allowed" disabled>
              <span class="font-retro tracking-wider">QUICK_MATCH.EXE</span>
              <span class="ml-2 text-warning-500">[DISABLED]</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Game Instructions -->
      <div class="card p-8 animate-slide-up" style="animation-delay: 0.4s;">
        <h2 class="text-3xl font-bold text-gradient mb-8 font-retro tracking-wider">HOW TO PLAY</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="p-6 bg-secondary-900/30 backdrop-blur-lg border border-neon-cyan/30 clip-cyber-button">
            <h3 class="font-bold mb-4 text-neon-cyan font-retro text-xl">CONTROLS</h3>
            <div class="space-y-3 font-mono">
              <div class="flex items-center space-x-3">
                <span class="w-16 text-neon-pink">PLAYER1:</span>
                <span class="text-neon-green">A</span> 
                <span class="text-neon-cyan/70">(Up)</span> 
                <span class="text-neon-cyan/50">/</span> 
                <span class="text-neon-green">Z</span> 
                <span class="text-neon-cyan/70">(Down)</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="w-16 text-neon-pink">PLAYER2:</span>
                <span class="text-neon-green">↑</span> 
                <span class="text-neon-cyan/70">(Up)</span> 
                <span class="text-neon-cyan/50">/</span> 
                <span class="text-neon-green">↓</span> 
                <span class="text-neon-cyan/70">(Down)</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="w-16 text-neon-pink">START:</span>
                <span class="text-neon-green">SPACEBAR</span>
              </div>
            </div>
          </div>
          
          <div class="p-6 bg-secondary-900/30 backdrop-blur-lg border border-neon-green/30 clip-cyber-button">
            <h3 class="font-bold mb-4 text-neon-green font-retro text-xl">OBJECTIVE</h3>
            <div class="space-y-3 font-mono text-neon-cyan/80">
              <div class="flex items-start space-x-3">
                <span class="text-neon-pink">></span>
                <span>Score points by hitting the ball past your opponent</span>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-neon-pink">></span>
                <span>First to reach the target score wins</span>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-neon-pink">></span>
                <span>Use paddle movement to control ball direction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Terminal Footer -->
      <div class="mt-12 text-center animate-fade-in" style="animation-delay: 0.6s;">
        <div class="inline-block bg-secondary-900/50 backdrop-blur-lg border border-neon-cyan/30 px-6 py-3 clip-cyber-button">
          <p class="text-neon-cyan/60 font-mono text-sm">
            <span class="text-neon-pink">game@ft_transcendence:~$</span> 
            <span class="animate-pulse">echo "Choose your destiny"</span>
            <span class="animate-pulse text-neon-green ml-2">_</span>
          </p>
        </div>
      </div>
    </div>
  `;

  setupEventListeners(container);
  return container;
}

function setupEventListeners(container: HTMLElement) {
  const backButton = container.querySelector('#backButton') as HTMLButtonElement;
  const playAiButton = container.querySelector('#playAiButton') as HTMLButtonElement;
  const playTournamentButton = container.querySelector('#playTournamentButton') as HTMLButtonElement;
  const quickMatchButton = container.querySelector('#quickMatchButton') as HTMLButtonElement;

  // Back button
  backButton.addEventListener('click', () => {
    window.location.href = '/dashboard';
  });

  // Play vs AI - opens game service directly
  playAiButton.addEventListener('click', () => {
    // Open the game service for AI play
    const gameServiceUrl = `https://${window.location.hostname}:3002`;
    window.open(gameServiceUrl, '_blank');
  });

  // Tournament Play - redirects to tournament page
  playTournamentButton.addEventListener('click', () => {
    window.location.href = '/tournament';
  });

  // Quick Match - disabled for now
  quickMatchButton.addEventListener('click', () => {
    // TODO: Implement real-time matchmaking
    alert('Quick Match feature coming soon!');
  });
} 