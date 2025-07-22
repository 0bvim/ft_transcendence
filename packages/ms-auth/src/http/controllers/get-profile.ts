import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma';

export async function getProfile(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.id;
    
    if (!userId) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return reply.status(404).send({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    return reply.status(200).send({
      user
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    
    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to get profile'
    });
  }
}
