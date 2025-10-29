#!/bin/bash

# 🚀 Nero Server Setup Script
# This script sets up a fresh Ubuntu server for Nero deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_info "🚀 Starting Nero Server Setup..."

# Update system
print_info "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential tools
print_info "🔧 Installing essential tools..."
apt-get install -y curl wget git build-essential

# Install Node.js 18.x
print_info "📦 Installing Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    print_info "✅ Node.js $(node --version) installed"
else
    print_info "✅ Node.js $(node --version) already installed"
fi

# Install PM2
print_info "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
    print_info "✅ PM2 installed"
else
    print_info "✅ PM2 already installed"
fi

# Install Nginx
print_info "📦 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_info "✅ Nginx installed"
else
    print_info "✅ Nginx already installed"
fi

# Install MongoDB
print_info "📦 Installing MongoDB..."
if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl enable mongod
    systemctl start mongod
    print_info "✅ MongoDB installed"
else
    print_info "✅ MongoDB already installed"
fi

# Install Certbot for SSL
print_info "📦 Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
    print_info "✅ Certbot installed"
else
    print_info "✅ Certbot already installed"
fi

# Create directory structure
print_info "📁 Creating directory structure..."
mkdir -p /var/www/nero
mkdir -p /var/www/nero-dev
chown -R $SUDO_USER:$SUDO_USER /var/www/nero
chown -R $SUDO_USER:$SUDO_USER /var/www/nero-dev

# Configure firewall
print_info "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp      # SSH
    ufw allow 80/tcp      # HTTP
    ufw allow 443/tcp     # HTTPS
    ufw --force enable
    print_info "✅ Firewall configured"
fi

# Configure Nginx for Nero
print_info "⚙️  Configuring Nginx..."

# Production configuration
cat > /etc/nginx/sites-available/nero << 'EOF'
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

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Development configuration
cat > /etc/nginx/sites-available/nero-dev << 'EOF'
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
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
EOF

# Enable sites
ln -sf /etc/nginx/sites-available/nero /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/nero-dev /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t
systemctl reload nginx
print_info "✅ Nginx configured"

# Create environment template
print_info "📝 Creating environment template..."
cat > /var/www/nero/server/.env.example << 'EOF'
# Environment
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/nero

# JWT Secrets
JWT_SECRET=change-this-to-a-secure-random-string
JWT_REFRESH_SECRET=change-this-to-another-secure-random-string

# Google AI
GOOGLE_AI_API_KEY=your-google-ai-api-key

# API Configuration
API_BASE_URL=https://api.nero.app

# CORS
CORS_ORIGIN=https://nero.app,https://panel.nero.app
EOF

chown $SUDO_USER:$SUDO_USER /var/www/nero/server/.env.example

print_info "✅ Environment template created at /var/www/nero/server/.env.example"
print_warning "⚠️  Please copy .env.example to .env and update with real values"

# Print summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Server setup completed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure DNS records:"
echo "   - nero.app → Your server IP"
echo "   - www.nero.app → Your server IP"
echo "   - api.nero.app → Your server IP"
echo "   - panel.nero.app → Your server IP"
echo "   - dev.nero.app → Your server IP"
echo "   - dev-api.nero.app → Your server IP"
echo "   - dev-panel.nero.app → Your server IP"
echo ""
echo "2. Set up SSL certificates:"
echo "   sudo certbot --nginx -d nero.app -d www.nero.app -d api.nero.app -d panel.nero.app"
echo "   sudo certbot --nginx -d dev.nero.app -d dev-api.nero.app -d dev-panel.nero.app"
echo ""
echo "3. Configure backend environment:"
echo "   cd /var/www/nero/server"
echo "   cp .env.example .env"
echo "   nano .env  # Edit with your values"
echo ""
echo "4. Configure GitHub Secrets:"
echo "   - SERVER_HOST: $(hostname -I | awk '{print $1}')"
echo "   - SERVER_USERNAME: $SUDO_USER"
echo "   - SERVER_PASSWORD: Your SSH password"
echo "   - GOOGLE_CLIENT_ID: Your Google OAuth client ID"
echo ""
echo "5. Push to GitHub to trigger deployment"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 For more information, see: DEPLOYMENT.md"
echo ""
