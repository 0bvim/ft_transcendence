import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3003),
  DATABASE_URL: z.string().default('file:./tournament.db'),
  LOG_LEVEL: z.string().default('info'),
  AUTH_SERVICE_URL: z.string().default('http://localhost:4242'),
  GAME_SERVICE_URL: z.string().default('http://localhost:4244'),
  BLOCKCHAIN_SERVICE_URL: z.string().default('http://localhost:3004'),
});

export const env = envSchema.parse(process.env);
