/**
 * Rate limiter utility using token bucket algorithm
 * Prevents DoS attacks and API quota exhaustion
 */

import { logger } from './logger.js';
import { serverConfig } from '../config/environment.js';

interface RateLimitConfig {
    requests: number; // Maximum requests allowed
    window: number; // Time window in milliseconds
}

interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

// Default rate limits per tool
const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
    search_contacts: { requests: 20, window: 60000 }, // 20/min
    retrieve_all_contacts: { requests: 20, window: 60000 }, // 20/min
    get_contact_properties: { requests: 30, window: 60000 }, // 30/min
    create_note: { requests: 30, window: 60000 }, // 30/min
    update_note: { requests: 30, window: 60000 }, // 30/min
    retrieve_notes: { requests: 30, window: 60000 }, // 30/min
    create_task: { requests: 30, window: 60000 }, // 30/min
    update_task: { requests: 30, window: 60000 }, // 30/min
    retrieve_all_tasks: { requests: 20, window: 60000 }, // 20/min
    default: { requests: 10, window: 60000 }, // 10/min fallback
};

class RateLimiter {
    private buckets: Map<string, TokenBucket>;
    private enabled: boolean;

    constructor() {
        this.buckets = new Map();
        // Initialize from environment configuration
        this.enabled = serverConfig.enableRateLimiting;
        logger.info('Rate limiter initialized', { enabled: this.enabled });
    }

    /**
     * Enable or disable rate limiting
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        logger.info('Rate limiting status changed', { enabled });
    }

    /**
     * Check if a request is allowed for a specific tool
     * @param toolName - Name of the tool being called
     * @returns Object with allowed status and retry information
     */
    checkLimit(toolName: string): { allowed: boolean; retryAfter?: number; limit?: RateLimitConfig } {
        if (!this.enabled) {
            return { allowed: true };
        }

        const config = DEFAULT_LIMITS[toolName] ?? DEFAULT_LIMITS.default;
        if (!config) {
            // Fallback to default if somehow not found
            return { allowed: true };
        }

        const bucket = this.getOrCreateBucket(toolName, config);

        // Refill tokens based on elapsed time
        this.refillBucket(bucket, config);

        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            return { allowed: true, limit: config };
        }

        // Calculate retry-after in seconds
        const retryAfter = Math.ceil(config.window / 1000);

        logger.warn('Rate limit exceeded', {
            toolName,
            limit: config.requests,
            window: config.window,
            retryAfter,
        });

        return {
            allowed: false,
            retryAfter,
            limit: config,
        };
    }

    /**
     * Get or create a token bucket for a tool
     */
    private getOrCreateBucket(toolName: string, config: RateLimitConfig): TokenBucket {
        let bucket = this.buckets.get(toolName);

        if (!bucket) {
            bucket = {
                tokens: config.requests,
                lastRefill: Date.now(),
            };
            this.buckets.set(toolName, bucket);
        }

        return bucket;
    }

    /**
     * Refill tokens in the bucket based on elapsed time
     */
    private refillBucket(bucket: TokenBucket, config: RateLimitConfig): void {
        const now = Date.now();
        const elapsed = now - bucket.lastRefill;

        // If the time window has passed, refill to maximum
        if (elapsed >= config.window) {
            bucket.tokens = config.requests;
            bucket.lastRefill = now;
        } else {
            // Gradual refill based on elapsed time
            const tokensToAdd = (elapsed / config.window) * config.requests;
            bucket.tokens = Math.min(config.requests, bucket.tokens + tokensToAdd);
            bucket.lastRefill = now;
        }
    }

    /**
     * Reset rate limits for a specific tool (useful for testing)
     */
    reset(toolName?: string): void {
        if (toolName) {
            this.buckets.delete(toolName);
            logger.debug('Rate limit reset for tool', { toolName });
        } else {
            this.buckets.clear();
            logger.debug('All rate limits reset');
        }
    }

    /**
     * Get current status for a tool (for monitoring/debugging)
     */
    getStatus(toolName: string): { tokens: number; limit: RateLimitConfig } | null {
        const config = DEFAULT_LIMITS[toolName] ?? DEFAULT_LIMITS.default;
        if (!config) {
            return null;
        }

        const bucket = this.buckets.get(toolName);

        if (!bucket) {
            return { tokens: config.requests, limit: config };
        }

        this.refillBucket(bucket, config);

        return {
            tokens: Math.floor(bucket.tokens),
            limit: config,
        };
    }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
