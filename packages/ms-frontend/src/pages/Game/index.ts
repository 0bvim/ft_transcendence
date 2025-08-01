import { showMenuGame, GameType, hideGame } from './game';
import { showTournamentSection, setupTournamentEventListeners } from './tournament';

function setupPageEventListeners(container: HTMLElement): void {
  const playAiButton = container.querySelector('#playAiButton');
  const localGameButton = container.querySelector('#localGameButton');
  const tournamentButton = container.querySelector('#tournamentButton');
  const backButton = container.querySelector('#backButton');
  const difficultyEasy = container.querySelector('#difficulty-easy');
  const difficultyMedium = container.querySelector('#difficulty-medium');
  const difficultyHard = container.querySelector('#difficulty-hard');

  let selectedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';

  const updateButtonStyles = () => {
    difficultyEasy?.classList.toggle('btn-success', selectedDifficulty === 'easy');
    difficultyEasy?.classList.toggle('opacity-50', selectedDifficulty !== 'easy');
    difficultyMedium?.classList.toggle('btn-warning', selectedDifficulty === 'medium');
    difficultyMedium?.classList.toggle('opacity-50', selectedDifficulty !== 'medium');
    difficultyHard?.classList.toggle('btn-error', selectedDifficulty === 'hard');
    difficultyHard?.classList.toggle('opacity-50', selectedDifficulty !== 'hard');
  };

  difficultyEasy?.addEventListener('click', () => {
    selectedDifficulty = 'easy';
    updateButtonStyles();
  });

  difficultyMedium?.addEventListener('click', () => {
    selectedDifficulty = 'medium';
    updateButtonStyles();
  });

  difficultyHard?.addEventListener('click', () => {
    selectedDifficulty = 'hard';
    updateButtonStyles();
  });

  playAiButton?.addEventListener('click', () => showMenuGame(container, GameType.AI, selectedDifficulty));
  localGameButton?.addEventListener('click', () => showMenuGame(container, GameType.Local));

  // Set initial styles
  updateButtonStyles();
  tournamentButton?.addEventListener('click', () => showTournamentSection(container));

  backButton?.addEventListener('click', () => {
    // Hide any active game or tournament section before navigating
    const gameSection = container.querySelector('#gameSection') as HTMLElement;
    const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;
    if (!gameSection.classList.contains('hidden')) {
        hideGame(container);
    }
    if (!tournamentSection.classList.contains('hidden')) {
        const gameModeSelection = container.querySelector('#gameModeSelection') as HTMLElement;
        tournamentSection.classList.add('hidden');
        gameModeSelection.classList.remove('hidden');
    } else {
        window.history.pushState({}, '', '/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
  });

  setupTournamentEventListeners(container);
}

function handleUrlParameters(container: HTMLElement): void {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');

  if (view === 'tournaments') {
    showTournamentSection(container);
  }
  cleanupUrlParameters();
}

function cleanupUrlParameters(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('view');
  window.history.replaceState({}, '', url.toString());
}

export default function GamePage(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen relative overflow-hidden';

  container.innerHTML = `
    <!-- Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 synthwave-grid opacity-15"></div>
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(255,0,255,0.12) 0%, transparent 70%);"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,255,0.12) 0%, transparent 70%); animation-delay: -2s;"></div>
      <div class="horizon-line"></div>
      <div class="scan-line"></div>
    </div>

    <div class="relative z-10 container-fluid py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-12 animate-fade-in">
        <div class="flex items-center space-x-6">
          <button id="backButton" class="btn btn-ghost group">
            <svg class="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            BACK
          </button>
          <h1 id="pageTitle" class="text-5xl font-bold text-gradient font-retro tracking-wider">
            <span class="text-neon-pink">GAME</span> 
            <span class="text-neon-cyan">OPTIONS</span>
          </h1>
        </div>
      </div>

      <!-- Game Mode Selection -->
      <div id="gameModeSelection" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up">
        <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
          <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">PLAY VS AI</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Challenge our AI opponent.</p>
          <button id="playAiButton" class="btn btn-primary w-full">START_AI_GAME</button>
          <div id="difficulty-selection" class="flex justify-center space-x-2 my-2">
            <button id="difficulty-easy" class="btn btn-sm btn-success">Easy</button>
            <button id="difficulty-medium" class="btn btn-sm btn-warning">Medium</button>
            <button id="difficulty-hard" class="btn btn-sm btn-error">Hard</button>
          </div>
        </div>
        <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
          <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">LOCAL DUEL</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Play with a friend on the same screen.</p>
          <button id="localGameButton" class="btn btn-primary w-full">START_LOCAL_GAME</button>
        </div>
        <div class="card p-6 text-center group hover:scale-105 transition-all duration-500">
          <h3 class="text-xl font-bold text-neon-green mb-3 font-retro">TOURNAMENTS</h3>
          <p class="text-neon-cyan/80 mb-6 font-mono text-sm">Compete and climb the leaderboard.</p>
          <button id="tournamentButton" class="btn btn-primary w-full">VIEW_TOURNAMENTS</button>
        </div>
      </div>

      <!-- Game Section (hidden by default) -->
      <div id="gameSection" class="hidden animate-fade-in flex flex-col items-center justify-center">
        <h2 id="gameTitle" class="text-3xl font-bold text-neon-green font-retro tracking-wider mb-8"></h2>
        <div class="relative bg-black border-2 border-neon-cyan rounded-lg overflow-hidden mx-auto w-full max-w-4xl">
            <div id="canvasContainer" class="w-full h-full"></div>
            <div id="gameOverlay" class="absolute inset-0 flex flex-col items-center p-4 pointer-events-none">
                <!-- Scoreboard -->
                <div class="flex items-center justify-center space-x-24 w-full">
                    <!-- Player 1 -->
                    <div class="text-center">
                        <div id="player1Name" class="text-xl font-bold text-white font-retro tracking-wider">PLAYER 1</div>
                        <div id="player1Score" class="text-4xl font-bold text-white font-mono tracking-widest mt-2">0</div>
                    </div>
                    <!-- Player 2 -->
                    <div class="text-center">
                        <div id="player2Name" class="text-xl font-bold text-white font-retro tracking-wider">PLAYER 2</div>
                        <div id="player2Score" class="text-4xl font-bold text-white font-mono tracking-widest mt-2">0</div>
                    </div>
                </div>

                <!-- Game Status Message -->
                <div id="gameStatus" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-neon-pink font-retro hidden"></div>
            </div>
        </div>
      </div>

      <!-- Tournament Section (hidden by default) -->
      <div id="tournamentSection" class="hidden animate-fade-in">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-neon-green font-retro tracking-wider">TOURNAMENTS</h2>
            <button id="createTournamentButton" class="btn btn-primary">CREATE_TOURNAMENT</button>
        </div>
        <div id="tournamentList" class="space-y-4"></div>
      </div>
    </div>
  `;

  setupPageEventListeners(container);
  handleUrlParameters(container);

  return container;
}
