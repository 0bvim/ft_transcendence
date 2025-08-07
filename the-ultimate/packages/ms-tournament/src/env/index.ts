import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3003),
  DATABASE_URL: z.string().default('file:./tournament.db'),
  LOG_LEVEL: z.string().default('info'),
  AUTH_SERVICE_URL: z.string().default('https://localhost:3001'),
  GAME_SERVICE_URL: z.string().default('https://localhost:3002'),
  JWT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
