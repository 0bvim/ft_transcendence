import jwt from 'jsonwebtoken';
import axios from 'axios';
import { env } from './env.js';
import { JWTPayload, AuthUser } from './types.js';

export class AuthService {
  private authServiceUrl: string;
  private jwtSecret: string;

  constructor() {
    this.authServiceUrl = env.AUTH_SERVICE_URL;
    this.jwtSecret = env.JWT_SECRET;
  }

  /**
   * Verify JWT token locally
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Validate token with auth service (optional additional validation)
   */
  async validateTokenWithAuthService(token: string): Promise<AuthUser | null> {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        httpsAgent: new (await import('https')).Agent({
          rejectUnauthorized: false // For self-signed certificates in development
        })
      });

      if (response.status === 200 && response.data.user) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Auth service validation failed:', error);
      return null;
    }
  }

  /**
   * Extract token from WebSocket connection
   * Token can be passed as query parameter or in the Sec-WebSocket-Protocol header
   */
  extractTokenFromConnection(request: any): string | null {
    // Try query parameter first
    const urlParams = new URLSearchParams(request.url?.split('?')[1] || '');
    const tokenFromQuery = urlParams.get('token');
    
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    // Try from headers
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try from Sec-WebSocket-Protocol (some clients use this)
    const protocols = request.headers['sec-websocket-protocol'];
    if (protocols) {
      const protocolList = protocols.split(',').map((p: string) => p.trim());
      const tokenProtocol = protocolList.find((p: string) => p.startsWith('token.'));
      if (tokenProtocol) {
        return tokenProtocol.substring(6); // Remove 'token.' prefix
      }
    }

    return null;
  }

  /**
   * Authenticate WebSocket connection
   */
  async authenticateConnection(request: any): Promise<{ isAuthenticated: boolean; user?: AuthUser }> {
    const token = this.extractTokenFromConnection(request);
    
    if (!token) {
      return { isAuthenticated: false };
    }

    // Verify token locally first
    const payload = this.verifyToken(token);
    if (!payload) {
      return { isAuthenticated: false };
    }

    // Create user object from JWT payload
    const user: AuthUser = {
      id: payload.sub,
      username: payload.username,
      email: payload.email
    };

    return { isAuthenticated: true, user };
  }
}
