# SwipeOne MCP Server

TypeScript MCP server exposing SwipeOne API endpoints as tools for ChatGPT and other MCP clients.

## Features

- ✅ **Contact Management**: Get properties, search, and retrieve contacts
- ✅ **Notes Management**: Create, retrieve, and update notes
- ✅ **Task Management**: Create, retrieve, and update tasks
- ✅ **MCP Prompts**: Built-in guidance for ChatGPT on tool usage
- 🔒 **Secure**: API key authentication with error handling
- ✨ **Type-Safe**: Full TypeScript with Zod validation

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env and add your SWIPEONE_API_KEY

# Build & Run
npm run build
npm start

# Test with Inspector
npm run inspector
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
```

### Claude Desktop Integration

Add to MCP settings file:

**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "swipeone": {
      "command": "node",
      "args": ["path/to/SwipeOneMCPServer/dist/index.js"],
      "env": {
        "SWIPEONE_API_KEY": "your_api_key_here",
        "DEFAULT_WORKSPACE_ID": "your_workspace_id"
      }
    }
  }
}
```

Restart Claude Desktop.

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

## Documentation

- [ADDING_TOOLS.md](./ADDING_TOOLS.md) - Guide for adding new tools
- [MCP_PROMPTS.md](./MCP_PROMPTS.md) - Guide for MCP prompts and ChatGPT guidance
- [OAUTH_STRATEGY.md](./OAUTH_STRATEGY.md) - OAuth integration strategy
- [CHATGPT_APPS_ANALYSIS.md](./CHATGPT_APPS_ANALYSIS.md) - ChatGPT Apps compatibility
- [API-ENDPOINTS-EXAMPLE.md](./API-ENDPOINTS-EXAMPLE.md) - API endpoint examples

## License

ISC
