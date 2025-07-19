import { blockchainApi } from '../api/blockchain';

interface BlockchainTournament {
  id: number;
  name: string;
  description: string;
  creator: string;
  createdAt: number;
  completedAt: number;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  isVerified: boolean;
}

interface BlockchainAchievement {
  tournamentId: number;
  userId: string;
  achievementType: string;
  timestamp: number;
  score: number;
  proofHash: string;
}

export default function BlockchainVerification(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-gray-900 text-white p-6';

  container.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <button id="backButton" class="btn btn-ghost text-gray-400 hover:text-white">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </button>
        </div>
        <h1 class="text-4xl font-bold mb-2">🔗 Blockchain Verification</h1>
        <p class="text-gray-300">
          Verify tournament results and achievements stored immutably on the Avalanche blockchain
        </p>
      </div>

      <!-- Network Info -->
      <div class="bg-gray-800 rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold">📡 Network Information</h2>
          <div id="network-status" class="flex items-center">
            <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
            <span class="text-sm">Connecting...</span>
          </div>
        </div>
        <div id="network-info" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="text-sm text-gray-400">Network</div>
            <div id="network-name" class="text-lg font-semibold">Loading...</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="text-sm text-gray-400">Chain ID</div>
            <div id="chain-id" class="text-lg font-semibold">Loading...</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="text-sm text-gray-400">Contract Status</div>
            <div id="contract-status" class="text-lg font-semibold">Loading...</div>
          </div>
        </div>
        <div class="mt-4 p-4 bg-gray-700 rounded-lg">
          <div class="text-sm text-gray-400">Smart Contract Address</div>
          <div id="contract-address" class="text-sm font-mono break-all">Loading...</div>
        </div>
      </div>

      <!-- Verification Tools -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Tournament Verification -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold mb-4">🏆 Tournament Verification</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Tournament ID</label>
              <input 
                type="number" 
                id="tournament-id-input" 
                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tournament ID"
                min="1"
              />
            </div>
            <button 
              id="verify-tournament-btn"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Verify Tournament
            </button>
            <div id="tournament-verification-result" class="hidden"></div>
          </div>
        </div>

        <!-- Match Result Verification -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-semibold mb-4">⚔️ Match Result Verification</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Result Hash</label>
              <input 
                type="text" 
                id="result-hash-input" 
                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter result hash (0x...)"
                pattern="^0x[a-fA-F0-9]{64}$"
              />
            </div>
            <button 
              id="verify-result-btn"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Verify Result
            </button>
            <div id="result-verification-result" class="hidden"></div>
          </div>
        </div>
      </div>

      <!-- User Achievements -->
      <div class="bg-gray-800 rounded-lg p-6 mb-8">
        <h3 class="text-xl font-semibold mb-4">🏅 User Achievements</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">User ID</label>
            <input 
              type="text" 
              id="user-id-input" 
              class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter user ID"
            />
          </div>
          <button 
            id="get-achievements-btn"
            class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Get Achievements
          </button>
          <div id="achievements-result" class="hidden"></div>
        </div>
      </div>

      <!-- Blockchain Statistics -->
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">📊 Blockchain Statistics</h3>
          <button 
            id="refresh-stats-btn"
            class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
        <div id="blockchain-stats" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="text-sm text-gray-400">Total Tournaments</div>
            <div id="total-tournaments" class="text-2xl font-bold text-blue-400">0</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="text-sm text-gray-400">Verified Results</div>
            <div id="verified-results" class="text-2xl font-bold text-green-400">0</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4">
            <div class="text-sm text-gray-400">Last Update</div>
            <div id="last-update" class="text-sm text-gray-400">Never</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize the page
  initializeBlockchainVerification(container);

  return container;
}

async function initializeBlockchainVerification(container: HTMLElement) {
  // Load network information
  await loadNetworkInfo(container);
  
  // Load blockchain statistics
  await loadBlockchainStats(container);
  
  // Setup event listeners
  setupEventListeners(container);
}

async function loadNetworkInfo(container: HTMLElement) {
  try {
    const response = await blockchainApi.getNetworkInfo();
    const { network, contractAddress, isDeployed } = response;
    
    // Update network status
    const statusElement = container.querySelector('#network-status');
    if (isDeployed) {
      statusElement!.innerHTML = `
        <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
        <span class="text-sm">Connected</span>
      `;
    } else {
      statusElement!.innerHTML = `
        <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
        <span class="text-sm">Contract Not Deployed</span>
      `;
    }
    
    // Update network information
    container.querySelector('#network-name')!.textContent = network.name || 'Unknown';
    container.querySelector('#chain-id')!.textContent = network.chainId?.toString() || 'Unknown';
    container.querySelector('#contract-status')!.textContent = isDeployed ? 'Deployed' : 'Not Deployed';
    container.querySelector('#contract-address')!.textContent = contractAddress || 'Not Available';
    
  } catch (error) {
    console.error('Error loading network info:', error);
    const statusElement = container.querySelector('#network-status');
    statusElement!.innerHTML = `
      <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
      <span class="text-sm">Connection Error</span>
    `;
  }
}

async function loadBlockchainStats(container: HTMLElement) {
  try {
    const response = await blockchainApi.getStats();
    const { tournamentCount } = response;
    
    container.querySelector('#total-tournaments')!.textContent = tournamentCount?.toString() || '0';
    container.querySelector('#last-update')!.textContent = new Date().toLocaleString();
    
  } catch (error) {
    console.error('Error loading blockchain stats:', error);
    showErrorMessage('Failed to load blockchain statistics');
  }
}

function setupEventListeners(container: HTMLElement) {
  // Tournament verification
  const verifyTournamentBtn = container.querySelector('#verify-tournament-btn');
  verifyTournamentBtn?.addEventListener('click', async () => {
    const tournamentId = (container.querySelector('#tournament-id-input') as HTMLInputElement).value;
    if (!tournamentId) {
      showErrorMessage('Please enter a tournament ID');
      return;
    }
    
    await verifyTournament(parseInt(tournamentId), container);
  });
  
  // Match result verification
  const verifyResultBtn = container.querySelector('#verify-result-btn');
  verifyResultBtn?.addEventListener('click', async () => {
    const resultHash = (container.querySelector('#result-hash-input') as HTMLInputElement).value;
    if (!resultHash) {
      showErrorMessage('Please enter a result hash');
      return;
    }
    
    if (!resultHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      showErrorMessage('Invalid result hash format');
      return;
    }
    
    await verifyMatchResult(resultHash, container);
  });
  
  // User achievements
  const getAchievementsBtn = container.querySelector('#get-achievements-btn');
  getAchievementsBtn?.addEventListener('click', async () => {
    const userId = (container.querySelector('#user-id-input') as HTMLInputElement).value;
    if (!userId) {
      showErrorMessage('Please enter a user ID');
      return;
    }
    
    await getUserAchievements(userId, container);
  });
  
  // Refresh stats
  const refreshStatsBtn = container.querySelector('#refresh-stats-btn');
  refreshStatsBtn?.addEventListener('click', async () => {
    await loadBlockchainStats(container);
  });

  // Back button
  const backButton = container.querySelector('#backButton');
  backButton?.addEventListener('click', () => {
    window.location.href = '/dashboard'; // Redirect to dashboard
  });
}

async function verifyTournament(tournamentId: number, container: HTMLElement) {
  try {
    showLoadingMessage('Verifying tournament...');
    
    const response = await blockchainApi.getTournament(tournamentId);
    const tournament = response.tournament;
    
    hideLoadingMessage();
    
    const resultContainer = container.querySelector('#tournament-verification-result');
    resultContainer!.className = 'bg-green-900 border border-green-600 rounded-lg p-4 text-green-100';
    resultContainer!.innerHTML = `
      <div class="flex items-center mb-3">
        <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
        <span class="font-semibold">Tournament Verified</span>
      </div>
      <div class="space-y-2 text-sm">
        <div><strong>Name:</strong> ${tournament.name}</div>
        <div><strong>Description:</strong> ${tournament.description}</div>
        <div><strong>Status:</strong> ${tournament.status}</div>
        <div><strong>Participants:</strong> ${tournament.currentParticipants}/${tournament.maxParticipants}</div>
        <div><strong>Created:</strong> ${new Date(tournament.createdAt * 1000).toLocaleString()}</div>
        ${tournament.completedAt ? `<div><strong>Completed:</strong> ${new Date(tournament.completedAt * 1000).toLocaleString()}</div>` : ''}
        <div><strong>Verified:</strong> ${tournament.isVerified ? 'Yes' : 'No'}</div>
      </div>
    `;
    
  } catch (error) {
    hideLoadingMessage();
    showVerificationError('tournament-verification-result', 'Tournament not found or verification failed', container);
  }
}

async function verifyMatchResult(resultHash: string, container: HTMLElement) {
  try {
    showLoadingMessage('Verifying match result...');
    
    const response = await blockchainApi.verifyMatchResult(resultHash);
    const isVerified = response.isVerified;
    
    hideLoadingMessage();
    
    const resultContainer = container.querySelector('#result-verification-result');
    
    if (isVerified) {
      resultContainer!.className = 'bg-green-900 border border-green-600 rounded-lg p-4 text-green-100';
      resultContainer!.innerHTML = `
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span class="font-semibold">Match Result Verified</span>
        </div>
        <div class="text-sm mt-2">
          This match result has been verified and stored immutably on the blockchain.
        </div>
      `;
    } else {
      resultContainer!.className = 'bg-red-900 border border-red-600 rounded-lg p-4 text-red-100';
      resultContainer!.innerHTML = `
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span class="font-semibold">Match Result Not Verified</span>
        </div>
        <div class="text-sm mt-2">
          This match result hash was not found on the blockchain.
        </div>
      `;
    }
    
  } catch (error) {
    hideLoadingMessage();
    showVerificationError('result-verification-result', 'Result verification failed', container);
  }
}

async function getUserAchievements(userId: string, container: HTMLElement) {
  try {
    showLoadingMessage('Loading achievements...');
    
    const response = await blockchainApi.getUserAchievements(userId);
    const achievements = response.achievements;
    
    hideLoadingMessage();
    
    const resultContainer = container.querySelector('#achievements-result');
    
    if (achievements.length === 0) {
      resultContainer!.className = 'bg-gray-700 rounded-lg p-4 text-gray-300';
      resultContainer!.innerHTML = `
        <div class="text-center">
          <div class="text-sm">No achievements found for this user.</div>
        </div>
      `;
    } else {
      resultContainer!.className = 'bg-purple-900 border border-purple-600 rounded-lg p-4 text-purple-100';
      resultContainer!.innerHTML = `
        <div class="mb-3">
          <span class="font-semibold">${achievements.length} Achievement(s) Found</span>
        </div>
        <div class="space-y-3">
          ${achievements.map(achievement => `
            <div class="bg-purple-800 rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">${achievement.achievementType}</span>
                <span class="text-sm text-purple-300">Score: ${achievement.score}</span>
              </div>
              <div class="text-xs text-purple-300">
                <div>Tournament ID: ${achievement.tournamentId}</div>
                <div>Date: ${new Date(achievement.timestamp * 1000).toLocaleString()}</div>
                <div>Proof: ${achievement.proofHash.substring(0, 16)}...</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    
  } catch (error) {
    hideLoadingMessage();
    showVerificationError('achievements-result', 'Failed to load achievements', container);
  }
}

function showVerificationError(elementId: string, message: string, container: HTMLElement) {
  const resultContainer = container.querySelector(`#${elementId}`);
  resultContainer!.className = 'bg-red-900 border border-red-600 rounded-lg p-4 text-red-100';
  resultContainer!.innerHTML = `
    <div class="flex items-center">
      <div class="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
      <span class="font-semibold">Verification Error</span>
    </div>
    <div class="text-sm mt-2">${message}</div>
  `;
}

function showLoadingMessage(message: string) {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'blockchain-loading';
  loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  loadingDiv.innerHTML = `
    <div class="bg-gray-800 rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-white text-lg">${message}</p>
    </div>
  `;
  document.body.appendChild(loadingDiv);
}

function hideLoadingMessage() {
  const loadingDiv = document.getElementById('blockchain-loading');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

function showErrorMessage(message: string) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}
