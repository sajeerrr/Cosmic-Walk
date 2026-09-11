from pydantic import BaseModel
from typing import Dict, Any
from enum import Enum


class ChallengeDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    IMPOSSIBLE = "impossible"
    RIDICULOUS = "ridiculous"


class Challenge(BaseModel):
    challenge_id: str
    title: str
    description: str
    origin_id: str
    destination_id: str
    mode_id: str
    constraints: Dict[str, Any]
    difficulty: ChallengeDifficulty
    time_limit_seconds: float
    cost_limit_usd: float
    success_criteria: Dict[str, bool]
    fun_description: str
    reward: str
