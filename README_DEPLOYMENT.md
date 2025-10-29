# 🚀 Nero Deployment - Visual Guide

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                        │
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐              │
│  │   Web    │     │  Panel   │     │  Server  │              │
│  │  (Vite)  │     │  (Vite)  │     │(Node.js) │              │
│  └──────────┘     └──────────┘     └──────────┘              │
│                                                                  │
│                    ↓ Push to master/dev                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Actions                              │
│                                                                  │
│  1. 📦 Install Dependencies                                     │
│  2. 🔨 Build All Components                                     │
│  3. 🚀 Deploy to Server via SSH                                 │
│  4. 🔄 Restart PM2 Process                                      │
│  5. ✅ Health Check                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Production Server                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │  Nginx (Reverse Proxy + Static Files)              │        │
│  │  ├─ nero.app         → /var/www/nero/dist          │        │
│  │  ├─ api.nero.app     → http://localhost:3000       │        │
│  │  └─ panel.nero.app   → /var/www/nero/panel/dist    │        │
│  └────────────────────────────────────────────────────┘        │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────┐        │
│  │  PM2 (Process Manager)                             │        │
│  │  └─ nero → Node.js API Server (Port 3000)          │        │
│  └────────────────────────────────────────────────────┘        │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────┐        │
│  │  MongoDB (Database)                                │        │
│  │  └─ nero database (Port 27017)                     │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Deployment Flow

```
┌──────────────┐
│   Developer  │
│   commits &  │
│     pushes   │
└──────┬───────┘
       │
       ↓
┌──────────────┐     master branch     ┌──────────────┐
│    GitHub    ├──────────────────────→│ Production   │
│  Repository  │                        │ Environment  │
│              │     dev branch         │              │
│              ├──────────────────────→ │ Development  │
└──────────────┘                        │ Environment  │
                                        └──────────────┘
```

## 📋 Environment Comparison

| Feature | Production | Development |
|---------|------------|-------------|
| **Branch** | `master` / `main` | `dev` |
| **Domain** | nero.app | dev.nero.app |
| **API Domain** | api.nero.app | dev-api.nero.app |
| **Panel Domain** | panel.nero.app | dev-panel.nero.app |
| **Port** | 3000 | 3001 |
| **PM2 Name** | nero | nero-dev |
| **Path** | /var/www/nero | /var/www/nero-dev |
| **MongoDB** | nero | nero-dev |

## 🎯 Quick Start Guide

### Step 1: Server Setup (5 minutes)

```bash
# On your Ubuntu server
wget https://raw.githubusercontent.com/your-username/nero/master/scripts/setup-server.sh
chmod +x setup-server.sh
sudo ./setup-server.sh
```

**This installs**: Node.js, PM2, Nginx, MongoDB, Certbot

### Step 2: Configure DNS (10 minutes)

Add these A records to your domain:

```
@ (root)            → Your Server IP
www                 → Your Server IP
api                 → Your Server IP
panel               → Your Server IP
dev                 → Your Server IP
dev-api             → Your Server IP
dev-panel           → Your Server IP
```

### Step 3: GitHub Secrets (2 minutes)

Go to: `Repository → Settings → Secrets and variables → Actions`

```
SERVER_HOST         = your.server.ip.address
SERVER_USERNAME     = ubuntu
SERVER_PASSWORD     = your-ssh-password
GOOGLE_CLIENT_ID    = your-google-client-id
```

### Step 4: Server Environment (3 minutes)

```bash
# SSH to your server
ssh username@your-server-ip

# Configure production
cd /var/www/nero/server
cp .env.example .env
nano .env  # Edit values

# Key values to set:
# - JWT_SECRET (32+ characters)
# - GOOGLE_AI_API_KEY
# - MONGODB_URI
```

### Step 5: SSL Certificates (5 minutes)

```bash
# After DNS propagates (wait 1-24 hours)
sudo certbot --nginx \
  -d nero.app \
  -d www.nero.app \
  -d api.nero.app \
  -d panel.nero.app
```

### Step 6: Deploy! (Automatic)

```bash
# From your local machine
git push origin master  # Deploys to production
```

**Watch deployment**: Go to GitHub → Actions tab

## 📊 Deployment Timeline

```
┌─────────────┐
│   0:00      │ Push to GitHub
│   Commit    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   0:30      │ GitHub Actions triggered
│   Trigger   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   1:00      │ Install dependencies
│   Install   │ (Server, Web, Panel)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   2:00      │ Build all components
│   Build     │ (TypeScript, Vite)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   3:00      │ SSH to server
│   Deploy    │ Pull code, rebuild
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   4:00      │ Restart PM2 process
│   Restart   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   4:30      │ Health check (8 retries)
│   Verify    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   5:00      │ ✅ Deployment Complete!
│   Success   │
└─────────────┘

Total Time: ~5 minutes
```

## 🔍 Monitoring Commands

### Check Deployment Status

```bash
# GitHub Actions
Open: https://github.com/your-username/nero/actions

# Server Status
pm2 status

# View Logs
pm2 logs nero --lines 50

# Health Check
curl https://api.nero.app/api/health
```

### Common Commands

```bash
# Restart application
pm2 restart nero

# View real-time logs
pm2 logs nero --raw

# Monitor resources
pm2 monit

# Nginx status
sudo systemctl status nginx

# MongoDB status
sudo systemctl status mongod
```

## 🎨 Directory Structure

```
/var/www/nero/
├── dist/                    # Built web application
│   ├── index.html
│   └── assets/
├── panel/
│   └── dist/               # Built admin panel
│       ├── index.html
│       └── assets/
└── server/
    ├── dist/               # Built backend
    │   └── index.js
    ├── uploads/            # User uploads
    ├── .env               # Environment variables
    └── node_modules/
```

## 📈 Success Indicators

After deployment, verify these:

```
✅ GitHub Actions workflow status: ✓ Success
✅ PM2 process status: online
✅ API health check: { "status": "ok" }
✅ Web app loads: https://nero.app
✅ Admin panel loads: https://panel.nero.app
✅ SSL certificates valid (green padlock)
✅ No errors in PM2 logs
✅ MongoDB connected
```

## 🛠️ Customization

### Change Ports

Edit `.github/workflows/deploy.yml`:

```yaml
echo "app_port=4000" >> $GITHUB_OUTPUT  # Change from 3000
```

### Change Domains

Edit `.github/workflows/deploy.yml`:

```yaml
echo "api_url=https://api.myapp.com" >> $GITHUB_OUTPUT
```

### Add Staging Environment

1. Create `staging` branch
2. Add to workflow trigger:
```yaml
on:
  push:
    branches: [ master, main, dev, staging ]
```
3. Add staging configuration in "Determine Environment" step

## 📚 Documentation Files

```
📄 DEPLOYMENT.md
   └─ Complete deployment guide with all instructions

📄 DEPLOYMENT_QUICK_REFERENCE.md
   └─ Command reference for daily operations

📄 DEPLOYMENT_CHECKLIST.md
   └─ Step-by-step checklist for deployment

📄 CI_CD_SETUP_SUMMARY.md
   └─ Overview of CI/CD setup

📄 README_DEPLOYMENT.md
   └─ This visual guide

📂 .github/workflows/
   ├── deploy.yml          (Main workflow)
   └── README.md           (Workflow documentation)

📂 scripts/
   ├── setup-server.sh     (Server automation)
   └── README.md           (Scripts documentation)
```

## 🔐 Security Checklist

- [ ] SSL certificates installed (HTTPS)
- [ ] Firewall enabled (UFW)
- [ ] MongoDB authentication enabled
- [ ] Strong passwords for all services
- [ ] GitHub secrets properly configured
- [ ] SSH key authentication (recommended)
- [ ] Environment variables secured
- [ ] Regular backups configured
- [ ] Monitoring tools set up
- [ ] Error logging enabled

## 🚨 Troubleshooting Quick Fix

```bash
# If deployment fails:

# 1. Check GitHub Actions logs
Go to: GitHub → Actions → Latest workflow run

# 2. Check server logs
ssh username@server-ip
pm2 logs nero --lines 100

# 3. Verify services are running
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod

# 4. Test health endpoint
curl http://localhost:3000/api/health

# 5. Restart if needed
pm2 restart nero
sudo systemctl restart nginx
```

## 🎯 Next Actions

1. ✅ Read `DEPLOYMENT.md` for complete setup
2. ✅ Follow `DEPLOYMENT_CHECKLIST.md` step-by-step
3. ✅ Run `setup-server.sh` on your server
4. ✅ Configure GitHub secrets
5. ✅ Configure server `.env` file
6. ✅ Set up DNS records
7. ✅ Install SSL certificates
8. ✅ Push to GitHub to deploy
9. ✅ Verify deployment
10. ✅ Celebrate! 🎉

## 📞 Need Help?

1. **Documentation**: Start with `DEPLOYMENT.md`
2. **Quick Commands**: Check `DEPLOYMENT_QUICK_REFERENCE.md`
3. **Step-by-Step**: Follow `DEPLOYMENT_CHECKLIST.md`
4. **Workflow Issues**: See `.github/workflows/README.md`
5. **Server Setup**: Review `scripts/README.md`

---

**Ready to deploy?** Start with: `DEPLOYMENT_CHECKLIST.md` ✨
