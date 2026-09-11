from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class MissionModifier(BaseModel):
    speed_override_km_h: Optional[float] = None
    active_hours_per_day: Optional[float] = None
    rest_days_per_week: Optional[float] = None
    cargo_mass_kg: Optional[float] = None
    unlimited_food: Optional[bool] = False
    unlimited_water: Optional[bool] = False
    unlimited_fuel: Optional[bool] = False
    no_rest: Optional[bool] = False
    broken_equipment: Optional[bool] = False
    random_events_enabled: Optional[bool] = True


class MissionRequest(BaseModel):
    origin_id: str
    destination_id: str
    travel_date: str
    mode_id: str
    crew_size: int = 1
    modifiers: Optional[MissionModifier] = None
    seed: Optional[int] = None


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


class MissionVerdict(BaseModel):
    classification: str  # SENSIBLE, DIFFICULT, EXTREME, ABSURD, IMPOSSIBLE
    score: float
    title: str
    summary: str


class ScaleComparisonItem(BaseModel):
    label: str
    value: float
    formatted_value: str
    unit: str


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
    verdict: Optional[MissionVerdict] = None
    scale_comparison: Optional[List[ScaleComparisonItem]] = []
    events: Optional[List[Dict[str, Any]]] = []
