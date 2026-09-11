from fastapi import APIRouter, HTTPException

from app.services.data_loader import DataLoader

router = APIRouter()


@router.get("/")
async def list_travel_modes():
    """List all available travel modes."""
    data = DataLoader.load_travel_modes()
    return data["modes"]


@router.get("/{mode_id}")
async def get_travel_mode(mode_id: str):
    """Get details for a specific travel mode."""
    try:
        return DataLoader.get_travel_mode(mode_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/categories")
async def list_categories():
    """List all travel mode categories."""
    return [
        {"id": "human_powered", "name": "Human-Powered", "description": "Walking, running, cycling"},
        {"id": "realistic", "name": "Realistic", "description": "Current technology"},
        {"id": "theoretical", "name": "Theoretical", "description": "Physics-compliant but unproven"},
        {"id": "absurd", "name": "Absurd", "description": "Comical but consistent"},
        {"id": "impossible", "name": "Impossible", "description": "Breaks physics entirely"}
    ]
