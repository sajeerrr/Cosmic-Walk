from fastapi import APIRouter, HTTPException
from datetime import date, datetime

from app.services.data_loader import DataLoader
from app.services.astronomy_engine import AstronomyEngine

router = APIRouter()


@router.get("/")
async def list_planets():
    """List all available planets."""
    data = DataLoader.load_planets()
    return data["planets"]


@router.get("/{planet_id}")
async def get_planet(planet_id: str):
    """Get details for a specific planet."""
    try:
        return DataLoader.get_planet(planet_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{planet_id}/position")
async def get_planet_position(planet_id: str, date_str: str = None):
    """Get planet position at a specific date (YYYY-MM-DD format)."""
    try:
        planet = DataLoader.get_planet(planet_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    if date_str:
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD."
            )
    else:
        target_date = date.today()

    return AstronomyEngine.get_planet_position(planet_id, target_date)
