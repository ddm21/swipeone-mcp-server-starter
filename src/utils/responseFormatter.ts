/**
 * Utility functions for formatting MCP responses
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Format a successful response with data
 */
export function successResponse(data: any): CallToolResult {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
}

/**
 * Format an error response
 */
export function errorResponse(message: string, details?: any): CallToolResult {
    const errorText = details
        ? `${message}\n\nDetails: ${JSON.stringify(details, null, 2)}`
        : message;

    return {
        content: [
            {
                type: 'text',
                text: errorText,
            },
        ],
        isError: true,
    };
}

/**
 * Format a validation error response
 */
export function validationErrorResponse(errors: any[]): CallToolResult {
    const errorMessages = errors.map((err) => `- ${err.path.join('.')}: ${err.message}`).join('\n');
    return errorResponse(`Validation failed:\n${errorMessages}`);
}
