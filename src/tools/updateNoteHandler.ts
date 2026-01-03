/**
 * Handler for update_note tool
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler } from '../types/toolHandler.js';
import type { UpdateNoteInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { uiResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Update Note Tool Handler
 * Updates an existing note's title and/or content
 */
export class UpdateNoteHandler implements ToolHandler<UpdateNoteInput> {
    async execute(input: UpdateNoteInput): Promise<CallToolResult> {
        try {
            const { noteId, title, content } = input;

            logger.info('Updating note', {
                noteId,
                hasTitle: !!title,
                hasContent: !!content,
            });

            // Build update data
            const updateData: { title?: string; content?: string } = {};
            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;

            // Call API
            const response = await apiClient.updateNote(noteId, updateData);

            logger.info('Successfully updated note', {
                noteId,
            });

            return uiResponse('update_note', response, 'updated');
        } catch (error) {
            logger.error('Failed to update note', error);

            if (error instanceof SwipeOneAPIError) {
                return errorResponse(
                    `API Error: ${error.message}`,
                    error.statusCode ? { statusCode: error.statusCode } : undefined
                );
            }

            return errorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred while updating note'
            );
        }
    }
}

// Export singleton instance
export const updateNoteHandler = new UpdateNoteHandler();
