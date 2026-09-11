from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import List

from app.models.mission import MissionRequest, MissionResult
from app.models.simulation import WhatIfScenario, SimulationResult
from app.models.race import RaceRequest, RaceResult
from app.models.challenge import Challenge, ChallengeDifficulty
from app.models.report import ReportRequest, TravelReport
from app.services.mission_calculator import MissionCalculator
from app.services.distance_engine import DistanceEngine
from app.services.simulation_engine import SimulationEngine
from app.services.race_engine import RaceEngine
from app.services.challenge_engine import ChallengeEngine
from app.services.ai_report_engine import AIReportEngine

router = APIRouter()


@router.post("/calculate")
async def calculate_mission(request: MissionRequest):
    """
    Calculate a complete mission.

    Returns distance, travel time, resources, cost, difficulty, and ridiculousness.
    """
    try:
        result = MissionCalculator.calculate_mission(
            request.origin_id,
            request.destination_id,
            request.travel_date,
            request.mode_id,
            request.crew_size
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/distance")
async def calculate_distance(origin_id: str, destination_id: str, travel_date: str):
    """Calculate distance between two planets at a specific date."""
    try:
        date_obj = datetime.strptime(travel_date, "%Y-%m-%d").date()
        return DistanceEngine.get_interplanetary_distance(
            origin_id, destination_id, date_obj
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/simulate", response_model=SimulationResult)
async def simulate_mission(scenario: WhatIfScenario):
    """
    Run a what-if mission simulation.

    Allows exploring modified scenarios with events and outcomes.
    """
    try:
        result = SimulationEngine.run_what_if(scenario)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/race")
async def run_race(request: RaceRequest):
    """
    Run a race between multiple travel modes.

    Compare different travel modes racing to the same destination.
    """
    try:
        result = RaceEngine.run_race(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/challenge", response_model=Challenge)
async def get_challenge(difficulty: str = "medium"):
    """
    Generate a random travel challenge.

    Optional difficulty: easy, medium, hard, impossible, ridiculous
    """
    try:
        valid_difficulties = ["easy", "medium", "hard", "impossible", "ridiculous"]
        if difficulty not in valid_difficulties:
            difficulty = "medium"
        result = ChallengeEngine.generate_challenge(difficulty)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report", response_model=TravelReport)
async def generate_report(request: ReportRequest):
    """
    Generate an AI-powered travel report.

    Creates an engaging narrative about the mission journey.
    Note: Requires ANTHROPIC_API_KEY for full reports, otherwise generates mock reports.
    """
    try:
        engine = AIReportEngine()
        result = await engine.generate_report(
            request.origin_id,
            request.destination_id,
            request.travel_date,
            request.mode_id,
            request.crew_size
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
