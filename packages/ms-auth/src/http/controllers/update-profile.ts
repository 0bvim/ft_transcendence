import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
});

export async function updateProfile(
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

    const body = updateProfileSchema.parse(request.body);
    
    // Check if display name is already taken (if provided)
    if (body.displayName) {
      const existingUser = await prisma.user.findFirst({
        where: {
          displayName: body.displayName,
          id: { not: userId }, // Exclude current user
          deletedAt: null
        }
      });
      
      if (existingUser) {
        return reply.status(400).send({
          error: 'Display name already taken',
          message: 'This display name is already in use'
        });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: body.displayName,
        avatarUrl: body.avatarUrl,
        bio: body.bio,
        updatedAt: new Date()
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

    return reply.status(200).send({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    request.log.error('Error updating profile:', error);
    
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Invalid input',
        message: error.errors[0].message
      });
    }
    
    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to update profile'
    });
  }
}
