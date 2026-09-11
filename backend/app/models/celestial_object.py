from enum import Enum
from pydantic import BaseModel
from typing import Dict, List, Optional


class CelestialType(str, Enum):
    STAR = "star"
    PLANET = "planet"
    DWARF_PLANET = "dwarf_planet"
    MOON = "moon"
    ASTEROID = "asteroid"
    COMET = "comet"
    OTHER = "other"


class CelestialObject(BaseModel):
    id: str
    name: str
    type: CelestialType = CelestialType.PLANET
    primary_body_id: Optional[str] = None
    mass_kg: float
    radius_km: float
    semi_major_axis_au: float
    eccentricity: float
    orbital_period_days: float
    rotation_period_hours: float
    avg_temp_celsius: float
    gravity_m_s2: float
    atmosphere_composition: Optional[Dict[str, float]] = {}
    moons_count: Optional[int] = 0
    description: str
    fun_facts: Optional[List[str]] = []
