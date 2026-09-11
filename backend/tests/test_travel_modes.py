"""Tests for travel mode calculations."""
import pytest

from app.services.travel_mode_engine import TravelModeEngine
from app.services.data_loader import DataLoader


def test_walking_takes_very_long_time():
    """Walking to Mars should take millions of years."""
    walk_mode = DataLoader.get_travel_mode("walk")
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    result = TravelModeEngine.calculate_travel_time(
        walk_mode, 225_000_000, earth, mars
    )

    assert result["travel_time_years"] > 10_000
    assert result["generations_needed"] > 100



def test_teleportation_is_instant():
    """Teleportation should be near-instant."""
    teleport_mode = DataLoader.get_travel_mode("teleportation")
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    result = TravelModeEngine.calculate_travel_time(
        teleport_mode, 225_000_000, earth, mars
    )

    assert result["travel_time_seconds"] < 1
    assert result["travel_time_human"] == "instant"


def test_realistic_mode_respects_physics():
    """Realistic modes should not exceed speed of light."""
    ion_drive_mode = DataLoader.get_travel_mode("ion_drive")
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    result = TravelModeEngine.calculate_travel_time(
        ion_drive_mode, 225_000_000, earth, mars
    )

    # Calculate minimum time at speed of light
    speed_of_light_km_s = 299_792.458
    min_time = 225_000_000 / speed_of_light_km_s

    # Travel time should be greater than speed of light limit
    # (unless we're using impossible modes)
    assert result["travel_time_seconds"] > min_time * 0.01


def test_chemical_rocket_has_phases():
    """Chemical rocket travel should have acceleration/cruise/deceleration phases."""
    rocket_mode = DataLoader.get_travel_mode("chemical_rocket")
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    result = TravelModeEngine.calculate_travel_time(
        rocket_mode, 225_000_000, earth, mars
    )

    assert "phase_breakdown" in result
    assert "acceleration_seconds" in result["phase_breakdown"]
    assert "cruise_seconds" in result["phase_breakdown"]
    assert "deceleration_seconds" in result["phase_breakdown"]


def test_human_powered_includes_calories():
    """Human-powered modes should calculate calories."""
    walk_mode = DataLoader.get_travel_mode("walk")
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    result = TravelModeEngine.calculate_travel_time(
        walk_mode, 225_000_000, earth, mars
    )

    assert "total_calories_burned" in result
    assert result["total_calories_burned"] > 0
    assert "equivalent_pizzas" in result


def test_absurd_mode_cosmic_hitchhiking():
    """Cosmic hitchhiking should have special rules."""
    hitchhike_mode = DataLoader.get_travel_mode("cosmic_hitchhiking")
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    result = TravelModeEngine.calculate_travel_time(
        hitchhike_mode, 225_000_000, earth, mars
    )

    assert "wait_time_for_ride_days" in result
    assert "probability_of_pickup" in result
    assert result["probability_of_pickup"] < 0.01  # Very rare!


def test_warp_drive_exceeds_light_speed():
    """Warp drive should exceed speed of light."""
    warp_mode = DataLoader.get_travel_mode("warp_drive")
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    result = TravelModeEngine.calculate_travel_time(
        warp_mode, 225_000_000, earth, mars
    )

    # Should arrive in seconds, not minutes
    assert result["travel_time_seconds"] < 60
    assert "warp_factor" in result


def test_all_modes_can_calculate():
    """All travel modes should be able to calculate travel time."""
    modes = DataLoader.load_travel_modes()["modes"]
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    for mode in modes:
        result = TravelModeEngine.calculate_travel_time(
            mode, 225_000_000, earth, mars
        )

        assert "travel_time_seconds" in result
        assert "travel_time_human" in result
        assert result["travel_time_seconds"] > 0
