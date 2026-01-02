/**
 * HTTP client for SwipeOne API with authentication and error handling
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { serverConfig } from '../config/environment.js';
import { validateWorkspaceId, validateContactId, validateNoteId, validateTaskId } from '../utils/validators.js';
import type {
    ContactPropertiesResponse,
    SearchContactsRequest,
    SearchContactsResponse,
    RetrieveAllContactsRequest,
    RetrieveAllContactsResponse,
    CreateNoteRequest,
    CreateNoteResponse,
    RetrieveNotesResponse,
    UpdateNoteRequest,
    UpdateNoteResponse,
    CreateTaskRequest,
    CreateTaskResponse,
    UpdateTaskRequest,
    UpdateTaskResponse,
    RetrieveAllTasksRequest,
    RetrieveAllTasksResponse,
} from '../types/index.js';
import { SwipeOneAPIError } from '../types/index.js';

/**
 * Generate a unique correlation ID for request tracing
 */
function generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

class SwipeOneAPIClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: serverConfig.apiBaseUrl,
            timeout: serverConfig.timeout,
            headers: {
                'x-api-key': serverConfig.apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'SwipeOne-MCP-Server/1.0.0',
            },
        });

        // Request interceptor to add correlation ID
        this.client.interceptors.request.use(
            (config: any) => {
                config.headers['X-Request-ID'] = generateCorrelationId();
                return config;
            },
            (error: any) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response: any) => response,
            (error: AxiosError) => {
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private handleError(error: AxiosError): SwipeOneAPIError {
        if (error.response) {
            // Server responded with error status
            const statusCode = error.response.status;
            const message = `API request failed with status ${statusCode}`;
            return new SwipeOneAPIError(message, statusCode, error.response.data);
        } else if (error.request) {
            // Request made but no response received
            return new SwipeOneAPIError('No response received from API server');
        } else {
            // Error setting up the request
            return new SwipeOneAPIError(`Request setup failed: ${error.message}`);
        }
    }

    /**
     * Get all contact properties for a workspace
     */
    async getContactProperties(workspaceId: string): Promise<ContactPropertiesResponse> {
        try {
            const validatedId = validateWorkspaceId(workspaceId);
            const response = await this.client.get<ContactPropertiesResponse>(
                `/workspaces/${validatedId}/contact-properties`
            );
            return response.data;
        } catch (error) {
            if (error instanceof SwipeOneAPIError) {
                throw error;
            }
            throw new SwipeOneAPIError('Failed to fetch contact properties');
        }
    }

    /**
     * Search contacts in a workspace
     */
    async searchContacts(
        workspaceId: string,
        searchRequest: SearchContactsRequest
    ): Promise<SearchContactsResponse> {
        try {
            const validatedId = validateWorkspaceId(workspaceId);
            const response = await this.client.post<SearchContactsResponse>(
                `/workspaces/${validatedId}/contacts/search`,
                searchRequest
            );
            return response.data;
        } catch (error) {
            if (error instanceof SwipeOneAPIError) {
                throw error;
            }
            throw new SwipeOneAPIError('Failed to search contacts');
        }
    }

    /**
     * Retrieve all contacts in a workspace
     */
    async retrieveAllContacts(
        workspaceId: string,
        params: RetrieveAllContactsRequest
    ): Promise<RetrieveAllContactsResponse> {
        try {
            const validatedId = validateWorkspaceId(workspaceId);
            const response = await this.client.get<RetrieveAllContactsResponse>(
                `/workspaces/${validatedId}/contacts`,
                { params }
            );
            return response.data;
        } catch (error) {
            if (error instanceof SwipeOneAPIError) {
                throw error;
            }
            throw new SwipeOneAPIError('Failed to retrieve contacts');
        }
    }

    /**
     * Create a note for a contact
     */
    async createNote(
        contactId: string,
        noteData: CreateNoteRequest
    ): Promise<CreateNoteResponse> {
        try {
            const validatedId = validateContactId(contactId);
            const response = await this.client.post<CreateNoteResponse>(
                `/contacts/${validatedId}/notes`,
                noteData
            );
            return response.data;
        } catch (error) {
            if (error instanceof SwipeOneAPIError) {
                throw error;
            }
            throw new SwipeOneAPIError('Failed to create note');
        }
    }

    /**
     * Retrieve all notes for a contact
     */
    async retrieveNotes(contactId: string): Promise<RetrieveNotesResponse> {
        try {
            const validatedId = validateContactId(contactId);
            const response = await this.client.get<RetrieveNotesResponse>(
                `/contacts/${validatedId}/notes`
            );
            return response.data;
        } catch (error) {
            if (error instanceof SwipeOneAPIError) {
                throw error;
            }
            throw new SwipeOneAPIError('Failed to retrieve notes');
        }
    }

    /**
     * Update a note
     */
    async updateNote(
        noteId: string,
        noteData: UpdateNoteRequest
    ): Promise<UpdateNoteResponse> {
        try {
            const validatedId = validateNoteId(noteId);
            const response = await this.client.patch<UpdateNoteResponse>(
                `/notes/${validatedId}`,
                noteData
            );
            return response.data;
        } catch (error) {
            if (error instanceof SwipeOneAPIError) {
                throw error;
            }
            throw new SwipeOneAPIError('Failed to update note');
        }
    }

    /**
     * Create a task in a workspace
     */
    async createTask(
        workspaceId: string,
        taskData: CreateTaskRequest
    ): Promise<CreateTaskResponse> {
        try {
            const validatedId = validateWorkspaceId(workspaceId);
            const response = await this.client.post<CreateTaskResponse>(
                `/workspaces/${validatedId}/tasks`,
                taskData
            );
            return response.data;
        } catch (error) {
            if (error instanceof SwipeOneAPIError) {
                throw error;
            }
            throw new SwipeOneAPIError('Failed to create task');
        }
    }

    /**
     * Update a task
     */
    async updateTask(
        taskId: string,
        taskData: UpdateTaskRequest
    ): Promise<UpdateTaskResponse> {
        try {
            const validatedId = validateTaskId(taskId);
            const response = await this.client.patch<UpdateTaskResponse>(
                `/tasks/${validatedId}`,
                taskData
            );
            return response.data;
        } catch (error) {
            if (error instanceof SwipeOneAPIError) {
                throw error;
            }
            throw new SwipeOneAPIError('Failed to update task');
        }
    }

    /**
     * Retrieve all tasks in a workspace
     */
    async retrieveAllTasks(
        workspaceId: string,
        params: RetrieveAllTasksRequest
    ): Promise<RetrieveAllTasksResponse> {
        try {
            const validatedId = validateWorkspaceId(workspaceId);
            const response = await this.client.get<RetrieveAllTasksResponse>(
                `/workspaces/${validatedId}/tasks`,
                { params }
            );
            return response.data;
        } catch (error) {
            if (error instanceof SwipeOneAPIError) {
                throw error;
            }
            throw new SwipeOneAPIError('Failed to retrieve tasks');
        }
    }
}

// Export singleton instance
export const apiClient = new SwipeOneAPIClient();
