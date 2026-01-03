# How to Test Locally with ChatGPT Apps

Quick guide to test the SwipeOne MCP Server locally using ngrok and ChatGPT Apps.

## Prerequisites

- Node.js 18+ installed
- SwipeOne API key
- [ngrok](https://ngrok.com/) account (free tier works)
- ChatGPT Plus or Team account

---

## Step 1: Install Dependencies

```bash
# Install server dependencies
npm install

# Install UI dependencies
cd web && npm install && cd ..
```

---

## Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set your API key (minimum 32 characters):

```env
SWIPEONE_API_KEY=your_api_key_minimum_32_characters
DEFAULT_WORKSPACE_ID=your_workspace_id

# For local testing (optional - auth disabled by default)
AUTH_ENABLED=false
ALLOWED_ORIGINS=http://localhost:3000,https://chatgpt.com
LOG_LEVEL=debug
```

---

## Step 3: Build the Project

```bash
# Build server
npm run build

# Build UI components
cd web && npm run build && cd ..
```

---

## Step 4: Start the Server

**Terminal 1:**
```bash
npm start
```

You should see:
```
SwipeOne MCP Server running on port 3000
MCP endpoint: http://localhost:3000/mcp
```

---

## Step 5: Expose with ngrok

**Terminal 2:**
```bash
ngrok http 3000
```

Copy the **https** URL (e.g., `https://abc-123.ngrok-free.app`)

> **Important:** Keep both terminals running!

---

## Step 6: Configure ChatGPT Apps

### Option A: Custom GPT with Actions

1. Go to [ChatGPT](https://chatgpt.com)
2. Click **Explore GPTs** → **Create**
3. In **Configure** tab:
   - Name: "SwipeOne Assistant"
   - Description: "Manage SwipeOne contacts, notes, and tasks"
4. Scroll to **Actions** → **Create new action**
5. In the schema editor, paste:

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "SwipeOne MCP Server",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://your-ngrok-url.ngrok-free.app"
    }
  ],
  "paths": {
    "/mcp": {
      "post": {
        "summary": "MCP Endpoint",
        "operationId": "mcpParams",
        "description": "Streamable HTTP MCP endpoint",
        "responses": {
          "200": {
            "description": "Successful response"
          }
        }
      }
    }
  }
}
```

6. Replace `your-ngrok-url` with your actual ngrok URL
7. Set **Authentication** to **None** (for local testing)
8. Click **Save**

### Option B: Direct MCP Connection

If using MCP-compatible client:
- **Endpoint:** `https://your-ngrok-url.ngrok-free.app/mcp`
- **Protocol:** Streamable HTTP

---

## Step 7: Test the Connection

In ChatGPT, try these commands:

### Test Contacts
```
Show me all my contacts
```

### Test Notes
```
Get notes for contact [contact-id]
```

### Test Tasks
```
Show me all my tasks
```

You should see beautiful UI cards with your data!

---

## Troubleshooting

### Server won't start
```bash
# Check .env file exists
ls -la .env

# Verify API key is set
cat .env | grep SWIPEONE_API_KEY

# Reinstall dependencies
npm install
cd web && npm install && cd ..
```

### ngrok connection issues
```bash
# Check server health via ngrok
curl https://your-ngrok-url.ngrok-free.app/

# Should return:
# {
#   "name": "SwipeOne MCP Server",
#   "version": "1.0.0",
#   "status": "running",
#   "endpoints": { "mcp": "/mcp" },
#   "activeConnections": 0
# }

# Restart ngrok if needed
# Press Ctrl+C in Terminal 2, then run again:
ngrok http 3000
```

### Common ngrok errors

**404 Not Found on `/`:**
- ✅ **Fixed!** The server now has a health check endpoint at `/`
- Test: `curl https://your-ngrok-url.ngrok-free.app/`

**400 Bad Request on `/messages`:**
- ✅ **Fixed!** The server now properly manages SSE connections
- This error occurred when POST `/messages` was called without an active SSE connection
- The fix: SSE connections are now tracked in a Map and properly managed

**404 Not Found on `/mcp`:**
- Ensure you are using the correct endpoint path `/mcp`
- The legacy `/sse` and `/messages` endpoints have been replaced

**CORS errors:**
- ✅ **Fixed!** In development mode, all origins are now allowed
- The server automatically detects `NODE_ENV=development` and allows any origin
- For production, set specific origins in `ALLOWED_ORIGINS` env variable

### ChatGPT can't connect
- Verify ngrok URL is correct (must be https)
- Check server is running in Terminal 1
- Look for errors in server logs
- Try refreshing ChatGPT page

### UI not showing
```bash
# Rebuild UI
cd web && npm run build && cd ..

# Restart server
# Press Ctrl+C in Terminal 1, then:
npm start
```

---

## Quick Commands Reference

```bash
# Start server
npm start

# Start ngrok
ngrok http 3000

# Rebuild everything
npm run build && cd web && npm run build && cd ..

# View logs (if using PM2)
pm2 logs swipeone-mcp

# Test with MCP Inspector
npm run inspector
```

---

## Development Mode

For faster development with auto-reload:

**Terminal 1 (Server):**
```bash
npm run dev
```

**Terminal 2 (UI):**
```bash
cd web && npm run dev
```

**Terminal 3 (ngrok):**
```bash
ngrok http 3000
```

Now changes auto-rebuild!

---

## Security Note

For local testing, authentication is disabled by default. For production:

1. Enable authentication:
   ```env
   AUTH_ENABLED=true
   AUTH_MODE=oauth
   ```

2. See [SECURITY.md](./SECURITY.md) for full security setup
3. See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

---

## Next Steps

- Customize UI in `web/src/`
- Add new tools (see [ADDING_TOOLS.md](./ADDING_TOOLS.md))
- Deploy to production (see [DEPLOYMENT.md](./DEPLOYMENT.md))
- Set up OAuth (see [OAUTH_STRATEGY.md](./OAUTH_STRATEGY.md))

---

## Need Help?

- Check server logs in Terminal 1
- Check ngrok dashboard: https://dashboard.ngrok.com
- Review [SECURITY.md](./SECURITY.md) for configuration
- Check [README.md](./README.md) for overview
