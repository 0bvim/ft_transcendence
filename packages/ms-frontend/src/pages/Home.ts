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
          <div class="flex items-center space-x-4">
            <!-- Cyberpunk Logo -->
            <div class="relative">
              <div class="w-12 h-12 clip-cyberpunk bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center shadow-neon-pink">
                <svg class="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="absolute inset-0 w-12 h-12 clip-cyberpunk bg-gradient-to-br from-neon-pink to-neon-cyan animate-glow-pulse opacity-50"></div>
            </div>
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
    <main class="relative z-10 flex items-center justify-center min-h-screen pt-0">
      <div class="container text-center animate-fade-in">
        <!-- Hero Content -->
        <div class="max-w-5xl mx-auto mb-20">
          <!-- Main Title -->
          <h1 class="text-7xl md:text-8xl font-bold text-gradient mb-8 animate-slide-up font-retro tracking-wider relative">
            <span class="text-neon text-neon-glow">THE ULTIMATE</span>
            <br />
            <span class="text-gradient animate-neon-flicker">PONG</span>
            <br />
            <span class="text-neon-cyan text-shadow-lg">EXPERIENCE</span>
          </h1>
          
          <!-- Subtitle -->
          <p class="text-xl text-neon-cyan/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up font-mono" style="animation-delay: 0.2s;">
            <span class="text-neon-pink">&gt;</span> Experience the classic game like never before with 
            <span class="text-neon-green">modern authentication</span>, 
            <span class="text-neon-cyan">real-time multiplayer</span>, 
            <span class="text-neon-pink">tournaments</span>, and 
            <span class="text-warning-500">cutting-edge security</span> features.
            <span class="animate-pulse">_</span>
          </p>
          
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-slide-up" style="animation-delay: 0.4s;">
            <a href="/register" data-link class="btn btn-primary group relative overflow-hidden">
              <span class="relative z-10 flex items-center">
                START_PLAYING.EXE
                <svg class="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>
            </a>
            <a href="#features" class="btn btn-secondary group">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                SYSTEM_INFO
              </span>
            </a>
          </div>

          <!-- Cyberpunk Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style="animation-delay: 0.6s;">
            <div class="card p-6 text-center group hover:scale-105 transition-transform duration-300">
              <div class="text-4xl font-bold text-neon-pink font-mono mb-2 animate-glow-pulse">1,000+</div>
              <div class="text-sm text-neon-cyan uppercase tracking-widest font-retro">Active_Players</div>
              <div class="w-full h-px bg-gradient-to-r from-transparent via-neon-pink to-transparent mt-3"></div>
            </div>
            <div class="card p-6 text-center group hover:scale-105 transition-transform duration-300">
              <div class="text-4xl font-bold text-neon-cyan font-mono mb-2 animate-glow-pulse">500+</div>
              <div class="text-sm text-neon-pink uppercase tracking-widest font-retro">Tournaments_Won</div>
              <div class="w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent mt-3"></div>
            </div>
            <div class="card p-6 text-center group hover:scale-105 transition-transform duration-300">
              <div class="text-4xl font-bold text-neon-green font-mono mb-2 animate-glow-pulse">10K+</div>
              <div class="text-sm text-neon-green uppercase tracking-widest font-retro">Games_Executed</div>
              <div class="w-full h-px bg-gradient-to-r from-transparent via-neon-green to-transparent mt-3"></div>
            </div>
          </div>
        </div>

        <!-- Feature Matrix -->
        <div id="features" class="relative">
          <!-- Section Header -->
          <div class="text-center mb-16 animate-slide-up" style="animation-delay: 0.8s;">
            <h2 class="text-5xl font-bold text-gradient mb-4 font-retro tracking-wider">
              <span class="text-neon-pink">&lt;</span>SYSTEM_FEATURES<span class="text-neon-cyan">/&gt;</span>
            </h2>
            <div class="w-32 h-px bg-gradient-to-r from-neon-pink to-neon-cyan mx-auto"></div>
          </div>

          <!-- Feature Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-slide-up" style="animation-delay: 1s;">
            <!-- Feature 1 -->
            <div class="card-hover p-8 text-center group relative">
              <div class="absolute inset-0 bg-gradient-to-br from-neon-pink/5 to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative">
                <div class="w-20 h-20 clip-cyberpunk bg-gradient-to-br from-neon-pink/20 to-neon-pink/40 mx-auto mb-6 flex items-center justify-center shadow-neon-pink group-hover:shadow-neon-pink transition-all duration-300">
                  <svg class="w-10 h-10 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-neon-cyan mb-3 font-retro uppercase tracking-wide">Multiplayer_Tournaments</h3>
                <p class="text-neon-cyan/70 font-mono text-sm leading-relaxed">
                  <span class="text-neon-pink">$</span> Compete with players worldwide in exciting tournaments with real-time matchmaking and blockchain verification.
                </p>
              </div>
            </div>

            <!-- Feature 2 -->
            <div class="card-hover p-8 text-center group relative">
              <div class="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative">
                <div class="w-20 h-20 clip-cyberpunk bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/40 mx-auto mb-6 flex items-center justify-center shadow-neon-cyan group-hover:shadow-neon-cyan transition-all duration-300">
                  <svg class="w-10 h-10 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-neon-green mb-3 font-retro uppercase tracking-wide">Advanced_Security</h3>
                <p class="text-neon-cyan/70 font-mono text-sm leading-relaxed">
                  <span class="text-neon-green">$</span> Military-grade authentication with 2FA, WebAuthn, and encrypted communications protecting your data.
                </p>
              </div>
            </div>

            <!-- Feature 3 -->
            <div class="card-hover p-8 text-center group relative">
              <div class="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-warning-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative">
                <div class="w-20 h-20 clip-cyberpunk bg-gradient-to-br from-neon-purple/20 to-neon-purple/40 mx-auto mb-6 flex items-center justify-center shadow-neon-purple group-hover:shadow-neon-purple transition-all duration-300">
                  <svg class="w-10 h-10 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-warning-500 mb-3 font-retro uppercase tracking-wide">Real-Time_Gaming</h3>
                <p class="text-neon-cyan/70 font-mono text-sm leading-relaxed">
                  <span class="text-warning-500">$</span> Lightning-fast gameplay with WebSocket connections and low-latency real-time synchronization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Command Line Footer -->
    <footer class="relative z-10 border-t border-neon-pink/30 mt-20">
      <div class="container-fluid py-8">
        <div class="text-center">
          <p class="text-neon-cyan/60 font-mono text-sm">
            <span class="text-neon-pink">root@ft_transcendence:~$</span> 
            echo "Welcome to the future of gaming" 
            <span class="animate-pulse">_</span>
          </p>
        </div>
      </div>
    </footer>
  `;

  return container;
} 