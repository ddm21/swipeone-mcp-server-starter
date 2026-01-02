/**
 * Handler for update_task tool
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler } from '../types/toolHandler.js';
import type { UpdateTaskInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Update Task Tool Handler
 * Updates an existing task's properties
 */
export class UpdateTaskHandler implements ToolHandler<UpdateTaskInput> {
    async execute(input: UpdateTaskInput): Promise<CallToolResult> {
        try {
            const { taskId, ...updateFields } = input;

            logger.info('Updating task', {
                taskId,
                hasName: !!updateFields.name,
                hasAssignedTo: !!updateFields.assignedTo,
                hasDueDate: !!updateFields.dueDate,
                hasReminder: !!updateFields.reminder,
                hasStatus: !!updateFields.status,
            });

            // Build update data (only include fields that are defined)
            const updateData: {
                name?: string;
                assignedTo?: string;
                dueDate?: string;
                reminder?: string;
                status?: 'not_started' | 'in_progress' | 'completed';
            } = {};

            if (updateFields.name !== undefined) updateData.name = updateFields.name;
            if (updateFields.assignedTo !== undefined) updateData.assignedTo = updateFields.assignedTo;
            if (updateFields.dueDate !== undefined) updateData.dueDate = updateFields.dueDate;
            if (updateFields.reminder !== undefined) updateData.reminder = updateFields.reminder;
            if (updateFields.status !== undefined) updateData.status = updateFields.status;

            // Call API
            const response = await apiClient.updateTask(taskId, updateData);

            logger.info('Successfully updated task', {
                taskId,
            });

            return successResponse(response);
        } catch (error) {
            logger.error('Failed to update task', error);

            if (error instanceof SwipeOneAPIError) {
                return errorResponse(
                    `API Error: ${error.message}`,
                    error.statusCode ? { statusCode: error.statusCode } : undefined
                );
            }

            return errorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred while updating task'
            );
        }
    }
}

// Export singleton instance
export const updateTaskHandler = new UpdateTaskHandler();
