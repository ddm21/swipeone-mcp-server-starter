# Deployment Guide

## Overview

This guide covers deploying the SwipeOne MCP Server to production with proper security, monitoring, and best practices.

## Prerequisites

- Node.js 18+ installed on server
- SwipeOne API key
- SSL/TLS certificates (for HTTPS)
- Domain name (optional but recommended)
- OAuth 2.1 credentials (for ChatGPT Apps)

---

## Production Environment Setup

### 1. Server Requirements

**Minimum Specifications:**
- CPU: 1 core
- RAM: 512MB
- Storage: 1GB
- OS: Linux (Ubuntu 20.04+ recommended) or Windows Server

**Recommended:**
- CPU: 2 cores
- RAM: 2GB
- Storage: 5GB
- OS: Ubuntu 22.04 LTS

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be 18.x or higher
npm --version
```

### 3. Clone and Setup Project

```bash
# Clone repository
git clone https://github.com/your-org/SwipeOneMCPServer.git
cd SwipeOneMCPServer

# Install dependencies
npm install
cd web && npm install && cd ..

# Build project
npm run build
cd web && npm run build && cd ..
```

---

## Configuration

### 1. Environment Variables

Create production `.env` file:

```env
# Environment
NODE_ENV=production

# SwipeOne API
SWIPEONE_API_KEY=your_production_api_key_minimum_32_characters
SWIPEONE_API_BASE_URL=https://api.swipeone.com/api
API_TIMEOUT=30000

# Authentication (REQUIRED for production)
AUTH_ENABLED=true
AUTH_MODE=oauth

# CORS (Restrict to ChatGPT)
ALLOWED_ORIGINS=https://chatgpt.com

# Security
ENABLE_RATE_LIMITING=true
LOG_LEVEL=info

# HTTPS
ENABLE_HTTPS=true
FORCE_HTTPS=true
SSL_CERT_PATH=/etc/ssl/certs/swipeone-mcp.crt
SSL_KEY_PATH=/etc/ssl/private/swipeone-mcp.key

# Server
PORT=3000
```

### 2. SSL/TLS Certificates

**Option A: Let's Encrypt (Recommended)**

```bash
# Install Certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificates will be at:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

Update `.env`:
```env
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
```

**Option B: Custom Certificate**

Place your certificates in `/etc/ssl/` and update paths in `.env`.

### 3. OAuth Configuration

See `OAUTH_STRATEGY.md` for complete OAuth 2.1 setup with ChatGPT Apps.

**Quick steps:**
1. Register OAuth application with ChatGPT
2. Configure redirect URIs
3. Implement token validation in `src/middleware/auth.ts`
4. Test OAuth flow

---

## Process Management

### Option 1: PM2 (Recommended)

**Install PM2:**
```bash
sudo npm install -g pm2
```

**Create ecosystem file** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'swipeone-mcp',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

**Start server:**
```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Manage server:**
```bash
pm2 status           # Check status
pm2 logs swipeone-mcp  # View logs
pm2 restart swipeone-mcp  # Restart
pm2 stop swipeone-mcp     # Stop
pm2 delete swipeone-mcp   # Remove
```

### Option 2: Systemd Service

**Create service file** (`/etc/systemd/system/swipeone-mcp.service`):
```ini
[Unit]
Description=SwipeOne MCP Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/SwipeOneMCPServer
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=swipeone-mcp
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable swipeone-mcp
sudo systemctl start swipeone-mcp

# Check status
sudo systemctl status swipeone-mcp

# View logs
sudo journalctl -u swipeone-mcp -f
```

---

## Reverse Proxy Setup

### Nginx Configuration

**Install Nginx:**
```bash
sudo apt install nginx
```

**Create configuration** (`/etc/nginx/sites-available/swipeone-mcp`):
```nginx
upstream swipeone_mcp {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/swipeone-mcp-access.log;
    error_log /var/log/nginx/swipeone-mcp-error.log;

    # Proxy settings
    location / {
        proxy_pass http://swipeone_mcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # MCP endpoint (longer timeout for SSE)
    location /mcp {
        proxy_pass http://swipeone_mcp;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE specific
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        chunked_transfer_encoding off;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/swipeone-mcp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Monitoring and Logging

### 1. Application Logs

**With PM2:**
```bash
pm2 logs swipeone-mcp --lines 100
pm2 logs swipeone-mcp --err  # Error logs only
```

**With Systemd:**
```bash
sudo journalctl -u swipeone-mcp -f
sudo journalctl -u swipeone-mcp --since "1 hour ago"
```

### 2. Log Rotation

**PM2 Log Rotation:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Systemd Logrotate** (`/etc/logrotate.d/swipeone-mcp`):
```
/var/log/swipeone-mcp/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload swipeone-mcp > /dev/null 2>&1 || true
    endscript
}
```

### 3. Health Monitoring

**Create health check endpoint** (add to `src/index.ts`):
```typescript
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
```

**Monitor with cron:**
```bash
# Add to crontab
*/5 * * * * curl -f http://localhost:3000/health || systemctl restart swipeone-mcp
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Fail2Ban

Protect against brute force attacks:

```bash
# Install
sudo apt install fail2ban

# Configure for nginx
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/swipeone-mcp-error.log
```

```bash
sudo systemctl restart fail2ban
```

### 3. Regular Updates

```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Node.js dependencies
cd /path/to/SwipeOneMCPServer
npm audit
npm audit fix

# Rebuild
npm run build
cd web && npm run build && cd ..

# Restart
pm2 restart swipeone-mcp
```

---

## Backup Strategy

### 1. Configuration Backup

```bash
# Backup .env and configs
tar -czf swipeone-mcp-config-$(date +%Y%m%d).tar.gz .env ecosystem.config.js

# Store securely (not in git!)
```

### 2. Automated Backups

Create backup script (`/usr/local/bin/backup-swipeone.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/backups/swipeone-mcp"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup configuration
tar -czf $BACKUP_DIR/config-$DATE.tar.gz \
    /path/to/SwipeOneMCPServer/.env \
    /path/to/SwipeOneMCPServer/ecosystem.config.js

# Keep only last 7 days
find $BACKUP_DIR -name "config-*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /usr/local/bin/backup-swipeone.sh
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] All tests passing
- [ ] Dependencies updated
- [ ] Security audit completed
- [ ] `.env` configured for production
- [ ] SSL certificates obtained
- [ ] OAuth configured and tested
- [ ] Backup strategy in place

### Deployment
- [ ] Build project (`npm run build`)
- [ ] Build UI (`cd web && npm run build`)
- [ ] Start with PM2 or systemd
- [ ] Configure nginx reverse proxy
- [ ] Enable firewall
- [ ] Setup monitoring
- [ ] Configure log rotation
- [ ] Test all endpoints
- [ ] Verify SSL/HTTPS working
- [ ] Test OAuth flow
- [ ] Check CORS configuration

### Post-Deployment
- [ ] Monitor logs for errors
- [ ] Test with ChatGPT Apps
- [ ] Verify rate limiting
- [ ] Check authentication
- [ ] Monitor performance
- [ ] Setup alerts
- [ ] Document any issues
- [ ] Create runbook for common issues

---

## Troubleshooting

### Server Won't Start

**Check logs:**
```bash
pm2 logs swipeone-mcp --err
```

**Common issues:**
- Missing `.env` file
- Invalid API key
- Port already in use
- Missing SSL certificates

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart if needed
pm2 restart swipeone-mcp
```

### SSL Certificate Expired

```bash
# Renew Let's Encrypt
sudo certbot renew

# Reload nginx
sudo systemctl reload nginx
```

### OAuth Errors

- Verify redirect URIs match exactly
- Check token validation logic
- Ensure clock synchronization (NTP)
- Review OAuth logs

---

## Scaling

### Horizontal Scaling

Use PM2 cluster mode:
```javascript
// ecosystem.config.js
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

### Load Balancing

Use nginx upstream with multiple instances:
```nginx
upstream swipeone_mcp {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor logs for errors
- Check server health
- Review security alerts

**Weekly:**
- Review access logs
- Check disk space
- Update dependencies

**Monthly:**
- Security audit
- Performance review
- Backup verification
- SSL certificate check

---

## Support and Resources

- **Security Guide:** `SECURITY.md`
- **OAuth Setup:** `OAUTH_STRATEGY.md`
- **ChatGPT Integration:** `CHATGPT_APPS_ANALYSIS.md`
- **Development Guide:** `ADDING_TOOLS.md`

For production issues, check logs first, then review relevant documentation.
