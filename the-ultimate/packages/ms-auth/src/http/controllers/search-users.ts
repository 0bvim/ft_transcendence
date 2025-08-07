import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository';

const searchUsersQuerySchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export async function searchUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { username } = searchUsersQuerySchema.parse(request.query);
    
    const usersRepository = new PrismaUsersRepository();
    const user = await usersRepository.findByUsername(username);
    
    if (!user || user.deletedAt) {
      return reply.status(404).send({
        success: false,
        error: 'User not found',
        message: 'No user found with that username'
      });
    }
    
    // Return only safe user information
    return reply.status(200).send({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Error searching users:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
      message: 'Failed to search users'
    });
  }
}
