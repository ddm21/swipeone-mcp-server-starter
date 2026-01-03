/**
 * Logging utility for MCP server with data sanitization
 */

import { config } from '../config/environment.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Sensitive patterns to redact from logs (using regex for better matching)
const SENSITIVE_PATTERNS = [
    /api[_-]?key/i,
    /auth/i,
    /token/i,
    /secret/i,
    /password/i,
    /credential/i,
    /session/i,
    /cookie/i,
    /bearer/i,
    /swipeone[_-]?api[_-]?key/i,
];

class Logger {
    private prefix: string;

    constructor(prefix: string = 'MCP') {
        this.prefix = prefix;
    }

    /**
     * Check if a key is sensitive using regex patterns
     */
    private isSensitiveKey(key: string): boolean {
        const lowerKey = key.toLowerCase();
        return SENSITIVE_PATTERNS.some((pattern) => pattern.test(lowerKey));
    }

    /**
     * Sanitize data to remove sensitive information
     */
    private sanitizeData(data: any): any {
        if (data === null || data === undefined) {
            return data;
        }

        // Handle primitives
        if (typeof data !== 'object') {
            return data;
        }

        // Handle arrays
        if (Array.isArray(data)) {
            return data.map((item) => this.sanitizeData(item));
        }

        // Handle objects
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
            // Check if key is sensitive
            if (this.isSensitiveKey(key)) {
                sanitized[key] = '[REDACTED]';
            } else if (key === 'headers' && typeof value === 'object' && value !== null) {
                // Special handling for headers object
                sanitized[key] = this.sanitizeHeaders(value);
            } else if (typeof value === 'object' && value !== null) {
                // Recursively sanitize nested objects
                sanitized[key] = this.sanitizeData(value);
            } else if (typeof value === 'string' && value.length > 1000) {
                // Truncate very long strings
                sanitized[key] = value.substring(0, 1000) + '... [truncated]';
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    /**
     * Sanitize HTTP headers
     */
    private sanitizeHeaders(headers: any): any {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(headers)) {
            if (this.isSensitiveKey(key)) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    /**
     * Check if stack traces should be included
     */
    private shouldIncludeStackTrace(): boolean {
        return config.NODE_ENV === 'development';
    }

    private log(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${this.prefix}] ${message}`;

        // Sanitize data before logging
        const sanitizedData = data ? this.sanitizeData(data) : undefined;

        // Use console.error for MCP servers (stdout is reserved for protocol)
        if (sanitizedData) {
            console.error(logMessage, sanitizedData);
        } else {
            console.error(logMessage);
        }
    }

    debug(message: string, data?: any) {
        this.log('debug', message, data);
    }

    info(message: string, data?: any) {
        this.log('info', message, data);
    }

    warn(message: string, data?: any) {
        this.log('warn', message, data);
    }

    error(message: string, error?: any) {
        if (error instanceof Error) {
            const errorData: any = {
                message: error.message,
                name: error.name,
            };

            // Only include stack trace in development
            if (this.shouldIncludeStackTrace()) {
                errorData.stack = error.stack;
            }

            this.log('error', message, errorData);
        } else {
            this.log('error', message, error);
        }
    }
}

// Export singleton logger
export const logger = new Logger('SwipeOne');

// Export logger class for creating scoped loggers
export { Logger };

