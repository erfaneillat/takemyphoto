# Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ installed on server
- MongoDB instance (Atlas or self-hosted)
- Cloudinary account
- Twilio account
- Domain name with SSL certificate

---

## 📦 Deployment Options

### Option 1: Railway (Recommended for Quick Deploy)

1. **Create Railway Account**: https://railway.app

2. **Install Railway CLI**:
```bash
npm install -g @railway/cli
railway login
```

3. **Initialize Project**:
```bash
cd server
railway init
```

4. **Set Environment Variables**:
```bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your-mongodb-uri
railway variables set JWT_SECRET=your-secret
railway variables set JWT_REFRESH_SECRET=your-refresh-secret
railway variables set CLOUDINARY_CLOUD_NAME=your-cloud-name
railway variables set CLOUDINARY_API_KEY=your-api-key
railway variables set CLOUDINARY_API_SECRET=your-api-secret
railway variables set TWILIO_ACCOUNT_SID=your-twilio-sid
railway variables set TWILIO_AUTH_TOKEN=your-twilio-token
railway variables set TWILIO_PHONE_NUMBER=your-twilio-number
railway variables set CORS_ORIGIN=https://your-frontend-domain.com
```

5. **Deploy**:
```bash
railway up
```

---

### Option 2: Heroku

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Login and Create App**:
```bash
heroku login
heroku create nero-api
```

3. **Add MongoDB**:
```bash
heroku addons:create mongolab:sandbox
```

4. **Set Environment Variables**:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
heroku config:set CLOUDINARY_API_KEY=your-api-key
heroku config:set CLOUDINARY_API_SECRET=your-api-secret
heroku config:set TWILIO_ACCOUNT_SID=your-twilio-sid
heroku config:set TWILIO_AUTH_TOKEN=your-twilio-token
heroku config:set TWILIO_PHONE_NUMBER=your-twilio-number
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
```

5. **Deploy**:
```bash
git push heroku main
```

6. **Scale**:
```bash
heroku ps:scale web=1
```

---

### Option 3: Render

1. **Create Render Account**: https://render.com

2. **Create New Web Service**:
   - Connect GitHub repository
   - Select `server` folder as root directory
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Add Environment Variables** in Render dashboard

4. **Deploy**: Automatic on git push

---

### Option 4: DigitalOcean/AWS/VPS

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 2. Clone and Setup Project

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-repo/nero.git
cd nero/server

# Install dependencies
sudo npm install

# Build
sudo npm run build

# Create .env file
sudo nano .env
# Add all environment variables
```

#### 3. Configure PM2

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'nero-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/nero-api
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/nero-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🗄️ MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (Free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string
6. Update `MONGODB_URI` in environment variables

### Option 2: Self-Hosted MongoDB

```bash
# Install MongoDB
# See VPS setup above

# Secure MongoDB
sudo nano /etc/mongod.conf
```

Add authentication:
```yaml
security:
  authorization: enabled
```

Create admin user:
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

---

## 🔐 Environment Variables Checklist

```env
# Required
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nero
JWT_SECRET=generate-strong-secret-key
JWT_REFRESH_SECRET=generate-another-strong-secret
CORS_ORIGIN=https://your-frontend-domain.com

# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Twilio (Required for SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Optional
API_VERSION=v1
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
MAX_FILES_PER_REQUEST=5
```

### Generate Strong Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs nero-api

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    paths:
      - 'server/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./server
        run: npm ci
      
      - name: Run tests
        working-directory: ./server
        run: npm test
      
      - name: Build
        working-directory: ./server
        run: npm run build
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🧪 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB connection tested
- [ ] Cloudinary credentials verified
- [ ] Twilio credentials verified
- [ ] CORS origin set correctly
- [ ] Strong JWT secrets generated
- [ ] SSL certificate installed
- [ ] Health endpoint accessible
- [ ] API endpoints tested
- [ ] Error logging configured
- [ ] Monitoring setup
- [ ] Backup strategy in place

---

## 🔍 Health Checks

Test your deployment:

```bash
# Health check
curl https://api.yourdomain.com/health

# API version
curl https://api.yourdomain.com/api/v1

# Test authentication
curl -X POST https://api.yourdomain.com/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs nero-api --lines 100

# Check environment variables
pm2 env 0

# Restart application
pm2 restart nero-api
```

### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "your-mongodb-uri"

# Check MongoDB status
sudo systemctl status mongod
```

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart with memory limit
pm2 restart nero-api --max-memory-restart 500M
```

---

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale to 4 instances
pm2 scale nero-api 4

# Or use cluster mode
pm2 start ecosystem.config.js -i max
```

### Load Balancing

Use Nginx for load balancing:

```nginx
upstream nero_backend {
    least_conn;
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
    server localhost:5003;
}

server {
    location / {
        proxy_pass http://nero_backend;
    }
}
```

---

## 🔒 Security Best Practices

1. **Use HTTPS only**
2. **Keep dependencies updated**: `npm audit fix`
3. **Use strong secrets**: 64+ character random strings
4. **Whitelist IPs** in MongoDB Atlas
5. **Enable rate limiting**
6. **Monitor logs** for suspicious activity
7. **Regular backups** of MongoDB
8. **Use environment variables** for all secrets
9. **Keep Node.js updated**
10. **Use PM2 in cluster mode**

---

## 💾 Backup Strategy

### MongoDB Backup

```bash
# Backup
mongodump --uri="your-mongodb-uri" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="your-mongodb-uri" /backup/20240101

# Automated daily backup
crontab -e
0 2 * * * mongodump --uri="your-uri" --out=/backup/$(date +\%Y\%m\%d)
```

---

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Verify environment variables
3. Test database connection
4. Check firewall rules
5. Review Nginx configuration

---

## ✅ Post-Deployment

1. Test all API endpoints
2. Monitor error rates
3. Check response times
4. Verify SMS sending
5. Test file uploads
6. Monitor database performance
7. Setup alerts for downtime
8. Document API URL for frontend team
