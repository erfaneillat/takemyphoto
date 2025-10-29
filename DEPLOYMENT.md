# 🚀 Nero Deployment Guide

This document explains how to set up and use the GitHub Actions CI/CD pipeline for the Nero application.

## 📋 Table of Contents
- [Overview](#overview)
- [Repository Setup](#repository-setup)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Server Requirements](#server-requirements)
- [Environment Configuration](#environment-configuration)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)

## Overview

The CI/CD pipeline automatically builds and deploys three components:
1. **Web Application** (Vite-based frontend)
2. **Admin Panel** (Vite-based admin dashboard)
3. **Backend Server** (Node.js/Express API)

### Supported Branches
- `master` or `main` → Production deployment
- `dev` → Development deployment

## Repository Setup

### 1. Create GitHub Environments

Navigate to your repository settings and create two environments:

1. **production**
   - Used for `master`/`main` branch
   - Add production-specific secrets

2. **development**
   - Used for `dev` branch
   - Add development-specific secrets

### 2. Enable GitHub Actions

Ensure GitHub Actions is enabled in your repository settings.

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

### Required Secrets (Production)

Navigate to `Settings → Secrets and variables → Actions` and add:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SERVER_HOST` | Production server IP/domain | `192.168.1.100` or `server.nero.app` |
| `SERVER_USERNAME` | SSH username | `root` or `deploy` |
| `SERVER_PASSWORD` | SSH password | `your-secure-password` |
| `SERVER_PORT` | SSH port (optional) | `22` (default) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |

### Optional Secrets (Development)

If you have separate development servers, add:

| Secret Name | Description |
|------------|-------------|
| `DEV_SERVER_HOST` | Development server IP/domain |
| `DEV_SERVER_USERNAME` | Development SSH username |
| `DEV_SERVER_PASSWORD` | Development SSH password |
| `DEV_SERVER_PORT` | Development SSH port |
| `DEV_GOOGLE_CLIENT_ID` | Development Google OAuth Client ID |

> **Note**: If development secrets are not provided, it will fall back to production secrets.

## Server Requirements

### Prerequisites

Your server must have the following installed:

1. **Node.js 18.x or higher**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **PM2** (Process Manager)
   ```bash
   sudo npm install -g pm2
   ```

3. **Git**
   ```bash
   sudo apt-get install git
   ```

4. **Nginx** (for serving static files and reverse proxy)
   ```bash
   sudo apt-get install nginx
   ```

### Directory Structure

The deployment creates the following structure:

**Production:**
```
/var/www/nero/
├── server/          # Backend API
│   ├── dist/        # Built server code
│   └── uploads/     # User uploads
├── dist/            # Built web application
└── panel/
    └── dist/        # Built admin panel
```

**Development:**
```
/var/www/nero-dev/
├── server/
├── dist/
└── panel/
```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the server directory on your deployment server:

**Production (`/var/www/nero/server/.env`):**
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nero
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
GOOGLE_AI_API_KEY=your-google-ai-api-key
API_BASE_URL=https://api.nero.app
CORS_ORIGIN=https://nero.app,https://panel.nero.app
```

**Development (`/var/www/nero-dev/server/.env`):**
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/nero-dev
JWT_SECRET=your-development-jwt-secret
JWT_REFRESH_SECRET=your-development-refresh-secret
GOOGLE_AI_API_KEY=your-google-ai-api-key
API_BASE_URL=https://dev-api.nero.app
CORS_ORIGIN=https://dev.nero.app,https://dev-panel.nero.app
```

### Nginx Configuration

#### Production Configuration

Create `/etc/nginx/sites-available/nero`:

```nginx
# API Server
server {
    listen 80;
    server_name api.nero.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded files
    location /uploads {
        alias /var/www/nero/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Web Application
server {
    listen 80;
    server_name nero.app www.nero.app;
    root /var/www/nero/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Admin Panel
server {
    listen 80;
    server_name panel.nero.app;
    root /var/www/nero/panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nero /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Development Configuration

Create `/etc/nginx/sites-available/nero-dev`:

```nginx
# Development API Server
server {
    listen 80;
    server_name dev-api.nero.app;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/nero-dev/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Development Web Application
server {
    listen 80;
    server_name dev.nero.app;
    root /var/www/nero-dev/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Development Admin Panel
server {
    listen 80;
    server_name dev-panel.nero.app;
    root /var/www/nero-dev/panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### SSL/TLS Setup (Recommended)

Use Certbot to add HTTPS:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d nero.app -d www.nero.app -d api.nero.app -d panel.nero.app
sudo certbot --nginx -d dev.nero.app -d dev-api.nero.app -d dev-panel.nero.app
```

## Deployment Process

### Automatic Deployment

The workflow triggers automatically on:
- Push to `master`, `main`, or `dev` branches
- Manual trigger via GitHub Actions UI

### Manual Deployment

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select "🚀 Deploy Nero Application"
4. Click "Run workflow"
5. Select environment (production/development)
6. Click "Run workflow"

### Workflow Steps

1. **Checkout Code** - Fetches latest code from repository
2. **Setup Node.js** - Installs Node.js 18.x with npm cache
3. **Install Dependencies** - Installs dependencies for all three components
4. **Determine Environment** - Sets environment variables based on branch
5. **Build Server** - Compiles TypeScript backend
6. **Build Web Application** - Builds Vite frontend with env vars
7. **Build Admin Panel** - Builds Vite admin panel with env vars
8. **Deploy Server Code** - SSHs to server and deploys code
9. **Restart PM2** - Restarts Node.js process
10. **Health Check** - Verifies API is responding
11. **Deployment Summary** - Shows deployment details

## Troubleshooting

### Build Failures

**Issue**: Build fails with "dist directory not found"
- **Solution**: Check build logs for compilation errors
- Verify all dependencies are installed
- Check TypeScript errors in code

**Issue**: Module not found errors
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install`

### Deployment Failures

**Issue**: SSH connection failed
- **Solution**: Verify `SERVER_HOST`, `SERVER_USERNAME`, and `SERVER_PASSWORD` secrets
- Check SSH port (default is 22)
- Ensure firewall allows SSH connections

**Issue**: PM2 process not starting
- **Solution**: 
  ```bash
  # SSH to server
  cd /var/www/nero/server
  pm2 logs nero --lines 50
  ```
- Check environment variables in `.env` file
- Verify MongoDB connection

**Issue**: Health check failed
- **Solution**: Check if:
  - Backend is running: `pm2 status`
  - Port is correct: `netstat -tlnp | grep 3000`
  - API responds: `curl http://localhost:3000/api/health`
  - Check logs: `pm2 logs nero`

### Application Issues

**Issue**: 404 errors on frontend routes
- **Solution**: Ensure Nginx `try_files` directive is configured correctly

**Issue**: API requests failing with CORS errors
- **Solution**: Update `CORS_ORIGIN` in server `.env` to include your domains

**Issue**: Images not loading
- **Solution**: 
  - Check `uploads` directory exists: `/var/www/nero/server/uploads`
  - Verify Nginx serves static files from correct path
  - Check file permissions: `chmod -R 755 /var/www/nero/server/uploads`

**Issue**: Google OAuth not working
- **Solution**: 
  - Verify `GOOGLE_CLIENT_ID` secret is set
  - Check authorized origins in Google Cloud Console
  - Ensure environment variable is passed during build

## Monitoring

### View Application Logs

```bash
# Production logs
pm2 logs nero

# Development logs
pm2 logs nero-dev

# Last 100 lines
pm2 logs nero --lines 100

# Follow logs in real-time
pm2 logs nero --raw
```

### Monitor Process Status

```bash
# List all processes
pm2 list

# Detailed process info
pm2 show nero

# Monitor CPU and memory
pm2 monit
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## Maintenance

### Update Dependencies

To update dependencies, SSH to server and run:

```bash
cd /var/www/nero/server
npm update
pm2 restart nero
```

### Database Backup

```bash
# Backup MongoDB
mongodump --db nero --out /backups/nero-$(date +%Y%m%d)

# Restore MongoDB
mongorestore --db nero /backups/nero-20240101/nero
```

### Clean Old Files

```bash
# Clean PM2 logs
pm2 flush

# Clean old uploads (older than 90 days)
find /var/www/nero/server/uploads -type f -mtime +90 -delete
```

## Security Best Practices

1. **Use SSH Keys** instead of passwords for deployment
2. **Enable Firewall** (UFW) and only allow necessary ports
3. **Regular Updates**: Keep Node.js, npm, and packages updated
4. **Use HTTPS**: Always use SSL/TLS in production
5. **Environment Secrets**: Never commit `.env` files to Git
6. **Database Security**: Use MongoDB authentication
7. **Rate Limiting**: Implement rate limiting on API endpoints
8. **Backup Strategy**: Regular backups of database and uploads

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Check server logs with `pm2 logs`
3. Check Nginx logs
4. Review this documentation

For application issues:
1. Check browser console for frontend errors
2. Check network tab for API errors
3. Check backend logs for server errors
