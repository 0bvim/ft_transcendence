import "dotenv/config";
import { z } from "zod";

// Helper function to get dynamic host
const getDynamicHost = () => {
  // Check if HOST environment variable is set
  const envHost = process.env.HOST || process.env.FRONTEND_HOST;
  if (envHost && envHost !== '0.0.0.0') {
    return envHost;
  }
  
  // Default to localhost for development
  return 'localhost';
};

// Helper function to build URLs dynamically
const buildUrl = (protocol: string, host: string, port: number, path: string = '') => {
  return `${protocol}://${host}:${port}${path}`;
};

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  JWT_SECRET: z.string(),
  SALT_LEN: z.coerce.number().default(6),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("localhost"),
  FRONTEND_HOST: z.string().default("localhost"),
  FRONTEND_PORT: z.coerce.number().default(3010),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z
    .string()
    .optional(), // Make it optional so we can build it dynamically
    
  // WebAuthn
  WEBAUTHN_RP_ID: z.string().optional(), // Make it optional so we can build it dynamically
  WEBAUTHN_RP_NAME: z.string().default("ft_transcendence"),
  WEBAUTHN_ORIGIN: z.string().optional(), // Make it optional so we can build it dynamically
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error("Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

// Build dynamic values after successful parsing
const parsedEnv = _env.data;
const dynamicHost = getDynamicHost();

export const env = {
  ...parsedEnv,
  // Override with dynamic values if not provided
  GOOGLE_REDIRECT_URI: parsedEnv.GOOGLE_REDIRECT_URI || buildUrl('http', dynamicHost, 3001, '/auth/google/callback'),
  WEBAUTHN_RP_ID: parsedEnv.WEBAUTHN_RP_ID || dynamicHost,
  WEBAUTHN_ORIGIN: parsedEnv.WEBAUTHN_ORIGIN || buildUrl('http', dynamicHost, 3010),
};

// Log the configuration for debugging
console.log('Environment configuration:');
console.log('- HOST:', parsedEnv.HOST);
console.log('- FRONTEND_HOST:', parsedEnv.FRONTEND_HOST);
console.log('- Dynamic Host:', dynamicHost);
console.log('- GOOGLE_REDIRECT_URI:', env.GOOGLE_REDIRECT_URI);
console.log('- WEBAUTHN_RP_ID:', env.WEBAUTHN_RP_ID);
console.log('- WEBAUTHN_ORIGIN:', env.WEBAUTHN_ORIGIN);
