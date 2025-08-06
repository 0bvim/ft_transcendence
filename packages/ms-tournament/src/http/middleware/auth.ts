import { FastifyRequest, FastifyReply } from 'fastify';
import { verify } from 'jsonwebtoken';
import { env } from '../../env';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { sub: string };
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {

  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({ message: 'Authorization header not found.' });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return reply.status(401).send({ message: 'Token not found.' });
  }

  try {
    const decoded = verify(token, env.JWT_SECRET);
    request.user = { sub: (decoded as { sub: string }).sub };
  } catch (err) {
    return reply.status(401).send({ message: 'Invalid token.' });
  }
}
