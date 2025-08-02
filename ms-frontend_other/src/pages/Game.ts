import { PongGame } from '../game/PongGame';
import { authApi } from '../api/auth';
import { tournamentApi, Tournament, TournamentParticipant, Match } from '../api/tournament';
import { MultiplayerGame } from '../game/MultiplayerGame';
import { LocalVersusGame } from '../game/LocalVersusGame';

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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up">
        <!-- AI Opponent -->
        <div class="card p-6 text-center group hover:scale-105 transition-all duration-500" id="aiGameCard">
          <div class="w-20 h-20 bg-gradient-to-br from-neon-green to-neon-cyan clip-cyberpunk mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-neon-green mb-3 font-retro tracking-wider">PLAY VS AI</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono text-sm leading-relaxed">
            <span class="text-neon-pink">></span> Challenge AI opponent
            <br/>Practice & quick games
            <span class="animate-pulse">_</span>
          </p>
          <button id="playAiButton" class="btn btn-primary w-full group">
            <span class="relative z-10 flex items-center justify-center font-retro tracking-wider text-sm">
              START_AI_GAME
              <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </button>
        </div>

        <!-- Tournament Play -->
        <div class="card p-6 text-center group hover:scale-105 transition-all duration-500" id="tournamentCard">
          <div class="w-20 h-20 bg-gradient-to-br from-neon-purple to-neon-pink clip-cyberpunk mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-neon-pink mb-3 font-retro tracking-wider">TOURNAMENTS</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono text-sm leading-relaxed">
            <span class="text-neon-green">></span> Organized competitions
            <br/>Create & join tournaments
            <span class="animate-pulse">_</span>
          </p>
          <button id="playTournamentButton" class="btn btn-secondary w-full group">
            <span class="relative z-10 flex items-center justify-center font-retro tracking-wider text-sm">
              TOURNAMENT_ARENA
              <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </button>
        </div>

        <!-- Quick Match -->
        <div class="card p-6 text-center group hover:scale-105 transition-all duration-500" id="quickMatchCard">
          <div class="w-20 h-20 bg-gradient-to-br from-neon-yellow to-neon-orange clip-cyberpunk mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-neon-yellow mb-3 font-retro tracking-wider">QUICK MATCH</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono text-sm leading-relaxed">
            <span class="text-neon-orange">></span> Instant multiplayer
            <br/>Find random opponent
            <span class="animate-pulse">_</span>
          </p>
          <button id="quickMatchButton" class="btn btn-ghost w-full group opacity-50 cursor-not-allowed" disabled>
            <span class="relative z-10 flex items-center justify-center font-retro tracking-wider text-sm">
              COMING_SOON
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </span>
          </button>
        </div>
      </div>

      <!-- Embedded Game Canvas Section -->
      <div id="gameCanvasSection" class="hidden mt-12 animate-slide-up">
        <div class="card p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-3xl font-bold text-gradient font-retro tracking-wider">GAME_SESSION.EXE</h2>
            <button id="exitGameButton" class="btn btn-ghost group">
              <svg class="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              EXIT_GAME
            </button>
          </div>
          
          <!-- Game Status Bar -->
          <div id="gameStatusBar" class="mb-6 p-4 bg-secondary-900/30 backdrop-blur-lg border border-neon-cyan/30 clip-cyber-button">
            <div class="flex items-center justify-between font-mono">
              <div class="flex items-center space-x-4">
                <span class="text-neon-pink">STATUS:</span>
                <span id="gameStatus" class="text-neon-green">INITIALIZING...</span>
              </div>
              <div class="flex items-center space-x-6">
                <div class="flex items-center space-x-2">
                  <span id="playerLabel" class="text-neon-cyan">PLAYER:</span>
                  <span id="playerScore" class="text-neon-green font-bold">0</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-neon-cyan">AI:</span>
                  <span id="aiScore" class="text-neon-green font-bold">0</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Game Canvas Container -->
          <div id="gameCanvasContainer" class="relative bg-black border-2 border-neon-cyan/50 clip-cyber-button overflow-hidden">
            <div id="gameCanvas" class="w-full h-96 flex items-center justify-center">
              <div class="text-neon-cyan font-mono animate-pulse">
                <span class="text-neon-pink">></span> LOADING_GAME_ENGINE...
                <span class="animate-pulse">_</span>
              </div>
            </div>
          </div>
          
          <!-- Game Controls Info -->
          <div class="mt-6 p-4 bg-secondary-900/20 backdrop-blur-lg border border-neon-pink/20 clip-cyber-button">
            <div class="text-center font-mono text-sm text-neon-cyan">
              <span class="text-neon-pink">CONTROLS:</span>
              <span class="mx-4">W/S or ↑/↓ - MOVE PADDLE</span>
              <span class="mx-4">SPACE - START/PAUSE</span>
              <span class="mx-4">R - RESTART</span>
            </div>
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
  
  // Handle URL parameters for direct navigation from Dashboard
  handleUrlParameters(container);
  
  return container;
}

// Handle URL parameters for navigation from Dashboard
function handleUrlParameters(container: HTMLElement): void {
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section');
  const action = urlParams.get('action');
  
  if (section === 'tournament') {
    // Show tournament section automatically
    setTimeout(async () => {
      await showTournamentSection(container);
      
      // If action is create, show create tournament modal
      if (action === 'create') {
        setTimeout(() => {
          showCreateTournamentModal(container);
        }, 500); // Small delay to ensure tournament section is loaded
      }
      
      // Clean up URL parameters for cleaner experience
      cleanupUrlParameters();
    }, 100);
  }
}

// Clean up URL parameters after handling them
function cleanupUrlParameters(): void {
  if (window.location.search) {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }
}

// Game types for embedded game functionality
type GameType = 'ai-match' | 'multiplayer-match' | 'tournament-match' | 'quick-match';

interface GameConfig {
  type: GameType;
  difficulty?: 'easy' | 'medium' | 'hard';
  targetScore?: number;
  tournamentId?: string;
  matchId?: string;
  player1Name?: string;
  player2Name?: string;
}

// Show the embedded game canvas and initialize game
async function showEmbeddedGame(container: HTMLElement, gameType: GameType): Promise<void> {
  const gameCanvasSection = container.querySelector('#gameCanvasSection') as HTMLElement;
  
  if (!gameCanvasSection) return;
  
  // Configure game based on type
  const gameConfig: GameConfig = {
    type: gameType,
    difficulty: 'medium',
    targetScore: 5
  };
  
  // Show the game canvas section with animation
  gameCanvasSection.classList.remove('hidden');
  
  // Scroll to game section
  setTimeout(() => {
    gameCanvasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
  
  // Initialize game
  await initializeEmbeddedGame(container, gameConfig);
}

// Hide the embedded game canvas
function hideEmbeddedGame(container: HTMLElement): void {
  const gameCanvasSection = container.querySelector('#gameCanvasSection') as HTMLElement;
  
  if (!gameCanvasSection) return;
  
  // Hide the game canvas section
  gameCanvasSection.classList.add('hidden');
  
  // Clean up game resources
  cleanupEmbeddedGame(container);
  
  // Scroll back to top of page
  setTimeout(() => {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// Initialize the embedded game with real p5.js PongGame and player name
async function initializeEmbeddedGame(container: HTMLElement, config: GameConfig): Promise<void> {
  const gameCanvas = container.querySelector('#gameCanvas') as HTMLElement;
  const gameStatus = container.querySelector('#gameStatus') as HTMLElement;
  const playerScore = container.querySelector('#playerScore') as HTMLElement;
  const aiScore = container.querySelector('#aiScore') as HTMLElement;
  const playerLabel = container.querySelector('#playerLabel') as HTMLElement;
  
  if (!gameCanvas || !gameStatus) return;
  
  // Update status
  gameStatus.textContent = 'LOADING_GAME_ENGINE...';
  
  // Get current user name and update UI
  let playerName = 'PLAYER';
  try {
    const userProfile = await authApi.getProfile();
    playerName = userProfile.user.displayName || userProfile.user.username || 'PLAYER';
    
    // Update player label in UI
    if (playerLabel) {
      playerLabel.textContent = `${playerName.toUpperCase()}:`;
    }
  } catch (error) {
    console.warn('Could not fetch user profile, using default name:', error);
  }
  
  // Clear the canvas container and prepare for p5.js
  gameCanvas.innerHTML = '';
  gameCanvas.style.display = 'flex';
  gameCanvas.style.justifyContent = 'center';
  gameCanvas.style.alignItems = 'center';
  
  // Import and initialize the PongGame
  try {
    const { PongGame, GameState } = await import('../game/PongGame.js');
    
    // Create game configuration
    const gameConfig = {
      player1Name: playerName,
      player2Name: config.type === 'ai-match' ? 'AI_OPPONENT' : 'PLAYER_2',
      player1IsAI: false,
      player2IsAI: config.type === 'ai-match',
      aiDifficulty: (config.difficulty || 'medium').toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
      targetScore: config.targetScore || 5
    };
    
    // Create game callbacks
    const gameCallbacks = {
      onScoreUpdate: (player1Score: number, player2Score: number) => {
        if (playerScore) playerScore.textContent = player1Score.toString();
        if (aiScore) aiScore.textContent = player2Score.toString();
      },
      onGameStateChange: (state: any) => {
        if (!gameStatus) return;
        
        switch (state) {
          case GameState.Loading:
            gameStatus.textContent = 'LOADING...';
            break;
          case GameState.Ready:
            gameStatus.textContent = 'READY_TO_PLAY';
            break;
          case GameState.Playing:
            gameStatus.textContent = 'PLAYING';
            break;
          case GameState.Paused:
            gameStatus.textContent = 'PAUSED';
            break;
          case GameState.GameOver:
            gameStatus.textContent = 'GAME_OVER';
            break;
        }
      },
      onGameEnd: (winner: string, _finalScore: { player1: number; player2: number }) => {
        if (gameStatus) {
          gameStatus.textContent = `${winner.toUpperCase()}_WINS!`;
        }
        
        // Show game over message
        setTimeout(() => {
          if (gameStatus) {
            gameStatus.textContent = 'GAME_COMPLETE';
          }
        }, 3000);
      }
    };
    
    // Create and initialize the game
    const pongGame = new PongGame(gameConfig, gameCallbacks);
    pongGame.init(gameCanvas);
    
    // Store game instance for cleanup
    (container as any)._pongGameInstance = pongGame;
    
    // Update UI elements
    gameStatus.textContent = 'READY_TO_PLAY';
    
  } catch (error) {
    console.error('Failed to load PongGame:', error);
    gameStatus.textContent = 'ERROR_LOADING_GAME';
    
    // Fallback to placeholder
    gameCanvas.innerHTML = `
      <div class="w-full h-full bg-black border border-neon-red/30 flex items-center justify-center">
        <div class="text-center">
          <div class="text-neon-red font-mono mb-4">
            <span class="text-neon-pink">!</span> GAME_ENGINE_ERROR
          </div>
          <div class="text-neon-cyan font-mono text-sm">
            Failed to initialize game engine
          </div>
          <div class="mt-4 text-neon-yellow font-mono text-xs">
            Check console for details
          </div>
        </div>
      </div>
    `;
  }
}

// Clean up game resources
function cleanupEmbeddedGame(container: HTMLElement): void {
  const gameStatus = container.querySelector('#gameStatus') as HTMLElement;
  const gameCanvas = container.querySelector('#gameCanvas') as HTMLElement;
  const playerLabel = container.querySelector('#playerLabel') as HTMLElement;
  
  // Reset status
  if (gameStatus) {
    gameStatus.textContent = 'INITIALIZING...';
  }
  
  // Reset player label
  if (playerLabel) {
    playerLabel.textContent = 'PLAYER:';
  }
  
  // Reset canvas
  if (gameCanvas) {
    gameCanvas.innerHTML = `
      <div class="text-neon-cyan font-mono animate-pulse">
        <span class="text-neon-pink">></span> LOADING_GAME_ENGINE...
        <span class="animate-pulse">_</span>
      </div>
    `;
  }
  
  // Clean up game instance
  if ((container as any)._pongGameInstance) {
    try {
      (container as any)._pongGameInstance.cleanup();
    } catch (error) {
      console.warn('Error cleaning up game instance:', error);
    }
    delete (container as any)._pongGameInstance;
  }
}

function setupEventListeners(container: HTMLElement) {
  const backButton = container.querySelector('#backButton') as HTMLButtonElement;
  const playAiButton = container.querySelector('#playAiButton') as HTMLButtonElement;
  const playTournamentButton = container.querySelector('#playTournamentButton') as HTMLButtonElement;
  const quickMatchButton = container.querySelector('#quickMatchButton') as HTMLButtonElement;
  const exitGameButton = container.querySelector('#exitGameButton') as HTMLButtonElement;

  // Back button
  backButton.addEventListener('click', () => {
    window.location.href = '/dashboard';
  });

  // Play vs AI - show embedded game canvas
  playAiButton.addEventListener('click', async () => {
    await showEmbeddedGame(container, 'ai-match');
  });

  // Tournament Play - show tournament section
  playTournamentButton.addEventListener('click', async () => {
    await showTournamentSection(container);
  });

  // Quick Match - disabled for now
  quickMatchButton.addEventListener('click', () => {
    // TODO: Implement real-time matchmaking
    alert('Quick Match feature coming soon!');
  });

  // Exit game - hide embedded game canvas
  exitGameButton?.addEventListener('click', () => {
    hideEmbeddedGame(container);
  });
}

// Tournament Section Management
async function showTournamentSection(container: HTMLElement): Promise<void> {
  // Hide game options and show tournament section
  const gameOptions = container.querySelector('.container-fluid');
  let tournamentSection = container.querySelector('#tournamentSection');
  
  if (gameOptions) gameOptions.classList.add('hidden');
  
  if (!tournamentSection) {
    // Create tournament section if it doesn't exist
    await createTournamentSection(container);
    tournamentSection = container.querySelector('#tournamentSection');
  }
  
  if (tournamentSection) {
    tournamentSection.classList.remove('hidden');
    await loadTournaments(container);
    setupTournamentEventListeners(container);
  }
}

async function createTournamentSection(container: HTMLElement): Promise<void> {
  const tournamentHTML = `
    <div id="tournamentSection" class="relative z-10 container-fluid py-8 animate-fade-in hidden">
      <!-- Tournament Header -->
      <div class="card p-6 mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <button id="backToGameButton" class="btn btn-ghost group">
              <svg class="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span class="font-retro tracking-wider">BACK_TO_GAME</span>
            </button>
            <div class="border-l border-neon-cyan/30 pl-6">
              <h1 class="text-3xl font-bold text-gradient font-retro tracking-wider">
                <span class="text-neon-purple">TOURNAMENT</span> 
                <span class="text-neon-pink">ARENA</span>
              </h1>
              <p class="text-neon-cyan/60 font-mono text-sm mt-1">
                <span class="text-neon-green">></span> Competitive multiplayer tournaments
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button id="refreshTournamentsButton" class="btn btn-ghost group">
              <svg class="w-4 h-4 mr-2 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span class="font-retro tracking-wider text-sm">REFRESH</span>
            </button>
            <button id="createTournamentButton" class="btn btn-primary group">
              <svg class="w-4 h-4 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span class="font-retro tracking-wider">CREATE_TOURNAMENT</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Tournament List -->
      <div id="tournamentsList" class="space-y-4">
        <div class="card p-8 text-center">
          <div class="text-neon-cyan font-mono text-lg mb-4 animate-pulse">
            <span class="text-neon-pink">></span> SCANNING_TOURNAMENTS...
          </div>
          <div class="loading-spinner mx-auto"></div>
        </div>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', tournamentHTML);
}

function hideTournamentSection(container: HTMLElement): void {
  const gameOptions = container.querySelector('.container-fluid');
  const tournamentSection = container.querySelector('#tournamentSection');
  
  if (gameOptions) gameOptions.classList.remove('hidden');
  if (tournamentSection) tournamentSection.classList.add('hidden');
}

async function loadTournaments(container: HTMLElement): Promise<void> {
  try {
    // Load both WAITING and ACTIVE tournaments so users can see and play active tournaments
    const waitingTournaments = await tournamentApi.getTournaments({ page: 1, limit: 10, status: 'WAITING' });
    const activeTournaments = await tournamentApi.getTournaments({ page: 1, limit: 10, status: 'ACTIVE' });
    
    // Combine and sort tournaments
    const allTournaments = [...waitingTournaments.tournaments, ...activeTournaments.tournaments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    await displayTournaments(container, allTournaments);
  } catch (error) {
    console.error('Failed to load tournaments:', error);
    displayTournamentError(container, 'Failed to load tournaments');
  }
}

async function displayTournaments(container: HTMLElement, tournaments: Tournament[]): Promise<void> {
  const tournamentsList = container.querySelector('#tournamentsList');
  if (!tournamentsList) return;
  
  // Get current user to check tournament ownership
  let currentUser = null;
  try {
    const currentUserResponse = await authApi.getProfile();
    currentUser = currentUserResponse.user;
  } catch (error) {
    console.warn('Could not get current user:', error);
  }
  
  if (tournaments.length === 0) {
    tournamentsList.innerHTML = `
      <div class="text-center py-12">
        <div class="text-neon-cyan font-mono text-lg mb-4">NO_TOURNAMENTS_AVAILABLE</div>
        <p class="text-neon-cyan/60 font-mono">Create a new tournament to get started!</p>
      </div>
    `;
    return;
  }
  
  const tournamentsHTML = tournaments.map(tournament => `
    <div class="card p-6 hover:scale-105 transition-all duration-300 cursor-pointer tournament-card" data-tournament-id="${tournament.id}">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-neon-green font-retro tracking-wider">${tournament.name}</h3>
        <div class="flex items-center space-x-4">
          <span class="px-3 py-1 bg-neon-purple/20 border border-neon-purple/50 rounded text-neon-purple font-mono text-sm">
            ${tournament.status}
          </span>
          <span class="text-neon-cyan font-mono">${tournament.currentPlayers}/${tournament.maxPlayers}</span>
        </div>
      </div>
      
      <p class="text-neon-cyan/80 font-mono mb-4">${tournament.description || 'No description provided'}</p>
      
      <div class="grid grid-cols-3 gap-4 text-sm font-mono">
        <div>
          <span class="text-neon-pink">TYPE:</span>
          <span class="text-neon-cyan ml-2">${tournament.tournamentType}</span>
        </div>
        <div>
          <span class="text-neon-pink">AI_DIFFICULTY:</span>
          <span class="text-neon-cyan ml-2">${tournament.aiDifficulty}</span>
        </div>
        <div>
          <span class="text-neon-pink">AUTO_START:</span>
          <span class="text-neon-cyan ml-2">${tournament.autoStart ? 'YES' : 'NO'}</span>
        </div>
      </div>
      
      <div class="flex space-x-4 mt-6">
        ${tournament.status === 'WAITING' && tournament.currentPlayers < tournament.maxPlayers ? `
          <button class="btn btn-primary flex-1 join-tournament-btn" data-tournament-id="${tournament.id}">
            <span class="font-retro tracking-wider">JOIN_TOURNAMENT</span>
          </button>
        ` : ''}
        ${tournament.status === 'WAITING' && currentUser && tournament.createdBy === currentUser.id && tournament.currentPlayers >= 1 ? `
          <button class="btn btn-secondary flex-1 start-tournament-btn" data-tournament-id="${tournament.id}">
            <span class="font-retro tracking-wider">START_TOURNAMENT</span>
          </button>
        ` : ''}
        ${tournament.status === 'ACTIVE' ? `
          <button class="btn btn-primary flex-1 play-tournament-btn" data-tournament-id="${tournament.id}">
            <span class="font-retro tracking-wider">PLAY_MATCH</span>
          </button>
        ` : ''}
        <button class="btn btn-ghost view-tournament-btn" data-tournament-id="${tournament.id}">
          <span class="font-retro tracking-wider">VIEW_DETAILS</span>
        </button>
      </div>
    </div>
  `).join('');
  
  tournamentsList.innerHTML = tournamentsHTML;
  
  // Reconfigure event listeners for dynamically created buttons
  setupDynamicTournamentEventListeners(container);
}

function displayTournamentError(container: HTMLElement, message: string): void {
  const tournamentsList = container.querySelector('#tournamentsList');
  if (!tournamentsList) return;
  
  tournamentsList.innerHTML = `
    <div class="text-center py-12">
      <div class="text-neon-red font-mono text-lg mb-4">ERROR</div>
      <p class="text-neon-cyan/60 font-mono">${message}</p>
      <button id="retryLoadTournaments" class="btn btn-primary mt-4">
        <span class="font-retro tracking-wider">RETRY</span>
      </button>
    </div>
  `;
}

function setupTournamentEventListeners(container: HTMLElement): void {
  // Back to game options
  const backToGameButton = container.querySelector('#backToGameButton');
  backToGameButton?.addEventListener('click', () => {
    hideTournamentSection(container);
  });
  
  // Refresh tournaments button
  const refreshButton = container.querySelector('#refreshTournamentsButton');
  refreshButton?.addEventListener('click', async () => {
    await loadTournaments(container);
    showNotification(container, 'Tournaments refreshed!', 'success');
  });
  
  // Create tournament button
  const createTournamentButton = container.querySelector('#createTournamentButton');
  createTournamentButton?.addEventListener('click', () => {
    showCreateTournamentModal(container);
  });
  
  // Setup dynamic event listeners for tournament cards
  setupDynamicTournamentEventListeners(container);
}

// Function to setup event listeners for dynamically created tournament buttons
function setupDynamicTournamentEventListeners(container: HTMLElement): void {
  // Tournament card interactions
  const joinButtons = container.querySelectorAll('.join-tournament-btn');
  joinButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tournamentId = (e.target as HTMLElement).closest('button')?.dataset.tournamentId;
      if (tournamentId) {
        await joinTournament(container, tournamentId);
      }
    });
  });
  
  // Start tournament buttons
  const startButtons = container.querySelectorAll('.start-tournament-btn');
  startButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tournamentId = (e.target as HTMLElement).closest('button')?.dataset.tournamentId;
      if (tournamentId) {
        try {
          console.log('Starting tournament:', tournamentId);
          await tournamentApi.startTournament(tournamentId);
          showNotification(container, 'Tournament started successfully!', 'success');
          
          // Wait a moment for matches to be created
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get tournament details to find the first match
          const tournamentDetails = await tournamentApi.getTournament(tournamentId);
          console.log('Tournament details after start:', tournamentDetails);
          console.log('Available matches:', tournamentDetails.matches);
          
          if (tournamentDetails.matches && tournamentDetails.matches.length > 0) {
            // Find the first available match (WAITING or IN_PROGRESS)
            const firstMatch = tournamentDetails.matches.find((match: any) => 
              match.status === 'WAITING' || match.status === 'IN_PROGRESS'
            );
            
            console.log('First match found:', firstMatch);
            
            if (firstMatch) {
              // Automatically start the first match
              await startMultiplayerMatch(container, firstMatch.id, tournamentId);
            } else {
              console.log('No matches available, refreshing tournament list');
              // If no matches available, refresh tournament list
              await loadTournaments(container);
            }
          } else {
            console.log('No matches found, refreshing tournament list');
            // If no matches found, refresh tournament list
            await loadTournaments(container);
          }
        } catch (error) {
          console.error('Failed to start tournament:', error);
          showNotification(container, 'Failed to start tournament.', 'error');
        }
      }
    });
  });
  
  // Play tournament buttons (for active tournaments)
  const playButtons = container.querySelectorAll('.play-tournament-btn');
  playButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tournamentId = (e.target as HTMLElement).closest('button')?.dataset.tournamentId;
      if (tournamentId) {
        try {
          console.log('Playing tournament:', tournamentId);
          
          // Get tournament details to find the first available match
          const tournamentDetails = await tournamentApi.getTournament(tournamentId);
          console.log('Play tournament - Tournament details:', tournamentDetails);
          console.log('Play tournament - Available matches:', tournamentDetails.matches);
          
          if (tournamentDetails.matches && tournamentDetails.matches.length > 0) {
            // Find the first available match (WAITING or IN_PROGRESS)
            const availableMatch = tournamentDetails.matches.find((match: any) => 
              match.status === 'WAITING' || match.status === 'IN_PROGRESS'
            );
            
            console.log('Available match found:', availableMatch);
            console.log('Available match ID:', availableMatch?.id);
            console.log('Available match status:', availableMatch?.status);
            
            if (availableMatch) {
              // Start the available match
              console.log('Calling startMultiplayerMatch with matchId:', availableMatch.id);
              
              // Start the match using direct approach (no fallback needed)
              await startMultiplayerMatchDirect(container, availableMatch, tournamentId);
            } else {
              showNotification(container, 'No matches available to play in this tournament.', 'error');
            }
          } else {
            showNotification(container, 'No matches found in this tournament.', 'error');
          }
        } catch (error) {
          console.error('Failed to play tournament:', error);
          showNotification(container, 'Failed to start match.', 'error');
        }
      }
    });
  });
  
  const viewButtons = container.querySelectorAll('.view-tournament-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tournamentId = (e.target as HTMLElement).closest('button')?.dataset.tournamentId;
      if (tournamentId) {
        await showTournamentDetails(container, tournamentId);
      }
    });
  });
  
  // Retry load tournaments on error
  const retryButton = container.querySelector('#retryLoadTournaments');
  retryButton?.addEventListener('click', async () => {
    await loadTournaments(container);
  });
}

async function joinTournament(container: HTMLElement, tournamentId: string): Promise<void> {
  try {
    await tournamentApi.joinTournament(tournamentId);
    await loadTournaments(container);
    showNotification(container, 'Successfully joined tournament!', 'success');
  } catch (error) {
    console.error('Failed to join tournament:', error);
    showNotification(container, 'Failed to join tournament. Please try again.', 'error');
  }
}

function showNotification(container: HTMLElement, message: string, type: 'success' | 'error'): void {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded border font-mono text-sm animate-fade-in ${
    type === 'success' 
      ? 'bg-neon-green/20 border-neon-green text-neon-green' 
      : 'bg-neon-red/20 border-neon-red text-neon-red'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showCreateTournamentModal(container: HTMLElement): void {
  const modalHTML = `
    <div id="createTournamentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
      <div class="bg-gray-900 border border-neon-cyan/50 rounded-lg p-8 max-w-md w-full mx-4 animate-scale-in">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-neon-green font-retro tracking-wider">CREATE_TOURNAMENT</h2>
          <button id="closeCreateModal" class="text-neon-red hover:text-neon-red/80 text-2xl">&times;</button>
        </div>
        
        <form id="createTournamentForm" class="space-y-4">
          <div>
            <label class="block text-neon-cyan font-mono text-sm mb-2">TOURNAMENT_NAME</label>
            <input type="text" id="tournamentName" required class="w-full p-3 bg-gray-800 border border-neon-cyan/50 rounded text-neon-cyan font-mono focus:border-neon-green focus:outline-none" placeholder="Enter tournament name...">
          </div>
          
          <div>
            <label class="block text-neon-cyan font-mono text-sm mb-2">DESCRIPTION</label>
            <textarea id="tournamentDescription" class="w-full p-3 bg-gray-800 border border-neon-cyan/50 rounded text-neon-cyan font-mono focus:border-neon-green focus:outline-none" rows="3" placeholder="Enter description..."></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-neon-cyan font-mono text-sm mb-2">MAX_PLAYERS</label>
              <select id="maxPlayers" class="w-full p-3 bg-gray-800 border border-neon-cyan/50 rounded text-neon-cyan font-mono focus:border-neon-green focus:outline-none">
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="16">16</option>
              </select>
            </div>
            
            <div>
              <label class="block text-neon-cyan font-mono text-sm mb-2">AI_DIFFICULTY</label>
              <select id="aiDifficulty" class="w-full p-3 bg-gray-800 border border-neon-cyan/50 rounded text-neon-cyan font-mono focus:border-neon-green focus:outline-none">
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <input type="checkbox" id="autoStart" class="w-4 h-4 text-neon-green bg-gray-800 border-neon-cyan/50 rounded focus:ring-neon-green">
            <label for="autoStart" class="text-neon-cyan font-mono text-sm">AUTO_START_WHEN_FULL</label>
          </div>
          
          <div class="flex space-x-4 mt-6">
            <button type="button" id="cancelCreate" class="btn btn-ghost flex-1">
              <span class="font-retro tracking-wider">CANCEL</span>
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              <span class="font-retro tracking-wider">CREATE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Setup modal event listeners
  const modal = document.getElementById('createTournamentModal');
  const closeBtn = document.getElementById('closeCreateModal');
  const cancelBtn = document.getElementById('cancelCreate');
  const form = document.getElementById('createTournamentForm') as HTMLFormElement;
  
  const closeModal = () => modal?.remove();
  
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleCreateTournament(container, form);
    closeModal();
  });
}

async function handleCreateTournament(container: HTMLElement, form: HTMLFormElement): Promise<void> {
  try {
    const tournamentData = {
      name: (form.querySelector('#tournamentName') as HTMLInputElement).value,
      description: (form.querySelector('#tournamentDescription') as HTMLTextAreaElement).value,
      maxPlayers: parseInt((form.querySelector('#maxPlayers') as HTMLSelectElement).value),
      tournamentType: 'MIXED' as const,
      aiDifficulty: (form.querySelector('#aiDifficulty') as HTMLSelectElement).value as 'EASY' | 'MEDIUM' | 'HARD',
      autoStart: (form.querySelector('#autoStart') as HTMLInputElement).checked
    };
    
    await tournamentApi.createTournament(tournamentData);
    await loadTournaments(container);
    showNotification(container, 'Tournament created successfully!', 'success');
  } catch (error) {
    console.error('Failed to create tournament:', error);
    showNotification(container, 'Failed to create tournament. Please try again.', 'error');
  }
}

async function showTournamentDetails(container: HTMLElement, tournamentId: string): Promise<void> {
  try {
    const tournament = await tournamentApi.getTournament(tournamentId);
    const currentUserResponse = await authApi.getProfile();
    const currentUser = currentUserResponse.user;
    
    const modalHTML = `
      <div id="tournamentDetailsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
        <div class="bg-gray-900 border border-neon-cyan/50 rounded-lg p-8 max-w-2xl w-full mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-neon-green font-retro tracking-wider">${tournament.name}</h2>
            <button id="closeDetailsModal" class="text-neon-red hover:text-neon-red/80 text-2xl">&times;</button>
          </div>
          
          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <span class="text-neon-pink">STATUS:</span>
                <span class="text-neon-cyan ml-2">${tournament.status}</span>
              </div>
              <div>
                <span class="text-neon-pink">PLAYERS:</span>
                <span class="text-neon-cyan ml-2">${tournament.currentPlayers}/${tournament.maxPlayers}</span>
              </div>
              <div>
                <span class="text-neon-pink">TYPE:</span>
                <span class="text-neon-cyan ml-2">${tournament.tournamentType}</span>
              </div>
              <div>
                <span class="text-neon-pink">AI_DIFFICULTY:</span>
                <span class="text-neon-cyan ml-2">${tournament.aiDifficulty}</span>
              </div>
            </div>
            
            ${tournament.description ? `
              <div>
                <h3 class="text-neon-pink font-mono text-sm mb-2">DESCRIPTION:</h3>
                <p class="text-neon-cyan/80 font-mono">${tournament.description}</p>
              </div>
            ` : ''}
            
            <div>
              <h3 class="text-neon-pink font-mono text-sm mb-3">PARTICIPANTS:</h3>
              <div class="space-y-2">
                ${tournament.participants.map(participant => `
                  <div class="flex items-center justify-between p-3 bg-gray-800 rounded border border-neon-cyan/30">
                    <span class="text-neon-cyan font-mono">${participant.displayName}</span>
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-1 bg-neon-purple/20 border border-neon-purple/50 rounded text-neon-purple font-mono text-xs">
                        ${participant.participantType}
                      </span>
                      <span class="px-2 py-1 bg-neon-green/20 border border-neon-green/50 rounded text-neon-green font-mono text-xs">
                        ${participant.status}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            ${tournament.matches && tournament.matches.length > 0 ? `
              <div>
                <h3 class="text-neon-pink font-mono text-sm mb-3">MATCHES:</h3>
                <div class="space-y-2">
                  ${tournament.matches.map(match => `
                    <div class="flex items-center justify-between p-3 bg-gray-800 rounded border border-neon-cyan/30">
                      <div class="flex items-center space-x-4">
                        <span class="text-neon-cyan font-mono">Round ${match.round}</span>
                        <span class="px-2 py-1 bg-neon-blue/20 border border-neon-blue/50 rounded text-neon-blue font-mono text-xs">
                          ${match.status}
                        </span>
                      </div>
                      ${match.status === 'IN_PROGRESS' || match.status === 'WAITING' ? `
                        <button class="btn btn-primary btn-sm play-match-btn" data-match-id="${match.id}" data-tournament-id="${tournament.id}">
                          <span class="font-retro tracking-wider text-xs">PLAY_MATCH</span>
                        </button>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="flex space-x-4 mt-6">
            <button id="closeDetails" class="btn btn-ghost flex-1">
              <span class="font-retro tracking-wider">CLOSE</span>
            </button>
            ${tournament.status === 'WAITING' && tournament.currentPlayers < tournament.maxPlayers ? `
              <button id="joinFromDetails" class="btn btn-primary flex-1" data-tournament-id="${tournament.id}">
                <span class="font-retro tracking-wider">JOIN_TOURNAMENT</span>
              </button>
            ` : ''}
            ${tournament.status === 'WAITING' && currentUser && tournament.createdBy === currentUser.id && tournament.currentPlayers >= 1 ? `
              <button id="startFromDetails" class="btn btn-secondary flex-1" data-tournament-id="${tournament.id}">
                <span class="font-retro tracking-wider">START_TOURNAMENT</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup modal event listeners
    const modal = document.getElementById('tournamentDetailsModal');
    const closeBtn = document.getElementById('closeDetailsModal');
    const closeDetailsBtn = document.getElementById('closeDetails');
    const joinBtn = document.getElementById('joinFromDetails');
    const startBtn = document.getElementById('startFromDetails');
    
    const closeModal = () => modal?.remove();
    
    closeBtn?.addEventListener('click', closeModal);
    closeDetailsBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    joinBtn?.addEventListener('click', async () => {
      await joinTournament(container, tournamentId);
      closeModal();
    });
    
    startBtn?.addEventListener('click', async () => {
      try {
        await tournamentApi.startTournament(tournamentId);
        showNotification(container, 'Tournament started successfully!', 'success');
        closeModal();
        
        // Wait a moment for matches to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get tournament details to find the first match
        const tournamentDetails = await tournamentApi.getTournament(tournamentId);
        console.log('Modal - Tournament details after start:', tournamentDetails);
        console.log('Modal - Available matches:', tournamentDetails.matches);
        
        if (tournamentDetails.matches && tournamentDetails.matches.length > 0) {
          // Find the first available match (WAITING or IN_PROGRESS)
          const firstMatch = tournamentDetails.matches.find((match: any) => 
            match.status === 'WAITING' || match.status === 'IN_PROGRESS'
          );
          
          if (firstMatch) {
            // Automatically start the first match
            await startMultiplayerMatch(container, firstMatch.id, tournamentId);
          } else {
            // If no matches available, refresh tournament list
            await loadTournaments(container);
          }
        } else {
          // If no matches found, refresh tournament list
          await loadTournaments(container);
        }
      } catch (error) {
        console.error('Failed to start tournament:', error);
        showNotification(container, 'Failed to start tournament.', 'error');
      }
    });
    
    // Play match buttons
    const playMatchButtons = modal?.querySelectorAll('.play-match-btn');
    playMatchButtons?.forEach(button => {
      button.addEventListener('click', async (e) => {
        const matchId = (e.target as HTMLElement).dataset.matchId;
        const tournamentId = (e.target as HTMLElement).dataset.tournamentId;
        if (matchId && tournamentId) {
          closeModal();
          await startMultiplayerMatch(container, matchId, tournamentId);
        }
      });
    });
    
  } catch (error) {
    console.error('Failed to load tournament details:', error);
    showNotification(container, 'Failed to load tournament details.', 'error');
  }
}

// Initialize PongGame for tournament match
async function initializePongGameForMatch(container: HTMLElement, matchData: any, tournamentId: string): Promise<void> {
  // Ensure sections are properly displayed/hidden
  const tournamentSection = container.querySelector('#tournamentSection');
  const gameSection = container.querySelector('#gameSection');
  if (tournamentSection) tournamentSection.classList.add('hidden');
  if (gameSection) gameSection.classList.remove('hidden');
  try {
    console.log('🔧 [PONG_INIT] Setting up PongGame for match');
    console.log('📊 [PONG_INIT] Match data details:', {
      id: matchData?.id,
      status: matchData?.status,
      localVersus: matchData?.localVersus,
      player1Keys: matchData?.player1Keys,
      player2Keys: matchData?.player2Keys
    });
    
    // Debug container and DOM structure
    console.log('🔍 [CANVAS] Searching for #gameCanvas in DOM...');
    console.log('📝 [DOM_DEBUG] Container details:', {
      tagName: container.tagName,
      id: container.id,
      className: container.className,
      childrenCount: container.children.length
    });
    
    // Com a nova estrutura, a busca pelo container é mais direta e confiável.
    const gameContainer = container.querySelector('#game-canvas-container') as HTMLElement;

    if (!gameContainer) {
      console.error('❌ [CRITICAL] Canvas container #game-canvas-container not found!');
      throw new Error('Game canvas container is missing from the DOM.');
    }

    console.log('✅ [CANVAS] Found game container:', gameContainer);
    console.log('📊 [CONTAINER] Container properties:', {
      clientWidth: gameContainer.clientWidth,
      clientHeight: gameContainer.clientHeight,
      offsetWidth: gameContainer.offsetWidth,
      offsetHeight: gameContainer.offsetHeight
    });
    
    // Clear the canvas container and prepare for p5.js
    console.log('🧹 [CANVAS] Clearing canvas and setting up styles...');
    gameContainer.innerHTML = '';
    console.log('✅ [CONTAINER] Cleared existing children');
    
    // Style the container to ensure canvas is visible
    gameContainer.style.display = 'flex';
    gameContainer.style.justifyContent = 'center';
    gameContainer.style.alignItems = 'center';
    gameContainer.style.width = '100%';
    gameContainer.style.height = '100%';
    gameContainer.style.position = 'relative';
    gameContainer.style.zIndex = '10';
    gameContainer.style.backgroundColor = 'transparent';
    console.log('💅 [STYLES] Applied critical visibility styles to gameContainer');
    
    // Get user profile for player name
    console.log('👤 [AUTH] Fetching user profile for player name...');
    let playerName = 'PLAYER';
    try {
      const userProfile = await authApi.getProfile();
      playerName = userProfile.user.displayName || userProfile.user.username || 'PLAYER';
      console.log('✅ [AUTH] User profile fetched:', { playerName, userId: userProfile.user.id });
    } catch (error) {
      console.warn('⚠️ [AUTH] Could not fetch user profile, using default name:', error);
    }
    
    // Import and initialize the PongGame
    console.log('📦 [IMPORT] Importing PongGame module...');
    const { PongGame, GameState } = await import('../game/PongGame.js');
    console.log('✅ [IMPORT] PongGame module imported successfully');
    
    // Determine if this is local versus or multiplayer
    const isLocalVersus = matchData.localVersus || false;
    console.log('🎯 [GAME_TYPE] Local versus mode:', isLocalVersus);
    
    // Create game configuration based on match data
    const gameConfig = {
      player1Name: playerName,
      player2Name: isLocalVersus ? 'PLAYER_2' : 'OPPONENT',
      player1IsAI: false,
      player2IsAI: !isLocalVersus, // If not local versus, assume AI opponent
      aiDifficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
      targetScore: 5,
      matchId: matchData.id,
      tournamentId: tournamentId,
      localVersus: isLocalVersus
    };
    
    console.log('⚙️ [CONFIG] Game configuration created:');
    console.log('📊 [CONFIG] Player 1:', { name: gameConfig.player1Name, isAI: gameConfig.player1IsAI });
    console.log('📊 [CONFIG] Player 2:', { name: gameConfig.player2Name, isAI: gameConfig.player2IsAI });
    console.log('📊 [CONFIG] Game settings:', { 
      aiDifficulty: gameConfig.aiDifficulty, 
      targetScore: gameConfig.targetScore,
      localVersus: gameConfig.localVersus,
      matchId: gameConfig.matchId
    });
    
    // Create game callbacks
    const gameCallbacks = {
      onScoreUpdate: (player1Score: number, player2Score: number) => {
        console.log('Score update:', { player1Score, player2Score });
        // Atualizar placar na interface integrada
        updateLiveScore(container, player1Score, player2Score);
        // Update score display if elements exist (fallback)
        const p1Score = container.querySelector('.player1-score');
        const p2Score = container.querySelector('.player2-score');
        if (p1Score) p1Score.textContent = player1Score.toString();
        if (p2Score) p2Score.textContent = player2Score.toString();
      },
      onGameStateChange: (state: any) => {
        console.log('Game state changed:', state);
        
        let statusText = 'UNKNOWN';
        switch (state) {
          case GameState.Loading:
            statusText = 'LOADING...';
            break;
          case GameState.Ready:
            statusText = 'READY TO PLAY';
            break;
          case GameState.Playing:
            statusText = 'PLAYING';
            break;
          case GameState.Paused:
            statusText = 'PAUSED';
            break;
          case GameState.GameOver:
            statusText = 'GAME OVER';
            break;
        }
        
        // Atualizar status na interface integrada
        updateMatchStatus(container, statusText);
        
        // Update status display if elements exist (fallback)
        const gameStatus = container.querySelector('.game-status');
        if (gameStatus) {
          gameStatus.textContent = statusText;
        }
      },
      onGameEnd: async (winner: string, finalScore: { player1: number; player2: number }) => {
        console.log('Game ended:', { winner, finalScore });
        
        // Atualizar status na interface integrada
        updateMatchStatus(container, `${winner.toUpperCase()} WINS!`);
        
        // Update status display if elements exist (fallback)
        const gameStatus = container.querySelector('.game-status');
        if (gameStatus) {
          gameStatus.textContent = `${winner.toUpperCase()} WINS!`;
        }
        
        // Submit match result to tournament system
        try {
          const result = { winner, finalScore };
          await tournamentApi.submitMatchResult(matchData.id, result, matchData);
          
          showNotification(container, 'Match result submitted!', 'success');
          
          // Atualizar status para indicar que estamos procurando a próxima partida
          updateMatchStatus(container, 'FINDING NEXT MATCH...');
          
          // Wait a moment then check for next match using integrated interface
          setTimeout(async () => {
            await checkForNextMatchIntegrated(container, tournamentId);
          }, 2000);
          
        } catch (error) {
          console.error('Failed to submit match result:', error);
          showNotification(container, 'Failed to submit match result', 'error');
          updateMatchStatus(container, 'ERROR SUBMITTING RESULT');
        }
      }
    };
    
    // Create and initialize the game
    console.log('🏗️ [PONG] Creating PongGame instance...');
    console.log('🕰️ [TIMING] Timestamp before creation:', new Date().toISOString());
    
    let pongGame;
    try {
      pongGame = new PongGame(gameConfig, gameCallbacks);
      console.log('✅ [PONG] PongGame instance created successfully');
      console.log('📊 [PONG] Instance properties:', {
        hasInit: typeof pongGame.init === 'function',
        constructor: pongGame.constructor.name,
        gameConfig: !!gameConfig,
        gameCallbacks: !!gameCallbacks
      });
    } catch (error) {
      console.error('❌ [PONG] Failed to create PongGame instance:', error);
      throw error;
    }
    
    console.log('🚀 [PONG] Initializing PongGame with container...');
    console.log('📊 [PONG] Container details for init:', {
      tagName: gameContainer.tagName,
      id: gameContainer.id,
      clientWidth: gameContainer.clientWidth,
      clientHeight: gameContainer.clientHeight
    });
    
    try {
      // Pass the container element to PongGame
      console.log('🎯 [CANVAS] Passing container to PongGame:', {
        tagName: gameContainer.tagName,
        id: gameContainer.id
      });
      
      await pongGame.init(gameContainer);
      console.log('✅ [PONG] PongGame.init() completed successfully');
      
      // Auto-start the game after initialization
      console.log('🚀 [AUTO_START] Starting game automatically...');
      setTimeout(() => {
        if (pongGame && typeof pongGame.startGame === 'function') {
          pongGame.startGame();
          console.log('✅ [AUTO_START] Game started automatically!');
        } else {
          console.error('❌ [AUTO_START] startGame method not available');
        }
      }, 500); // Small delay to ensure everything is ready
      
    } catch (error) {
      console.error('❌ [PONG] PongGame.init() failed:', error);
      console.error('📝 [PONG] Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      throw error;
    }
    
    // Store game instance for cleanup
    (container as any)._pongGameInstance = pongGame;
    console.log('💾 [CLEANUP] Game instance stored for cleanup');
    
    console.log('🎉 [SUCCESS] PongGame initialized successfully!');
    console.log('🕰️ [TIMING] Timestamp after initialization:', new Date().toISOString());
    
  } catch (error) {
    console.error('Failed to initialize PongGame for match:', error);
    
    // Fallback to error display
    const gameCanvas = container.querySelector('#gameCanvas');
    if (gameCanvas) {
      gameCanvas.innerHTML = `
        <div class="w-full h-full bg-black border border-red-500 flex items-center justify-center">
          <div class="text-center text-white">
            <div class="text-red-500 font-mono mb-4">GAME_ENGINE_ERROR</div>
            <div class="text-gray-300 font-mono text-sm">Failed to initialize game</div>
            <div class="mt-4 text-yellow-500 font-mono text-xs">Check console for details</div>
          </div>
        </div>
      `;
    }
    
    throw error;
  }
}

// Check for next match in tournament (legacy version)
async function checkForNextMatch(container: HTMLElement, tournamentId: string): Promise<void> {
  // Redirect to integrated version
  await checkForNextMatchIntegrated(container, tournamentId);
}

// Check for next match using integrated tournament interface
async function checkForNextMatchIntegrated(container: HTMLElement, tournamentId: string): Promise<void> {
  try {
    console.log('🔍 [NEXT_MATCH] Checking for next match in tournament:', tournamentId);
    
    // Get updated tournament details
    const tournamentDetails = await tournamentApi.getTournament(tournamentId);
    console.log('📊 [TOURNAMENT_UPDATE] Updated tournament data:', tournamentDetails);
    
    // Atualizar sidebar com dados atualizados
    await updateTournamentSidebar(container, tournamentDetails, { status: 'SEARCHING_NEXT' });
    
    if (tournamentDetails.matches && tournamentDetails.matches.length > 0) {
      // Find the next available match
      const nextMatch = tournamentDetails.matches.find((match: any) => 
        match.status === 'WAITING' || match.status === 'IN_PROGRESS'
      );
      
      if (nextMatch) {
        console.log('✅ [NEXT_MATCH] Next match found:', nextMatch.id);
        updateMatchStatus(container, 'LOADING NEXT MATCH...');
        showNotification(container, 'Starting next match...', 'success');
        
        // Start the next match automatically using integrated interface
        setTimeout(async () => {
          console.log('🚀 [AUTO_START] Auto-starting next match:', nextMatch.id);
          await startNextMatchIntegrated(container, nextMatch, tournamentId);
        }, 1500);
      } else {
        console.log('🏆 [TOURNAMENT_END] No more matches, tournament completed');
        updateMatchStatus(container, 'TOURNAMENT COMPLETED!');
        showNotification(container, 'Tournament completed! 🏆', 'success');
        
        // Show final tournament results for a moment
        setTimeout(() => {
          updateMatchStatus(container, 'RETURNING TO LOBBY...');
          setTimeout(() => {
            returnToTournamentView(container);
          }, 2000);
        }, 4000);
      }
    } else {
      console.log('❌ [NO_MATCHES] No matches found in tournament');
      updateMatchStatus(container, 'NO MATCHES FOUND');
      setTimeout(() => {
        returnToTournamentView(container);
      }, 2000);
    }
  } catch (error) {
    console.error('❌ [NEXT_MATCH_ERROR] Failed to check for next match:', error);
    updateMatchStatus(container, 'ERROR LOADING NEXT MATCH');
    showNotification(container, 'Failed to load next match', 'error');
    setTimeout(() => {
      returnToTournamentView(container);
    }, 3000);
  }
}

// Start next match using integrated interface (avoids full page rebuild)
async function startNextMatchIntegrated(container: HTMLElement, nextMatchData: any, tournamentId: string): Promise<void> {
  try {
    console.log('🎮 [NEXT_MATCH_START] Starting next match with integrated interface:', nextMatchData.id);
    
    // Update interface for new match without rebuilding entire UI
    const gameTitle = container.querySelector('#game-title') as HTMLElement;
    const gameControlsInfo = container.querySelector('#game-controls-info') as HTMLElement;
    const gameCanvasContainer = container.querySelector('#game-canvas-container') as HTMLElement;
    
    if (!gameTitle || !gameControlsInfo || !gameCanvasContainer) {
      console.error('❌ [UI_ERROR] Required UI elements not found, falling back to full rebuild');
      await startMultiplayerMatchDirect(container, nextMatchData, tournamentId);
      return;
    }
    
    // Update match info
    const isLocalVersus = nextMatchData.localVersus || false;
    const gameTitle_text = isLocalVersus ? 'LOCAL VERSUS MATCH' : `ROUND ${nextMatchData.round} - MATCH ${nextMatchData.matchNumber}`;
    const controlsText = isLocalVersus 
      ? 'Player 1: W/S keys | Player 2: Arrow Up/Down keys'
      : 'Controls: W/S or Arrow Keys to move paddle';
    
    gameTitle.innerText = gameTitle_text;
    gameControlsInfo.innerText = controlsText;
    
    // Clear and prepare canvas
    gameCanvasContainer.innerHTML = '';
    
    // Update tournament sidebar
    const tournamentData = await tournamentApi.getTournament(tournamentId);
    await updateTournamentSidebar(container, tournamentData, nextMatchData);
    
    // Initialize the new game
    updateMatchStatus(container, 'INITIALIZING GAME...');
    await initializePongGameForMatch(container, nextMatchData, tournamentId);
    
    console.log('✅ [NEXT_MATCH_SUCCESS] Next match started successfully with integrated interface');
  } catch (error) {
    console.error('❌ [NEXT_MATCH_ERROR] Failed to start next match with integrated interface:', error);
    // Fallback to full rebuild
    await startMultiplayerMatchDirect(container, nextMatchData, tournamentId);
  }
}

// Return to tournament view function
function returnToTournamentView(container: HTMLElement): void {
  console.log('🔄 [NAVIGATION] Returning to tournament view');
  const tournamentSection = container.querySelector('#tournamentSection');
  const gameSection = container.querySelector('#gameSection');
  const gameCanvasSection = container.querySelector('#gameCanvasSection');
  
  // Oculta todas as seções de jogo
  if (gameSection) gameSection.classList.add('hidden');
  if (gameCanvasSection) gameCanvasSection.classList.add('hidden');
  
  // Mostra a seção de torneio
  if (tournamentSection) tournamentSection.classList.remove('hidden');
  console.log('✅ [NAVIGATION] Tournament section shown, game sections hidden');
  
  // Limpa instâncias do jogo para liberar recursos
  if ((container as any)._pongGameInstance) {
    console.log('🧹 [CLEANUP] Removing PongGame instance');
    delete (container as any)._pongGameInstance;
  }
  
  // Reload tournaments to get updated status
  loadTournaments(container).catch(error => {
    console.error('Failed to reload tournaments:', error);
  });
}

// Alternative start multiplayer match function using match data directly
async function startMultiplayerMatchDirect(container: HTMLElement, matchData: any, tournamentId: string): Promise<void> {
  try {
    console.log('🎮 [MATCH_START] Starting match directly with data:', { matchId: matchData.id, tournamentId });

    // 1. Criar interface integrada do torneio com dados completos
    const mainContent = container.querySelector('#main-content') || container;
    
    // Buscar dados completos do torneio para exibir na interface
    let tournamentData;
    try {
      tournamentData = await tournamentApi.getTournament(tournamentId);
      console.log('🏆 [TOURNAMENT_DATA] Tournament data loaded:', tournamentData);
    } catch (error) {
      console.error('❌ [TOURNAMENT_DATA] Failed to load tournament data:', error);
      tournamentData = { name: 'Tournament', matches: [], participants: [] };
    }
    
    mainContent.innerHTML = `
      <section id="integrated-tournament-section" class="relative z-10 container-fluid py-4 animate-fade-in w-full h-full">
        <!-- Tournament Header -->
        <div class="bg-black/50 border border-neon-purple/30 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h1 class="text-xl font-bold text-neon-purple font-retro tracking-wider">${tournamentData.name}</h1>
              <span class="px-2 py-1 bg-neon-green/20 border border-neon-green/50 rounded text-neon-green font-mono text-xs">
                ${tournamentData.status || 'ACTIVE'}
              </span>
            </div>
            <div class="flex items-center space-x-4 text-sm font-mono">
              <span class="text-neon-cyan">Players: ${tournamentData.currentPlayers || 0}/${tournamentData.maxPlayers || 0}</span>
              <button id="backToTournamentBtn" class="btn btn-ghost btn-sm">Exit Tournament</button>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-12 gap-4 h-full">
          <!-- Tournament Sidebar -->
          <div class="col-span-3 space-y-4">
            <!-- Current Match Info -->
            <div class="bg-black/50 border border-neon-cyan/30 rounded-lg p-4">
              <h3 class="text-lg font-bold text-neon-cyan font-retro mb-3">CURRENT_MATCH</h3>
              <div id="current-match-info" class="space-y-2 text-sm font-mono">
                <div class="text-neon-green">Round ${matchData.round || 1} - Match ${matchData.matchNumber || 1}</div>
                <div class="text-neon-pink">Status: <span id="match-status">LOADING...</span></div>
                <div class="text-neon-yellow">Score: <span id="live-score">0 - 0</span></div>
              </div>
            </div>
            
            <!-- Tournament Progress -->
            <div class="bg-black/50 border border-neon-green/30 rounded-lg p-4">
              <h3 class="text-lg font-bold text-neon-green font-retro mb-3">PROGRESS</h3>
              <div id="tournament-progress" class="space-y-2 text-sm font-mono">
                <div class="text-neon-cyan">Matches Completed: <span id="completed-matches">0</span></div>
                <div class="text-neon-cyan">Matches Remaining: <span id="remaining-matches">0</span></div>
                <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div id="progress-bar" class="bg-neon-green h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
              </div>
            </div>
            
            <!-- Next Matches -->
            <div class="bg-black/50 border border-neon-pink/30 rounded-lg p-4">
              <h3 class="text-lg font-bold text-neon-pink font-retro mb-3">UPCOMING</h3>
              <div id="upcoming-matches" class="space-y-2 text-xs font-mono max-h-32 overflow-y-auto">
                <!-- Upcoming matches will be populated here -->
              </div>
            </div>
          </div>
          
          <!-- Game Area -->
          <div class="col-span-9">
            <div id="game-container" class="bg-black/50 border border-neon-cyan/30 rounded-lg p-4 h-full flex flex-col">
              <div class="flex items-center justify-between mb-4">
                <h2 id="game-title" class="text-2xl font-bold text-neon-green font-retro tracking-wider">LOADING_MATCH...</h2>
                <div id="game-timer" class="text-neon-yellow font-mono text-lg">00:00</div>
              </div>
              
              <div id="game-canvas-container" class="flex-1 bg-black flex items-center justify-center border border-neon-cyan/20 rounded"></div>
              
              <div class="mt-4 flex items-center justify-between">
                <p id="game-controls-info" class="text-neon-cyan/80 font-mono text-sm"></p>
                <div id="game-actions" class="flex space-x-2">
                  <!-- Game action buttons will be added here -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
    console.log('✅ [DOM] Game area cleaned and prepared.');

    // 2. Preparar dados e textos
    const isLocalVersus = matchData.localVersus || false;
    const gameTitle = isLocalVersus ? 'LOCAL VERSUS MATCH' : `ROUND ${matchData.round} - MATCH ${matchData.matchNumber}`;
    const controlsText = isLocalVersus 
      ? 'Player 1: W/S keys | Player 2: Arrow Up/Down keys'
      : 'Controls: W/S or Arrow Keys to move paddle';

    (mainContent.querySelector('#game-title') as HTMLElement).innerText = gameTitle;
    (mainContent.querySelector('#game-controls-info') as HTMLElement).innerText = controlsText;
    console.log('✅ [UI] Game title and controls updated.');
    
    // 5. Atualizar dados do torneio na interface
    await updateTournamentSidebar(container, tournamentData, matchData);
    
    // 6. Adicionar event listener para o botão de sair
    const backToTournamentBtn = mainContent.querySelector('#backToTournamentBtn');
    backToTournamentBtn?.addEventListener('click', () => {
      console.log('⬅️ [NAV] User clicked Exit Tournament');
      returnToTournamentView(container);
    });

    // 3. Esperar o container do canvas estar pronto e visível
    const gameCanvasContainer = mainContent.querySelector('#game-canvas-container') as HTMLElement;
    await waitForElementReady(gameCanvasContainer);
    console.log('✅ [TIMING] Canvas container is rendered and ready.');

    // 4. Inicializar o jogo
    console.log('🚀 [INIT] Initializing PongGame...');
    await initializePongGameForMatch(container, matchData, tournamentId);
    console.log('🎉 [SUCCESS] Match initialization completed.');
    showNotification(container, 'Match started!', 'success');

  } catch (error) {
    console.error('❌ [CRITICAL] Failed to start multiplayer match:', error);
    showNotification(container, 'Failed to start match. Check console for details.', 'error');
    // Opcional: reverter a UI para um estado seguro
    // returnToTournamentView(container);
  }
}

// Helper para esperar o elemento estar pronto no DOM
function waitForElementReady(element: HTMLElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!element) {
      return reject(new Error('Element not found in DOM.'));
    }

    const checkDimensions = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        resolve();
      } else {
        requestAnimationFrame(checkDimensions);
      }
    };

    checkDimensions();
  });
}

// Atualizar sidebar do torneio com dados em tempo real
async function updateTournamentSidebar(container: HTMLElement, tournamentData: any, currentMatchData: any): Promise<void> {
  try {
    console.log('🔄 [SIDEBAR] Updating tournament sidebar with data:', { tournamentData, currentMatchData });
    
    // Atualizar informações da partida atual
    const matchStatus = container.querySelector('#match-status');
    if (matchStatus) {
      matchStatus.textContent = currentMatchData.status || 'IN_PROGRESS';
    }
    
    // Calcular progresso do torneio
    const totalMatches = tournamentData.matches ? tournamentData.matches.length : 0;
    const completedMatches = tournamentData.matches ? tournamentData.matches.filter((m: any) => m.status === 'COMPLETED').length : 0;
    const remainingMatches = totalMatches - completedMatches;
    const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;
    
    // Atualizar progresso
    const completedElement = container.querySelector('#completed-matches');
    const remainingElement = container.querySelector('#remaining-matches');
    const progressBar = container.querySelector('#progress-bar') as HTMLElement;
    
    if (completedElement) completedElement.textContent = completedMatches.toString();
    if (remainingElement) remainingElement.textContent = remainingMatches.toString();
    if (progressBar) progressBar.style.width = `${progressPercentage}%`;
    
    // Atualizar próximas partidas
    const upcomingMatches = tournamentData.matches ? 
      tournamentData.matches.filter((m: any) => m.status === 'WAITING' || m.status === 'IN_PROGRESS').slice(0, 5) : [];
    
    const upcomingContainer = container.querySelector('#upcoming-matches');
    if (upcomingContainer) {
      if (upcomingMatches.length > 0) {
        upcomingContainer.innerHTML = upcomingMatches.map((match: any) => `
          <div class="text-neon-cyan p-2 bg-gray-800/50 rounded border border-neon-cyan/20">
            <div class="text-neon-green">Round ${match.round} - Match ${match.matchNumber}</div>
            <div class="text-neon-pink text-xs">${match.status}</div>
          </div>
        `).join('');
      } else {
        upcomingContainer.innerHTML = '<div class="text-neon-cyan/60">No upcoming matches</div>';
      }
    }
    
    console.log('✅ [SIDEBAR] Tournament sidebar updated successfully');
  } catch (error) {
    console.error('❌ [SIDEBAR] Failed to update tournament sidebar:', error);
  }
}

// Atualizar placar em tempo real na interface integrada
function updateLiveScore(container: HTMLElement, player1Score: number, player2Score: number): void {
  const liveScore = container.querySelector('#live-score');
  if (liveScore) {
    liveScore.textContent = `${player1Score} - ${player2Score}`;
  }
}

// Atualizar status da partida na interface integrada
function updateMatchStatus(container: HTMLElement, status: string): void {
  const matchStatus = container.querySelector('#match-status');
  if (matchStatus) {
    matchStatus.textContent = status;
  }
}

// Start multiplayer match function
async function startMultiplayerMatch(container: HTMLElement, matchId: string, tournamentId: string): Promise<void> {
  try {
    console.log('startMultiplayerMatch called with:', { matchId, tournamentId });
    
    // Validate matchId
    if (!matchId || typeof matchId !== 'string') {
      throw new Error(`Invalid matchId: ${matchId}`);
    }
    
    // Get match details with retry logic
    console.log('Calling getMatchDetails for matchId:', matchId);
    let matchResponse;
    let retries = 3;
    
    while (retries > 0) {
      try {
        matchResponse = await tournamentApi.getMatchDetails(matchId);
        console.log('getMatchDetails response:', matchResponse);
        
        if (matchResponse && matchResponse.success) {
          break; // Success, exit retry loop
        } else {
          console.warn(`getMatchDetails attempt failed, retries left: ${retries - 1}`, matchResponse);
          if (retries === 1) {
            throw new Error(`Failed to get match details after retries: ${JSON.stringify(matchResponse)}`);
          }
        }
      } catch (error) {
        console.error(`getMatchDetails error on attempt ${4 - retries}:`, error);
        if (retries === 1) {
          throw error;
        }
      }
      
      retries--;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (!matchResponse || !matchResponse.success) {
      console.error('getMatchDetails failed after all retries:', matchResponse);
      throw new Error('Failed to get match details');
    }
    
    const matchData = matchResponse.data;
    const isLocalVersus = matchData.localVersus;
    
    // Hide tournament section and show multiplayer game
    const tournamentSection = container.querySelector('#tournamentSection');
    const gameSection = container.querySelector('#gameSection');
    
    if (tournamentSection) tournamentSection.classList.add('hidden');
    if (gameSection) gameSection.classList.remove('hidden');
    
    // Update game section for multiplayer
    const gameSectionElement = gameSection as HTMLElement;
    const gameTitle = isLocalVersus ? 'LOCAL VERSUS MATCH' : 'MULTIPLAYER MATCH';
    const controlsText = isLocalVersus 
      ? 'Player 1: W/S keys | Player 2: Arrow Up/Down keys'
      : 'Controls: W/S or Arrow Keys to move paddle';
    
    gameSectionElement.innerHTML = `
      <div class="text-center space-y-6">
        <h2 class="text-3xl font-bold text-neon-green font-retro tracking-wider mb-8">${gameTitle}</h2>
        
        <div id="multiplayerStatus" class="text-neon-cyan font-mono text-lg mb-4">
          ${isLocalVersus ? 'Preparing local versus match...' : 'Connecting to match...'}
        </div>
        
        <div class="relative bg-black border-2 border-neon-cyan rounded-lg overflow-hidden mx-auto" style="width: 820px; height: 420px;">
          <canvas id="multiplayerCanvas" width="800" height="400" class="border border-neon-cyan/50"></canvas>
        </div>
        
        <div class="flex justify-center space-x-4 mt-6">
          <button id="exitMultiplayerMatch" class="btn btn-ghost">
            <span class="font-retro tracking-wider">EXIT_MATCH</span>
          </button>
        </div>
        
        <div class="text-sm text-neon-cyan/60 font-mono mt-4">
          <p>${controlsText}</p>
          ${!isLocalVersus ? '<p>Press SPACE when ready to play</p>' : ''}
        </div>
      </div>
    `;
    
    // Get canvas and initialize game
    const canvas = document.getElementById('multiplayerCanvas') as HTMLCanvasElement;
    const statusElement = document.getElementById('multiplayerStatus') as HTMLElement;
    
    if (!canvas) {
      throw new Error('Multiplayer canvas not found');
    }
    
    // Create game instance based on mode
    const game = isLocalVersus 
      ? new LocalVersusGame(canvas, matchData)
      : new MultiplayerGame(canvas, matchId);
    
    // Set up status and game end callbacks
    game.setOnStatusChange((status: string) => {
      if (statusElement) {
        statusElement.textContent = status;
      }
    });
    
    game.setOnGameEnd(async (winner: string, scores: any) => {
      if (statusElement) {
        statusElement.textContent = `Game finished! Winner: ${winner}`;
      }
      
      // Show result notification
      showNotification(container, `Match completed! Winner: ${winner}`, 'success');
      
      // Wait a moment to show the result
      setTimeout(async () => {
        try {
          // Get updated tournament details to find next match
          const tournamentDetails = await tournamentApi.getTournament(tournamentId);
          console.log('Looking for next match in tournament:', tournamentDetails);
          
          if (tournamentDetails.matches && tournamentDetails.matches.length > 0) {
            // Find the next available match (WAITING or IN_PROGRESS)
            const nextMatch = tournamentDetails.matches.find((match: any) => 
              match.status === 'WAITING' || match.status === 'IN_PROGRESS'
            );
            
            console.log('Next match found:', nextMatch);
            
            if (nextMatch) {
              // Automatically start the next match
              statusElement.textContent = 'Starting next match...';
              await startMultiplayerMatch(container, nextMatch.id, tournamentId);
            } else {
              // No more matches - tournament is complete
              statusElement.textContent = 'Tournament completed!';
              showNotification(container, 'Tournament completed!', 'success');
              setTimeout(() => {
                showTournamentSection(container);
              }, 3000);
            }
          } else {
            // No matches found - return to tournament
            setTimeout(() => {
              showTournamentSection(container);
            }, 2000);
          }
        } catch (error) {
          console.error('Failed to find next match:', error);
          // On error, return to tournament section
          setTimeout(() => {
            showTournamentSection(container);
          }, 2000);
        }
      }, 2000);
    });
    
    // Connect to match (for multiplayer) or start immediately (for local-versus)
    if (isLocalVersus) {
      // Local versus starts immediately
      if (statusElement) {
        statusElement.textContent = 'Local versus match ready!';
      }
    } else {
      // Connect to multiplayer match
      await (game as MultiplayerGame).connect();
    }
    
    // Setup exit button
    const exitButton = document.getElementById('exitMultiplayerMatch');
    exitButton?.addEventListener('click', () => {
      if (isLocalVersus) {
        (game as LocalVersusGame).destroy();
      } else {
        (game as MultiplayerGame).disconnect();
      }
      showTournamentSection(container);
    });
    
  } catch (error) {
    console.error('Failed to start multiplayer match:', error);
    showNotification(container, 'Failed to start multiplayer match.', 'error');
    
    // Return to tournament section on error
    showTournamentSection(container);
  }
} 

// --- BEGIN: New Tournament Bracket Rendering ---
function renderTournamentBracket(container: HTMLElement, tournamentData: Tournament): void {
  const bracketContainer = container.querySelector('#tournament-bracket-container');
  if (!bracketContainer) {
    console.error('Bracket container not found!');
    return;
  }

  // Group matches by round
  const rounds: { [key: number]: Match[] } = {};
  tournamentData.matches.forEach(match => {
    if (!rounds[match.round]) {
      rounds[match.round] = [];
    }
    rounds[match.round].push(match);
  });

  // Sort rounds and matches within rounds
  const sortedRoundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);
  sortedRoundNumbers.forEach(roundNum => {
    rounds[roundNum].sort((a, b) => a.matchNumber - b.matchNumber);
  });

  let bracketHTML = '<div class="tournament-bracket">';

  for (const roundNum of sortedRoundNumbers) {
    const roundMatches = rounds[roundNum];
    const roundTitle = getRoundTitle(sortedRoundNumbers.length, roundNum);

    bracketHTML += `
      <div class="round">
        <h3 class="round-title">${roundTitle}</h3>
        <div class="matches">
    `;

    for (const match of roundMatches) {
      const player1 = tournamentData.participants.find(p => p.id === match.player1Id);
      const player2 = tournamentData.participants.find(p => p.id === match.player2Id);

      const p1Name = player1?.displayName ?? 'TBD';
      const p2Name = player2?.displayName ?? (match.player1Id ? 'TBD' : 'BYE');

      const p1Score = match.player1Score ?? '';
      const p2Score = match.player2Score ?? '';

      let p1Class = '';
      let p2Class = '';
      if (match.status === 'COMPLETED') {
        if (match.winnerId === player1?.id) p1Class = 'winner';
        if (match.winnerId === player2?.id) p2Class = 'winner';
      }

      bracketHTML += `
        <div class="match ${match.status.toLowerCase()}">
          <div class="match-content">
            <div class="team ${p1Class}">
              <span class="name">${p1Name}</span>
              <span class="score">${p1Score}</span>
            </div>
            <div class="team ${p2Class}">
              <span class="name">${p2Name}</span>
              <span class="score">${p2Score}</span>
            </div>
          </div>
        </div>
      `;
    }

    bracketHTML += '</div></div>'; // Close .matches and .round
  }

  bracketHTML += '</div>'; // Close .tournament-bracket
  bracketContainer.innerHTML = bracketHTML;
}

function getRoundTitle(totalRounds: number, currentRound: number): string {
    if (totalRounds === 1) return 'Final';
    if (currentRound === totalRounds) return 'Final';
    if (currentRound === totalRounds - 1) return 'Semi-Finals';
    if (currentRound === totalRounds - 2) return 'Quarter-Finals';
    return `Round ${currentRound}`;
}
// --- END: New Tournament Bracket Rendering ---