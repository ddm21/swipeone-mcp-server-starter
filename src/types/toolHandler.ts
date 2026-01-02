/**
 * Base types for MCP tool handlers
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Context passed to tool handlers
 */
export interface ToolContext {
    workspaceId: string;
    oauthToken?: string | undefined;
}

/**
 * Base interface for all tool handlers
 */
export interface ToolHandler<TInput = any> {
    /**
     * Execute the tool with validated input
     */
    execute(input: TInput, context: ToolContext): Promise<CallToolResult>;
}

/**
 * Tool registration information
 */
export interface ToolRegistration {
    name: string;
    description: string;
    inputSchema: any;
    handler: ToolHandler;
}
