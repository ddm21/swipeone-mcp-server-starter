/**
 * Zod schemas for MCP tool input validation
 */

import { z } from 'zod';

// Schema for get_contact_properties tool
export const getContactPropertiesSchema = z.object({
    // Optional for testing (uses DEFAULT_WORKSPACE_ID), required in production with OAuth
    workspaceId: z.string().optional(),
});

export type GetContactPropertiesInput = z.infer<typeof getContactPropertiesSchema>;

// Schema for search_contacts tool
const filterPredicateSchema = z.object({
    property: z.string(),
    operator: z.string(),
    value: z.string(),
    dataType: z.string(),
});

const filterSchema = z.object({
    type: z.enum(['and', 'or']),
    predicates: z.array(filterPredicateSchema),
});

const sortOptionSchema = z.object({
    property: z.string(),
    order: z.enum(['asc', 'dsc']),
});

export const searchContactsSchema = z.object({
    // Optional for testing (uses DEFAULT_WORKSPACE_ID), required in production with OAuth
    workspaceId: z.string().optional(),
    filter: filterSchema.optional(),
    limit: z.number().min(1).max(100).default(10),
    sort: z.array(sortOptionSchema).optional(),
    searchAfter: z.string().optional(),
    searchBefore: z.string().optional(),
});

export type SearchContactsInput = z.infer<typeof searchContactsSchema>;

// Schema for retrieve_all_contacts tool
export const retrieveAllContactsSchema = z.object({
    // Optional for testing (uses DEFAULT_WORKSPACE_ID), required in production with OAuth
    workspaceId: z.string().optional(),
    searchText: z.string().optional(),
    sort: z.string().optional(),
    order: z.number().min(-1).max(1).optional(),
    searchAfter: z.string().optional(),
    searchBefore: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
});

export type RetrieveAllContactsInput = z.infer<typeof retrieveAllContactsSchema>;

// Schema for create_note tool
export const createNoteSchema = z.object({
    contactId: z.string(),
    title: z.string().min(1).max(500).trim(),
    content: z.string().min(1).max(10000).trim(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

// Schema for retrieve_notes tool
export const retrieveNotesSchema = z.object({
    contactId: z.string(),
});

export type RetrieveNotesInput = z.infer<typeof retrieveNotesSchema>;

// Schema for update_note tool
export const updateNoteSchema = z.object({
    noteId: z.string(),
    title: z.string().min(1).max(500).trim().optional(),
    content: z.string().min(1).max(10000).trim().optional(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// Schema for create_task tool
export const createTaskSchema = z.object({
    // Optional for testing (uses DEFAULT_WORKSPACE_ID), required in production with OAuth
    workspaceId: z.string().optional(),
    name: z.string().min(1).max(500).trim(),
    assignedTo: z.string().max(200).trim().optional(),
    dueDate: z.string().datetime().optional(),
    reminder: z.string().datetime().optional(),
    contactId: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// Schema for update_task tool
export const updateTaskSchema = z.object({
    taskId: z.string(),
    name: z.string().min(1).max(500).trim().optional(),
    assignedTo: z.string().max(200).trim().optional(),
    dueDate: z.string().datetime().optional(),
    reminder: z.string().datetime().optional(),
    status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// Schema for retrieve_all_tasks tool
export const retrieveAllTasksSchema = z.object({
    // Optional for testing (uses DEFAULT_WORKSPACE_ID), required in production with OAuth
    workspaceId: z.string().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

export type RetrieveAllTasksInput = z.infer<typeof retrieveAllTasksSchema>;
