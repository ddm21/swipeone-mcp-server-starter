/**
 * ID validation and sanitization utilities
 * Prevents injection attacks and path traversal
 */

// Valid ID pattern: alphanumeric, hyphens, underscores only
const ID_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/;

/**
 * Validate and sanitize a workspace ID
 * @param id - Workspace ID to validate
 * @returns URL-encoded validated ID
 * @throws Error if ID is invalid
 */
export function validateWorkspaceId(id: string): string {
    if (!id || typeof id !== 'string') {
        throw new Error('Workspace ID is required and must be a string');
    }

    if (!ID_PATTERN.test(id)) {
        throw new Error(
            'Invalid workspace ID format. Must contain only alphanumeric characters, hyphens, and underscores (max 100 chars)'
        );
    }

    return encodeURIComponent(id);
}

/**
 * Validate and sanitize a contact ID
 * @param id - Contact ID to validate
 * @returns URL-encoded validated ID
 * @throws Error if ID is invalid
 */
export function validateContactId(id: string): string {
    if (!id || typeof id !== 'string') {
        throw new Error('Contact ID is required and must be a string');
    }

    if (!ID_PATTERN.test(id)) {
        throw new Error(
            'Invalid contact ID format. Must contain only alphanumeric characters, hyphens, and underscores (max 100 chars)'
        );
    }

    return encodeURIComponent(id);
}

/**
 * Validate and sanitize a note ID
 * @param id - Note ID to validate
 * @returns URL-encoded validated ID
 * @throws Error if ID is invalid
 */
export function validateNoteId(id: string): string {
    if (!id || typeof id !== 'string') {
        throw new Error('Note ID is required and must be a string');
    }

    if (!ID_PATTERN.test(id)) {
        throw new Error(
            'Invalid note ID format. Must contain only alphanumeric characters, hyphens, and underscores (max 100 chars)'
        );
    }

    return encodeURIComponent(id);
}

/**
 * Validate and sanitize a task ID
 * @param id - Task ID to validate
 * @returns URL-encoded validated ID
 * @throws Error if ID is invalid
 */
export function validateTaskId(id: string): string {
    if (!id || typeof id !== 'string') {
        throw new Error('Task ID is required and must be a string');
    }

    if (!ID_PATTERN.test(id)) {
        throw new Error(
            'Invalid task ID format. Must contain only alphanumeric characters, hyphens, and underscores (max 100 chars)'
        );
    }

    return encodeURIComponent(id);
}

/**
 * Validate a generic ID (for cases where type is unknown)
 * @param id - ID to validate
 * @param idType - Type of ID for error messages
 * @returns URL-encoded validated ID
 * @throws Error if ID is invalid
 */
export function validateId(id: string, idType: string = 'ID'): string {
    if (!id || typeof id !== 'string') {
        throw new Error(`${idType} is required and must be a string`);
    }

    if (!ID_PATTERN.test(id)) {
        throw new Error(
            `Invalid ${idType} format. Must contain only alphanumeric characters, hyphens, and underscores (max 100 chars)`
        );
    }

    return encodeURIComponent(id);
}
