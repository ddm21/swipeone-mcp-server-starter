# Adding New Tools

## Quick Steps

1. **Add Types** → `src/types/index.ts`
2. **Add Schema** → `src/schemas/toolSchemas.ts`
3. **Add API Method** → `src/services/apiClient.ts`
4. **Create Handler** → `src/tools/yourHandler.ts`
5. **Add Definition** → `src/tools/definitions.ts`
6. **Register Handler** → `src/tools/registry.ts`
7. **Export Handler** → `src/tools/index.ts`
8. **Add to Schema Registry** → `src/index.ts`

## Example: Create Note Tool

### 1. Types (`src/types/index.ts`)
```typescript
export interface CreateNoteRequest {
    title: string;
    content: string;
}

export interface CreateNoteResponse {
    status: string;
    data: { note: Note };
}
```

### 2. Schema (`src/schemas/toolSchemas.ts`)
```typescript
export const createNoteSchema = z.object({
    contactId: z.string(),
    title: z.string(),
    content: z.string(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
```

### 3. API Method (`src/services/apiClient.ts`)
```typescript
async createNote(contactId: string, noteData: CreateNoteRequest): Promise<CreateNoteResponse> {
    const response = await this.client.post(`/contacts/${contactId}/notes`, noteData);
    return response.data;
}
```

### 4. Handler (`src/tools/createNoteHandler.ts`)
```typescript
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolHandler } from '../types/toolHandler.js';
import type { CreateNoteInput } from '../schemas/toolSchemas.js';
import { apiClient } from '../services/apiClient.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';
import { SwipeOneAPIError } from '../types/index.js';

export class CreateNoteHandler implements ToolHandler<CreateNoteInput> {
    async execute(input: CreateNoteInput): Promise<CallToolResult> {
        try {
            const { contactId, title, content } = input;
            const response = await apiClient.createNote(contactId, { title, content });
            return successResponse(response);
        } catch (error) {
            logger.error('Failed to create note', error);
            if (error instanceof SwipeOneAPIError) {
                return errorResponse(`API Error: ${error.message}`);
            }
            return errorResponse(error instanceof Error ? error.message : 'Unknown error');
        }
    }
}

export const createNoteHandler = new CreateNoteHandler();
```

### 5. Definition (`src/tools/definitions.ts`)
```typescript
export const createNoteTool: Tool = {
    name: 'create_note',
    description: 'Create a new note for a contact',
    inputSchema: {
        type: 'object',
        properties: {
            contactId: { type: 'string', description: 'Contact ID' },
            title: { type: 'string', description: 'Note title' },
            content: { type: 'string', description: 'Note content' },
        },
        required: ['contactId', 'title', 'content'],
    },
};

// Add to allTools array
export const allTools: Tool[] = [
    // ... existing tools
    createNoteTool,
];
```

### 6. Register (`src/tools/registry.ts`)
```typescript
import { createNoteHandler } from './createNoteHandler.js';

export const toolHandlers: Record<string, ToolHandler> = {
    // ... existing handlers
    create_note: createNoteHandler,
};
```

### 7. Export (`src/tools/index.ts`)
```typescript
export * from './createNoteHandler.js';
```

### 8. Schema Registry (`src/index.ts`)
```typescript
import { createNoteSchema } from './schemas/toolSchemas.js';

const schemaRegistry: Record<string, z.ZodSchema> = {
    // ... existing schemas
    create_note: createNoteSchema,
};

// Tools that don't need workspaceId
const noWorkspaceTools = ['create_note', 'retrieve_notes', 'update_note', 'update_task'];
```

## Build & Test
```bash
npm run build
npm run inspector
```

## Reference Examples
- **Simple**: `src/tools/getContactPropertiesHandler.ts`
- **Complex**: `src/tools/searchContactsHandler.ts`
- **No workspace**: `src/tools/createNoteHandler.ts`
