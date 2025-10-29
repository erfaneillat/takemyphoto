# 🚀 Deployment Quick Reference

A quick reference guide for Nero deployment commands and configurations.

## 📋 GitHub Secrets Required

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SERVER_HOST` | Production server IP/domain | `192.168.1.100` |
| `SERVER_USERNAME` | SSH username | `ubuntu` |
| `SERVER_PASSWORD` | SSH password | `***` |
| `SERVER_PORT` | SSH port (optional) | `22` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123-abc.apps.googleusercontent.com` |
| `DEV_SERVER_HOST` | Dev server (optional) | `192.168.1.101` |
| `DEV_SERVER_USERNAME` | Dev SSH user (optional) | `ubuntu` |
| `DEV_SERVER_PASSWORD` | Dev SSH pass (optional) | `***` |
| `DEV_SERVER_PORT` | Dev SSH port (optional) | `22` |
| `DEV_GOOGLE_CLIENT_ID` | Dev Google OAuth (optional) | `456-def.apps.googleusercontent.com` |

## 🌐 Default URLs

### Production
- **Web**: https://nero.app
- **API**: https://api.nero.app
- **Panel**: https://panel.nero.app
- **Port**: 3000
- **PM2 Name**: nero
- **Path**: /var/www/nero

### Development
- **Web**: https://dev.nero.app
- **API**: https://dev-api.nero.app
- **Panel**: https://dev-panel.nero.app
- **Port**: 3001
- **PM2 Name**: nero-dev
- **Path**: /var/www/nero-dev

## ⚙️ Environment Variables

### Server (.env)

```bash
# Environment
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/nero

# JWT Secrets
JWT_SECRET=your-jwt-secret-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters

# Google AI
GOOGLE_AI_API_KEY=your-google-ai-api-key

# API Configuration
API_BASE_URL=https://api.nero.app

# CORS
CORS_ORIGIN=https://nero.app,https://panel.nero.app
```

### Frontend Build (Auto-injected)

```bash
# Web & Panel
VITE_API_URL=https://api.nero.app/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🔧 Common Commands

### SSH Connection

```bash
# Production
ssh username@server-ip

# With SSH config
ssh nero-prod
```

### PM2 Process Management

```bash
# List all processes
pm2 list

# View logs
pm2 logs nero
pm2 logs nero --lines 100
pm2 logs nero --raw

# Monitor processes
pm2 monit

# Restart process
pm2 restart nero

# Stop process
pm2 stop nero

# Delete process
pm2 delete nero

# Save PM2 configuration
pm2 save

# Show process details
pm2 show nero
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### MongoDB Commands

```bash
# Connect to MongoDB
mongosh

# Use database
use nero

# Check status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Backup database
mongodump --db nero --out /backups/nero-$(date +%Y%m%d)

# Restore database
mongorestore --db nero /backups/nero-20240101/nero

# Show databases
show dbs

# Show collections
show collections

# Query collection
db.users.find().limit(5)
```

### SSL Certificate Commands

```bash
# Install certificates
sudo certbot --nginx -d nero.app -d www.nero.app -d api.nero.app -d panel.nero.app

# Renew certificates
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run
```

### Server Maintenance

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top
# or
htop

# Check running processes
ps aux | grep node

# Check ports
sudo netstat -tlnp | grep :3000

# Check firewall status
sudo ufw status

# View system logs
sudo journalctl -u nginx -f
sudo journalctl -u mongod -f
```

## 🔍 Health Checks

### API Health Check

```bash
# Production
curl http://localhost:3000/api/health

# Development
curl http://localhost:3001/api/health

# Remote
curl https://api.nero.app/api/health
```

### Expected Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Check Application Status

```bash
# PM2 status
pm2 status

# Check if port is in use
sudo lsof -i :3000

# Check application logs
pm2 logs nero --lines 50
```

### Restart Everything

```bash
# Restart PM2 process
pm2 restart nero

# Restart Nginx
sudo systemctl restart nginx

# Restart MongoDB
sudo systemctl restart mongod
```

### Fix Common Issues

**Issue**: Port already in use
```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 PID
```

**Issue**: PM2 not starting on reboot
```bash
pm2 startup
pm2 save
```

**Issue**: Nginx 502 Bad Gateway
```bash
# Check if backend is running
pm2 list

# Check backend logs
pm2 logs nero

# Restart backend
pm2 restart nero
```

**Issue**: MongoDB connection failed
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

## 📊 Monitoring

### Check Resource Usage

```bash
# PM2 monitoring
pm2 monit

# Disk usage
df -h

# Memory usage
free -m

# CPU usage
top -bn1 | head -20

# Network usage
sudo iftop
```

### View All Logs

```bash
# PM2 logs
pm2 logs nero --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# System logs
sudo journalctl -f
```

## 🔄 Manual Deployment

If GitHub Actions is not available:

```bash
# SSH to server
ssh username@server-ip

# Navigate to app directory
cd /var/www/nero

# Pull latest code
git pull origin master

# Install dependencies
cd server && npm ci && cd ..
npm ci
cd panel && npm ci && cd ..

# Build all components
cd server && npm run build && cd ..
npm run build
cd panel && npm run build && cd ..

# Restart PM2
pm2 restart nero

# Verify deployment
pm2 logs nero --lines 20
curl http://localhost:3000/api/health
```

## 🔐 Security Checklist

- [ ] SSL certificates installed and auto-renewing
- [ ] Firewall enabled (UFW)
- [ ] MongoDB authentication enabled
- [ ] Strong passwords for all services
- [ ] Regular backups configured
- [ ] SSH key authentication enabled
- [ ] Unnecessary ports closed
- [ ] Server software up to date
- [ ] Environment variables secured
- [ ] Logs monitored regularly

## 📱 Quick Actions

### Deploy to Production
```bash
git push origin master
# GitHub Actions will auto-deploy
```

### Deploy to Development
```bash
git push origin dev
# GitHub Actions will auto-deploy
```

### Rollback Deployment
```bash
# SSH to server
ssh username@server-ip

# Navigate to app
cd /var/www/nero

# Checkout previous commit
git log --oneline
git checkout <previous-commit-hash>

# Rebuild
cd server && npm run build && cd ..
npm run build
cd panel && npm run build && cd ..

# Restart
pm2 restart nero
```

### View Deployment Status
1. Go to GitHub repository
2. Click "Actions" tab
3. View latest workflow run

## 📞 Support Resources

- **Documentation**: /DEPLOYMENT.md
- **Workflows**: /.github/workflows/README.md
- **Scripts**: /scripts/README.md
- **GitHub Actions**: Repository → Actions tab
- **Server Logs**: `pm2 logs nero`

## 💾 Backup Commands

```bash
# Backup database
mongodump --db nero --out /backups/nero-$(date +%Y%m%d)

# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /var/www/nero/server/uploads

# Backup .env files
cp /var/www/nero/server/.env /backups/.env-$(date +%Y%m%d)

# Full backup script
sudo tar -czf /backups/nero-full-$(date +%Y%m%d).tar.gz \
  /var/www/nero \
  --exclude=/var/www/nero/node_modules \
  --exclude=/var/www/nero/server/node_modules \
  --exclude=/var/www/nero/panel/node_modules
```

## 🎯 Performance Tips

```bash
# Clear PM2 logs
pm2 flush

# Optimize PM2
pm2 optimize

# Clear npm cache
npm cache clean --force

# Remove old logs
find /var/log -name "*.log" -mtime +30 -delete

# Monitor performance
pm2 monit
```

---

**Last Updated**: January 2024
**Version**: 1.0.0
