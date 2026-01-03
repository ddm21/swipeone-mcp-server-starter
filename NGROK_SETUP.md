# Running SwipeOne MCP with Ngrok

## 1. Start Support
Run the MCP server locally (it will listen on port 3000):
```bash
npm start
```

## 2. Start Ngrok
In a new terminal, expose port 3000:
```bash
ngrok http 3000
```
Copy the `https://...` URL provided by ngrok.

## 3. Configure ChatGPT
1. Go to your GPT configuration.
2. Create/Edit an action.
3. Import from URL: `[ngrok_url]/sse` (e.g. `https://abc-123.ngrok-free.app/sse`)
4. Authentication: API Key (Header `x-api-key`) or OAuth (if configured).

> [!NOTE]
> Keep both terminals running while testing.
