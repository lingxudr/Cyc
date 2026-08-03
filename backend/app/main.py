from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Ensure workspace root and cypy-main are in python path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CYPY_DIR = os.path.abspath(os.path.join(ROOT_DIR, "cypy-main"))

for p in [ROOT_DIR, CYPY_DIR]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

from app.config import settings
from app.api.routes import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend service powering CYPY AI Manga Translator SaaS",
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "CYPY Web Engine",
        "version": settings.VERSION,
        "cypy_engine_available": os.path.exists(CYPY_DIR)
    }

