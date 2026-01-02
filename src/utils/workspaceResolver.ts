/**
 * Workspace ID resolution utility
 */

import { serverConfig } from '../config/environment.js';

/**
 * Resolve workspace ID from input or environment
 * @param providedWorkspaceId - Workspace ID from tool input (optional)
 * @returns Resolved workspace ID
 * @throws Error if no workspace ID is available
 */
export function resolveWorkspaceId(providedWorkspaceId?: string): string {
    const workspaceId = providedWorkspaceId || serverConfig.defaultWorkspaceId;

    if (!workspaceId) {
        throw new Error(
            'workspaceId is required. Either provide it as a parameter or set DEFAULT_WORKSPACE_ID in your environment.'
        );
    }

    return workspaceId;
}

/**
 * Extract OAuth context from request metadata (for future OAuth implementation)
 */
export function extractOAuthContext(request: any): { workspaceId?: string; token?: string } | null {
    try {
        const context = request.meta?.oauthContext;
        if (context) {
            return {
                workspaceId: context.workspaceId,
                token: context.accessToken,
            };
        }
        return null;
    } catch {
        return null;
    }
}
