from pydantic import BaseModel
from typing import List


class TravelReport(BaseModel):
    report_id: str
    mission_summary: str
    journey_narrative: str
    crew_log: List[str]
    highlights: List[str]
    warnings: List[str]
    recommendations: str
    fun_rating: float


class ReportRequest(BaseModel):
    origin_id: str
    destination_id: str
    travel_date: str
    mode_id: str
    crew_size: int = 1
