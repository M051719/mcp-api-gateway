import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Environment schema definition
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Database Configuration
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.string().regex(/^\d+$/).transform(Number),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),

  // Supabase Configuration
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(32),
  SUPABASE_DB_URL: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1),
  SUPABASE_REALTIME_ENABLED: z.string().transform((val) => val === 'true'),

  // Expo Configuration
  EXPO_ACCESS_TOKEN: z.string().optional(),
  EXPO_OWNER: z.string().optional(),
  EXPO_PROJECT_ID: z.string().optional(),
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string(),

  // Cloudflare Configuration
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_ZONE_ID: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_WORKERS_DEV: z.string().transform((val) => val === 'true'),
  CLOUDFLARE_ENVIRONMENT: z.string(),

  // StackHawk Configuration
  STACKHAWK_API_KEY: z.string().optional(),
  STACKHAWK_APP_ID: z.string().optional(),
  STACKHAWK_ENV: z.string(),
  STACKHAWK_HOST: z.string().url(),

  // Claude/Anthropic Configuration
  ANTHROPIC_API_KEY: z.string().min(1),
  CLAUDE_MODEL: z.string().min(1),
  CLAUDE_MAX_TOKENS: z.string().regex(/^\d+$/).transform(Number),
  CLAUDE_TEMPERATURE: z.string().regex(/^\d*\.?\d+$/).transform(Number),

  // API Configuration
  API_PORT: z.string().regex(/^\d+$/).transform(Number),
  KONG_ADMIN_URL: z.string().url(),

  // Security & Rate Limiting
  RATE_LIMIT_REQUESTS: z.string().regex(/^\d+$/).transform(Number),
  RATE_LIMIT_TOKENS: z.string().regex(/^\d+$/).transform(Number),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),

  // Logging & Monitoring
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  REQUEST_LOGGING: z.string().transform((val) => val === 'true'),
  DETAILED_ERRORS: z.string().transform((val) => val === 'true'),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string(),

  // CORS & Security
  CORS_ENABLED: z.string().transform((val) => val === 'true'),
  ALLOWED_ORIGINS: z.string().transform((val) => val.split(',')),
  TRUSTED_PROXIES: z.string(),
  ENABLE_SECURITY_HEADERS: z.string().transform((val) => val === 'true'),
});

export function validateEnv(envPath = '.env') {
  // Load environment variables
  const resolvedPath = path.resolve(process.cwd(), envPath);
  const envContent = dotenv.config({ path: resolvedPath });

  if (envContent.error) {
    throw new Error(`Error loading environment file: ${envContent.error.message}`);
  }

  try {
    // Validate and transform environment variables
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables are valid');
    return env;
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    if (error.errors) {
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw error;
  }
}

export { envSchema };