import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base, SessionLocal
from backend.app.services.seed_service import seed_demo_learners
from backend.app.services.role_service import load_roles
from backend.app.routers import (
    learners,
    roles,
    analysis,
    roadmap,
    replan,
    progress,
    demo
)

# Application Lifespan: DB migration and initial seeding
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create SQLite database tables if not existing
    Base.metadata.create_all(bind=engine)
    
    # Pre-cache role framework definitions
    load_roles()
    
    # Seed Demo Learners (Jordan Miller & Alex Chen)
    db = SessionLocal()
    try:
        seed_demo_learners(db)
    finally:
        db.close()
        
    yield

app = FastAPI(
    title="Your AI Career Navigator API",
    description=(
        "Localhost API for skill framework gap analysis, staged weekly roadmapping, "
        "evidence tracking, and replanning.\n\n"
        "**Persistent Disclaimer**: This tool provides guidance, not guarantees. It cannot "
        "promise employment, and its assessments are estimates, not measures of your worth or potential."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register sub-routers
app.include_router(learners.router)
app.include_router(roles.router)
app.include_router(analysis.router)
app.include_router(roadmap.router)
app.include_router(replan.router)
app.include_router(progress.router)
app.include_router(demo.router)

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "AI Career Navigator API",
        "version": "1.0.0",
        "disclaimer": "This tool provides guidance, not guarantees. It cannot promise employment, and its assessments are estimates, not measures of your worth or potential."
    }

# Link & serve Frontend directly from FastAPI
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_frontend(full_path: str):
        if full_path in ("docs", "openapi.json", "redoc") or full_path.startswith(("docs/", "redoc/")):
            return None
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": "Welcome to Your AI Career Navigator API",
            "docs_url": "/docs",
            "disclaimer": "This tool provides guidance, not guarantees. It cannot promise employment, and its assessments are estimates, not measures of your worth or potential."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8001, reload=True)


