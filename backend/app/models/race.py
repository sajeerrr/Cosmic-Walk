from pydantic import BaseModel
from typing import List, Dict, Any


class RaceParticipant(BaseModel):
    mode_id: str
    name: str


class RaceRequest(BaseModel):
    origin_id: str
    destination_id: str
    travel_date: str
    participants: List[RaceParticipant]


class ParticipantResult(BaseModel):
    mode_id: str
    mode_name: str
    travel_time_seconds: float
    travel_time_human: str
    cost_usd: float
    difficulty: str
    survival_probability: float


class RaceResult(BaseModel):
    race_id: str
    origin: str
    destination: str
    date: str
    participants: List[Dict[str, Any]]
    winner: Dict[str, Any]
    time_differences: Dict[str, str]
    fun_commentary: str
