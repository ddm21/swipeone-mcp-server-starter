/**
 * ID validation and sanitization utilities
 * Prevents injection attacks and path traversal
 */

import { serverConfig } from '../config/environment.js';

// MongoDB ObjectID pattern: 24-character hexadecimal string
const MONGODB_OBJECTID_PATTERN = /^[a-f0-9]{24}$/i;

// Lenient pattern for development: alphanumeric, hyphens, underscores
const LENIENT_ID_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/;

/**
 * Determine if strict validation should be used
 * In production, use strict MongoDB ObjectID validation
 * In development, allow more flexible IDs for testing
 */
function shouldUseStrictValidation(): boolean {
    return serverConfig.authEnabled || process.env.NODE_ENV === 'production';
}

/**
 * Validate ID format
 * @param id - ID to validate
 * @param idType - Type of ID for error messages
 * @returns true if valid
 */
function isValidId(id: string, idType: string): { valid: boolean; error?: string } {
    if (!id || typeof id !== 'string') {
        return { valid: false, error: `${idType} is required and must be a string` };
    }

    const useStrict = shouldUseStrictValidation();

    if (useStrict) {
        // Strict validation: MongoDB ObjectID format
        if (!MONGODB_OBJECTID_PATTERN.test(id)) {
            return {
                valid: false,
                error: `Invalid ${idType} format. Must be a 24-character hexadecimal string (MongoDB ObjectID)`,
            };
        }
    } else {
        // Lenient validation for development
        if (!LENIENT_ID_PATTERN.test(id)) {
            return {
                valid: false,
                error: `Invalid ${idType} format. Must contain only alphanumeric characters, hyphens, and underscores (max 100 chars)`,
            };
        }
    }

    return { valid: true };
}

/**
 * Validate and sanitize a workspace ID
 * @param id - Workspace ID to validate
 * @returns URL-encoded validated ID
 * @throws Error if ID is invalid
 */
export function validateWorkspaceId(id: string): string {
    const validation = isValidId(id, 'Workspace ID');
    if (!validation.valid) {
        throw new Error(validation.error);
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
    const validation = isValidId(id, 'Contact ID');
    if (!validation.valid) {
        throw new Error(validation.error);
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
    const validation = isValidId(id, 'Note ID');
    if (!validation.valid) {
        throw new Error(validation.error);
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
    const validation = isValidId(id, 'Task ID');
    if (!validation.valid) {
        throw new Error(validation.error);
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
    const validation = isValidId(id, idType);
    if (!validation.valid) {
        throw new Error(validation.error);
    }
    return encodeURIComponent(id);
}

