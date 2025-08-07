// Mock authentication module for development

interface User {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
}

/**
 * Gets the current authenticated user
 * @returns The current user or null if not authenticated
 */
export function getCurrentUser(): User | null {
  // Check for auth token
  const token = localStorage.getItem('jwt') || localStorage.getItem('token');
  if (!token) return null;
  
  // For development, return a mock user
  // In production, this would decode the JWT or fetch user data from an API
  try {
    // Try to get saved user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    
    // If no saved user, return a default one
    return {
      id: 'user-123',
      username: 'player1',
      displayName: 'Player 1'
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Mock function to simulate logging in a user
 * @param username The username to log in with
 */
export function login(username: string): User {
  const user = {
    id: 'user-' + Math.floor(Math.random() * 1000),
    username: username,
    displayName: username
  };
  
  // Save token and user in localStorage
  localStorage.setItem('token', 'mock-jwt-token');
  localStorage.setItem('user', JSON.stringify(user));
  
  return user;
}

/**
 * Mock function to simulate logging out
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
}