# Security Guide

## Overview

The SwipeOne MCP Server implements comprehensive security features to protect your data and API credentials. This guide covers all security configurations and best practices.

## Security Features

### 🔐 Authentication & Authorization
- **Mock Authentication** for development
- **OAuth 2.1** support for production
- **Token-based** access control
- **User context** extraction and validation

### 🌐 CORS Protection
- **Restricted origins** - Only allowed domains can connect
- **Configurable** per environment
- **Credentials support** for authenticated requests

### 🛡️ XSS Prevention
- **HTML escaping** for all user-generated content
- **JSON sanitization** before embedding in UI
- **Content Security Policy** headers
- **Script injection** protection

### ✅ Input Validation
- **MongoDB ObjectID** validation in production
- **Zod schemas** for all tool inputs
- **ID sanitization** to prevent injection
- **Strict mode** for production environments

### 📝 Secure Logging
- **Sensitive data redaction** (API keys, tokens, passwords)
- **Regex-based detection** for comprehensive coverage
- **Stack traces** only in development
- **Sanitized error messages**

### ⏱️ Rate Limiting
- **Per-tool limits** to prevent abuse
- **Token bucket algorithm** for fair usage
- **Rate limit headers** in responses
- **Configurable** via environment

### 🔒 Additional Protections
- **Request size limits** (1MB) to prevent DoS
- **Timeout handling** with clear error messages
- **Secure correlation IDs** using crypto.randomUUID()
- **Environment validation** for critical settings

---

## Configuration

### Development Setup

For local development with relaxed security:

```env
# .env
NODE_ENV=development

# Authentication (disabled for easy testing)
AUTH_ENABLED=false
AUTH_MODE=mock
MOCK_AUTH_TOKEN=dev_token_12345

# CORS (permissive for local development)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# API Key (minimum 32 characters)
SWIPEONE_API_KEY=your_development_api_key_here_min_32_chars

# Rate Limiting
ENABLE_RATE_LIMITING=true

# Logging
LOG_LEVEL=debug
```

### Production Setup

For production deployment with strict security:

```env
# .env
NODE_ENV=production

# Authentication (REQUIRED)
AUTH_ENABLED=true
AUTH_MODE=oauth

# CORS (strict - only ChatGPT)
ALLOWED_ORIGINS=https://chatgpt.com

# API Key (strong, minimum 32 characters)
SWIPEONE_API_KEY=your_production_api_key_minimum_32_characters

# Rate Limiting
ENABLE_RATE_LIMITING=true

# Logging (minimal)
LOG_LEVEL=info

# HTTPS (recommended)
ENABLE_HTTPS=true
FORCE_HTTPS=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

---

## Authentication

### Mock Authentication (Development)

For local testing without OAuth setup:

1. **Enable mock auth:**
   ```env
   AUTH_ENABLED=true
   AUTH_MODE=mock
   MOCK_AUTH_TOKEN=dev_token_12345
   ```

2. **Use the token:**
   ```bash
   curl -H "Authorization: Bearer dev_token_12345" http://localhost:3000/mcp
   ```

3. **User context:**
   - User ID: `dev_user`
   - Workspace ID: From `DEFAULT_WORKSPACE_ID`

### OAuth Authentication (Production)

For production with ChatGPT Apps:

1. **Enable OAuth:**
   ```env
   AUTH_ENABLED=true
   AUTH_MODE=oauth
   ```

2. **Implement token validation:**
   - Update `src/middleware/auth.ts`
   - Add JWT verification
   - Validate token signature, expiration, issuer
   - Extract user claims

3. **See:** `OAUTH_STRATEGY.md` for complete OAuth implementation guide

---

## CORS Configuration

### Allowed Origins

Control which domains can access your MCP server:

**Development:**
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Production:**
```env
ALLOWED_ORIGINS=https://chatgpt.com
```

**Multiple domains:**
```env
ALLOWED_ORIGINS=https://chatgpt.com,https://your-app.com
```

### CORS Settings

The server enforces:
- ✅ Credentials support
- ✅ Limited to GET and POST methods
- ✅ Specific allowed headers (Content-Type, Authorization)
- ❌ No wildcard origins in production

---

## Input Validation

### Validation Modes

**Development Mode** (lenient):
- Allows alphanumeric, hyphens, underscores
- 1-100 characters
- Easier for testing with mock data

**Production Mode** (strict):
- MongoDB ObjectID format only
- Exactly 24 hexadecimal characters
- Prevents invalid API requests

### Automatic Switching

Validation automatically becomes strict when:
- `AUTH_ENABLED=true`, OR
- `NODE_ENV=production`

### Manual Override

To test strict validation in development:
```env
AUTH_ENABLED=true
AUTH_MODE=mock
```

---

## Rate Limiting

### Default Limits

| Tool | Requests | Window |
|------|----------|--------|
| `search_contacts` | 20 | 1 minute |
| `retrieve_all_contacts` | 20 | 1 minute |
| `get_contact_properties` | 30 | 1 minute |
| `create_note` | 30 | 1 minute |
| `update_note` | 30 | 1 minute |
| `retrieve_notes` | 30 | 1 minute |
| `create_task` | 30 | 1 minute |
| `update_task` | 30 | 1 minute |
| `retrieve_all_tasks` | 20 | 1 minute |

### Response Headers

When rate limited, responses include:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
Retry-After: 60
```

### Disable Rate Limiting

Only for development/testing:
```env
ENABLE_RATE_LIMITING=false
```

---

## Logging Security

### Redacted Data

The logger automatically redacts:
- API keys (all variations: `api_key`, `apiKey`, `x-api-key`)
- Authorization headers
- Bearer tokens
- Secrets and passwords
- Session and cookie data
- Credentials

### Log Levels

**Development:**
```env
LOG_LEVEL=debug  # Verbose logging
```

**Production:**
```env
LOG_LEVEL=info   # Essential logs only
```

**Options:** `debug`, `info`, `warn`, `error`

---

## HTTPS Configuration

### Generate SSL Certificates

**Self-signed (development):**
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

**Production:**
Use Let's Encrypt or your certificate provider.

### Configure Server

```env
ENABLE_HTTPS=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem

# Force HTTPS redirect
FORCE_HTTPS=true
```

### Local Development

HTTPS is optional for localhost. HTTP is fine for local testing.

---

## Security Checklist

### Before Production Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Enable authentication: `AUTH_ENABLED=true`
- [ ] Configure OAuth (see `OAUTH_STRATEGY.md`)
- [ ] Restrict CORS: `ALLOWED_ORIGINS=https://chatgpt.com`
- [ ] Use strong API key (32+ characters)
- [ ] Enable HTTPS with valid certificates
- [ ] Set `FORCE_HTTPS=true`
- [ ] Use `LOG_LEVEL=info` or `warn`
- [ ] Enable rate limiting
- [ ] Review and test all security features
- [ ] Monitor logs for security events

### Regular Maintenance

- [ ] Rotate API keys periodically
- [ ] Update SSL certificates before expiration
- [ ] Review access logs for suspicious activity
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Test authentication flows regularly

---

## Security Best Practices

### API Keys
- ✅ Use strong, random keys (32+ characters)
- ✅ Store in `.env`, never commit to git
- ✅ Rotate periodically
- ✅ Use different keys for dev/prod
- ❌ Never log or expose in responses

### Authentication
- ✅ Always enable in production
- ✅ Use OAuth for ChatGPT Apps
- ✅ Validate tokens properly
- ✅ Check token expiration
- ❌ Never use mock auth in production

### CORS
- ✅ Restrict to specific domains
- ✅ Use HTTPS origins only
- ✅ Test CORS configuration
- ❌ Never use wildcard (`*`) in production

### Logging
- ✅ Use appropriate log levels
- ✅ Monitor logs regularly
- ✅ Sanitize sensitive data
- ❌ Never log credentials or tokens

### Network
- ✅ Use HTTPS in production
- ✅ Keep certificates updated
- ✅ Use strong TLS settings
- ❌ Never expose server on public IP without HTTPS

---

## Troubleshooting

### Authentication Issues

**401 Unauthorized:**
- Check `AUTH_ENABLED` is set correctly
- Verify token format: `Bearer <token>`
- Confirm token matches `MOCK_AUTH_TOKEN` (dev) or is valid JWT (prod)

**403 Forbidden:**
- Check user has access to workspace
- Verify workspace ID in token claims

### CORS Errors

**CORS policy blocked:**
- Verify origin is in `ALLOWED_ORIGINS`
- Check origin format (include protocol: `https://`)
- Ensure no trailing slashes

### Rate Limiting

**429 Too Many Requests:**
- Wait for `Retry-After` seconds
- Check if rate limits are appropriate
- Consider increasing limits for your use case

### Validation Errors

**Invalid ID format:**
- In production, use MongoDB ObjectID format (24 hex chars)
- In development, ensure IDs match allowed pattern
- Check `AUTH_ENABLED` setting affects validation strictness

---

## Additional Resources

- **OAuth Setup:** See `OAUTH_STRATEGY.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Security Audit:** See artifacts for detailed security analysis
- **ChatGPT Integration:** See `CHATGPT_APPS_ANALYSIS.md`

---

## Support

For security concerns or questions:
1. Review this guide thoroughly
2. Check server logs for detailed error messages
3. Verify environment configuration
4. Test in development before deploying to production
