# Deployment Guide

This project deploys as two services:

| Part | Host | Config |
|------|------|--------|
| React frontend (Vite) | Vercel | `frontend/vercel.json` |
| FastAPI backend | Render | `render.yaml` |

The frontend reads the backend URL from `VITE_API_URL` at build time, so set it
**before** the production build.

---

## 1. Push to GitHub

```bash
cd adaptive-learning
git add .
git commit -m "Update deployment config"
git push origin main
```

Repository: https://github.com/rihaanps-hash/adaptive-learning

---

## 2. Deploy the backend (Render)

1. Open https://dashboard.render.com/blueprints
2. **New Blueprint Instance** → connect the GitHub repo
3. Apply the blueprint. Render reads `render.yaml` and creates:
   - Service: `adaptive-learning-api`
   - Root directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Wait for the service to go live, then note its URL, e.g.
   `https://adaptive-learning-api.onrender.com`

Verify:

```bash
curl https://YOUR-SERVICE.onrender.com/api/health
```

CORS already allows `http://localhost:3000`, `http://localhost:5173`, and every
`https://*.vercel.app` origin. To allow a custom domain, set `CORS_ORIGINS` on
the Render service to a comma-separated list of origins.

> Render's free plan sleeps after inactivity, so the first request may take
> 30–60 seconds.

---

## 3. Deploy the frontend (Vercel)

```bash
cd frontend
npx vercel login
npx vercel link --project adaptive-learning
npx vercel env add VITE_API_URL production
# paste https://YOUR-SERVICE.onrender.com when prompted
npx vercel --prod
```

Repeat `vercel env add VITE_API_URL preview` if you want preview deployments to
use the hosted API.

`frontend/vercel.json` rewrites all routes to `index.html` so React Router deep
links work.

---

## Environment variables

| Where | Name | Value |
|-------|------|-------|
| Vercel (build) | `VITE_API_URL` | `https://YOUR-SERVICE.onrender.com` |
| Render (runtime) | `CORS_ORIGINS` | optional custom origins, comma-separated |
| Render (runtime) | `PORT` | set automatically by Render |

---

## Verify the deployment

1. Frontend: `https://your-app.vercel.app`
2. Backend health: `https://YOUR-SERVICE.onrender.com/api/health`
3. API docs: `https://YOUR-SERVICE.onrender.com/docs`

---

## Local development

```bash
# Terminal 1 - backend
cd backend
venv\Scripts\activate        # Windows
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - frontend
cd frontend
npm install
npm run dev                  # http://localhost:3000, proxies /api to :8000
```

Production build:

```bash
cd frontend
npm run build
npm run preview              # http://localhost:4173
```
