/**
 * Tool registry for managing and executing tools
 */

import type { ToolHandler } from '../types/toolHandler.js';
import { getContactPropertiesHandler } from './getContactPropertiesHandler.js';
import { searchContactsHandler } from './searchContactsHandler.js';
import { retrieveAllContactsHandler } from './retrieveAllContactsHandler.js';
import { createNoteHandler } from './createNoteHandler.js';
import { retrieveNotesHandler } from './retrieveNotesHandler.js';
import { updateNoteHandler } from './updateNoteHandler.js';
import { createTaskHandler } from './createTaskHandler.js';
import { updateTaskHandler } from './updateTaskHandler.js';
import { retrieveAllTasksHandler } from './retrieveAllTasksHandler.js';

/**
 * Registry of all available tool handlers
 */
export const toolHandlers: Record<string, ToolHandler> = {
    get_contact_properties: getContactPropertiesHandler,
    search_contacts: searchContactsHandler,
    retrieve_all_contacts: retrieveAllContactsHandler,
    create_note: createNoteHandler,
    retrieve_notes: retrieveNotesHandler,
    update_note: updateNoteHandler,
    create_task: createTaskHandler,
    update_task: updateTaskHandler,
    retrieve_all_tasks: retrieveAllTasksHandler,
};

/**
 * Get a tool handler by name
 * @param toolName - Name of the tool
 * @returns Tool handler or undefined if not found
 */
export function getToolHandler(toolName: string): ToolHandler | undefined {
    return toolHandlers[toolName];
}

/**
 * Check if a tool exists
 * @param toolName - Name of the tool
 * @returns True if tool exists
 */
export function hasToolHandler(toolName: string): boolean {
    return toolName in toolHandlers;
}

