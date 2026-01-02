# ChatGPT Apps Compatibility Analysis

## Executive Summary

**Current Status**: Your MCP server is **NOT yet compatible** with ChatGPT Apps but is **well-architected for future OAuth integration**.

**Key Finding**: ChatGPT Apps require **OAuth 2.1 authentication**, but your current implementation uses **API key authentication** (`x-api-key` header). However, your codebase already has OAuth placeholders and your `OAUTH_STRATEGY.md` document is mostly correct.

---

## Current Implementation Analysis

### Authentication Method
- **Current**: API key authentication via `x-api-key` header
- **Location**: `src/services/apiClient.ts` (line 44)
- **Configuration**: `SWIPEONE_API_KEY` environment variable

```typescript
// Current authentication (API key)
headers: {
    'x-api-key': serverConfig.apiKey,  // ❌ Not compatible with ChatGPT Apps
    'Content-Type': 'application/json',
}
```

### OAuth Preparation
Your code already has OAuth placeholders:

1. **ToolContext interface** (`src/types/toolHandler.ts`):
   ```typescript
   export interface ToolContext {
       workspaceId: string;
       oauthToken?: string | undefined;  // ✅ Already defined
   }
   ```

2. **Main server** (`src/index.ts`, line 137-138):
   ```typescript
   const context = {
       workspaceId: workspaceId || '',
       oauthToken: undefined,  // ✅ Placeholder ready
   };
   ```

3. **Environment config** (`src/config/environment.ts`, line 24):
   ```typescript
   DEFAULT_WORKSPACE_ID: z.string().optional(),  // ✅ Flexible for OAuth
   ```

---

## ChatGPT Apps Requirements (2026)

Based on official MCP documentation and OAuth 2.1 specifications:

### 1. **OAuth 2.1 Standard**
- ChatGPT Apps **require OAuth 2.1** (not API keys)
- MCP servers act as **OAuth Resource Servers**
- ChatGPT acts as the **OAuth Client**

### 2. **Required Endpoints**
Your SwipeOne backend must provide:

#### a. Protected Resource Metadata
```
GET /.well-known/oauth-protected-resource
```
Response:
```json
{
  "resource": "https://api.swipeone.com",
  "authorization_servers": [
    "https://auth.swipeone.com"
  ]
}
```

#### b. Authorization Server Metadata (RFC 8414)
```
GET /.well-known/oauth-authorization-server
```
Response:
```json
{
  "issuer": "https://auth.swipeone.com",
  "authorization_endpoint": "https://auth.swipeone.com/oauth/authorize",
  "token_endpoint": "https://auth.swipeone.com/oauth/token",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "code_challenge_methods_supported": ["S256"]
}
```

### 3. **PKCE Requirement**
- **Mandatory**: PKCE with SHA-256
- ChatGPT will automatically use PKCE
- Your authorization server must validate code challenges

### 4. **Dynamic Client Registration (Optional but Recommended)**
- Support RFC 7591 for dynamic client registration
- Allows ChatGPT to register automatically

---

## OAUTH_STRATEGY.md Review

### ✅ What's Correct

1. **OAuth Flow** (lines 55-68): Accurate description of the authorization flow
2. **Token Storage** (lines 70-73): Correct token types and lifetimes
3. **Request Flow** (lines 75-89): Good understanding of OAuth context
4. **Middleware Approach** (lines 95-126): Solid implementation strategy
5. **API Client Updates** (lines 128-150): Correct approach to dynamic tokens
6. **Security Considerations** (lines 328-350): Comprehensive security practices

### ⚠️ What Needs Updates

1. **OAuth Context Location** (line 79):
   ```typescript
   // Document says:
   "oauthContext": { ... }  // ❌ Incorrect location
   
   // Should be (per MCP spec):
   request.meta.oauthContext  // ✅ Correct location
   ```
   **Your document already has this correct** in the middleware example (line 115)!

2. **Missing MCP-Specific Requirements**:
   - Protected resource metadata endpoint
   - Authorization server metadata (RFC 8414)
   - PKCE requirement (SHA-256 mandatory)

3. **Token Refresh** (lines 260-271):
   - Refresh tokens are handled by ChatGPT, not your MCP server
   - Your MCP server just validates access tokens

---

## Required Changes for ChatGPT Apps

### Phase 1: SwipeOne Backend (OAuth Server)

You need to build/configure an OAuth 2.1 server for SwipeOne:

1. **Authorization Endpoint**
   ```
   GET /oauth/authorize
   ```

2. **Token Endpoint**
   ```
   POST /oauth/token
   ```

3. **Metadata Endpoints**
   ```
   GET /.well-known/oauth-authorization-server
   GET /.well-known/oauth-protected-resource
   ```

4. **PKCE Support**
   - Validate `code_challenge` during authorization
   - Verify `code_verifier` during token exchange

### Phase 2: MCP Server Updates

#### 1. Update API Client (`src/services/apiClient.ts`)

**Current** (line 39-48):
```typescript
constructor() {
    this.client = axios.create({
        baseURL: serverConfig.apiBaseUrl,
        headers: {
            'x-api-key': serverConfig.apiKey,  // ❌ Remove this
        },
    });
}
```

**Required**:
```typescript
constructor() {
    this.client = axios.create({
        baseURL: serverConfig.apiBaseUrl,
        // No default auth header
    });
}

// Add method to set OAuth token per request
setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Or better: per-request token
async getContactProperties(workspaceId: string, oauthToken?: string) {
    const headers = oauthToken 
        ? { Authorization: `Bearer ${oauthToken}` }
        : { 'x-api-key': serverConfig.apiKey };  // Fallback for testing
    
    const response = await this.client.get(
        `/workspaces/${workspaceId}/contact-properties`,
        { headers }
    );
    return response.data;
}
```

#### 2. Update Main Server (`src/index.ts`)

**Current** (line 134-139):
```typescript
const context = {
    workspaceId: workspaceId || '',
    oauthToken: undefined,  // ❌ Not extracting from request
};
```

**Required**:
```typescript
// Extract OAuth context from MCP request
const oauthContext = request.meta?.oauthContext;

const context = {
    workspaceId: oauthContext?.workspaceId || workspaceId || '',
    oauthToken: oauthContext?.accessToken,  // ✅ Extract from request
};

// Validate token if present
if (oauthContext && !isTokenValid(oauthContext)) {
    return errorResponse('OAuth token expired or invalid');
}
```

#### 3. Create OAuth Middleware (`src/middleware/oauth.ts`)

```typescript
import { z } from 'zod';

const oauthContextSchema = z.object({
    accessToken: z.string(),
    workspaceId: z.string(),
    userId: z.string(),
    expiresAt: z.number(),
});

export type OAuthContext = z.infer<typeof oauthContextSchema>;

export function extractOAuthContext(request: any): OAuthContext | null {
    try {
        const context = request.meta?.oauthContext;
        return context ? oauthContextSchema.parse(context) : null;
    } catch {
        return null;
    }
}

export function isTokenValid(context: OAuthContext): boolean {
    return Date.now() < context.expiresAt;
}
```

#### 4. Update Environment Config (`src/config/environment.ts`)

```typescript
const envSchema = z.object({
    // Make API key optional (for OAuth mode)
    SWIPEONE_API_KEY: z.string().optional(),
    
    // OAuth configuration
    OAUTH_ENABLED: z.boolean().default(false),
    
    // Keep for backward compatibility
    DEFAULT_WORKSPACE_ID: z.string().optional(),
});
```

#### 5. Update All Tool Handlers

**Current** (e.g., `createNoteHandler.ts`, line 18):
```typescript
async execute(input: CreateNoteInput): Promise<CallToolResult> {
    // ❌ Not using context parameter
}
```

**Required**:
```typescript
async execute(input: CreateNoteInput, context: ToolContext): Promise<CallToolResult> {
    // ✅ Pass OAuth token to API client
    const response = await apiClient.createNote(
        contactId, 
        { title, content },
        context.oauthToken  // Pass token
    );
}
```

---

## Hybrid Mode Strategy (Recommended)

Support both API key (testing) and OAuth (production):

```typescript
// In index.ts
const oauthContext = extractOAuthContext(request);

let authToken: string | undefined;
let workspaceId: string;

if (oauthContext && isTokenValid(oauthContext)) {
    // Production: Use OAuth
    authToken = oauthContext.accessToken;
    workspaceId = oauthContext.workspaceId;
    logger.info('Using OAuth authentication');
} else {
    // Testing: Use API key
    authToken = undefined;  // API client will use x-api-key
    workspaceId = args.workspaceId || serverConfig.defaultWorkspaceId;
    logger.info('Using API key authentication (testing mode)');
}

const context = { workspaceId, oauthToken: authToken };
```

---

## Summary of Required Changes

### ✅ No Changes Needed
- MCP SDK integration
- Tool definitions and handlers structure
- Validation schemas
- Error handling
- Rate limiting
- Logging

### ⚠️ Changes Required

| Component | Change Required | Complexity |
|-----------|----------------|------------|
| **SwipeOne OAuth Server** | Build OAuth 2.1 endpoints | **High** |
| **API Client** | Support Bearer tokens | **Medium** |
| **Main Server** | Extract OAuth context | **Low** |
| **Tool Handlers** | Pass context to API calls | **Low** |
| **Environment Config** | Add OAuth settings | **Low** |
| **OAuth Middleware** | Create new file | **Low** |

---

## Recommended Implementation Order

1. **Build SwipeOne OAuth Server** (Backend team)
   - Authorization endpoint
   - Token endpoint
   - Metadata endpoints
   - PKCE support

2. **Update MCP Server** (Your codebase)
   - Create OAuth middleware
   - Update API client for Bearer tokens
   - Extract OAuth context in main server
   - Update tool handlers to pass context

3. **Test Hybrid Mode**
   - Verify API key mode still works
   - Test OAuth mode with mock tokens

4. **Register with ChatGPT**
   - Submit MCP server for review
   - Provide OAuth metadata URLs

5. **Production Deployment**
   - Deploy with HTTPS
   - Configure OAuth credentials
   - Monitor token validation

---

## Conclusion

**Your `OAUTH_STRATEGY.md` is 90% correct** and provides an excellent roadmap. The main gaps are:

1. MCP-specific OAuth context location (`request.meta.oauthContext`)
2. Protected resource metadata requirements
3. PKCE mandatory requirement
4. Token refresh is handled by ChatGPT (not your server)

**Your codebase is well-prepared** with OAuth placeholders already in place. The changes needed are straightforward and your architecture supports them cleanly.

**Next Step**: Build the SwipeOne OAuth 2.1 server first, then update the MCP server to extract and use OAuth tokens.
