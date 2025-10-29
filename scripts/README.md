# Deployment Scripts

This directory contains scripts to help with server setup and deployment automation.

## 📜 Available Scripts

### `setup-server.sh` - Automated Server Setup

Automatically sets up a fresh Ubuntu server with all dependencies required for Nero deployment.

#### What It Does

1. **System Updates**: Updates Ubuntu packages
2. **Essential Tools**: Installs curl, wget, git, build-essential
3. **Node.js 18.x**: Installs Node.js and npm
4. **PM2**: Installs PM2 process manager globally
5. **Nginx**: Installs and configures Nginx web server
6. **MongoDB**: Installs MongoDB 6.0
7. **Certbot**: Installs Certbot for SSL certificates
8. **Directory Structure**: Creates /var/www/nero and /var/www/nero-dev
9. **Firewall**: Configures UFW firewall (ports 22, 80, 443)
10. **Nginx Config**: Creates production and development server blocks
11. **Environment Template**: Creates .env.example file

#### Usage

**Prerequisites:**
- Fresh Ubuntu 20.04 or 22.04 server
- Root access (sudo)

**Run the script:**

```bash
# Download the script
curl -O https://raw.githubusercontent.com/your-username/nero/master/scripts/setup-server.sh

# Make it executable
chmod +x setup-server.sh

# Run with sudo
sudo ./setup-server.sh
```

**Or SSH and run directly:**

```bash
ssh user@your-server
git clone https://github.com/your-username/nero.git
cd nero/scripts
sudo ./setup-server.sh
```

#### After Running

1. **Configure DNS Records**
   Point these domains to your server IP:
   - `nero.app`
   - `www.nero.app`
   - `api.nero.app`
   - `panel.nero.app`
   - `dev.nero.app`
   - `dev-api.nero.app`
   - `dev-panel.nero.app`

2. **Set Up SSL Certificates**
   ```bash
   sudo certbot --nginx -d nero.app -d www.nero.app -d api.nero.app -d panel.nero.app
   sudo certbot --nginx -d dev.nero.app -d dev-api.nero.app -d dev-panel.nero.app
   ```

3. **Configure Environment Variables**
   ```bash
   cd /var/www/nero/server
   cp .env.example .env
   nano .env  # Edit with your actual values
   ```

4. **Configure GitHub Secrets**
   Add these secrets to your GitHub repository:
   - `SERVER_HOST`: Your server IP
   - `SERVER_USERNAME`: SSH username
   - `SERVER_PASSWORD`: SSH password
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID

5. **Deploy via GitHub Actions**
   Push to `master` or `dev` branch to trigger automatic deployment

#### Verification

Check that all services are running:

```bash
# Check Node.js
node --version

# Check PM2
pm2 --version

# Check Nginx
sudo systemctl status nginx

# Check MongoDB
sudo systemctl status mongod

# Check Nginx configuration
sudo nginx -t
```

#### Troubleshooting

**Issue**: MongoDB fails to install
- **Solution**: Check Ubuntu version compatibility
- Manual installation: https://www.mongodb.com/docs/manual/installation/

**Issue**: Nginx configuration test fails
- **Solution**: Check syntax errors in config files
- Run: `sudo nginx -t` to see specific errors

**Issue**: PM2 doesn't start on boot
- **Solution**: Run PM2 startup command manually
  ```bash
  pm2 startup systemd
  pm2 save
  ```

**Issue**: Firewall blocks connections
- **Solution**: 
  ```bash
  sudo ufw status
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  ```

## 🔧 Adding New Scripts

To add a new deployment script:

1. Create a new `.sh` file in this directory
2. Add shebang at the top: `#!/bin/bash`
3. Make it executable: `chmod +x your-script.sh`
4. Document it in this README
5. Include error handling: `set -e`
6. Add colored output for better UX
7. Test on a clean server

### Script Template

```bash
#!/bin/bash

# Script Name and Description
# Usage: ./script-name.sh

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Your script logic here
print_info "Starting script..."

# ... your commands ...

print_info "✅ Script completed"
```

## 🔐 Security Notes

1. **Never commit credentials** to version control
2. **Review scripts** before running with sudo
3. **Use SSH keys** instead of passwords for production
4. **Regularly update** server packages
5. **Enable firewall** on production servers
6. **Use strong passwords** for all services
7. **Keep MongoDB secured** with authentication
8. **Monitor logs** regularly

## 📚 Related Documentation

- [Main Deployment Guide](/DEPLOYMENT.md)
- [GitHub Actions Workflows](/.github/workflows/README.md)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 💡 Tips

### Quick Server Access

Add SSH config to `~/.ssh/config`:

```
Host nero-prod
    HostName your-server-ip
    User your-username
    Port 22

Host nero-dev
    HostName your-dev-server-ip
    User your-username
    Port 22
```

Then connect with:
```bash
ssh nero-prod
ssh nero-dev
```

### PM2 Monitoring

Monitor all PM2 processes:
```bash
pm2 monit
```

View logs in real-time:
```bash
pm2 logs nero --lines 100 --raw
```

### Nginx Logs

View access logs:
```bash
sudo tail -f /var/log/nginx/access.log
```

View error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### MongoDB Backup

Create automated backups:
```bash
#!/bin/bash
# Add to cron: 0 2 * * * /path/to/backup-mongo.sh

BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --db nero --out $BACKUP_DIR/nero-$DATE

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

## 🆘 Support

For script issues:
1. Check script output for specific errors
2. Review this documentation
3. Check related service logs
4. Verify server requirements are met
