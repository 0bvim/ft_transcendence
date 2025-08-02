import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3003"),
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
});

export const env = envSchema.parse(process.env);
