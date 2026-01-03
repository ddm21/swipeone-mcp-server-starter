# SwipeOne MCP Server Documentation

Welcome to the SwipeOne MCP Server documentation! This folder contains all the guides you need to get started, develop, deploy, and integrate the server.

---

## 📚 Documentation Structure

### 🚀 Getting Started
Start here if you're new to the project:
- **[HOW-TO-TEST.md](./getting-started/HOW-TO-TEST.md)** - Quick guide to test locally with ngrok and ChatGPT Apps

### 💻 Development
Guides for developers working on the codebase:
- **[ADDING_TOOLS.md](./development/ADDING_TOOLS.md)** - Step-by-step guide to add new MCP tools
- **[UI_IMPLEMENTATION.md](./development/UI_IMPLEMENTATION.md)** - UI component architecture and implementation
- **[MCP_PROMPTS.md](./development/MCP_PROMPTS.md)** - Guide for creating MCP prompts

### 🚢 Deployment
Production deployment and security:
- **[SECURITY.md](./deployment/SECURITY.md)** - Comprehensive security features and configuration guide
- **[PROD-DEPLOYMENT.md](./deployment/PROD-DEPLOYMENT.md)** - Complete production deployment guide

### 🔗 Integration
Integrating with external services:
- **[OAUTH_STRATEGY.md](./integration/OAUTH_STRATEGY.md)** - OAuth 2.1 implementation strategy for production

---

## 🗺️ Quick Navigation

### I want to...

**...test the server locally**
→ Start with [HOW-TO-TEST.md](./getting-started/HOW-TO-TEST.md)

**...add a new tool**
→ Follow [ADDING_TOOLS.md](./development/ADDING_TOOLS.md)

**...understand the UI**
→ Read [UI_IMPLEMENTATION.md](./development/UI_IMPLEMENTATION.md)

**...deploy to production**
→ Follow [PROD-DEPLOYMENT.md](./deployment/PROD-DEPLOYMENT.md)

**...secure the server**
→ Review [SECURITY.md](./deployment/SECURITY.md)

**...implement OAuth**
→ See [OAUTH_STRATEGY.md](./integration/OAUTH_STRATEGY.md)

**...create MCP prompts**
→ Check [MCP_PROMPTS.md](./development/MCP_PROMPTS.md)

---

## 📖 Reading Order

### For New Users
1. [HOW-TO-TEST.md](./getting-started/HOW-TO-TEST.md) - Get up and running
2. [SECURITY.md](./deployment/SECURITY.md) - Understand security features
3. [OAUTH_STRATEGY.md](./integration/OAUTH_STRATEGY.md) - Plan for production

### For Developers
1. [ADDING_TOOLS.md](./development/ADDING_TOOLS.md) - Learn the tool architecture
2. [UI_IMPLEMENTATION.md](./development/UI_IMPLEMENTATION.md) - Understand the UI system
3. [MCP_PROMPTS.md](./development/MCP_PROMPTS.md) - Create helpful prompts
4. [SECURITY.md](./deployment/SECURITY.md) - Security best practices

### For DevOps/Deployment
1. [SECURITY.md](./deployment/SECURITY.md) - Security configuration
2. [PROD-DEPLOYMENT.md](./deployment/PROD-DEPLOYMENT.md) - Production deployment
3. [OAUTH_STRATEGY.md](./integration/OAUTH_STRATEGY.md) - OAuth setup
4. [HOW-TO-TEST.md](./getting-started/HOW-TO-TEST.md) - Testing procedures

---

## 📂 Folder Structure

```
docs/
├── README.md                          # This file
├── getting-started/
│   └── HOW-TO-TEST.md                # Local testing guide
├── development/
│   ├── ADDING_TOOLS.md               # Tool development guide
│   ├── UI_IMPLEMENTATION.md          # UI architecture
│   └── MCP_PROMPTS.md                # Prompts guide
├── deployment/
│   ├── SECURITY.md                   # Security guide
│   └── PROD-DEPLOYMENT.md            # Production deployment
└── integration/
    └── OAUTH_STRATEGY.md             # OAuth implementation
```

---

## 🔍 Document Summaries

### Getting Started

#### HOW-TO-TEST.md
Quick guide to test the MCP server locally using ngrok for HTTPS and connecting to ChatGPT Apps. Includes step-by-step setup, troubleshooting, and development mode instructions.

### Development

#### ADDING_TOOLS.md
Complete guide for adding new MCP tools to the server. Covers types, schemas, API methods, handlers, definitions, and registration with code examples.

#### UI_IMPLEMENTATION.md
Technical documentation of the React-based UI component system. Explains the architecture, features, and how UI responses are generated for each tool.

#### MCP_PROMPTS.md
Guide for creating and managing MCP prompts that provide guidance to ChatGPT on how to use the tools effectively.

### Deployment

#### SECURITY.md
Comprehensive security guide covering authentication, CORS, XSS prevention, input validation, rate limiting, logging security, and best practices for development and production.

#### PROD-DEPLOYMENT.md
Complete production deployment guide including server requirements, environment setup, SSL/TLS certificates, OAuth configuration, process management (PM2, systemd), Nginx reverse proxy, monitoring, security hardening, backup strategy, and maintenance tasks.

### Integration

#### OAUTH_STRATEGY.md
Complete OAuth 2.1 implementation strategy for production deployment. Includes OAuth flow, required endpoints, migration path, security considerations, and code examples.

---

## 🆘 Need Help?

- **Quick Start**: See [HOW-TO-TEST.md](./getting-started/HOW-TO-TEST.md)
- **Main README**: See [../README.md](../README.md) for project overview
- **Security Questions**: Check [SECURITY.md](./deployment/SECURITY.md)
- **Development Issues**: Review [ADDING_TOOLS.md](./development/ADDING_TOOLS.md)

---

## 📝 Contributing to Documentation

When adding or updating documentation:

1. **Choose the right folder**:
   - `getting-started/` - User-facing setup guides
   - `development/` - Developer guides and architecture
   - `deployment/` - Production deployment and operations
   - `integration/` - External service integrations

2. **Follow the format**:
   - Clear headings and sections
   - Code examples where applicable
   - Step-by-step instructions
   - Troubleshooting sections

3. **Update this README**:
   - Add new documents to the structure
   - Update summaries
   - Add to quick navigation

---

## 📊 Documentation Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| HOW-TO-TEST.md | ✅ Current | 2026-01-03 |
| ADDING_TOOLS.md | ✅ Current | 2026-01-03 |
| UI_IMPLEMENTATION.md | ✅ Current | 2026-01-02 |
| MCP_PROMPTS.md | ✅ Current | 2026-01-02 |
| SECURITY.md | ✅ Current | 2026-01-03 |
| PROD-DEPLOYMENT.md | ✅ Current | 2026-01-03 |
| OAUTH_STRATEGY.md | ✅ Current | 2026-01-02 |

All documentation is up-to-date and reflects the current codebase.
