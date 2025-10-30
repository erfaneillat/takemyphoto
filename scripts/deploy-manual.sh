#!/bin/bash

# Manual Deployment Script for Nero Application
# This script can be run directly on the server to deploy updates

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_PATH="${APP_PATH:-/var/www/nero}"
APP_NAME="${APP_NAME:-nero}"
BRANCH="${BRANCH:-master}"

echo -e "${BLUE}🚀 Starting Nero Manual Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "App Path: ${APP_PATH}"
echo -e "App Name: ${APP_NAME}"
echo -e "Branch: ${BRANCH}"
echo ""

# Navigate to app directory
echo -e "${BLUE}📂 Navigating to app directory...${NC}"
cd "${APP_PATH}"

# Pull latest code
echo -e "${BLUE}🔄 Pulling latest code from ${BRANCH}...${NC}"
git fetch origin "${BRANCH}"
git reset --hard origin/"${BRANCH}"
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found in root directory${NC}"
    echo -e "${YELLOW}⚠️  Creating .env from .env.example${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please update .env with your actual values${NC}"
    else
        echo -e "${RED}❌ .env.example not found. Cannot create .env${NC}"
        echo -e "${YELLOW}💡 You need to create a .env file manually with Vite environment variables${NC}"
    fi
fi

# Check for server .env file
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  server/.env file not found${NC}"
    echo -e "${YELLOW}⚠️  Creating server/.env from server/.env.example${NC}"
    if [ -f "server/.env.example" ]; then
        cp server/.env.example server/.env
        echo -e "${YELLOW}⚠️  Please update server/.env with your actual values${NC}"
    else
        echo -e "${RED}❌ server/.env.example not found. Cannot create server/.env${NC}"
    fi
fi
echo ""

# Install and build server
echo -e "${BLUE}📦 Installing server dependencies...${NC}"
cd server
npm ci || npm install
echo -e "${GREEN}✅ Server dependencies installed${NC}"
echo ""

echo -e "${BLUE}🔨 Building server...${NC}"
npm run build
if [ ! -d "dist" ] || [ ! -f "dist/index.js" ]; then
    echo -e "${RED}❌ Server build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server built successfully${NC}"
echo ""

# Install and build web app
echo -e "${BLUE}📦 Installing web dependencies...${NC}"
cd ..
npm ci || npm install
echo -e "${GREEN}✅ Web dependencies installed${NC}"
echo ""

echo -e "${BLUE}🔨 Building web application...${NC}"
npm run build
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Web build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Web application built successfully${NC}"
echo ""

# Install and build admin panel
echo -e "${BLUE}📦 Installing panel dependencies...${NC}"
cd panel
npm ci || npm install
echo -e "${GREEN}✅ Panel dependencies installed${NC}"
echo ""

echo -e "${BLUE}🔨 Building admin panel...${NC}"
npm run build
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Panel build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Admin panel built successfully${NC}"
echo ""

# Create uploads directory
cd ..
mkdir -p server/uploads
echo -e "${GREEN}✅ Uploads directory ready${NC}"
echo ""

# Restart PM2
echo -e "${BLUE}🔄 Restarting PM2 process...${NC}"
cd server
if pm2 describe "${APP_NAME}" > /dev/null 2>&1; then
    pm2 restart "${APP_NAME}" --update-env
    echo -e "${GREEN}✅ PM2 process restarted${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 process not found. Starting new instance...${NC}"
    pm2 start dist/index.js --name "${APP_NAME}" --node-args '-r tsconfig-paths/register'
    echo -e "${GREEN}✅ PM2 process started${NC}"
fi
pm2 save
echo ""

# Show PM2 status
echo -e "${BLUE}📊 PM2 Status:${NC}"
pm2 status "${APP_NAME}"
echo ""

# Health check
echo -e "${BLUE}🏥 Performing health check...${NC}"
sleep 5
PORT=$(pm2 jlist | jq -r ".[] | select(.name==\"${APP_NAME}\") | .pm2_env.PORT // 3000")
if curl -fsS "http://localhost:${PORT}/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo -e "${YELLOW}📋 Recent logs:${NC}"
    pm2 logs "${APP_NAME}" --lines 20 --nostream
    exit 1
fi
echo ""

# Show recent logs
echo -e "${BLUE}📋 Recent logs:${NC}"
pm2 logs "${APP_NAME}" --lines 10 --nostream
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  ${BLUE}pm2 logs ${APP_NAME}${NC}        - View logs"
echo -e "  ${BLUE}pm2 monit${NC}                  - Monitor resources"
echo -e "  ${BLUE}pm2 restart ${APP_NAME}${NC}    - Restart app"
echo -e "  ${BLUE}pm2 status${NC}                 - Check status"
