# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## 📁 Workflows

### `deploy.yml` - Main Deployment Workflow

Automatically builds and deploys the Nero application (web, panel, and backend) to production or development servers.

#### Trigger Conditions

- **Automatic**: Push to `master`, `main`, or `dev` branches
- **Manual**: Via GitHub Actions UI with environment selection

#### Environment Mapping

| Branch | Environment | App Name | Port | Path |
|--------|-------------|----------|------|------|
| `master`/`main` | production | nero | 3000 | /var/www/nero |
| `dev` | development | nero-dev | 3001 | /var/www/nero-dev |

#### Required Secrets

See [DEPLOYMENT.md](/DEPLOYMENT.md#github-secrets-configuration) for complete secret configuration.

**Production:**
- `SERVER_HOST` - Server IP/domain
- `SERVER_USERNAME` - SSH username
- `SERVER_PASSWORD` - SSH password
- `SERVER_PORT` - SSH port (optional, default: 22)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID

**Development (optional, falls back to production secrets):**
- `DEV_SERVER_HOST`
- `DEV_SERVER_USERNAME`
- `DEV_SERVER_PASSWORD`
- `DEV_SERVER_PORT`
- `DEV_GOOGLE_CLIENT_ID`

#### Workflow Steps

1. **Checkout Code** - Fetch repository code
2. **Setup Node.js** - Install Node.js 18.x with npm caching
3. **Install Dependencies** - Install npm packages for server, web, and panel
4. **Determine Environment** - Set environment variables based on branch
5. **Build Server** - Compile TypeScript backend
6. **Build Web** - Build Vite frontend with API URL injection
7. **Build Panel** - Build Vite admin panel with API URL injection
8. **Deploy Server Code** - SSH to server, pull code, rebuild on server
9. **Restart PM2** - Restart Node.js process manager
10. **Health Check** - Verify API responds to health checks (8 attempts, 5s intervals)
11. **Deployment Summary** - Print deployment details

#### Customization

To customize deployment settings, modify the "🔍 Determine Environment" step:

```yaml
- name: 🔍 Determine Environment
  id: env
  run: |
    if [ "${{ github.ref }}" == "refs/heads/dev" ]; then
      echo "app_name=nero-dev" >> $GITHUB_OUTPUT
      echo "app_port=3001" >> $GITHUB_OUTPUT
      echo "app_path=/var/www/nero-dev" >> $GITHUB_OUTPUT
      echo "api_url=https://dev-api.nero.app" >> $GITHUB_OUTPUT
      echo "web_url=https://dev.nero.app" >> $GITHUB_OUTPUT
    else
      echo "app_name=nero" >> $GITHUB_OUTPUT
      echo "app_port=3000" >> $GITHUB_OUTPUT
      echo "app_path=/var/www/nero" >> $GITHUB_OUTPUT
      echo "api_url=https://api.nero.app" >> $GITHUB_OUTPUT
      echo "web_url=https://nero.app" >> $GITHUB_OUTPUT
    fi
```

**Customizable Values:**
- `app_name` - PM2 process name
- `app_port` - Backend server port
- `app_path` - Deployment directory on server
- `api_url` - API base URL for frontend builds
- `web_url` - Web application URL

#### Build-time Environment Variables

The workflow injects environment variables during build:

**Web Application:**
```bash
VITE_API_URL=https://api.nero.app/api \
VITE_GOOGLE_CLIENT_ID=... \
npm run build
```

**Admin Panel:**
```bash
VITE_API_URL=https://api.nero.app/api \
npm run build
```

**Server:**
```bash
NODE_ENV=production npm run build
```

#### Health Check

The workflow performs health checks after deployment:

- **Endpoint**: `http://127.0.0.1:{PORT}/api/health`
- **Attempts**: 8 retries
- **Interval**: 5 seconds between attempts
- **Timeout**: 40 seconds total

If health check fails, it displays the last 20 lines of PM2 logs.

#### Deployment Outputs

After successful deployment, the workflow prints:

```
🎉 Deployment completed successfully!
📊 Summary:
- Environment: production
- API URL: https://api.nero.app
- Web URL: https://nero.app
- App Port: 3000
- PM2 App Name: nero
```

## 🔧 Adding New Workflows

To add a new workflow:

1. Create a new `.yml` file in this directory
2. Define triggers, jobs, and steps
3. Reference secrets using `${{ secrets.SECRET_NAME }}`
4. Test in a feature branch before merging

### Example: Testing Workflow

```yaml
name: 🧪 Run Tests

on:
  pull_request:
    branches: [ master, main, dev ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install Dependencies
      run: npm ci
    
    - name: Run Tests
      run: npm test
```

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [SSH Action Documentation](https://github.com/appleboy/ssh-action)
- [Complete Deployment Guide](/DEPLOYMENT.md)

## 🐛 Troubleshooting

### Workflow fails at checkout
- Check repository permissions
- Verify branch exists

### Build fails
- Check build logs in GitHub Actions
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

### Deployment fails
- Verify GitHub secrets are set correctly
- Check SSH connectivity to server
- Verify server has required software (Node.js, PM2, Git)

### Health check fails
- Check PM2 process is running: `pm2 list`
- Verify API port is correct
- Check server logs: `pm2 logs nero`
- Ensure health endpoint exists in backend

## 🔐 Security Notes

1. **Never commit secrets** to the repository
2. Use GitHub Secrets for sensitive data
3. Use **SSH keys** instead of passwords (recommended)
4. Regularly rotate secrets and passwords
5. Use **least privilege** principle for SSH users
6. Enable **2FA** on GitHub account

## 📞 Support

For issues with GitHub Actions workflows:
1. Check the Actions tab in GitHub repository
2. Review workflow logs for specific errors
3. Consult [DEPLOYMENT.md](/DEPLOYMENT.md) for setup help
