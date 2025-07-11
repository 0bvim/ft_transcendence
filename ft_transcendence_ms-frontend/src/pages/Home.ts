export default function Home(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'min-h-screen flex items-center justify-center bg-gray-50';

  container.innerHTML = `
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Welcome to ft_transcendence
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        The ultimate Pong experience with modern authentication
      </p>
      
      <div class="space-x-4">
        <a href="/login" data-link class="btn btn-primary">
          Sign In
        </a>
        <a href="/register" data-link class="btn btn-secondary">
          Sign Up
        </a>
      </div>
    </div>
  `;

  return container;
} 