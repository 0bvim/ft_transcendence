import './style.css';
import { Router } from './router/index';

// Get the app container
const appContainer = document.getElementById('app');

if (!appContainer) {
  throw new Error('App container not found');
}

// Create router instance
const router = new Router(appContainer);

// Add routes
router.addRoute({
  path: '/',
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
  component: () => import('./pages/Game'),
  requiresAuth: true,
  title: 'Game'
});

router.addRoute({
  path: '/blockchain',
  component: () => import('./pages/BlockchainVerification'),
  requiresAuth: false,
  title: 'Blockchain Verification'
});

// Handle default route
const currentPath = window.location.pathname;
if (currentPath === '/') {
  // Redirect to dashboard if authenticated, otherwise to login
  const isAuthenticated = !!localStorage.getItem('accessToken');
  if (isAuthenticated) {
    window.location.href = '/dashboard';
  } else {
    window.location.href = '/login';
  }
}

// Start the router
router.start(); 