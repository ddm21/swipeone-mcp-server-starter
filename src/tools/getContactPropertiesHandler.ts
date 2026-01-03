/**
 * Handler for get_contact_properties tool
 */

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler, ToolContext } from '../types/toolHandler.js';
import type { GetContactPropertiesInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { uiResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Get Contact Properties Tool Handler
 * Retrieves all contact properties (fields) available in a workspace
 */
export class GetContactPropertiesHandler implements ToolHandler<GetContactPropertiesInput> {
    async execute(_input: GetContactPropertiesInput, context: ToolContext): Promise<CallToolResult> {
        try {
            logger.info('Fetching contact properties', { workspaceId: context.workspaceId });

            // Call API
            const response = await apiClient.getContactProperties(context.workspaceId);

            logger.info('Successfully fetched contact properties', {
                workspaceId: context.workspaceId,
                count: response.data.count,
            });

            return uiResponse('get_contact_properties', response);
        } catch (error) {
            logger.error('Failed to fetch contact properties', error);

            if (error instanceof SwipeOneAPIError) {
                return errorResponse(
                    `API Error: ${error.message}`,
                    error.statusCode ? { statusCode: error.statusCode } : undefined
                );
            }

            return errorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred while fetching contact properties'
            );
        }
    }
}

// Export singleton instance
export const getContactPropertiesHandler = new GetContactPropertiesHandler();
