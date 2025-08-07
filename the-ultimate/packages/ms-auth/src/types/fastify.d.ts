import 'fastify';
import '@fastify/multipart';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      username: string;
      email: string;
      displayName?: string;
      avatarUrl?: string;
      bio?: string;
      twoFactorEnabled: boolean;
    };
    file(): Promise<{
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    } | undefined>;
  }
}
