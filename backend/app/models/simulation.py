from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class WhatIfScenario(BaseModel):
    origin_id: str
    destination_id: str
    travel_date: str
    mode_id: str
    crew_size: int
    modifications: Dict[str, Any]


class SimulationEvent(BaseModel):
    day: int
    event: str
    type: str
    severity: str


class SimulationResult(BaseModel):
    scenario_id: str
    baseline: Dict[str, Any]
    modified: Dict[str, Any]
    comparison: Dict[str, Any]
    outcome: str
    events: List[SimulationEvent]
    lessons_learned: List[str]
