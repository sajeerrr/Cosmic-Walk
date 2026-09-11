import json
from pathlib import Path
from typing import Dict, Any, Optional


class DataLoader:
    """Load and cache static data from JSON files."""

    _planets_cache: Optional[Dict[str, Any]] = None
    _travel_modes_cache: Optional[Dict[str, Any]] = None

    @classmethod
    def _get_data_path(cls) -> Path:
        return Path(__file__).parent.parent / "data"

    @classmethod
    def load_planets(cls) -> Dict[str, Any]:
        """Load planets data from JSON."""
        if cls._planets_cache is None:
            path = cls._get_data_path() / "planets.json"
            with open(path, encoding="utf-8") as f:
                cls._planets_cache = json.load(f)
        return cls._planets_cache

    @classmethod
    def load_travel_modes(cls) -> Dict[str, Any]:
        """Load travel modes data from JSON."""
        if cls._travel_modes_cache is None:
            path = cls._get_data_path() / "travel_modes.json"
            with open(path, encoding="utf-8") as f:
                cls._travel_modes_cache = json.load(f)
        return cls._travel_modes_cache

    @classmethod
    def get_planet(cls, planet_id: str) -> Dict[str, Any]:
        """Get a specific planet by ID."""
        planets = cls.load_planets()["planets"]
        for planet in planets:
            if planet["id"] == planet_id:
                return planet
        raise ValueError(f"Planet '{planet_id}' not found")

    @classmethod
    def get_travel_mode(cls, mode_id: str) -> Dict[str, Any]:
        """Get a specific travel mode by ID."""
        modes = cls.load_travel_modes()["modes"]
        for mode in modes:
            if mode["id"] == mode_id:
                return mode
        raise ValueError(f"Travel mode '{mode_id}' not found")
