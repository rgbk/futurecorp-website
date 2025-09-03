# GitHub Setup for Future Corp Website

## Repository Setup

1. **Create GitHub Repository**
   ```bash
   # Go to GitHub and create a new repository named: future-corp-website
   # Make it public for GitHub Pages
   # Don't initialize with README (we already have one)
   ```

2. **Link Local Repository**
   ```bash
   cd /Users/marckremers/DevZone/work/future-corp
   git remote add origin https://github.com/YOUR_USERNAME/future-corp-website.git
   git add .
   git commit -m "Initial commit: Professional Future Corp website"
   git branch -M main
   git push -u origin main
   ```

## GitHub Pages Configuration

### Repository Settings
1. Go to **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` (will be created by GitHub Actions)
4. **Custom domain**: `futurecorp.paris`

### Domain Configuration
1. Add `CNAME` file to repository root with `futurecorp.paris`
2. Update DNS at Gandi:

| Type | Name | Value |
|------|------|-------|
| CNAME | www | YOUR_USERNAME.github.io |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

## GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10.15.0
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run tests
      run: pnpm test
    
    - name: Build
      run: pnpm build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        cname: futurecorp.paris
```

## Repository Structure

```
future-corp-website/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   └── CNAME            # Contains: futurecorp.paris
├── src/
├── CNAME                # Root CNAME file
├── README.md
├── SPECS.md
└── package.json
```

## Next Steps

1. **Replace YOUR_USERNAME** with your GitHub username
2. **Create the repository** on GitHub
3. **Push the initial commit**
4. **Configure GitHub Pages**
5. **Update DNS settings**

The site will be live at `futurecorp.paris` within minutes of DNS propagation!
