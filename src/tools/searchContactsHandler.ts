/**
 * Handler for search_contacts tool
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler, ToolContext } from '../types/toolHandler.js';
import type { SearchContactsInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { uiResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Search Contacts Tool Handler
 * Search and filter contacts with advanced options
 */
export class SearchContactsHandler implements ToolHandler<SearchContactsInput> {
    async execute(input: SearchContactsInput, context: ToolContext): Promise<CallToolResult> {
        try {
            // Extract workspaceId from input (already validated)
            const { workspaceId: _, ...searchRequest } = input;

            logger.info('Searching contacts', {
                workspaceId: context.workspaceId,
                hasFilter: !!searchRequest.filter,
                limit: searchRequest.limit,
            });

            // Call API
            const response = await apiClient.searchContacts(context.workspaceId, searchRequest);

            logger.info('Successfully searched contacts', {
                workspaceId: context.workspaceId,
                count: response.data.count,
                returned: response.data.contacts.length,
            });

            return uiResponse('search_contacts', response);
        } catch (error) {
            logger.error('Failed to search contacts', error);

            if (error instanceof SwipeOneAPIError) {
                return errorResponse(
                    `API Error: ${error.message}`,
                    error.statusCode ? { statusCode: error.statusCode } : undefined
                );
            }

            return errorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred while searching contacts'
            );
        }
    }
}

// Export singleton instance
export const searchContactsHandler = new SearchContactsHandler();
