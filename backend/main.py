"""Vercel entrypoint for the FastAPI backend.

Vercel's Python runtime looks for a top-level `app` in `main.py` and routes
requests to it. The actual application lives in `app/main.py`.
"""

from app.main import app

__all__ = ["app"]
