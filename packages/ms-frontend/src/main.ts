import './style.css';
import { Router } from './router/index';
import { AudioControl } from './components/AudioControl';

// Get the app container
const appContainer = document.getElementById('app');

if (!appContainer) {
  throw new Error('App container not found');
}

// Initialize audio control
const audioControl = new AudioControl();
audioControl.mount(document.body);

// Create router instance
const router = new Router(appContainer);

// Add routes
router.addRoute({
  path: '/',
  component: () => import('./pages/Home'),
  title: 'Home'
});

router.addRoute({
  path: '/home',
  component: () => import('./pages/Home'),
  title: 'Home'
});

router.addRoute({
  path: '/login',
  component: () => import('./pages/Login'),
  title: 'Login'
});

router.addRoute({
  path: '/register',
  component: () => import('./pages/Register'),
  title: 'Register'
});

router.addRoute({
  path: '/verify-2fa',
  component: () => import('./pages/Verify2FA'),
  title: '2FA Verification'
});

router.addRoute({
  path: '/dashboard',
  component: () => import('./pages/Dashboard'),
  requiresAuth: true,
  title: 'Dashboard'
});

router.addRoute({
  path: '/auth/google/callback',
  component: () => import('./pages/GoogleCallback'),
  title: 'Google Sign-In'
});

// Tournament routes
router.addRoute({
  path: '/tournament',
  component: () => import('./pages/Tournament'),
  requiresAuth: true,
  title: 'Tournament Hub'
});

router.addRoute({
  path: '/tournament/create',
  component: () => import('./pages/TournamentCreate'),
  requiresAuth: true,
  title: 'Create Tournament'
});

router.addRoute({
  path: '/tournament/:id',
  component: () => import('./pages/TournamentDetail'),
  requiresAuth: true,
  title: 'Tournament Details'
});

// Profile and blockchain verification routes
router.addRoute({
  path: '/profile',
  component: () => import('./pages/Profile'),
  requiresAuth: true,
  title: 'Profile'
});

router.addRoute({
  path: '/game',
  component: () => import('./pages/Game/index'),
  requiresAuth: true,
  title: 'Game'
});

// Start the router
router.start(); 

// Add synthwave visual effects to the page
function addSynthwaveEffects() {
  // Add scan line effect
  const scanLine = document.createElement('div');
  scanLine.className = 'scan-line';
  document.body.appendChild(scanLine);

  // Add horizon line effect (optional, can be added to specific pages)
  const horizonLine = document.createElement('div');
  horizonLine.className = 'horizon-line';
  document.body.appendChild(horizonLine);
}

// Initialize synthwave effects
addSynthwaveEffects();

// Export audio control for potential external use
export { audioControl }; 