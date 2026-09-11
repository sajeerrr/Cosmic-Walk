"""Tests for ridiculousness scoring."""
import pytest

from app.services.mission_calculator import MissionCalculator


def test_ridiculousness_score_range():
    """Ridiculousness score should be between 0 and 100."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "chemical_rocket", 4
    )

    assert 0 <= mission["ridiculousness"]["score"] <= 100


def test_walking_to_mars_is_ridiculous():
    """Walking to Mars should have high ridiculousness."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "walk", 1
    )

    assert mission["ridiculousness"]["score"] > 70
    assert mission["ridiculousness"]["rating"] in ["Absurd", "Maximum Chaos"]


def test_chemical_rocket_is_sensible():
    """Chemical rocket should be relatively sensible."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "chemical_rocket", 4
    )

    assert mission["ridiculousness"]["score"] < 50


def test_impossible_modes_are_ridiculous():
    """Impossible travel modes should have high ridiculousness."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "teleportation", 1
    )

    assert mission["ridiculousness"]["score"] > 60


def test_ridiculousness_includes_fun_facts():
    """Ridiculousness should include fun facts."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "walk", 1
    )

    assert "fun_facts" in mission["ridiculousness"]
    assert len(mission["ridiculousness"]["fun_facts"]) > 0


def test_cosmic_hitchhiking_is_maximum_chaos():
    """Cosmic hitchhiking should be maximum chaos."""
    mission = MissionCalculator.calculate_mission(
        "earth", "mars", "2024-06-15", "cosmic_hitchhiking", 1
    )

    assert mission["ridiculousness"]["score"] > 60
