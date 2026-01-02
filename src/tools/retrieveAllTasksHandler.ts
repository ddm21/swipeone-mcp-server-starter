/**
 * Handler for retrieve_all_tasks tool
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler, ToolContext } from '../types/toolHandler.js';
import type { RetrieveAllTasksInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Retrieve All Tasks Tool Handler
 * Retrieves all tasks from a workspace with pagination
 */
export class RetrieveAllTasksHandler implements ToolHandler<RetrieveAllTasksInput> {
    async execute(input: RetrieveAllTasksInput, context: ToolContext): Promise<CallToolResult> {
        try {
            // Extract workspaceId from input (already validated)
            const { workspaceId: _, ...params } = input;

            logger.info('Retrieving all tasks', {
                workspaceId: context.workspaceId,
                page: params.page,
                limit: params.limit,
            });

            // Call API
            const response = await apiClient.retrieveAllTasks(context.workspaceId, params);

            logger.info('Successfully retrieved tasks', {
                workspaceId: context.workspaceId,
                total: response.data.total,
                returned: response.data.tasks.length,
                page: response.data.page,
            });

            return successResponse(response);
        } catch (error) {
            logger.error('Failed to retrieve tasks', error);

            if (error instanceof SwipeOneAPIError) {
                return errorResponse(
                    `API Error: ${error.message}`,
                    error.statusCode ? { statusCode: error.statusCode } : undefined
                );
            }

            return errorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred while retrieving tasks'
            );
        }
    }
}

// Export singleton instance
export const retrieveAllTasksHandler = new RetrieveAllTasksHandler();
