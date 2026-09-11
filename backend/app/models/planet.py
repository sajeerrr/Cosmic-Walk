from pydantic import BaseModel
from typing import Dict, List


class Planet(BaseModel):
    id: str
    name: str
    mass_kg: float
    radius_km: float
    semi_major_axis_au: float
    eccentricity: float
    orbital_period_days: float
    rotation_period_hours: float
    avg_temp_celsius: float
    gravity_m_s2: float
    atmosphere_composition: Dict[str, float]
    moons_count: int
    description: str
    fun_facts: List[str]


class PlanetPosition(BaseModel):
    planet_id: str
    date: str
    x_au: float
    y_au: float
    z_au: float
    distance_from_sun_au: float
