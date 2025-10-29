# ✅ Deployment Checklist

Use this checklist to ensure proper deployment setup for the Nero application.

## 📋 Pre-Deployment Setup

### 1. Server Preparation

- [ ] Ubuntu 20.04 or 22.04 server provisioned
- [ ] Root or sudo access available
- [ ] Server has at least:
  - [ ] 2GB RAM
  - [ ] 20GB storage
  - [ ] 2 CPU cores
- [ ] Server IP address noted
- [ ] SSH access configured

### 2. Domain Configuration

- [ ] Domain purchased (e.g., nero.app)
- [ ] DNS A records created:
  - [ ] `@` or `nero.app` → Server IP
  - [ ] `www` or `www.nero.app` → Server IP
  - [ ] `api` or `api.nero.app` → Server IP
  - [ ] `panel` or `panel.nero.app` → Server IP
- [ ] Development subdomains (optional):
  - [ ] `dev.nero.app` → Server IP
  - [ ] `dev-api.nero.app` → Server IP
  - [ ] `dev-panel.nero.app` → Server IP
- [ ] DNS propagation verified (wait 1-24 hours)

### 3. Server Setup

- [ ] Run `setup-server.sh` script:
  ```bash
  sudo ./scripts/setup-server.sh
  ```
- [ ] Verify installations:
  - [ ] Node.js: `node --version` (should be 18.x)
  - [ ] PM2: `pm2 --version`
  - [ ] Nginx: `nginx -v`
  - [ ] MongoDB: `mongod --version`
  - [ ] Certbot: `certbot --version`

### 4. Server Configuration

- [ ] Create production .env file:
  ```bash
  cd /var/www/nero/server
  cp .env.example .env
  nano .env
  ```
- [ ] Fill in all environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `MONGODB_URI` (valid connection string)
  - [ ] `JWT_SECRET` (min 32 characters)
  - [ ] `JWT_REFRESH_SECRET` (min 32 characters)
  - [ ] `GOOGLE_AI_API_KEY`
  - [ ] `API_BASE_URL`
  - [ ] `CORS_ORIGIN`
- [ ] Create development .env file (optional):
  ```bash
  cd /var/www/nero-dev/server
  cp /var/www/nero/server/.env.example .env
  nano .env
  ```

### 5. SSL Certificates

- [ ] DNS propagated and resolving correctly
- [ ] Install production certificates:
  ```bash
  sudo certbot --nginx -d nero.app -d www.nero.app -d api.nero.app -d panel.nero.app
  ```
- [ ] Install development certificates (optional):
  ```bash
  sudo certbot --nginx -d dev.nero.app -d dev-api.nero.app -d dev-panel.nero.app
  ```
- [ ] Verify HTTPS works for all domains
- [ ] Auto-renewal configured: `sudo certbot renew --dry-run`

### 6. MongoDB Setup

- [ ] MongoDB running: `sudo systemctl status mongod`
- [ ] Enable authentication (production):
  ```bash
  mongosh
  use admin
  db.createUser({
    user: "neroAdmin",
    pwd: "secure-password",
    roles: [{ role: "readWrite", db: "nero" }]
  })
  ```
- [ ] Update `MONGODB_URI` in .env with credentials
- [ ] Test connection: `mongosh "mongodb://neroAdmin:password@localhost:27017/nero"`

### 7. Firewall Configuration

- [ ] Firewall enabled: `sudo ufw status`
- [ ] Required ports open:
  - [ ] Port 22 (SSH): `sudo ufw allow 22/tcp`
  - [ ] Port 80 (HTTP): `sudo ufw allow 80/tcp`
  - [ ] Port 443 (HTTPS): `sudo ufw allow 443/tcp`
- [ ] Unnecessary ports closed
- [ ] Firewall active: `sudo ufw enable`

## 🔧 GitHub Setup

### 8. Repository Configuration

- [ ] GitHub repository created
- [ ] Code pushed to repository
- [ ] Branches created:
  - [ ] `master` or `main` (production)
  - [ ] `dev` (development)

### 9. GitHub Secrets

Navigate to: `Settings → Secrets and variables → Actions`

**Production Secrets (Required):**
- [ ] `SERVER_HOST` = Your server IP or domain
- [ ] `SERVER_USERNAME` = SSH username (e.g., ubuntu)
- [ ] `SERVER_PASSWORD` = SSH password
- [ ] `SERVER_PORT` = SSH port (22 or custom)
- [ ] `GOOGLE_CLIENT_ID` = Google OAuth client ID

**Development Secrets (Optional):**
- [ ] `DEV_SERVER_HOST` = Dev server IP/domain
- [ ] `DEV_SERVER_USERNAME` = Dev SSH username
- [ ] `DEV_SERVER_PASSWORD` = Dev SSH password
- [ ] `DEV_SERVER_PORT` = Dev SSH port
- [ ] `DEV_GOOGLE_CLIENT_ID` = Dev Google OAuth ID

### 10. GitHub Environments

- [ ] Production environment created
- [ ] Development environment created (optional)
- [ ] Protection rules configured (optional):
  - [ ] Required reviewers
  - [ ] Wait timer
  - [ ] Deployment branches

### 11. Google OAuth Setup

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 client IDs created:
  - [ ] Production client ID
  - [ ] Development client ID (optional)
- [ ] Authorized JavaScript origins added:
  - [ ] `https://nero.app`
  - [ ] `https://dev.nero.app` (optional)
- [ ] Authorized redirect URIs added:
  - [ ] `https://nero.app/*`
  - [ ] `https://dev.nero.app/*` (optional)

## 🚀 Initial Deployment

### 12. Test Workflow

- [ ] GitHub Actions enabled
- [ ] Workflow file exists: `.github/workflows/deploy.yml`
- [ ] Test manual trigger:
  1. Go to Actions tab
  2. Select "🚀 Deploy Nero Application"
  3. Click "Run workflow"
  4. Select environment
  5. Click "Run workflow"
- [ ] Watch workflow execution
- [ ] Verify all steps pass

### 13. Verify Deployment

**Backend:**
- [ ] PM2 process running: `pm2 list`
- [ ] API health check: `curl https://api.nero.app/api/health`
- [ ] API logs clean: `pm2 logs nero --lines 20`

**Frontend:**
- [ ] Web app loads: https://nero.app
- [ ] No console errors (F12 → Console)
- [ ] Google OAuth working
- [ ] API requests successful (Network tab)

**Admin Panel:**
- [ ] Panel loads: https://panel.nero.app
- [ ] Login working
- [ ] Admin functions operational

### 14. Test User Flows

- [ ] User can access website
- [ ] User can sign in with Google
- [ ] User can generate images
- [ ] User can edit images
- [ ] User can upscale images
- [ ] User can explore templates
- [ ] Admin can log in to panel
- [ ] Admin can manage categories
- [ ] Admin can manage styles/templates
- [ ] All features working end-to-end

## 🔄 Post-Deployment

### 15. Monitoring Setup

- [ ] PM2 monitoring: `pm2 monit`
- [ ] Log rotation configured
- [ ] Uptime monitoring tool configured (optional):
  - [ ] UptimeRobot
  - [ ] Pingdom
  - [ ] StatusCake
- [ ] Error tracking configured (optional):
  - [ ] Sentry
  - [ ] LogRocket
  - [ ] Rollbar

### 16. Backup Configuration

- [ ] Database backup script created
- [ ] Cron job for daily backups:
  ```bash
  crontab -e
  # Add: 0 2 * * * /path/to/backup-script.sh
  ```
- [ ] Backup storage location verified
- [ ] Backup restoration tested
- [ ] Uploads backup configured

### 17. Documentation

- [ ] Deployment credentials documented (securely)
- [ ] Server access documented
- [ ] Emergency contacts listed
- [ ] Runbook created for common issues
- [ ] Team trained on deployment process

### 18. Security Hardening

- [ ] SSH password authentication disabled (use keys)
- [ ] Root login disabled
- [ ] Fail2ban installed and configured
- [ ] Automatic security updates enabled
- [ ] Sensitive data encrypted
- [ ] Regular security audits scheduled

## 🧪 Testing Checklist

### 19. Production Testing

- [ ] Load testing performed
- [ ] Stress testing completed
- [ ] Security scan performed
- [ ] Performance benchmarks met
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing done:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

### 20. Development Testing

- [ ] Development environment matches production
- [ ] Feature branches deploy to dev correctly
- [ ] Dev-to-prod promotion tested
- [ ] Rollback procedure tested

## 📊 Performance Optimization

### 21. Frontend Optimization

- [ ] Images optimized and compressed
- [ ] Code splitting implemented
- [ ] Lazy loading configured
- [ ] CDN configured (optional)
- [ ] Caching headers set correctly
- [ ] Bundle size analyzed and optimized

### 22. Backend Optimization

- [ ] Database indexes created
- [ ] Query optimization done
- [ ] Response compression enabled
- [ ] Rate limiting configured
- [ ] API caching implemented (if applicable)
- [ ] Connection pooling optimized

### 23. Server Optimization

- [ ] Nginx gzip compression enabled
- [ ] Static file caching configured
- [ ] PM2 cluster mode enabled (optional)
- [ ] Memory limits configured
- [ ] Log rotation enabled

## 🎯 Launch Day

### 24. Pre-Launch

- [ ] All checklist items completed
- [ ] Final backup created
- [ ] Rollback plan ready
- [ ] Support team briefed
- [ ] Monitoring dashboards open
- [ ] Communication channels ready

### 25. Launch

- [ ] DNS switched to production (if needed)
- [ ] Final deployment triggered
- [ ] All services verified
- [ ] Health checks passing
- [ ] User testing confirmed
- [ ] Announcement made (if applicable)

### 26. Post-Launch

- [ ] Monitor errors for first 24 hours
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Address any critical issues
- [ ] Document lessons learned
- [ ] Plan next improvements

## 📝 Maintenance Schedule

### Daily
- [ ] Check PM2 status
- [ ] Review error logs
- [ ] Monitor disk space
- [ ] Verify backups completed

### Weekly
- [ ] Review performance metrics
- [ ] Check SSL certificate status
- [ ] Update dependencies (dev environment)
- [ ] Review security logs

### Monthly
- [ ] Update system packages
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Security audit
- [ ] Performance review

### Quarterly
- [ ] Major version updates
- [ ] Infrastructure review
- [ ] Disaster recovery test
- [ ] Cost optimization review

## ✅ Final Verification

- [ ] All production URLs accessible
- [ ] All features working correctly
- [ ] No errors in logs
- [ ] Monitoring active
- [ ] Backups running
- [ ] Team trained
- [ ] Documentation complete
- [ ] Emergency procedures documented
- [ ] Celebration planned! 🎉

---

## 📞 Emergency Contacts

**Server Access:**
- SSH: `username@server-ip`
- Port: `22`

**Key Services:**
- MongoDB: Port 27017
- Backend API: Port 3000 (prod), 3001 (dev)
- Nginx: Ports 80, 443

**Support Resources:**
- [Deployment Guide](/DEPLOYMENT.md)
- [Quick Reference](/DEPLOYMENT_QUICK_REFERENCE.md)
- [Workflow Docs](/.github/workflows/README.md)

---

**Deployment Date**: _______________
**Completed By**: _______________
**Sign-off**: _______________
