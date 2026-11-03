# Deployment Guide

## Quick Deploy Commands

### 1. Push to GitHub
```bash
cd C:\Users\Rihaan\adaptive-learning
git init
git add .
git commit -m "Adaptive Learning Platform - Hackathon MVP"
# Create repo at https://github.com/new first, then:
git remote add origin https://github.com/YOUR_USERNAME/adaptive-learning.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend to Railway (Recommended)
```bash
npm install -g @railway/cli
cd C:\Users\Rihaan\adaptive-learning\backend
railway login
railway init
railway up
```
**Save the Railway URL** (e.g., `https://adaptive-learning-backend.up.railway.app`)

### 3. Deploy Frontend to Vercel
```bash
cd C:\Users\Rihaan\adaptive-learning\frontend
npm install -g vercel
vercel
```
When prompted:
- Set up and deploy? **Yes**
- Scope: **Your account**
- Link to existing project? **No**
- Project name: `adaptive-learning`
- Directory: `./`
- Override settings? **No**

### 4. Add Backend URL to Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://YOUR-RAILWAY-URL.up.railway.app`
   - **Environments:** Production, Preview, Development
3. Click **Save**

### 5. Redeploy Frontend
```bash
cd C:\Users\Rihaan\adaptive-learning\frontend
vercel --prod
```

---

## Alternative Backend Hosting Options

### Render (Free Tier)
1. Go to https://render.com → New Web Service
2. Connect GitHub repo
3. Root directory: `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `python -m app.main`
6. Add env var: `PORT=8000`

### Fly.io
```bash
cd C:\Users\Rihaan\adaptive-learning\backend
fly launch
fly deploy
```

### PythonAnywhere (Free Tier)
1. Create account at pythonanywhere.com
2. Upload backend folder
3. Create virtualenv, install requirements
4. Configure Web App (manual config)

---

## Environment Variables

### Backend (.env)
```env
# Optional - for production
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

### Frontend (Vercel Dashboard)
| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_URL` | `https://your-backend.railway.app` | Production, Preview, Development |

---

## Verify Deployment

1. **Frontend:** https://your-app.vercel.app
2. **Backend Health:** https://your-backend.railway.app/api/health
3. **API Docs:** https://your-backend.railway.app/docs

---

## Troubleshooting

### CORS Errors
Add your Vercel URL to backend CORS:
```python
# In backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Not Found
- Check `VITE_API_URL` is set correctly in Vercel
- Redeploy frontend after adding env var: `vercel --prod`

### Build Fails
- Ensure all imports use the new `api` utility
- Run `npm run build` locally first

---

## Local Development After Deployment

```bash
# Terminal 1 - Backend
cd backend
.\venv\Scripts\activate
python -m app.main

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:3000 (proxies to localhost:8000)
Production: Uses `VITE_API_URL` from environment

---

## File Structure for Deployment

```
adaptive-learning/
├── backend/
│   ├── app/main.py          # FastAPI app
│   ├── requirements.txt     # Python deps
│   └── venv/                # Local only
├── frontend/
│   ├── src/
│   │   ├── lib/api.js       # API utility (uses VITE_API_URL)
│   │   ├── pages/*.jsx      # All pages use api utility
│   │   └── context/*.jsx    # Context uses api utility
│   ├── vite.config.js       # Uses VITE_API_URL
│   ├── package.json
│   └── dist/                # Build output (auto-generated)
├── .gitignore
└── README.md
```

---

## One-Command Deploy Script (Optional)

Create `deploy.sh`:
```bash
#!/bin/bash
# Deploy to Railway + Vercel
cd backend && railway up
cd ../frontend && vercel --prod
```

Run: `chmod +x deploy.sh && ./deploy.sh`