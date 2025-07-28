export default function Home(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen relative overflow-hidden';

  container.innerHTML = `
    <!-- Synthwave Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Animated Grid Background -->
      <div class="absolute inset-0 synthwave-grid opacity-30"></div>
      
      <!-- Neon Orbs -->
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(255,0,255,0.15) 0%, transparent 70%); animation-delay: -3s;"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(0,255,255,0.15) 0%, transparent 70%); animation-delay: -1s;"></div>
      <div class="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl animate-float" style="background: radial-gradient(circle, rgba(128,0,255,0.1) 0%, transparent 70%); animation-delay: -2s;"></div>
      
      <!-- Horizon Line -->
      <div class="horizon-line"></div>
      
      <!-- Perspective Grid -->
      <div class="absolute bottom-0 left-0 right-0 h-64 perspective-grid opacity-20"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-20 p-6">
      <div class="container-fluid">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <h1 class="text-3xl font-bold text-gradient font-retro tracking-wider">
              FT_TRANSCENDENCE
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <a href="/login" data-link class="nav-link">
              Sign In
            </a>
            <a href="/register" data-link class="btn btn-primary">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main class="relative z-10 flex items-center justify-center min-h-screen pt-0 pb-24">
      <div class="container text-center animate-fade-in">
        <!-- Hero Content -->
        <div class="max-w-6xl mx-auto">
          <!-- Main Title -->
          <div class="mb-12">
            <h1 class="text-8xl md:text-9xl font-bold text-gradient mb-8 animate-slide-up font-retro tracking-wider relative leading-tight">
              <div class="text-neon text-neon-glow">THE</div>
              <div class="text-gradient animate-neon-flicker">ULTIMATE</div>
              <div class="text-gradient animate-neon-flicker">PONG</div>
              <div class="text-neon-cyan text-shadow-lg">EXPERIENCE</div>
            </h1>
          </div>
          
          <!-- Subtitle -->
          <div class="mb-16">
            <p class="text-2xl text-neon-cyan/80 mb-4 max-w-4xl mx-auto leading-relaxed animate-slide-up font-mono" style="animation-delay: 0.2s;">
              <span class="text-neon-pink">&gt;</span> Experience the classic game like never before with 
              <span class="text-neon-green">modern authentication</span>, 
              <span class="text-neon-cyan">real-time multiplayer</span>, 
              <span class="text-neon-pink">tournaments</span>, and 
              <span class="text-warning-500">cutting-edge security</span> features.
              <span class="animate-pulse">_</span>
            </p>
          </div>
          
          <!-- Enhanced Action Buttons -->
          <div class="flex justify-center animate-slide-up" style="animation-delay: 0.4s;">
            <!-- Primary CTA Button -->
            <div class="relative group">
              <a href="/login" data-link class="btn btn-primary relative overflow-hidden text-lg px-12 py-6 block">
                <span class="relative z-10 flex items-center justify-center font-retro tracking-wider pointer-events-none">
                  START_PLAYING.EXE
                  <svg class="w-6 h-6 ml-4 transition-transform group-hover:translate-x-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
                <!-- Enhanced glow effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>
              </a>
              <!-- Outer glow ring -->
              <div class="absolute inset-0 -m-1 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-sm pointer-events-none"></div>
            </div>
          </div>

          <!-- Terminal Command Line -->
          <div class="mt-20 animate-slide-up" style="animation-delay: 0.6s;">
            <div class="inline-block bg-secondary-900/50 backdrop-blur-lg border border-neon-cyan/30 px-6 py-3 clip-cyber-button">
              <p class="text-neon-cyan/60 font-mono text-sm">
                <span class="text-neon-pink">root@ft_transcendence:~$</span> 
                <span class="animate-pulse">echo "Welcome to the future of gaming"</span>
                <span class="animate-pulse text-neon-green ml-2">_</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Minimal Footer -->
    <footer class="absolute bottom-0 left-0 right-0 z-10 border-t border-neon-pink/20 bg-secondary-900/20 backdrop-blur-sm">
      <div class="container-fluid py-4">
        <div class="text-center">
          <p class="text-neon-cyan/40 font-mono text-xs">
            <span class="text-neon-pink">ft_transcendence@2024:~$</span> 
            initialized_successfully
          </p>
        </div>
      </div>
    </footer>
  `;

  // Ensure button clicks work properly
  const startButton = container.querySelector('a[data-link]');
  if (startButton) {
    startButton.addEventListener('click', (e) => {
      console.log('Button clicked - checking if router handles it');
      // Let the event bubble up to the document where router listens
      // If router doesn't handle it in 100ms, manually navigate
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const href = startButton.getAttribute('href');
        if (currentPath === '/' || currentPath === '/home') {
          console.log('Router did not handle click, manually navigating to:', href);
          window.location.href = href || '/login';
        }
      }, 100);
    });
  }

  return container;
} 