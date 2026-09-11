"""Tests for difficulty scoring."""
import pytest

from app.services.difficulty_engine import DifficultyEngine
from app.services.mission_calculator import MissionCalculator


def test_difficulty_score_range():
    """Difficulty score should be between 0 and 100."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "chemical_rocket", 4
    )

    assert 0 <= mission["difficulty"]["score"] <= 100


def test_walking_to_mars_is_hard():
    """Walking to Mars should be extremely difficult."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "walk", 1
    )

    assert mission["difficulty"]["score"] > 50



def test_teleportation_is_easy():
    """Teleportation should be easy in terms of difficulty."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "teleportation", 1
    )

    # Low difficulty score (though absurdity is high)
    assert mission["difficulty"]["score"] < 40


def test_earth_to_moon_easier_than_earth_to_pluto():
    """Shorter distance should be easier."""
    # Note: We don't have moon in our data, so comparing Earth-Mars vs Earth-Pluto
    mars_mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "chemical_rocket", 4
    )

    pluto_mission = MissionCalculator.calculate_mission(
        "earth", "pluto", "2024-06-15", "chemical_rocket", 4
    )

    assert pluto_mission["difficulty"]["score"] > mars_mission["difficulty"]["score"]


def test_difficulty_factors():
    """Difficulty should include factor breakdown."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "chemical_rocket", 4
    )

    assert "factors" in mission["difficulty"]
    assert "distance" in mission["difficulty"]["factors"]
    assert "travel_time" in mission["difficulty"]["factors"]
