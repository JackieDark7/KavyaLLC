# Kavya LLC — Website

## Deploy to Vercel

### Option A: GitHub (Recommended)
1. Create a new GitHub repo
2. Push this folder to it:
   ```
   cd kavya-site
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. Go to **vercel.com** → "Add New Project" → Import your GitHub repo
4. Vercel auto-detects Vite — just click **Deploy**
5. Done! Your site is live.

### Option B: Vercel CLI
1. Install: `npm i -g vercel`
2. Run inside this folder:
   ```
   npm install
   vercel
   ```
3. Follow the prompts — it deploys automatically.

## Local Development
```
npm install
npm run dev
```
Opens at http://localhost:5173

## Custom Domain
In Vercel dashboard → your project → Settings → Domains → add your domain (e.g. kavyallc.com)
