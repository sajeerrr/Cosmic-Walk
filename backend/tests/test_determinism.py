"""Tests for determinism - same inputs should always produce same outputs."""
import pytest
from datetime import date

from app.services.mission_calculator import MissionCalculator
from app.services.astronomy_engine import AstronomyEngine
from app.services.distance_engine import DistanceEngine


def test_full_mission_is_deterministic():
    """Same mission inputs should produce identical outputs."""
    request = {
        "origin_id": "earth",
        "destination_id": "mars",
        "travel_date": "2024-06-15",
        "mode_id": "ion_drive",
        "crew_size": 4
    }

    result1 = MissionCalculator.calculate_mission(**request)
    result2 = MissionCalculator.calculate_mission(**request)

    assert result1["distance_km"] == pytest.approx(result2["distance_km"])
    assert result1["travel_time"]["travel_time_days"] == pytest.approx(
        result2["travel_time"]["travel_time_days"]
    )
    assert result1["cost"]["total_usd"] == pytest.approx(result2["cost"]["total_usd"])


def test_planet_positions_are_deterministic():
    """Same planet and date should give same position."""
    pos1 = AstronomyEngine.get_planet_position("jupiter", date(2025, 3, 15))
    pos2 = AstronomyEngine.get_planet_position("jupiter", date(2025, 3, 15))

    assert pos1 == pos2


def test_distances_are_deterministic():
    """Same planets and date should give same distance."""
    dist1 = DistanceEngine.get_interplanetary_distance(
        "venus", "neptune", date(2024, 12, 1)
    )
    dist2 = DistanceEngine.get_interplanetary_distance(
        "venus", "neptune", date(2024, 12, 1)
    )

    assert dist1 == dist2


def test_difficulty_is_deterministic():
    """Same mission parameters should give same difficulty."""
    mission1 = MissionCalculator.calculate_mission(
        "earth", "pluto", "2024-01-01", "fusion_drive", 10
    )
    mission2 = MissionCalculator.calculate_mission(
        "earth", "pluto", "2024-01-01", "fusion_drive", 10
    )

    assert mission1["difficulty"]["score"] == mission2["difficulty"]["score"]
    assert mission1["difficulty"]["rating"] == mission2["difficulty"]["rating"]


def test_cost_is_deterministic():
    """Same mission parameters should give same cost."""
    mission1 = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "chemical_rocket", 4
    )
    mission2 = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "chemical_rocket", 4
    )

    assert mission1["cost"]["total_usd"] == mission2["cost"]["total_usd"]
