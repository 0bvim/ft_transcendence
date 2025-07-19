export default function Home(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-mesh-gradient relative overflow-hidden';

  container.innerHTML = `
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
      <div class="absolute top-1/3 right-1/3 w-60 h-60 bg-primary-200/20 rounded-full blur-3xl animate-float" style="animation-delay: -1.5s;"></div>
      <div class="absolute bottom-1/4 left-1/4 w-40 h-40 bg-success-300/20 rounded-full blur-3xl animate-float" style="animation-delay: -2s;"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-10 p-6">
      <div class="container-fluid">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gradient">ft_transcendence</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <a href="/login" data-link class="btn btn-ghost">
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
        <div class="max-w-4xl mx-auto mb-16">
          <h1 class="text-6xl md:text-7xl font-bold text-gradient mb-6 animate-slide-up">
            The Ultimate
            <br />
            Pong Experience
          </h1>
          <p class="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up" style="animation-delay: 0.2s;">
            Experience the classic game like never before with modern authentication, 
            real-time multiplayer, tournaments, and cutting-edge security features.
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style="animation-delay: 0.4s;">
            <a href="/register" data-link class="btn btn-primary btn-lg group">
              Start Playing Now
              <svg class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </a>
            <a href="#features" class="btn btn-secondary btn-lg">
              Learn More
            </a>
          </div>

          <!-- Social Proof -->
          <div class="flex items-center justify-center space-x-8 text-secondary-500 animate-slide-up" style="animation-delay: 0.6s;">
            <div class="text-center">
              <div class="text-2xl font-bold text-secondary-900">1,000+</div>
              <div class="text-sm">Players</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-secondary-900">500+</div>
              <div class="text-sm">Tournaments</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-secondary-900">10k+</div>
              <div class="text-sm">Games Played</div>
            </div>
          </div>
        </div>

        <!-- Feature Preview -->
        <div id="features" class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-slide-up" style="animation-delay: 0.8s;">
          <div class="card-hover p-8 text-center group">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-secondary-900 mb-3">Multiplayer Tournaments</h3>
            <p class="text-secondary-600">Compete with players worldwide in exciting tournaments with real-time matchmaking.</p>
          </div>

          <div class="card-hover p-8 text-center group">
            <div class="w-16 h-16 bg-gradient-to-br from-success-500 to-success-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-secondary-900 mb-3">Advanced Security</h3>
            <p class="text-secondary-600">Secure authentication with 2FA, WebAuthn support, and OAuth integration.</p>
          </div>

          <div class="card-hover p-8 text-center group">
            <div class="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-secondary-900 mb-3">Real-time Gaming</h3>
            <p class="text-secondary-600">Lightning-fast gameplay with real-time synchronization and minimal latency.</p>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="mt-20 animate-slide-up" style="animation-delay: 1s;">
          <div class="card-gradient p-8 max-w-3xl mx-auto text-center">
            <h2 class="text-3xl font-bold text-secondary-900 mb-4">Ready to Play?</h2>
            <p class="text-secondary-600 mb-6">Join thousands of players in the most advanced Pong experience ever created.</p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/register" data-link class="btn btn-primary btn-lg">
                Create Free Account
              </a>
              <a href="/login" data-link class="btn btn-secondary btn-lg">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 py-8 border-t border-white/20 mt-20">
      <div class="container">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="flex items-center space-x-3 mb-4 md:mb-0">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
              </svg>
            </div>
            <span class="text-lg font-bold text-gradient">ft_transcendence</span>
          </div>
          
          <div class="flex items-center space-x-6 text-sm text-secondary-600">
            <a href="#" class="hover:text-primary-600 transition-colors">Privacy</a>
            <a href="#" class="hover:text-primary-600 transition-colors">Terms</a>
            <a href="#" class="hover:text-primary-600 transition-colors">Support</a>
          </div>
        </div>
        
        <div class="text-center mt-6 pt-6 border-t border-white/20 text-sm text-secondary-500">
          © 2024 ft_transcendence. All rights reserved.
        </div>
      </div>
    </footer>
  `;

  // Add smooth scrolling for anchor links
  setupSmoothScrolling(container);

  return container;
}

function setupSmoothScrolling(container: HTMLElement) {
  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.substring(1);
      const targetElement = container.querySelector(`#${targetId}`);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
} 