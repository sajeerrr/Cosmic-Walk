from fastapi import APIRouter, HTTPException
from datetime import date, datetime
from typing import Optional

from app.services.data_loader import DataLoader
from app.services.astronomy_engine import AstronomyEngine

router = APIRouter()


@router.get("/")
async def list_celestial_objects():
    """List all available celestial objects (stars, planets, dwarf planets, moons, comets, asteroids)."""
    data = DataLoader.load_celestial_objects()
    return data["celestial_objects"]


@router.get("/{object_id}")
async def get_celestial_object(object_id: str):
    """Get details for a specific celestial object."""
    try:
        return DataLoader.get_celestial_object(object_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{object_id}/position")
async def get_celestial_object_position(object_id: str, date_str: Optional[str] = None):
    """Get celestial object position at a specific date (YYYY-MM-DD format)."""
    try:
        obj = DataLoader.get_celestial_object(object_id)
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

    return AstronomyEngine.get_celestial_object_position(object_id, target_date)
