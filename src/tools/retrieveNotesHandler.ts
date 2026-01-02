/**
 * Handler for retrieve_notes tool
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler } from '../types/toolHandler.js';
import type { RetrieveNotesInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Retrieve Notes Tool Handler
 * Retrieves all notes for a specific contact
 */
export class RetrieveNotesHandler implements ToolHandler<RetrieveNotesInput> {
    async execute(input: RetrieveNotesInput): Promise<CallToolResult> {
        try {
            const { contactId } = input;

            logger.info('Retrieving notes for contact', {
                contactId,
            });

            // Call API
            const response = await apiClient.retrieveNotes(contactId);

            logger.info('Successfully retrieved notes', {
                contactId,
                count: response?.data?.notes?.length || 0,
            });

            return successResponse(response);
        } catch (error) {
            logger.error('Failed to retrieve notes', error);

            if (error instanceof SwipeOneAPIError) {
                return errorResponse(
                    `API Error: ${error.message}`,
                    error.statusCode ? { statusCode: error.statusCode } : undefined
                );
            }

            return errorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred while retrieving notes'
            );
        }
    }
}

// Export singleton instance
export const retrieveNotesHandler = new RetrieveNotesHandler();
