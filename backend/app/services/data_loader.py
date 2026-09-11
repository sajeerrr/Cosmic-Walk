import json
from pathlib import Path
from typing import Dict, Any, Optional, List


class DataLoader:
    """Load and cache static data from JSON files."""

    _planets_cache: Optional[Dict[str, Any]] = None
    _celestial_objects_cache: Optional[Dict[str, Any]] = None
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
    def load_celestial_objects(cls) -> Dict[str, Any]:
        """Load celestial objects data from JSON."""
        if cls._celestial_objects_cache is None:
            path = cls._get_data_path() / "celestial_objects.json"
            if path.exists():
                with open(path, encoding="utf-8") as f:
                    cls._celestial_objects_cache = json.load(f)
            else:
                # Fallback to planets.json
                planets = cls.load_planets()["planets"]
                cls._celestial_objects_cache = {"celestial_objects": planets}
        return cls._celestial_objects_cache

    @classmethod
    def load_travel_modes(cls) -> Dict[str, Any]:
        """Load travel modes data from JSON."""

        path = cls._get_data_path() / "travel_modes.json"
        with open(path, encoding="utf-8") as f:
            cls._travel_modes_cache = json.load(f)
        return cls._travel_modes_cache

    @classmethod
    def get_celestial_object(cls, object_id: str) -> Dict[str, Any]:
        """Get a specific celestial object by ID."""
        obj_id = object_id.lower().strip()
        objects = cls.load_celestial_objects().get("celestial_objects", [])
        for obj in objects:
            if obj["id"].lower() == obj_id:
                return obj
        # Fallback search in planets
        try:
            return cls.get_planet(obj_id)
        except ValueError:
            raise ValueError(f"Celestial object '{object_id}' not found")

    @classmethod
    def get_planet(cls, planet_id: str) -> Dict[str, Any]:
        """Get a specific planet by ID."""
        pid = planet_id.lower().strip()
        planets = cls.load_planets()["planets"]
        for planet in planets:
            if planet["id"].lower() == pid:
                return planet
        # Fallback to celestial objects
        objects = cls.load_celestial_objects().get("celestial_objects", [])
        for obj in objects:
            if obj["id"].lower() == pid:
                return obj
        raise ValueError(f"Planet '{planet_id}' not found")

    @classmethod
    def get_travel_mode(cls, mode_id: str) -> Dict[str, Any]:
        """Get a specific travel mode by ID."""
        mid = mode_id.lower().strip()
        modes = cls.load_travel_modes()["modes"]
        for mode in modes:
            if mode["id"].lower() == mid:
                return mode
        raise ValueError(f"Travel mode '{mode_id}' not found")
