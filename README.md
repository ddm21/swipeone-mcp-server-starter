# SwipeOne MCP Server

TypeScript MCP server exposing SwipeOne API endpoints as tools for ChatGPT and other MCP clients via **HTTP Streamable Transport** (MCP 2025-03-26).

## Features

- ✅ **Contact Management**: Get properties, search, and retrieve contacts
- ✅ **Notes Management**: Create, retrieve, and update notes
- ✅ **Task Management**: Create, retrieve, and update tasks
- ✅ **MCP Prompts**: Built-in guidance for ChatGPT on tool usage
- 🔒 **Secure**: API key authentication with error handling
- ✨ **Type-Safe**: Full TypeScript with Zod validation
- 🌐 **Streamable HTTP**: Modern MCP transport (replaces deprecated SSE)

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env and add your SWIPEONE_API_KEY
# Optionally configure PORT (default: 3000) and HOST (default: localhost)

# Build & Run
npm run build
npm start

# Server will start on http://localhost:3000
# MCP endpoint: http://localhost:3000/mcp
# Health check: http://localhost:3000/health
```

## Available Tools

### Contact Tools

- **`get_contact_properties`** - Get all contact fields in a workspace
- **`search_contacts`** - Advanced contact search with filters
- **`retrieve_all_contacts`** - Get all contacts with simple search

### Notes Tools

- **`create_note`** - Create a note for a contact
- **`retrieve_notes`** - Get all notes for a contact
- **`update_note`** - Update an existing note

### Task Tools

- **`create_task`** - Create a task in a workspace
- **`retrieve_all_tasks`** - Get all tasks in a workspace
- **`update_task`** - Update an existing task

### MCP Prompts

The server includes a built-in prompt that guides ChatGPT on how to use SwipeOne tools effectively:

- **`swipeone_assistant`** - Comprehensive guide on tool capabilities, best practices, and workflow examples

ChatGPT will automatically use this prompt to provide better assistance when working with your SwipeOne data.

## Configuration

### Environment Variables

Create `.env` file:
```env
SWIPEONE_API_KEY=your_api_key_here
DEFAULT_WORKSPACE_ID=your_workspace_id  # Optional for testing

# HTTP Server Configuration
PORT=3000        # Port for HTTP server (default: 3000)
HOST=localhost   # Host for HTTP server (default: localhost)
```

### Connecting to the Server

#### HTTP Client Connection

The server uses **Streamable HTTP** transport (MCP 2025-03-26 specification). Connect to:

**MCP Endpoint:**
```
http://localhost:3000/mcp
```

**For ChatGPT (via ngrok or public URL):**
```
https://your-ngrok-url.ngrok-free.app/mcp
```

**Setup with ngrok:**
1. Expose your local server: `ngrok http 3000`
2. Copy the ngrok HTTPS URL
3. Use `https://your-url.ngrok-free.app/mcp` in ChatGPT's MCP connector

#### Health Check

Verify the server is running:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "service": "swipeone-mcp-server",
  "version": "1.0.0",
  "transport": "sse",
  "endpoints": {
    "sse": "/sse",
    "mcp": "/mcp",
    "health": "/health"
  }
}
```

#### MCP Client Configuration

For MCP clients that support HTTP transport, use:

```json
{
  "mcpServers": {
    "swipeone": {
      "url": "http://localhost:3000/sse",
      "transport": "sse"
    }
  }
}
```

## Project Structure

```
src/
├── index.ts              # Main server
├── config/               # Environment config
├── schemas/              # Zod validation
├── services/             # API client
├── tools/                # Tool handlers
│   ├── definitions.ts    # Tool metadata
│   ├── registry.ts       # Handler registry
│   └── *Handler.ts       # Individual handlers
├── types/                # TypeScript types
└── utils/                # Utilities
```

## Development

### Commands

```bash
npm run build      # Build TypeScript
npm run dev        # Watch mode
npm start          # Run server
npm run inspector  # Test with MCP Inspector
```

### Adding New Tools

See [ADDING_TOOLS.md](./ADDING_TOOLS.md) for step-by-step guide.

## Troubleshooting

- **"Cannot find module"** → Run `npm install`
- **"Environment validation failed"** → Check `.env` file has `SWIPEONE_API_KEY`
- **"API request failed 401"** → Verify API key is correct
- **"Port already in use"** → Change `PORT` in `.env` or stop the process using port 3000
- **"Connection refused"** → Ensure server is running with `npm start`
- **Server not accessible** → Check firewall settings or try `HOST=0.0.0.0` for external access

## Documentation

- [ADDING_TOOLS.md](./ADDING_TOOLS.md) - Guide for adding new tools
- [MCP_PROMPTS.md](./MCP_PROMPTS.md) - Guide for MCP prompts and ChatGPT guidance
- [OAUTH_STRATEGY.md](./OAUTH_STRATEGY.md) - OAuth integration strategy
- [CHATGPT_APPS_ANALYSIS.md](./CHATGPT_APPS_ANALYSIS.md) - ChatGPT Apps compatibility
- [API-ENDPOINTS-EXAMPLE.md](./API-ENDPOINTS-EXAMPLE.md) - API endpoint examples

## License

ISC
