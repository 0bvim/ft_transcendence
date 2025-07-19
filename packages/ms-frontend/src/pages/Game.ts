export default function Game(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-secondary-50 flex items-center justify-center p-4';

  container.innerHTML = `
    <div class="w-full max-w-4xl text-center space-y-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-4 mb-6">
          <button id="backButton" class="btn btn-ghost text-secondary-600 hover:text-primary-600">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        
        <h1 class="text-4xl font-bold text-gradient mb-4">Pong Game</h1>
        <p class="text-secondary-600 text-lg">Get ready for the ultimate pong experience!</p>
      </div>

      <!-- Game Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="card-hover p-8 text-center group">
          <div class="w-16 h-16 bg-gradient-to-br from-success-500 to-success-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-900 mb-3">Play vs AI</h3>
          <p class="text-secondary-600 mb-6">Challenge our intelligent AI opponent</p>
          <button id="playAiButton" class="btn btn-success">
            Start AI Game
          </button>
        </div>

        <div class="card-hover p-8 text-center group">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-secondary-900 mb-3">Multiplayer</h3>
          <p class="text-secondary-600 mb-6">Play against other players online</p>
          <button id="playMultiplayerButton" class="btn btn-primary">
            Find Match
          </button>
        </div>
      </div>

      <!-- Game Status -->
      <div class="card-gradient p-6">
        <div class="flex items-center justify-center space-x-3 mb-4">
          <div class="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
          <span class="text-secondary-900 font-medium">Game Service Status: Connected</span>
        </div>
        <p class="text-secondary-600 text-sm">
          Game service is running on port 3003. Ready to play!
        </p>
      </div>

      <!-- Instructions -->
      <div class="text-left max-w-2xl mx-auto">
        <h3 class="text-lg font-semibold text-secondary-900 mb-4">How to Play</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary-600">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-primary-100 rounded flex items-center justify-center">
                <span class="text-primary-600 font-bold text-xs">↑</span>
              </div>
              <span>Move paddle up</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-primary-100 rounded flex items-center justify-center">
                <span class="text-primary-600 font-bold text-xs">↓</span>
              </div>
              <span>Move paddle down</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-success-100 rounded flex items-center justify-center">
                <span class="text-success-600 font-bold text-xs">⚡</span>
              </div>
              <span>First to 11 points wins</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-warning-100 rounded flex items-center justify-center">
                <span class="text-warning-600 font-bold text-xs">🏆</span>
              </div>
              <span>Compete in tournaments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup event listeners
  setupEventListeners(container);

  return container;
}

function setupEventListeners(container: HTMLElement) {
  const backButton = container.querySelector('#backButton') as HTMLButtonElement;
  const playAiButton = container.querySelector('#playAiButton') as HTMLButtonElement;
  const playMultiplayerButton = container.querySelector('#playMultiplayerButton') as HTMLButtonElement;

  // Back button
  backButton.addEventListener('click', () => {
    window.location.href = '/dashboard';
  });

  // Play vs AI
  playAiButton.addEventListener('click', () => {
    // Redirect to the game service
    const gameServiceUrl = `http://${window.location.hostname}:3003`;
    window.open(gameServiceUrl, '_blank');
  });

  // Play Multiplayer
  playMultiplayerButton.addEventListener('click', () => {
    // For now, redirect to tournament page
    // Later this could implement matchmaking
    window.location.href = '/tournament';
  });
} 