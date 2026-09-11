from pydantic import BaseModel
from enum import Enum
from typing import Dict, Any


class TravelCategory(str, Enum):
    HUMAN_POWERED = "human_powered"
    REALISTIC = "realistic"
    THEORETICAL = "theoretical"
    ABSURD = "absurd"
    IMPOSSIBLE = "impossible"


class TravelMode(BaseModel):
    id: str
    name: str
    category: TravelCategory
    description: str
    max_speed_km_s: float
    average_speed_km_s: float
    acceleration_m_s2: float
    fuel_type: str
    fuel_efficiency: float
    crew_capacity_min: int
    crew_capacity_max: int
    failure_rate: float
    cost_per_km_usd: float
    special_rules: Dict[str, Any]
    fun_description: str
