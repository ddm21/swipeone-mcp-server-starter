/**
 * HTML escaping utilities to prevent XSS attacks
 */

/**
 * Escape special HTML characters to prevent XSS
 * @param str - String to escape
 * @returns Escaped string safe for HTML embedding
 */
export function escapeHTML(str: string): string {
    if (typeof str !== 'string') {
        return String(str);
    }

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Escape JSON for safe embedding in HTML script tags
 * Prevents script injection and JSON breaking
 * @param obj - Object to stringify and escape
 * @returns Safely escaped JSON string
 */
export function escapeJSONForHTML(obj: any): string {
    const jsonString = JSON.stringify(obj);

    // Replace characters that could break out of script context
    return jsonString
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')  // Line separator
        .replace(/\u2029/g, '\\u2029'); // Paragraph separator
}

/**
 * Sanitize user-generated content for display
 * Removes potentially dangerous content while preserving safe formatting
 * @param content - User-generated content
 * @returns Sanitized content
 */
export function sanitizeUserContent(content: string): string {
    if (typeof content !== 'string') {
        return '';
    }

    // Remove any script tags
    let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Escape remaining HTML
    return escapeHTML(sanitized);
}
