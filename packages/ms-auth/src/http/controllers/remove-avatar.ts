import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository';
import path from 'path';
import { promises as fs } from 'fs';

export async function removeAvatar(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const usersRepository = new PrismaUsersRepository();
    
    // Get current user to check if they have an avatar
    const currentUser = await usersRepository.findById(userId);
    if (!currentUser) {
      return reply.status(404).send({ message: 'User not found' });
    }

    // Delete the avatar file if it exists
    if (currentUser.avatarUrl && currentUser.avatarUrl.startsWith('/uploads/avatars/')) {
      const fileName = path.basename(currentUser.avatarUrl);
      const filePath = path.join(process.cwd(), 'uploads', 'avatars', fileName);
      
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore errors when deleting avatar file (file might not exist)
        request.log.warn('Failed to delete avatar file:', error);
      }
    }

    // Remove avatar URL from database
    const updatedUser = await usersRepository.update(userId, {
      avatarUrl: null,
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = updatedUser;

    return reply.status(200).send({
      message: 'Avatar removed successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    request.log.error('Error removing avatar:', error);
    return reply.status(500).send({
      message: 'Failed to remove avatar'
    });
  }
} 