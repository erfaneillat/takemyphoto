# 🚀 Nero Deployment Setup Guide

## Overview

Nero uses GitHub Actions for automated CI/CD deployment. When you push to `master` or `dev` branches, the application automatically builds and deploys to your server.

## 📋 Prerequisites

- Ubuntu server (18.04+) with SSH access
- Node.js 18+ installed on server
- PM2 process manager installed on server
- MongoDB instance (local or Atlas)
- Domain name (optional, but recommended)

---

## 🔑 Step 1: GitHub Secrets Configuration

Go to your repository → **Settings** → **Secrets and variables** → **Actions**

### Required Secrets

#### Server Credentials
```
SERVER_HOST          = Your server IP or domain
SERVER_USERNAME      = SSH username (e.g., ubuntu, root)
SERVER_PASSWORD      = SSH password
SERVER_PORT          = SSH port (default: 22)
```

#### Backend Environment Variables (`ENV` secret)
Create a secret named `ENV` with the following content:

```bash
# Environment
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/nero
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nero

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters-long

# Google AI (for image generation)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# API Configuration
API_BASE_URL=http://takemyphoto.xyz

# CORS (comma-separated)
CORS_ORIGIN=http://takemyphoto.xyz,http://takemyphoto.xyz/panel

# Optional: Cloudinary for image storage
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend Environment Variables (`WEB_ENV` secret)
Create a secret named `WEB_ENV` with:

```bash
# API Configuration
VITE_API_URL=http://takemyphoto.xyz/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyB_xb9MsTagBJY0XmFIgr9H-6Jcz_mPjPw
VITE_FIREBASE_AUTH_DOMAIN=nero-d9eec.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nero-d9eec
VITE_FIREBASE_STORAGE_BUCKET=nero-d9eec.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=448577746795
VITE_FIREBASE_APP_ID=1:448577746795:web:a9368454f2b7864ccefe2e
VITE_FIREBASE_MEASUREMENT_ID=G-TN1ZGWZLQ1
```

#### Google OAuth
```
GOOGLE_CLIENT_ID     = Your Google OAuth client ID
```

### Optional: Development Secrets
For a separate development environment:
```
DEV_SERVER_HOST
DEV_SERVER_USERNAME
DEV_SERVER_PASSWORD
DEV_SERVER_PORT
DEV_ENV               = Development backend environment variables
DEV_WEB_ENV           = Development frontend environment variables
DEV_GOOGLE_CLIENT_ID
```

---

## 🖥️ Step 2: Server Setup

### Option A: Automated Setup

SSH into your server and run:

```bash
# Download setup script
curl -O https://raw.githubusercontent.com/your-username/nero/master/scripts/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

### Option B: Manual Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/nero
sudo chown $USER:$USER /var/www/nero

# Setup PM2 to start on boot
pm2 startup
# Run the command PM2 outputs
pm2 save
```

---

## 🚀 Step 3: First Deployment

### Automatic Deployment

Simply push to the master branch:

```bash
git add .
git commit -m "Initial deployment"
git push origin master
```

### Manual Deployment

If you need to deploy manually on the server:

```bash
# SSH to server
ssh username@your-server-ip

# Navigate to app directory
cd /var/www/nero

# Run deployment script
./scripts/deploy-manual.sh
```

---

## 📊 Step 4: Verify Deployment

### Check PM2 Status
```bash
pm2 status
pm2 logs nero
```

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

### Access Application
- **Web App**: http://your-domain or http://your-ip:3000
- **Admin Panel**: http://your-domain/panel
- **API**: http://your-domain/api

---

## 🔧 Common Operations

### View Logs
```bash
pm2 logs nero
pm2 logs nero --lines 100
pm2 logs nero --raw
```

### Restart Application
```bash
pm2 restart nero
```

### Stop Application
```bash
pm2 stop nero
```

### Monitor Resources
```bash
pm2 monit
```

### Manual Build and Restart

If automatic deployment isn't working:

```bash
cd /var/www/nero

# Pull latest code
git pull origin master

# Build server
cd server
npm ci
npm run build
cd ..

# Build web
npm ci
npm run build

# Build panel
cd panel
npm ci
npm run build
cd ..

# Restart PM2
pm2 restart nero
```

---

## 🐛 Troubleshooting

### Issue: Frontend not loading

**Problem**: White screen or "Cannot GET /" error

**Solution**:
```bash
cd /var/www/nero
# Check if .env exists
ls -la .env

# If not, create it
cp .env.example .env
# Edit with your values
nano .env

# Rebuild web
npm ci
npm run build

# Restart PM2
pm2 restart nero
```

### Issue: PM2 not starting

**Problem**: PM2 process fails to start

**Solution**:
```bash
# Check logs
pm2 logs nero --lines 50

# Verify server .env exists
ls -la /var/www/nero/server/.env

# Check if port is already in use
sudo lsof -i :3000

# Restart with full path
cd /var/www/nero/server
pm2 restart nero --node-args '-r tsconfig-paths/register'
```

### Issue: Build fails

**Problem**: npm run build fails

**Solution**:
```bash
# Check Node version
node --version  # Should be 18+

# Clear caches
cd /var/www/nero
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Issue: API calls failing

**Problem**: Frontend can't reach API

**Solution**:
```bash
# Check .env VITE_API_URL
cat /var/www/nero/.env | grep VITE_API_URL

# Should match your server URL
# If using domain: VITE_API_URL=http://yourdomain.com/api
# If using IP: VITE_API_URL=http://123.45.67.89:3000/api

# Rebuild after fixing
npm run build
pm2 restart nero
```

---

## 🔐 Security Best Practices

1. **Use SSH Keys** instead of passwords for deployment
2. **Enable Firewall** (UFW):
   ```bash
   sudo ufw allow 22/tcp      # SSH
   sudo ufw allow 80/tcp      # HTTP
   sudo ufw allow 443/tcp     # HTTPS
   sudo ufw enable
   ```
3. **Install SSL Certificate** with Certbot (if using domain)
4. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade
   ```
5. **Rotate Secrets** regularly in GitHub secrets
6. **Enable 2FA** on GitHub account
7. **Use MongoDB Authentication**

---

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js Documentation](https://nodejs.org/docs/)

---

## 💡 Tips

1. **Test in Development First**: Always test changes in the dev branch before production
2. **Monitor Logs**: Regularly check PM2 logs for errors
3. **Backup Database**: Setup automated MongoDB backups
4. **Use Environment Variables**: Never hard-code secrets
5. **Keep Dependencies Updated**: Regularly update npm packages

---

## 🆘 Need Help?

1. Check GitHub Actions logs in the Actions tab
2. Review server logs: `pm2 logs nero`
3. Verify all secrets are set in GitHub
4. Ensure .env files exist on server
5. Test health endpoint: `curl http://localhost:3000/health`
