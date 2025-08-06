import { FastifyRequest, FastifyReply } from 'fastify';
import { verify } from 'jsonwebtoken';
import { env } from '../../env';
import { prisma } from '../../lib/prisma';
import { userStatusStore } from '../../lib/user-status';

interface JwtPayload {
  username: string;
  iat: number;
  exp: number;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing access token'
      });
    }

    // Verify the JWT token
    const decoded = verify(token, env.JWT_SECRET) as JwtPayload;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { 
        username: decoded.username,
        deletedAt: null
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        twoFactorEnabled: true
      }
    });

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    // Add user to request object
    request.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      bio: user.bio || undefined,
      twoFactorEnabled: user.twoFactorEnabled
    };
    
    // Update user's last seen timestamp for online status
    userStatusStore.updateLastSeen(user.id);
    
  } catch (error) {
    console.error('JWT verification error:', error);
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
} 