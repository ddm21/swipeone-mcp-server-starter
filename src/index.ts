#!/usr/bin/env node

/**
 * SwipeOne MCP Server
 * Exposes SwipeOne API endpoints as MCP tools for ChatGPT integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Import tool infrastructure
import { allTools } from './tools/definitions.js';
import { getToolHandler } from './tools/registry.js';

// Import prompts
import { allPrompts, swipeoneAssistantPromptContent } from './prompts/definitions.js';

// Import schemas
import {
    getContactPropertiesSchema,
    searchContactsSchema,
    retrieveAllContactsSchema,
    createNoteSchema,
    retrieveNotesSchema,
    updateNoteSchema,
    createTaskSchema,
    updateTaskSchema,
    retrieveAllTasksSchema,
} from './schemas/toolSchemas.js';

// Import utilities
import { resolveWorkspaceId } from './utils/workspaceResolver.js';
import { errorResponse, validationErrorResponse } from './utils/responseFormatter.js';
import { logger } from './utils/logger.js';
import { rateLimiter } from './utils/rateLimiter.js';

// Schema registry for validation
const schemaRegistry: Record<string, z.ZodSchema> = {
    get_contact_properties: getContactPropertiesSchema,
    search_contacts: searchContactsSchema,
    retrieve_all_contacts: retrieveAllContactsSchema,
    create_note: createNoteSchema,
    retrieve_notes: retrieveNotesSchema,
    update_note: updateNoteSchema,
    create_task: createTaskSchema,
    update_task: updateTaskSchema,
    retrieve_all_tasks: retrieveAllTasksSchema,
};

// Initialize MCP Server
const server = new Server(
    {
        name: 'swipeone-api-server',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
            prompts: {},
        },
    }
);

logger.info('Initializing SwipeOne MCP Server');

// Handler for listing available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    logger.debug('Listing available prompts', { count: allPrompts.length });
    return { prompts: allPrompts };
});

// Handler for getting prompt content
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;

    if (name === 'swipeone_assistant') {
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: swipeoneAssistantPromptContent,
                    },
                },
            ],
        };
    }

    throw new Error(`Unknown prompt: ${name}`);
});

// Handler for listing available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('Listing available tools', { count: allTools.length });
    return { tools: allTools };
});

// Handler for executing tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info('Tool execution requested', { toolName: name });

    try {
        // Check rate limit
        const rateLimitCheck = rateLimiter.checkLimit(name);
        if (!rateLimitCheck.allowed) {
            logger.warn('Rate limit exceeded for tool', {
                toolName: name,
                retryAfter: rateLimitCheck.retryAfter,
            });
            return errorResponse(
                `Rate limit exceeded. Please try again in ${rateLimitCheck.retryAfter} seconds.`,
                {
                    retryAfter: rateLimitCheck.retryAfter,
                    limit: rateLimitCheck.limit,
                }
            );
        }

        // Get the tool handler
        const handler = getToolHandler(name);
        if (!handler) {
            logger.warn('Unknown tool requested', { toolName: name });
            return errorResponse(`Unknown tool: ${name}`);
        }

        // Get the validation schema
        const schema = schemaRegistry[name];
        if (!schema) {
            logger.error('No validation schema found for tool', { toolName: name });
            return errorResponse(`Internal error: No validation schema for tool ${name}`);
        }

        // Validate input
        let validatedArgs: any;
        try {
            validatedArgs = schema.parse(args);
        } catch (error) {
            if (error instanceof z.ZodError) {
                logger.warn('Validation failed', { toolName: name, errors: error.issues });
                return validationErrorResponse(error.issues);
            }
            throw error;
        }

        // Tools that don't require workspace ID
        const noWorkspaceTools = ['create_note', 'retrieve_notes', 'update_note', 'update_task'];

        // Resolve workspace ID (only for workspace-scoped tools)
        let workspaceId: string | undefined;
        if (!noWorkspaceTools.includes(name)) {
            try {
                workspaceId = resolveWorkspaceId(validatedArgs.workspaceId);
                logger.debug('Resolved workspace ID', { workspaceId });
            } catch (error) {
                logger.warn('Failed to resolve workspace ID', { error });
                return errorResponse(error instanceof Error ? error.message : 'Failed to resolve workspace ID');
            }
        }

        // Create tool context
        const context = {
            workspaceId: workspaceId || '',
            // OAuth token will be added here in future
            oauthToken: undefined,
        };

        // Execute the tool
        const result = await handler.execute(validatedArgs, context);

        logger.info('Tool execution completed', { toolName: name, isError: result.isError ?? false });

        return result;
    } catch (error) {
        logger.error('Unexpected error during tool execution', error);

        return errorResponse(
            error instanceof Error ? `Unexpected error: ${error.message}` : 'An unexpected error occurred'
        );
    }
});

// Start the server
async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        logger.info('SwipeOne MCP Server running on stdio');
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

main().catch((error) => {
    logger.error('Fatal error in main', error);
    process.exit(1);
});
