/**
 * Authentication middleware for MCP server
 * Supports both OAuth and mock authentication for development
 */

import type { Request, Response, NextFunction } from 'express';
import { serverConfig } from '../config/environment.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        workspaceId?: string;
        email?: string;
    };
}

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(authHeader?: string): string | null {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1] || null;
}

/**
 * Validate mock token for development
 */
function validateMockToken(token: string): { userId: string; workspaceId?: string } | null {
    if (token === serverConfig.mockAuthToken) {
        return {
            userId: 'dev_user',
            ...(serverConfig.defaultWorkspaceId && { workspaceId: serverConfig.defaultWorkspaceId }),
        };
    }
    return null;
}

/**
 * Validate OAuth token (placeholder for production implementation)
 * TODO: Implement actual OAuth token validation with JWT verification
 */
async function validateOAuthToken(_token: string): Promise<{ userId: string; workspaceId?: string; email?: string } | null> {
    // This is a placeholder - in production, you would:
    // 1. Verify JWT signature
    // 2. Check token expiration
    // 3. Validate issuer and audience
    // 4. Extract user claims
    logger.warn('OAuth validation not yet implemented, rejecting token');
    return null;
}

/**
 * Authentication middleware
 */
export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    // Skip authentication if disabled
    if (!serverConfig.authEnabled) {
        logger.debug('Authentication disabled, allowing request');
        next();
        return;
    }

    // Extract token from Authorization header
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
        logger.warn('Authentication failed: No token provided', {
            path: req.path,
            method: req.method,
        });
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication token required. Please provide a Bearer token in the Authorization header.',
        });
        return;
    }

    // Validate token based on auth mode
    let user: { userId: string; workspaceId?: string; email?: string } | null = null;

    if (serverConfig.authMode === 'mock') {
        user = validateMockToken(token);
    } else if (serverConfig.authMode === 'oauth') {
        user = await validateOAuthToken(token);
    }

    if (!user) {
        logger.warn('Authentication failed: Invalid token', {
            path: req.path,
            method: req.method,
            authMode: serverConfig.authMode,
        });
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid authentication token.',
        });
        return;
    }

    // Attach user to request
    req.user = user;

    logger.debug('Authentication successful', {
        userId: user.userId,
        workspaceId: user.workspaceId,
        path: req.path,
    });

    next();
}

/**
 * Extract workspace ID from authenticated request
 * Falls back to default workspace ID if not available
 */
export function getWorkspaceFromAuth(req: AuthenticatedRequest): string | undefined {
    return req.user?.workspaceId || serverConfig.defaultWorkspaceId;
}
