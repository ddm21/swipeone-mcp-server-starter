#!/usr/bin/env node

/**
 * SwipeOne MCP Server
 * Exposes SwipeOne API endpoints as MCP tools for ChatGPT integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';

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
import { serverConfig } from './config/environment.js';

// Import middleware
import { authMiddleware, type AuthenticatedRequest } from './middleware/auth.js';

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
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
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
                    headers: {
                        'X-RateLimit-Limit': rateLimitCheck.limit?.requests,
                        'X-RateLimit-Remaining': 0,
                        'Retry-After': rateLimitCheck.retryAfter,
                    },
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

// Start the HTTP server
async function main() {
    const app = express();
    const port = process.env.PORT || 3000;

    // Configure CORS - allow all origins in development, specific origins in production
    const corsOptions = {
        origin: serverConfig.nodeEnv === 'development' ? true : serverConfig.allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };
    app.use(cors(corsOptions));

    // Trust proxy headers when behind ngrok or other reverse proxies
    app.set('trust proxy', true);

    // Middleware to handle ngrok and other proxy Host headers
    app.use((req: Request, _res: Response, next: NextFunction) => {
        const host = req.headers.host;
        // If request comes from ngrok or other proxy, normalize the host header
        if (host && (host.includes('ngrok') || host.includes('.app') || host.includes('.io'))) {
            logger.debug('Normalizing proxy host header', { originalHost: host, newHost: `localhost:${port}` });
            req.headers.host = `localhost:${port}`;
        }
        next();
    });

    // Add request size limits to prevent DoS
    app.use(express.json({ limit: '1mb' }));

    // Log CORS configuration
    logger.info('CORS configured', {
        mode: serverConfig.nodeEnv === 'development' ? 'allow-all' : 'restricted',
        allowedOrigins: serverConfig.nodeEnv === 'development' ? ['*'] : serverConfig.allowedOrigins
    });

    // Apply authentication middleware if enabled
    if (serverConfig.authEnabled) {
        logger.info('Authentication enabled', { mode: serverConfig.authMode });
        app.use(authMiddleware);
    } else {
        logger.warn('Authentication disabled - not recommended for production');
    }

    // No need to store transports - StreamableHTTPServerTransport handles session management internally

    // Request logging middleware for debugging
    app.use((req: Request, _res: Response, next: NextFunction) => {
        logger.debug('Incoming request', {
            method: req.method,
            path: req.path,
            query: req.query,
            headers: {
                'content-type': req.headers['content-type'],
                'content-length': req.headers['content-length'],
                'mcp-session-id': req.headers['mcp-session-id'],
            },
        });
        next();
    });

    // Health check endpoint
    app.get('/', (_req: Request, res: Response) => {
        res.json({
            name: 'SwipeOne MCP Server',
            version: '1.0.0',
            status: 'running',
            endpoints: {
                mcp: '/mcp',
            },
        });
    });

    // MCP endpoint - handles both GET (SSE) and POST (messages) using Streamable HTTP
    app.all('/mcp', async (req: AuthenticatedRequest, res: Response) => {
        logger.info('MCP request received', {
            method: req.method,
            sessionId: req.headers['mcp-session-id'],
            userId: req.user?.userId,
            authEnabled: serverConfig.authEnabled,
        });

        try {
            // Create transport for this request
            // The SDK manages session IDs internally via mcp-session-id header
            const transport = new StreamableHTTPServerTransport();

            // Ensure onclose is defined to satisfy Transport interface requirements
            // This is required because StreamableHTTPServerTransport has onclose?: (() => void) | undefined,
            // but Transport interface requires onclose: () => void (never undefined)
            if (!transport.onclose) {
                transport.onclose = () => { };
            }

            // Connect to MCP server
            await server.connect(transport as any);

            // Handle the request (works for both GET and POST)
            await transport.handleRequest(req, res);

            logger.debug('MCP request handled successfully', {
                method: req.method,
                sessionId: req.headers['mcp-session-id']
            });
        } catch (error) {
            logger.error('Error handling MCP request', {
                error: error instanceof Error ? error.message : 'Unknown error',
                method: req.method,
                sessionId: req.headers['mcp-session-id'],
            });

            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
    });

    app.listen(port, () => {
        logger.info(`SwipeOne MCP Server running on port ${port}`);
        logger.info(`Health check: http://localhost:${port}/`);
        logger.info(`MCP endpoint: http://localhost:${port}/mcp`);
        logger.info(`Environment: ${serverConfig.nodeEnv}`);
    });
}

main().catch((error) => {
    logger.error('Fatal error in main', error);
    process.exit(1);
});
