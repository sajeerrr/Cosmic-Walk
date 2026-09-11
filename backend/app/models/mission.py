from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class MissionRequest(BaseModel):
    origin_id: str
    destination_id: str
    travel_date: str
    mode_id: str
    crew_size: int = 1


class TravelTimeResult(BaseModel):
    travel_time_seconds: float
    travel_time_days: float
    travel_time_years: float
    travel_time_human: str
    max_speed_reached_km_s: Optional[float] = None
    phase_breakdown: Optional[Dict[str, float]] = None


class ResourcesResult(BaseModel):
    life_support: Dict[str, float]
    propulsion: Dict[str, Any]
    total_mass_kg: float
    safety_margin_percent: float
    per_crew_member: Dict[str, float]


class CostBreakdown(BaseModel):
    launch_cost_usd: float
    fuel_cost_usd: float
    crew_cost_usd: float
    spacecraft_rental_usd: float
    mission_control_usd: float
    insurance_usd: float
    exotic_fees_usd: float
    contingency_usd: float
    total_usd: float


class DifficultyAssessment(BaseModel):
    score: float
    rating: str
    factors: Dict[str, float]
    description: str


class RidiculousnessAssessment(BaseModel):
    score: float
    rating: str
    factors: Dict[str, float]
    fun_facts: List[str]


class MissionResult(BaseModel):
    origin: Dict[str, Any]
    destination: Dict[str, Any]
    mode: Dict[str, Any]
    travel_date: str
    distance_km: float
    distance_au: float
    light_minutes: float
    travel_time: TravelTimeResult
    crew_size: int
    resources: ResourcesResult
    cost: CostBreakdown
    difficulty: DifficultyAssessment
    ridiculousness: RidiculousnessAssessment
