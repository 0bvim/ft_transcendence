import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository';
import { userStatusStore } from '../../lib/user-status';

// In-memory friends store (simple approach)
class FriendsStore {
  private friendships: Map<string, Set<string>> = new Map();

  addFriend(userId: string, friendId: string): void {
    // Add bidirectional friendship
    if (!this.friendships.has(userId)) {
      this.friendships.set(userId, new Set());
    }
    if (!this.friendships.has(friendId)) {
      this.friendships.set(friendId, new Set());
    }
    
    this.friendships.get(userId)!.add(friendId);
    this.friendships.get(friendId)!.add(userId);
  }

  removeFriend(userId: string, friendId: string): void {
    // Remove bidirectional friendship
    this.friendships.get(userId)?.delete(friendId);
    this.friendships.get(friendId)?.delete(userId);
  }

  getFriends(userId: string): string[] {
    return Array.from(this.friendships.get(userId) || []);
  }

  areFriends(userId: string, friendId: string): boolean {
    return this.friendships.get(userId)?.has(friendId) || false;
  }
}

const friendsStore = new FriendsStore();

const addFriendSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

const removeFriendSchema = z.object({
  friendId: z.string().min(1, 'Friend ID is required'),
});

// Add friend by username
export async function addFriend(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user?.id;
    
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { username } = addFriendSchema.parse(request.body);
    
    const usersRepository = new PrismaUsersRepository();
    const friend = await usersRepository.findByUsername(username);
    
    if (!friend || friend.deletedAt) {
      return reply.status(404).send({
        success: false,
        error: 'User not found',
        message: 'No user found with that username'
      });
    }

    if (friend.id === userId) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid request',
        message: 'Cannot add yourself as a friend'
      });
    }

    if (friendsStore.areFriends(userId, friend.id)) {
      return reply.status(409).send({
        success: false,
        error: 'Already friends',
        message: 'You are already friends with this user'
      });
    }

    friendsStore.addFriend(userId, friend.id);
    
    return reply.status(200).send({
      success: true,
      message: 'Friend added successfully',
      friend: {
        id: friend.id,
        username: friend.username,
        displayName: friend.displayName || friend.username,
        avatarUrl: friend.avatarUrl,
        isOnline: userStatusStore.isUserOnline(friend.id)
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
    
    console.error('Error adding friend:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add friend'
    });
  }
}

// Get friends list with online status
export async function getFriends(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user?.id;
    
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const friendIds = friendsStore.getFriends(userId);
    
    if (friendIds.length === 0) {
      return reply.status(200).send({
        success: true,
        friends: []
      });
    }

    const usersRepository = new PrismaUsersRepository();
    const friends = [];
    
    for (const friendId of friendIds) {
      const friend = await usersRepository.findById(friendId);
      if (friend && !friend.deletedAt) {
        friends.push({
          id: friend.id,
          username: friend.username,
          displayName: friend.displayName || friend.username,
          avatarUrl: friend.avatarUrl,
          isOnline: userStatusStore.isUserOnline(friend.id),
          lastSeen: userStatusStore.getUserLastSeen(friend.id)
        });
      }
    }
    
    return reply.status(200).send({
      success: true,
      friends
    });
    
  } catch (error) {
    console.error('Error getting friends:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get friends'
    });
  }
}

// Remove friend
export async function removeFriend(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user?.id;
    
    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { friendId } = removeFriendSchema.parse(request.params);
    
    if (!friendsStore.areFriends(userId, friendId)) {
      return reply.status(404).send({
        success: false,
        error: 'Not friends',
        message: 'You are not friends with this user'
      });
    }

    friendsStore.removeFriend(userId, friendId);
    
    return reply.status(200).send({
      success: true,
      message: 'Friend removed successfully'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Error removing friend:', error);
    return reply.status(500).send({
      success: false,
      error: 'Internal server error',
      message: 'Failed to remove friend'
    });
  }
}
