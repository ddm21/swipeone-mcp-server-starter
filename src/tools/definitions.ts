/**
 * Tool definitions for MCP server
 * Centralized location for all tool metadata
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Get Contact Properties Tool Definition
 */
export const getContactPropertiesTool: Tool = {
    name: 'get_contact_properties',
    description:
        'Retrieves all contact properties (fields) available in a SwipeOne workspace. Use this to discover what properties you can filter and sort by when searching contacts.',
    inputSchema: {
        type: 'object',
        properties: {
            workspaceId: {
                type: 'string',
                description:
                    'The unique identifier of the workspace to fetch contact properties from. Optional if DEFAULT_WORKSPACE_ID is set in environment.',
            },
        },
        required: [],
    },
};

/**
 * Search Contacts Tool Definition
 */
export const searchContactsTool: Tool = {
    name: 'search_contacts',
    description:
        'Search and filter contacts in a SwipeOne workspace. Supports complex filtering with AND/OR logic, sorting by multiple properties, and cursor-based pagination.',
    inputSchema: {
        type: 'object',
        properties: {
            workspaceId: {
                type: 'string',
                description:
                    'The unique identifier of the workspace to search contacts in. Optional if DEFAULT_WORKSPACE_ID is set in environment.',
            },
            filter: {
                type: 'object',
                description: 'Filter criteria for contacts',
                properties: {
                    type: {
                        type: 'string',
                        enum: ['and', 'or'],
                        description: 'Logical operator to combine predicates',
                    },
                    predicates: {
                        type: 'array',
                        description: 'Array of filter conditions',
                        items: {
                            type: 'object',
                            properties: {
                                property: {
                                    type: 'string',
                                    description: 'Property name to filter on (e.g., "customProperties.subscriptionStatus")',
                                },
                                operator: {
                                    type: 'string',
                                    description: 'Comparison operator (e.g., "is", "contains")',
                                },
                                value: {
                                    type: 'string',
                                    description: 'Value to compare against',
                                },
                                dataType: {
                                    type: 'string',
                                    description: 'Data type of the property (e.g., "string", "number")',
                                },
                            },
                            required: ['property', 'operator', 'value', 'dataType'],
                        },
                    },
                },
                required: ['type', 'predicates'],
            },
            limit: {
                type: 'number',
                description: 'Maximum number of contacts to return (1-100, default: 10)',
                minimum: 1,
                maximum: 100,
                default: 10,
            },
            sort: {
                type: 'array',
                description: 'Array of sort options',
                items: {
                    type: 'object',
                    properties: {
                        property: {
                            type: 'string',
                            description: 'Property name to sort by',
                        },
                        order: {
                            type: 'string',
                            enum: ['asc', 'dsc'],
                            description: 'Sort order (asc or dsc)',
                        },
                    },
                    required: ['property', 'order'],
                },
            },
            searchAfter: {
                type: 'string',
                description: 'Cursor token to get the next page of results',
            },
            searchBefore: {
                type: 'string',
                description: 'Cursor token to get the previous page of results',
            },
        },
        required: [],
    },
};

/**
 * Retrieve All Contacts Tool Definition
 */
export const retrieveAllContactsTool: Tool = {
    name: 'retrieve_all_contacts',
    description:
        'Retrieve all contacts from a SwipeOne workspace. Supports text search, sorting, and cursor-based pagination. Simpler alternative to search_contacts for basic retrieval.',
    inputSchema: {
        type: 'object',
        properties: {
            workspaceId: {
                type: 'string',
                description:
                    'The unique identifier of the workspace to retrieve contacts from. Optional if DEFAULT_WORKSPACE_ID is set in environment.',
            },
            searchText: {
                type: 'string',
                description: 'Text to search in contacts (searches in Name or Email fields)',
            },
            sort: {
                type: 'string',
                description: 'Field to sort by (e.g., "createdAt", "fullName")',
            },
            order: {
                type: 'number',
                description: 'Sort order: 1 for ascending, -1 for descending (default: 1)',
                enum: [-1, 1],
            },
            searchAfter: {
                type: 'string',
                description: 'Cursor token to fetch the next set of results',
            },
            searchBefore: {
                type: 'string',
                description: 'Cursor token to fetch the previous set of results',
            },
            limit: {
                type: 'number',
                description: 'Number of contacts to return (1-100, default: 20)',
                minimum: 1,
                maximum: 100,
                default: 20,
            },
        },
        required: [],
    },
};

/**
 * Create Note Tool Definition
 */
export const createNoteTool: Tool = {
    name: 'create_note',
    description:
        'Create a new note for a specific contact in SwipeOne. Notes can be used to track interactions, follow-ups, or any other important information about a contact.',
    inputSchema: {
        type: 'object',
        properties: {
            contactId: {
                type: 'string',
                description: 'The unique identifier of the contact to which the note will be added.',
            },
            title: {
                type: 'string',
                description: 'The title of the note (e.g., "Follow-up Call", "Meeting Notes").',
            },
            content: {
                type: 'string',
                description: 'The content/body of the note with detailed information.',
            },
        },
        required: ['contactId', 'title', 'content'],
    },
};

/**
 * Retrieve Notes Tool Definition
 */
export const retrieveNotesTool: Tool = {
    name: 'retrieve_notes',
    description:
        'Retrieve all notes associated with a specific contact in SwipeOne. Returns a list of all notes including their titles, content, and creation timestamps.',
    inputSchema: {
        type: 'object',
        properties: {
            contactId: {
                type: 'string',
                description: 'The unique identifier of the contact for which notes are to be retrieved.',
            },
        },
        required: ['contactId'],
    },
};

/**
 * Update Note Tool Definition
 */
export const updateNoteTool: Tool = {
    name: 'update_note',
    description:
        'Update an existing note in SwipeOne. You can update the title, content, or both. At least one field must be provided.',
    inputSchema: {
        type: 'object',
        properties: {
            noteId: {
                type: 'string',
                description: 'The unique identifier of the note to be updated.',
            },
            title: {
                type: 'string',
                description: 'The new title for the note (optional).',
            },
            content: {
                type: 'string',
                description: 'The new content for the note (optional).',
            },
        },
        required: ['noteId'],
    },
};

/**
 * Create Task Tool Definition
 */
export const createTaskTool: Tool = {
    name: 'create_task',
    description:
        'Create a new task in a SwipeOne workspace. Tasks can be assigned to users, linked to contacts, and include due dates and reminders for tracking follow-ups and action items.',
    inputSchema: {
        type: 'object',
        properties: {
            workspaceId: {
                type: 'string',
                description:
                    'The unique identifier of the workspace to create the task in. Optional if DEFAULT_WORKSPACE_ID is set in environment.',
            },
            name: {
                type: 'string',
                description: 'The name/title of the task (e.g., "Follow up with John Doe", "Send proposal"). Maximum 500 characters.',
            },
            assignedTo: {
                type: 'string',
                description: 'The user ID of the person assigned to this task (optional).',
            },
            dueDate: {
                type: 'string',
                description: 'Due date for the task in ISO 8601 format (e.g., "2024-07-10T12:00:00Z").',
            },
            reminder: {
                type: 'string',
                description: 'Reminder date for the task in ISO 8601 format (e.g., "2024-07-09T12:00:00Z").',
            },
            contactId: {
                type: 'string',
                description: 'The unique identifier of the contact associated with this task (optional).',
            },
        },
        required: ['name'],
    },
};

/**
 * Update Task Tool Definition
 */
export const updateTaskTool: Tool = {
    name: 'update_task',
    description:
        'Update an existing task in SwipeOne. You can update any combination of fields including name, assignedTo, dueDate, reminder, and status. At least one field must be provided.',
    inputSchema: {
        type: 'object',
        properties: {
            taskId: {
                type: 'string',
                description: 'The unique identifier of the task to be updated.',
            },
            name: {
                type: 'string',
                description: 'Updated name/title of the task. Maximum 500 characters.',
            },
            assignedTo: {
                type: 'string',
                description: 'Updated user ID of the person assigned to this task.',
            },
            dueDate: {
                type: 'string',
                description: 'Updated due date in ISO 8601 format (e.g., "2024-07-10T12:00:00Z").',
            },
            reminder: {
                type: 'string',
                description: 'Updated reminder date in ISO 8601 format (e.g., "2024-07-09T12:00:00Z").',
            },
            status: {
                type: 'string',
                enum: ['not_started', 'in_progress', 'completed'],
                description: 'Task status: "not_started", "in_progress", or "completed".',
            },
        },
        required: ['taskId'],
    },
};

/**
 * Retrieve All Tasks Tool Definition
 */
export const retrieveAllTasksTool: Tool = {
    name: 'retrieve_all_tasks',
    description:
        'Retrieve all tasks from a SwipeOne workspace with pagination support. Returns task details including status, assignments, due dates, and associated contacts.',
    inputSchema: {
        type: 'object',
        properties: {
            workspaceId: {
                type: 'string',
                description:
                    'The unique identifier of the workspace to retrieve tasks from. Optional if DEFAULT_WORKSPACE_ID is set in environment.',
            },
            page: {
                type: 'number',
                description: 'Page number for pagination (default: 1).',
                minimum: 1,
                default: 1,
            },
            limit: {
                type: 'number',
                description: 'Number of tasks to return per page (1-100, default: 20).',
                minimum: 1,
                maximum: 100,
                default: 20,
            },
        },
        required: [],
    },
};

/**
 * All available tools
 */
export const allTools: Tool[] = [
    getContactPropertiesTool,
    searchContactsTool,
    retrieveAllContactsTool,
    createNoteTool,
    retrieveNotesTool,
    updateNoteTool,
    createTaskTool,
    updateTaskTool,
    retrieveAllTasksTool,
];

