# Deployment Guide

The app is deployed entirely on Vercel:

| Part | Project | Root directory | URL |
|------|---------|----------------|-----|
| React frontend (Vite) | `adaptive-learning` | `frontend/` | https://adaptive-learning-ten-beta.vercel.app |
| FastAPI backend | `adaptive-learning-api` | `backend/` | https://adaptive-learning-api.vercel.app |

The frontend reads `VITE_API_URL` at build time; it is set to the backend URL in
the Vercel project settings for Production, Preview, and Development.

---

## Deploy with the Vercel CLI

### Backend

Vercel detects FastAPI from `backend/requirements.txt` and loads the top-level
`app` from `backend/main.py`, which re-exports the app from `backend/app/main.py`.
Every request is routed to that ASGI app.

```bash
cd backend
npx vercel link --project adaptive-learning-api
npx vercel deploy --prod
```

### Frontend

```bash
cd frontend
npx vercel link --project adaptive-learning
npx vercel env add VITE_API_URL \
  --value https://adaptive-learning-api.vercel.app \
  -e production -e preview -e development -y
npx vercel deploy --prod
```

`frontend/vercel.json` rewrites unknown routes to `index.html` so React Router
deep links work.

---

## CORS

The backend allows these origins by default:

- `http://localhost:3000`, `http://localhost:5173`
- Every `https://*.vercel.app` origin (including preview deployments)

For a custom domain, set `CORS_ORIGINS` on the Render/Vercel service to a
comma-separated list of origins.

---

## Verify

```bash
curl https://adaptive-learning-api.vercel.app/api/health
curl https://adaptive-learning-api.vercel.app/api/learners
```

API docs: https://adaptive-learning-api.vercel.app/docs

> **Note:** the demo data lives in process memory. Serverless functions can
> scale to multiple instances, so quiz/priority updates may not be visible
> across every request. For a persistent demo, use a hosted database.

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

Production preview locally:

```bash
cd frontend
npm run build
npm run preview              # http://localhost:4173
```

---

## Optional: Render instead of Vercel for the backend

`render.yaml` at the repo root defines a free Python web service:

1. https://dashboard.render.com/blueprints → **New Blueprint Instance**
2. Connect `rihaanps-hash/adaptive-learning` and apply
3. Set `VITE_API_URL` in Vercel to the Render service URL and redeploy

Render keeps a single long-running process, so demo state persists between
requests (free instances sleep after inactivity).
