# SwipeOne MCP Server

TypeScript MCP server exposing SwipeOne API endpoints as tools for ChatGPT with **rich UI components**.

## Features

### 🎨 Rich UI Components
All tools return beautiful, interactive UI instead of plain text:
- **Modern Design**: Gradient buttons, smooth animations, glassmorphism
- **Dark Mode**: Automatic theme detection  
- **Responsive**: Works on desktop and mobile
- **Interactive**: Click buttons to update tasks, view contacts

### 🔒 Security Features
- **Authentication**: Mock auth for dev, OAuth 2.1 for production
- **CORS Protection**: Configurable allowed origins
- **XSS Prevention**: HTML escaping and CSP headers
- **Input Validation**: MongoDB ObjectID validation in production
- **Rate Limiting**: Per-tool limits with headers
- **Secure Logging**: Automatic sensitive data redaction
- **Request Limits**: 1MB body size limit

### 📦 Core Capabilities
- **Contact Management**: Get properties, search, and retrieve contacts
- **Notes Management**: Create, retrieve, and update notes
- **Task Management**: Create, retrieve, and update tasks
- **MCP Prompts**: Built-in guidance for ChatGPT
- **Type-Safe**: Full TypeScript with Zod validation

## Quick Start

```bash
# Install dependencies
npm install
cd web && npm install && cd ..

# Configure
cp .env.example .env
# Edit .env and add your SWIPEONE_API_KEY

# Build server and UI
npm run build
cd web && npm run build && cd ..

# Run
npm start
```

## 🚀 Testing

**Local Development:**
1. Start server: `npm start`
2. Test with MCP Inspector: `npm run inspector`
3. Try: "Show me all my contacts" to see the UI!

**With ChatGPT Apps:**
- See [CHATGPT_APPS_ANALYSIS.md](./CHATGPT_APPS_ANALYSIS.md) for integration guide
- Configure OAuth as described in [OAUTH_STRATEGY.md](./OAUTH_STRATEGY.md)
- Deploy to production using [DEPLOYMENT.md](./DEPLOYMENT.md)

## Available Tools

### Contact Tools (with List UI)

- **`get_contact_properties`** - Get all contact fields in a workspace
- **`search_contacts`** - Advanced contact search with filters → Shows contact list with avatars
- **`retrieve_all_contacts`** - Get all contacts → Shows contact list with "View" buttons

### Notes Tools (with Card UI)

- **`create_note`** - Create a note for a contact → Shows success card
- **`retrieve_notes`** - Get all notes for a contact → Shows notes list with timestamps
- **`update_note`** - Update an existing note → Shows updated note card

### Task Tools (with Interactive UI)

- **`create_task`** - Create a task in a workspace → Shows task card with status
- **`retrieve_all_tasks`** - Get all tasks → Shows task list with "Start/Complete" buttons
- **`update_task`** - Update an existing task → Shows updated task card

### MCP Prompts

- **`swipeone_assistant`** - Comprehensive guide on tool capabilities and best practices

## UI Components

The server includes a complete React-based UI system:

```
web/
├── src/
│   ├── ContactsUI.tsx    # Contact list and properties
│   ├── NotesUI.tsx       # Notes list and cards
│   ├── TasksUI.tsx       # Tasks list with actions
│   ├── components.tsx    # Base UI components
│   └── component.tsx     # Main router
└── dist/
    └── component.js      # Built bundle (1.1MB)
```

**Features:**
- Modern gradient designs
- Smooth animations and transitions
- Dark mode support
- Responsive layouts
- Interactive buttons (task updates, contact views)

## Configuration

### Environment Variables

Create `.env` file from `.env.example`:

**Development:**
```env
# API Configuration
SWIPEONE_API_KEY=your_api_key_minimum_32_characters
DEFAULT_WORKSPACE_ID=your_workspace_id  # Optional

# Security (Permissive for dev)
AUTH_ENABLED=false
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=debug
```

**Production:**
```env
# API Configuration  
SWIPEONE_API_KEY=your_production_api_key_minimum_32_chars

# Security (Strict for production)
AUTH_ENABLED=true
AUTH_MODE=oauth
ALLOWED_ORIGINS=https://chatgpt.com
LOG_LEVEL=info
ENABLE_HTTPS=true
```

See [SECURITY.md](./SECURITY.md) for complete configuration guide.

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
├── tools/                # Tool handlers (updated for UI)
│   ├── definitions.ts    # Tool metadata
│   ├── registry.ts       # Handler registry
│   └── *Handler.ts       # Individual handlers
├── types/                # TypeScript types
└── utils/                # Utilities
    └── responseFormatter.ts  # UI response formatter

web/
├── src/                  # React UI components
│   ├── ContactsUI.tsx
│   ├── NotesUI.tsx
│   ├── TasksUI.tsx
│   ├── components.tsx
│   ├── hooks.ts
│   └── types.ts
├── package.json
└── tsconfig.json
```

## Development

### Commands

```bash
# Server
npm run build      # Build TypeScript
npm run dev        # Watch mode
npm start          # Run server
npm run inspector  # Test with MCP Inspector

# UI Components
cd web
npm run build      # Build UI bundle
npm run dev        # Watch mode for UI
```

### Adding New Tools

See [ADDING_TOOLS.md](./ADDING_TOOLS.md) for step-by-step guide.

### Customizing UI

Edit files in `web/src/`:
- `components.tsx` - Base components (Button, Card, Badge)
- `ContactsUI.tsx` - Contact-specific UI
- `NotesUI.tsx` - Notes-specific UI
- `TasksUI.tsx` - Tasks-specific UI

After changes, rebuild:
```bash
cd web && npm run build
```

## Troubleshooting

- **"Cannot find module"** → Run `npm install` in both root and `web/`
- **"Environment validation failed"** → Check `.env` file has `SWIPEONE_API_KEY`
- **"API request failed 401"** → Verify API key is correct
- **UI not showing** → Rebuild UI: `cd web && npm run build`
- **UI looks broken** → Clear browser cache, check console for errors

## Documentation

📚 **[View All Documentation](./docs/README.md)**

### 🚀 Getting Started
- **[HOW-TO-TEST.md](./docs/getting-started/HOW-TO-TEST.md)** - Quick guide to test locally with ngrok

### 💻 Development
- **[ADDING_TOOLS.md](./docs/development/ADDING_TOOLS.md)** - Guide for adding new tools
- **[UI_IMPLEMENTATION.md](./docs/development/UI_IMPLEMENTATION.md)** - UI technical details
- **[MCP_PROMPTS.md](./docs/development/MCP_PROMPTS.md)** - Guide for MCP prompts

### 🚢 Deployment & Security
- **[SECURITY.md](./docs/deployment/SECURITY.md)** - Security features and configuration
- **[PROD-DEPLOYMENT.md](./docs/deployment/PROD-DEPLOYMENT.md)** - Production deployment guide

### 🔗 Integration
- **[OAUTH_STRATEGY.md](./docs/integration/OAUTH_STRATEGY.md)** - OAuth 2.1 integration strategy

## License

ISC
