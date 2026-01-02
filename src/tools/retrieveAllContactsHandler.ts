/**
 * Handler for retrieve_all_contacts tool
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler, ToolContext } from '../types/toolHandler.js';
import type { RetrieveAllContactsInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Retrieve All Contacts Tool Handler
 * Retrieves all contacts from a workspace with optional filtering and pagination
 */
export class RetrieveAllContactsHandler implements ToolHandler<RetrieveAllContactsInput> {
    async execute(input: RetrieveAllContactsInput, context: ToolContext): Promise<CallToolResult> {
        try {
            // Extract workspaceId from input (already validated)
            const { workspaceId: _, ...params } = input;

            logger.info('Retrieving all contacts', {
                workspaceId: context.workspaceId,
                hasSearchText: !!params.searchText,
                limit: params.limit,
            });

            // Call API
            const response = await apiClient.retrieveAllContacts(context.workspaceId, params);

            logger.info('Successfully retrieved contacts', {
                workspaceId: context.workspaceId,
                count: response.data.count,
                returned: response.data.contacts.length,
            });

            return successResponse(response);
        } catch (error) {
            logger.error('Failed to retrieve contacts', error);

            if (error instanceof SwipeOneAPIError) {
                return errorResponse(
                    `API Error: ${error.message}`,
                    error.statusCode ? { statusCode: error.statusCode } : undefined
                );
            }

            return errorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred while retrieving contacts'
            );
        }
    }
}

// Export singleton instance
export const retrieveAllContactsHandler = new RetrieveAllContactsHandler();
