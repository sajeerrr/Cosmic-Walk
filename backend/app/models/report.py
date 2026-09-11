from pydantic import BaseModel
from typing import List, Optional


class TravelReviewRatings(BaseModel):
    comfort: str = ""
    speed: str = ""
    safety: str = ""
    convenience: str = ""
    ridiculousness: str = ""


class TravelReport(BaseModel):
    report_id: str

    # ── Rich AI narrative sections ──────────────────────────────────────────
    introduction: str = ""
    what_you_signed_up_for: str = ""
    travel_experience: str = ""
    daily_routine: str = ""

    # Resource stories
    food_story: str = ""
    water_story: str = ""
    footwear_story: str = ""

    # Fun sections
    boredom_index: str = ""
    things_you_will_miss: List[str] = []
    things_you_will_see: List[str] = []
    cosmic_problems: List[str] = []
    packing_list: List[str] = []
    travel_advice: List[str] = []
    survival_guide: str = ""
    generational_impact: str = ""
    arrival_scenario: str = ""

    # Review and conclusion
    travel_review: Optional[TravelReviewRatings] = None
    fictional_insurance: str = ""
    customer_review: str = ""
    final_verdict: str = ""

    # ── Legacy fields (kept for backwards compatibility) ────────────────────
    mission_summary: str = ""
    journey_narrative: str = ""
    crew_log: List[str] = []
    highlights: List[str] = []
    warnings: List[str] = []
    recommendations: str = ""
    fun_rating: float = 7.0


class ReportRequest(BaseModel):
    origin_id: str
    destination_id: str
    travel_date: str
    mode_id: str
    crew_size: int = 1
    # Optional passenger data for personalisation
    passenger_name: Optional[str] = "Commander"
    passenger_age: Optional[int] = 30
    passenger_height_cm: Optional[float] = 175.0
    passenger_weight_kg: Optional[float] = 70.0
    passenger_sex: Optional[str] = "Unspecified"
