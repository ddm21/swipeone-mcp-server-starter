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
    SWIPEONE_API_KEY: z.string().min(1, 'API key is required'),
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
    defaultWorkspaceId: config.DEFAULT_WORKSPACE_ID,
    enableRateLimiting: config.ENABLE_RATE_LIMITING,
    logLevel: config.LOG_LEVEL,
};
