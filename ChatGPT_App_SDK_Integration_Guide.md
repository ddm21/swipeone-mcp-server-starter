# ChatGPT App SDK & SwipeOne CRM MCP Integration Guide

## 1. Executive Summary

This document serves as the **Master Implementation Guide** for transforming the SwipeOne MCP server into a fully-fledged "ChatGPT App". It unifies the frontend UI requirements (The Apps SDK) with the backend security requirements (OAuth 2.1).

**Reference Documents:**
*   `CHATGPT_APPS_ANALYSIS.md`: Contains a deep-dive code analysis of the current SwipeOne backend and detailed gaps in the authentication flow. use that for specific file-level changes.
*   **Official Docs**: [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/)

## 2. Architecture Overview

To support ChatGPT Apps, the system requires changes across three layers:

| Layer | Responsibility | Key Changes Required |
| :--- | :--- | :--- |
| **Frontend (UI)** | Render interactive widgets (React) | Build a new React App hosted on a public URL. |
| **MCP Server (Backend)** | Provide tools & data | Add `_meta` hints to tool responses; Refactor `apiClient` to use OAuth tokens. |
| **Auth Server** | Authenticate users | Implement standard OAuth 2.1 (PKCE) endpoints. |

---

## 3. Detailed Implementation Strategy

### Phase 1: Authentication & Security (The "Hard" Part)
*Goal: Move from API Keys (`x-api-key`) to OAuth 2.1 Tokens.*

#### 1.1. Auth Server Requirements
Your backend team must expose standard OAuth 2.1 endpoints (as detailed in `CHATGPT_APPS_ANALYSIS.md`):
*   `GET /.well-known/oauth-protected-resource`: Discovery for ChatGPT.
    ```json
    { "resource": "https://api.swipeone.com", "authorization_servers": ["https://auth.swipeone.com"] }
    ```
*   `GET /.well-known/oauth-authorization-server`: Authorization server metadata.
*   **PKCE Support**: Mandatory SHA-256 for code challenges.

#### 1.2. MCP Server Code Refactoring
You need to modify the SwipeOne MCP codebase to handle per-request OAuth tokens instead of a single global API key.

*   **Middleware (`src/middleware/oauth.ts`)**:
    Create a middleware to extract the `Authorization: Bearer <token>` from the incoming MCP request headers (specifically `request.meta.oauthContext` if using the SDK's native auth handling, or standard headers).

*   **Main Server (`src/index.ts`)**:
    Update the server to extract the token from the context.
    ```typescript
    // Hybrid Strategy: Support both for testing
    const authToken = request.meta?.oauthContext?.accessToken || process.env.SWIPEONE_API_KEY;
    ```

*   **API Client (`src/services/apiClient.ts`)**:
    Refactor the client to accept a token per-request rather than at initialization.
    ```typescript
    // OLD
    headers: { 'x-api-key': config.apiKey }

    // NEW
    async getContact(id: string, token: string) {
       return axios.get(..., { headers: { Authorization: `Bearer ${token}` } });
    }
    ```

### Phase 2: The MCP Tool Protocol Updates
*Goal: Tell ChatGPT which UI to load.*

To "turn on" the UI, you must include the `_meta` field in your tool results.

#### 2.1. Update Tool Handlers
Modify `searchContactsTool` and others to return the special metadata.

```typescript
// src/tools/handlers/searchContacts.ts
return {
  content: [{ type: "text", text: "Found contact..." }],
  _meta: {
    resource: `https://your-ui-domain.com/widgets/contact-card?id=${contact.id}`,
    openai: {
      widgetPrefersBorder: true, 
      widgetDomain: "your-ui-domain.com",
      widgetCSP: {
        connect_domains: ["api.swipeone.com"],
        image_domains: ["cdn.swipeone.com"]
      }
    }
  }
};
```

### Phase 3: Frontend Development
*Goal: Build the interactive "Widget".*

#### 3.1. Build a React App
Create a lightweight React app using `@openai/apps-sdk-ui`.

*   **Routing**: The root component should inspect the URL query params or the `window.openai` context to decide what to render.
*   **State**: Use `window.openai.setWidgetState()` to save form progress.

#### 3.2. Widget Checklist
| Widget | Correlated Tool | Features |
| :--- | :--- | :--- |
| **Contact Card** | `search_contacts` | Display properties + "Add Note" button. |
| **Task List** | `retrieve_all_tasks` | Sortable columns + "Quick Complete" toggle. |
| **Note Editor** | `create_note` | Rich text area + "Save" button. |

---

## 4. API Reference: `window.openai`

The global object injected into your iframe.

```typescript
interface OpenAiGlobals {
  // Methods
  callTool(name: string, args: any): Promise<any>;
  setWidgetState(state: any): Promise<void>;
  sendFollowUpMessage(params: { prompt: string }): Promise<void>;
  
  // Properties
  toolInput: any;
  toolOutput: any; // The content returned from your MCP tool
}
```

## 5. Deployment & Debugging Checklist

1.  **Local Testing**:
    *   Use `npx @modelcontextprotocol/inspector` to verify tool outputs include `_meta`.
    *   Mock the OAuth header in the inspector to test `apiClient` refactoring.

2.  **Developer Mode in ChatGPT**:
    *   Go to **Settings > Connectors > Developer Mode**.
    *   Add your MCP Server URL.
    *   *Note*: For the UI to render, your UI domain must also be reachable (localhost works if tunneled via ngrok).

3.  **Validation**:
    *   Does `/.well-known/oauth-protected-resource` return correct JSON?
    *   Does the `apiClient` correctly pass the Bearer token to your backend?
    *   Does the UI render without CSP errors in the browser console?

## 6. Conclusion

The path to a production ChatGPT App involves **Authentication first, then UI**.

1.  **Start with Phase 1 (Auth)**: Use `CHATGPT_APPS_ANALYSIS.md` to guide the code refactoring.
2.  **Move to Phase 2 (Meta)**: Update tool responses.
3.  **Finish with Phase 3 (UI)**: Build the React widgets.
