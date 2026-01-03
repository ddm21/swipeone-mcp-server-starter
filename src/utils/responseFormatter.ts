/**
 * Utility functions for formatting MCP responses
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache the UI component bundle
let uiComponentCache: string | null = null;

function getUIComponent(): string {
    if (uiComponentCache) {
        return uiComponentCache;
    }

    try {
        const componentPath = join(__dirname, '../../web/dist/component.js');
        uiComponentCache = readFileSync(componentPath, 'utf-8');
        return uiComponentCache;
    } catch (error) {
        console.error('Failed to load UI component:', error);
        return '';
    }
}

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
 * Format a response with UI component
 */
export function uiResponse(toolName: string, data: any, action?: string): CallToolResult {
    const uiComponent = getUIComponent();

    const toolOutput = {
        toolName,
        data,
        action,
    };

    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2),
            },
        ],
        metadata: {
            'openai/widgetDomain': 'https://chatgpt.com',
            'openai/widgetCSP': {
                connect_domains: ['https://chatgpt.com'],
                resource_domains: ['https://*.oaistatic.com'],
            },
            'openai/widgetHTML': `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwipeOne UI</title>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        window.openai = window.openai || {};
        window.openai.toolOutput = ${JSON.stringify(toolOutput)};
        ${uiComponent}
    </script>
</body>
</html>
            `.trim(),
        },
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
