/**
 * Type definitions for SwipeOne API
 */

// Contact Property Types
export interface ContactProperty {
    name: string;
    label: string;
    dataType: string;
}

export interface ContactPropertiesResponse {
    status: string;
    data: {
        count: number;
        contactProperties: ContactProperty[];
    };
}

// Search Contacts Types
export interface FilterPredicate {
    property: string;
    operator: string;
    value: string;
    dataType: string;
}

export interface Filter {
    type: 'and' | 'or';
    predicates: FilterPredicate[];
}

export interface SortOption {
    property: string;
    order: 'asc' | 'dsc';
}

export interface SearchContactsRequest {
    filter?: Filter | undefined;
    limit?: number | undefined;
    sort?: SortOption[] | undefined;
    searchAfter?: string | undefined;
    searchBefore?: string | undefined;
}

export interface Contact {
    name: string;
    email: string;
    [key: string]: any; // Allow additional properties
}

export interface SearchContactsResponse {
    status: string;
    data: {
        count: number;
        searchAfter?: string;
        searchBefore?: string;
        contacts: Contact[];
    };
}

// Retrieve All Contacts Types
export interface RetrieveAllContactsRequest {
    searchText?: string | undefined;
    sort?: string | undefined;
    order?: number | undefined;
    searchAfter?: string | undefined;
    searchBefore?: string | undefined;
    limit?: number | undefined;
}

export interface RetrieveAllContactsResponse {
    status: string;
    data: {
        count: number;
        searchAfter?: string;
        searchBefore?: string;
        contacts: Contact[];
    };
}

// Configuration Types
export interface ServerConfig {
    apiBaseUrl: string;
    apiKey: string;
    timeout: number;
}

// Notes Types
export interface Note {
    _id: string;
    title: string;
    content: string;
    contactId: string;
    createdAt: string;
}

export interface CreateNoteRequest {
    title: string;
    content: string;
}

export interface CreateNoteResponse {
    status: string;
    data: {
        note: Note;
    };
}

export interface RetrieveNotesResponse {
    status: string;
    data: {
        notes: Note[];
    };
}

export interface UpdateNoteRequest {
    title?: string;
    content?: string;
}

export interface UpdateNoteResponse {
    status: string;
    data: {
        note: Note;
    };
}

// Task Types
export interface Task {
    _id: string;
    name: string;
    assignedTo?: string;
    dueDate?: string;
    reminder?: string;
    status?: 'not_started' | 'in_progress' | 'completed';
    contactId?: string;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskRequest {
    name: string;
    assignedTo?: string;
    dueDate?: string;
    reminder?: string;
    contactId?: string;
}

export interface CreateTaskResponse {
    status: string;
    data: {
        task: Task;
    };
}

export interface UpdateTaskRequest {
    name?: string;
    assignedTo?: string;
    dueDate?: string;
    reminder?: string;
    status?: 'not_started' | 'in_progress' | 'completed';
}

export interface UpdateTaskResponse {
    status: string;
    data: {
        task: Task;
    };
}

export interface RetrieveAllTasksRequest {
    page?: number;
    limit?: number;
}

export interface RetrieveAllTasksResponse {
    status: string;
    data: {
        total: number;
        page: number;
        limit: number;
        tasks: Task[];
    };
}

// Error Types
export class SwipeOneAPIError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: any
    ) {
        super(message);
        this.name = 'SwipeOneAPIError';
    }
}
