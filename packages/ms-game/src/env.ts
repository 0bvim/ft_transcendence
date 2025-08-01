import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3002').transform(Number),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Authentication service
  AUTH_SERVICE_URL: z.string().default('https://localhost:3001'),
  JWT_SECRET: z.string().default('your-jwt-secret-key'),
  
  // HTTPS Configuration
  HTTPS_KEY_PATH: z.string().default('./certs/key.pem'),
  HTTPS_CERT_PATH: z.string().default('./certs/cert.pem'),
  
  // Game Configuration
  GAME_UPDATE_RATE: z.string().default('60').transform(Number),
  MAX_PLAYERS_PER_GAME: z.string().default('2').transform(Number),
  PLAYER_DISCONNECT_TIMEOUT: z.string().default('30000').transform(Number),
  
  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export const env = envSchema.parse(process.env);
