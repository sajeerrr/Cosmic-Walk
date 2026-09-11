from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import planets, travel_modes, missions

app = FastAPI(
    title=settings.app_name,
    description="Interplanetary travel simulator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(planets.router, prefix="/api/v1/planets", tags=["planets"])
app.include_router(travel_modes.router, prefix="/api/v1/travel-modes", tags=["travel-modes"])
app.include_router(missions.router, prefix="/api/v1/missions", tags=["missions"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cosmicwalk-api"}
