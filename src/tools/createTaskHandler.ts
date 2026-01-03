/**
 * Handler for create_task tool
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler, ToolContext } from '../types/toolHandler.js';
import type { CreateTaskInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { uiResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Create Task Tool Handler
 * Creates a new task in a workspace
 */
export class CreateTaskHandler implements ToolHandler<CreateTaskInput> {
    async execute(input: CreateTaskInput, context: ToolContext): Promise<CallToolResult> {
        try {
            const { workspaceId: _, name, assignedTo, dueDate, reminder, contactId } = input;

            logger.info('Creating task in workspace', {
                workspaceId: context.workspaceId,
                nameLength: name.length,
                hasAssignedTo: !!assignedTo,
                hasDueDate: !!dueDate,
                hasReminder: !!reminder,
                hasContactId: !!contactId,
            });

            // Build request data (only include fields that are defined)
            const taskData: {
                name: string;
                assignedTo?: string;
                dueDate?: string;
                reminder?: string;
                contactId?: string;
            } = { name };

            if (assignedTo !== undefined) taskData.assignedTo = assignedTo;
            if (dueDate !== undefined) taskData.dueDate = dueDate;
            if (reminder !== undefined) taskData.reminder = reminder;
            if (contactId !== undefined) taskData.contactId = contactId;

            // Call API
            const response = await apiClient.createTask(context.workspaceId, taskData);

            logger.info('Successfully created task', {
                workspaceId: context.workspaceId,
                taskId: response?.data?.task?._id || 'unknown',
            });

            return uiResponse('create_task', response, 'created');
        } catch (error) {
            logger.error('Failed to create task', error);

            if (error instanceof SwipeOneAPIError) {
                return errorResponse(
                    `API Error: ${error.message}`,
                    error.statusCode ? { statusCode: error.statusCode } : undefined
                );
            }

            return errorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred while creating task'
            );
        }
    }
}

// Export singleton instance
export const createTaskHandler = new CreateTaskHandler();
