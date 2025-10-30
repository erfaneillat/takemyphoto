# 🔧 Quick Fix Steps - Frontend Not Loading

## Problem
Frontend .env file was missing, causing the build to fail or load incorrectly.

## ✅ What Was Fixed

1. **Backend now serves web frontend** from `/dist` directory
2. **CI/CD creates frontend .env** file during deployment
3. **Build dependencies moved to production** in package.json
4. **PM2 restart verification** added to ensure all builds exist

---

## 🚀 What You Need To Do NOW

### Option 1: Let CI/CD Handle It (Recommended)

1. **Add GitHub Secret `WEB_ENV`**:
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `WEB_ENV`
   - Value:
   ```bash
   VITE_API_URL=http://takemyphoto.xyz/api
   VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
   VITE_FIREBASE_API_KEY=AIzaSyB_xb9MsTagBJY0XmFIgr9H-6Jcz_mPjPw
   VITE_FIREBASE_AUTH_DOMAIN=nero-d9eec.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=nero-d9eec
   VITE_FIREBASE_STORAGE_BUCKET=nero-d9eec.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=448577746795
   VITE_FIREBASE_APP_ID=1:448577746795:web:a9368454f2b7864ccefe2e
   VITE_FIREBASE_MEASUREMENT_ID=G-TN1ZGWZLQ1
   ```

2. **Commit and Push** these changes:
   ```bash
   git add .
   git commit -m "fix: add frontend .env support and improve CI/CD"
   git push origin master
   ```

3. **Watch GitHub Actions** deploy automatically

---

### Option 2: Manual Fix On Server (Immediate)

If you need the site working RIGHT NOW:

```bash
# SSH to your server
ssh username@your-server-ip

# Navigate to app directory
cd /var/www/nero

# Create .env file in root
nano .env
```

Paste this into the .env file:
```bash
VITE_API_URL=http://takemyphoto.xyz/api
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
VITE_FIREBASE_API_KEY=AIzaSyB_xb9MsTagBJY0XmFIgr9H-6Jcz_mPjPw
VITE_FIREBASE_AUTH_DOMAIN=nero-d9eec.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nero-d9eec
VITE_FIREBASE_STORAGE_BUCKET=nero-d9eec.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=448577746795
VITE_FIREBASE_APP_ID=1:448577746795:web:a9368454f2b7864ccefe2e
VITE_FIREBASE_MEASUREMENT_ID=G-TN1ZGWZLQ1
```

Save with `Ctrl+X`, `Y`, `Enter`

Then rebuild:
```bash
# Install dependencies
npm ci

# Build frontend
npm run build

# Verify build succeeded
ls -la dist/index.html

# Restart PM2
pm2 restart nero

# Check if it's working
curl http://localhost:3000
```

---

## 🔍 Verify It's Working

### 1. Check PM2 Status
```bash
pm2 status nero
pm2 logs nero --lines 20
```

### 2. Test in Browser
Open: `http://your-domain-or-ip`

You should see the Nero web app, not a 404 or blank page.

### 3. Test Admin Panel
Open: `http://your-domain-or-ip/panel`

### 4. Test API
```bash
curl http://your-domain-or-ip/api/health
```

---

## 📝 Summary of Changes

### Files Modified
- ✅ `server/src/app.ts` - Added web frontend serving
- ✅ `package.json` - Moved build deps to production
- ✅ `.github/workflows/deploy.yml` - Added WEB_ENV support
- ✅ `.env.example` - Updated with correct variables
- ✅ `scripts/deploy-manual.sh` - Added .env checking

### New Files Created
- ✅ `DEPLOYMENT_SETUP_GUIDE.md` - Complete deployment guide
- ✅ `QUICK_FIX_STEPS.md` - This file
- ✅ `scripts/deploy-manual.sh` - Manual deployment script

---

## 🆘 Still Not Working?

### Check These:

1. **.env file exists in root** (`/var/www/nero/.env`)
   ```bash
   cat /var/www/nero/.env
   ```

2. **dist folder has files** (`/var/www/nero/dist/`)
   ```bash
   ls -la /var/www/nero/dist/
   ```

3. **PM2 is running**
   ```bash
   pm2 status
   ```

4. **Port 3000 is accessible**
   ```bash
   curl http://localhost:3000
   ```

5. **Check logs for errors**
   ```bash
   pm2 logs nero
   ```

---

## 💡 Next Steps

1. ✅ Fix immediate issue (Option 1 or 2 above)
2. ✅ Add `WEB_ENV` GitHub secret
3. ✅ Commit and push these changes
4. ✅ Test that CI/CD works automatically
5. ✅ Read `DEPLOYMENT_SETUP_GUIDE.md` for full details

---

## 🎯 The Root Cause

The issue was that:
1. Vite needs a `.env` file to read environment variables during build
2. CI/CD was only creating `/var/www/nero/server/.env`
3. It wasn't creating `/var/www/nero/.env` for the web frontend
4. Without env vars, the frontend built with wrong API URLs or missing config
5. Backend wasn't serving the frontend files at all

Now fixed! ✅
