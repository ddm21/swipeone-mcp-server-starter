/**
 * Environment configuration and validation
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root (two levels up from this file)
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

// Environment variable schema
const envSchema = z.object({
    SWIPEONE_API_KEY: z
        .string()
        .min(32, 'API key must be at least 32 characters')
        .regex(/^[A-Za-z0-9_-]+$/, 'API key contains invalid characters'),
    SWIPEONE_API_BASE_URL: z.string().url().default('https://api.swipeone.com/api'),
    API_TIMEOUT: z.coerce.number().default(30000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Optional: Default workspace ID for testing (will be replaced by OAuth in production)
    DEFAULT_WORKSPACE_ID: z.string().optional(),
    // Security configuration
    ENABLE_RATE_LIMITING: z
        .string()
        .default('true')
        .transform((val) => val === 'true' || val === '1'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    // Authentication configuration
    AUTH_ENABLED: z
        .string()
        .default('false')
        .transform((val) => val === 'true' || val === '1'),
    AUTH_MODE: z.enum(['oauth', 'mock']).default('mock'),
    MOCK_AUTH_TOKEN: z.string().default('dev_token_12345'),
    // CORS configuration
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),
    // SSL/TLS configuration
    SSL_CERT_PATH: z.string().optional(),
    SSL_KEY_PATH: z.string().optional(),
    ENABLE_HTTPS: z
        .string()
        .default('false')
        .transform((val) => val === 'true' || val === '1'),
    FORCE_HTTPS: z
        .string()
        .default('false')
        .transform((val) => val === 'true' || val === '1'),
});

// Load and validate environment variables
function loadEnvironment() {
    const env = {
        SWIPEONE_API_KEY: process.env.SWIPEONE_API_KEY || '',
        SWIPEONE_API_BASE_URL: process.env.SWIPEONE_API_BASE_URL,
        API_TIMEOUT: process.env.API_TIMEOUT || '30000',
        NODE_ENV: process.env.NODE_ENV,
        DEFAULT_WORKSPACE_ID: process.env.DEFAULT_WORKSPACE_ID,
        ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING || 'true',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        AUTH_ENABLED: process.env.AUTH_ENABLED || 'false',
        AUTH_MODE: process.env.AUTH_MODE || 'mock',
        MOCK_AUTH_TOKEN: process.env.MOCK_AUTH_TOKEN || 'dev_token_12345',
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173',
        SSL_CERT_PATH: process.env.SSL_CERT_PATH,
        SSL_KEY_PATH: process.env.SSL_KEY_PATH,
        ENABLE_HTTPS: process.env.ENABLE_HTTPS || 'false',
        FORCE_HTTPS: process.env.FORCE_HTTPS || 'false',
    };

    try {
        return envSchema.parse(env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment validation failed:');
            console.error('');
            error.issues.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            console.error('');
            console.error('💡 Tips:');
            console.error('  1. Copy .env.example to .env');
            console.error('  2. Set SWIPEONE_API_KEY to your API key');
            console.error('  3. Optionally set DEFAULT_WORKSPACE_ID for testing');
            console.error('');
            console.error('📖 See README.md for more information');
            process.exit(1);
        }
        throw error;
    }
}

export const config = loadEnvironment();

export const serverConfig = {
    apiBaseUrl: config.SWIPEONE_API_BASE_URL,
    apiKey: config.SWIPEONE_API_KEY,
    timeout: config.API_TIMEOUT,
    nodeEnv: config.NODE_ENV,
    defaultWorkspaceId: config.DEFAULT_WORKSPACE_ID,
    enableRateLimiting: config.ENABLE_RATE_LIMITING,
    logLevel: config.LOG_LEVEL,
    authEnabled: config.AUTH_ENABLED,
    authMode: config.AUTH_MODE,
    mockAuthToken: config.MOCK_AUTH_TOKEN,
    allowedOrigins: config.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),
    sslCertPath: config.SSL_CERT_PATH,
    sslKeyPath: config.SSL_KEY_PATH,
    enableHttps: config.ENABLE_HTTPS,
    forceHttps: config.FORCE_HTTPS,
};
