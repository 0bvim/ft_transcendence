import { showTournamentSection, setupTournamentEventListeners } from './tournament';
import { startLocalGame, cleanupLocalGame } from './localGame';
import TournamentCreate from '../TournamentCreate';

function showGameSection(container: HTMLElement, title: string) {
  const gameSection = container.querySelector('#gameSection') as HTMLElement;
  if (gameSection) gameSection.classList.remove('hidden');
  const gameTitleElement = container.querySelector('#gameTitle') as HTMLElement;
  if (gameTitleElement) gameTitleElement.textContent = title;
}

function hideGameSection(container: HTMLElement) {
  const gameSection = container.querySelector('#gameSection') as HTMLElement;
  if (gameSection) gameSection.classList.add('hidden');
}

function setupPageEventListeners(container: HTMLElement): void {
  const backButton = container.querySelector('#backButton');

  backButton?.addEventListener('click', () => {
    const gameSection = container.querySelector('#gameSection') as HTMLElement;
    const tournamentSection = container.querySelector('#tournamentSection') as HTMLElement;

    if (gameSection && !gameSection.classList.contains('hidden')) {
      cleanupLocalGame();
      hideGameSection(container);
    }

    if (tournamentSection && !tournamentSection.classList.contains('hidden')) {
      tournamentSection.classList.add('hidden');
    }

    window.history.pushState({}, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  setupTournamentEventListeners(container);
}

function handleUrlParameters(container: HTMLElement): void {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const mode = params.get('mode');

  if (window.location.pathname === '/tournament/create') {
    const tournamentCreatePage = TournamentCreate();
    container.innerHTML = '';
    container.appendChild(tournamentCreatePage);
    return;
  }

  if (view === 'tournaments') {
    showTournamentSection(container);
  } else if (mode) {
    switch (mode) {
      case 'ai':
        showGameSection(container, 'PLAYER VS AI');
        startLocalGame(container, { isAI: true});
        break;
      case 'local':
        showGameSection(container, 'LOCAL DUEL');
        startLocalGame(container, { isAI: false });
        break;
      case 'multiplayer':
        handleMultiplayer(container);
        break;
    }
  }

  cleanupUrlParameters();
}


function cleanupUrlParameters(): void {
  // const url = new URL(window.location.href);
  // url.searchParams.delete('view');
  // url.searchParams.delete('mode');
  // url.searchParams.delete('difficulty');
  // window.history.replaceState({}, '', url.toString());
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
            <span class="text-neon-cyan">ON</span>
          </h1>
        </div>
      </div>

      <!-- Game Section (hidden by default) -->
      <div id="gameSection" class="hidden animate-fade-in flex flex-col items-center justify-center">
        <h2 id="gameTitle" class="text-3xl font-bold text-neon-green font-retro tracking-wider mb-8"></h2>
        <div class="w-full">
          <div class="card bg-black border-2 border-neon-cyan overflow-hidden">
            <div class="min-h-[60vh] max-h-[80vh] flex items-center justify-center p-6" id="game-viewport">
              <div id="canvasContainer" class="w-full h-full absolute inset-0"></div>
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
