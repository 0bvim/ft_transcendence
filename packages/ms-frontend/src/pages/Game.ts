export default function Game(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-900 text-white p-6';

  container.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <button id="backButton" class="btn btn-ghost text-gray-400 hover:text-white">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </button>
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
            Game Options
          </h1>
        </div>
      </div>

      <!-- Game Mode Selection -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- AI Opponent -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-green-500 transition-colors duration-300">
          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-semibold mb-4 text-green-400">Play vs AI</h3>
            <p class="text-gray-300 mb-6">
              Challenge an AI opponent in a classic Pong match. Perfect for practice or quick games.
            </p>
            <button id="playAiButton" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Start AI Game
            </button>
          </div>
        </div>

        <!-- Tournament/Multiplayer -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-purple-500 transition-colors duration-300">
          <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-6 bg-purple-600 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-semibold mb-4 text-purple-400">Tournament Play</h3>
            <p class="text-gray-300 mb-6">
              Join or create tournaments to compete against other players in organized matches.
            </p>
            <button id="playTournamentButton" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Browse Tournaments
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Match -->
      <div class="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-yellow-400">Quick Match</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-300 mb-2">Looking for a quick game? Join a random match!</p>
            <p class="text-sm text-gray-400">This feature will be available soon with real-time matchmaking.</p>
          </div>
          <button id="quickMatchButton" class="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 opacity-50 cursor-not-allowed" disabled>
            Quick Match (Coming Soon)
          </button>
        </div>
      </div>

      <!-- Game Instructions -->
      <div class="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-blue-400">How to Play</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold mb-2 text-white">Controls</h3>
            <ul class="text-gray-300 space-y-1">
              <li><strong>Player 1:</strong> A (Up) / Z (Down)</li>
              <li><strong>Player 2:</strong> Arrow Up / Arrow Down</li>
              <li><strong>Start:</strong> Spacebar</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-2 text-white">Objective</h3>
            <ul class="text-gray-300 space-y-1">
              <li>• Score points by hitting the ball past your opponent</li>
              <li>• First to reach the target score wins</li>
              <li>• Use paddle movement to control ball direction</li>
            </ul>
          </div>
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
    const gameServiceUrl = `http://${window.location.hostname}:3003`;
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