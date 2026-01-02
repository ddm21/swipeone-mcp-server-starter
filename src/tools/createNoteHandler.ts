/**
 * Handler for create_note tool
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler } from '../types/toolHandler.js';
import type { CreateNoteInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Create Note Tool Handler
 * Creates a new note for a specific contact
 */
export class CreateNoteHandler implements ToolHandler<CreateNoteInput> {
    async execute(input: CreateNoteInput): Promise<CallToolResult> {
        try {
            const { contactId, title, content } = input;

            logger.info('Creating note for contact', {
                contactId,
                titleLength: title.length,
                contentLength: content.length,
            });

            // Call API
            const response = await apiClient.createNote(contactId, { title, content });

            logger.info('Successfully created note', {
                contactId,
                noteId: response?.data?.note?._id || 'unknown',
            });

            return successResponse(response);
        } catch (error) {
            logger.error('Failed to create note', error);

            if (error instanceof SwipeOneAPIError) {
                return errorResponse(
                    `API Error: ${error.message}`,
                    error.statusCode ? { statusCode: error.statusCode } : undefined
                );
            }

            return errorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred while creating note'
            );
        }
    }
}

// Export singleton instance
export const createNoteHandler = new CreateNoteHandler();
