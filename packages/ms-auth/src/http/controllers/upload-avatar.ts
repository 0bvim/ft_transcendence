import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';

const prisma = new PrismaClient();

// Avatar upload validation schema
const avatarUploadSchema = z.object({
  file: z.any()
});

// Allowed image types and size limits
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique filename
function generateFileName(originalName: string, userId: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  return `${userId}_${timestamp}${ext}`;
}

// Validate file type and size
function validateFile(file: any): string | null {
  if (!file) {
    return 'No file provided';
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return 'Invalid file type. Only JPEG, PNG, and WebP are allowed';
  }

  if (file.file && file.file.bytesRead > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 5MB';
  }

  return null;
}

export async function uploadAvatar(
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

    // Ensure upload directory exists
    await ensureUploadDir();

    // Get uploaded file
    const data = await request.file();
    
    if (!data) {
      return reply.status(400).send({
        error: 'No file uploaded',
        message: 'Please select an image file to upload'
      });
    }

    // Validate file
    const validationError = validateFile(data);
    if (validationError) {
      return reply.status(400).send({
        error: 'Invalid file',
        message: validationError
      });
    }

    // Generate unique filename
    const fileName = generateFileName(data.originalname, userId);
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Save file to disk
    await pipeline(data.buffer, createWriteStream(filePath));

    // Generate avatar URL
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Update user's avatar URL in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: avatarUrl,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Delete old avatar file if it exists
    try {
      const oldAvatarPath = updatedUser.avatarUrl;
      if (oldAvatarPath && oldAvatarPath !== avatarUrl) {
        const oldFileName = path.basename(oldAvatarPath);
        const oldFilePath = path.join(UPLOAD_DIR, oldFileName);
        await fs.unlink(oldFilePath);
      }
    } catch (error) {
      // Ignore errors when deleting old avatar
      console.warn('Failed to delete old avatar:', error);
    }

    return reply.status(200).send({
      message: 'Avatar uploaded successfully',
      user: updatedUser,
      avatarUrl: avatarUrl
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Invalid input',
        message: error.errors[0].message
      });
    }
    
    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to upload avatar'
    });
  }
}

// Default avatar URLs based on user ID
export function getDefaultAvatarUrl(userId: string): string {
  const avatarStyles = [
    'pixel-art',
    'avataaars',
    'bottts',
    'shapes',
    'personas'
  ];
  
  const styleIndex = parseInt(userId.slice(-1), 16) % avatarStyles.length;
  const style = avatarStyles[styleIndex];
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${userId}`;
}
