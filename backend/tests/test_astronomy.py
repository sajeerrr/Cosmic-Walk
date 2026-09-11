"""Tests for astronomy calculations."""
import pytest
from datetime import date

from app.services.astronomy_engine import AstronomyEngine
from app.services.data_loader import DataLoader


def test_planet_position_is_deterministic():
    """Same planet and date must always return same position."""
    pos1 = AstronomyEngine.get_planet_position("earth", date(2024, 6, 15))
    pos2 = AstronomyEngine.get_planet_position("earth", date(2024, 6, 15))

    assert pos1["position_au"]["x"] == pytest.approx(pos2["position_au"]["x"])
    assert pos1["position_au"]["y"] == pytest.approx(pos2["position_au"]["y"])
    assert pos1["position_au"]["z"] == pytest.approx(pos2["position_au"]["z"])


def test_planet_position_changes_over_time():
    """Planet position should change over time."""
    pos1 = AstronomyEngine.get_planet_position("earth", date(2024, 1, 1))
    pos2 = AstronomyEngine.get_planet_position("earth", date(2024, 7, 1))

    # Positions should be different (earth moves in orbit)
    assert pos1["position_au"] != pos2["position_au"]


def test_earth_orbital_radius():
    """Earth's orbital radius should be approximately 1 AU."""
    pos = AstronomyEngine.get_planet_position("earth", date(2024, 1, 1))

    # Earth's distance from sun should be close to 1 AU
    assert 0.98 < pos["distance_from_sun_au"] < 1.02


def test_mars_year_is_longer():
    """Mars orbital period should be longer than Earth's."""
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    assert mars["orbital_period_days"] > earth["orbital_period_days"]


def test_all_planets_have_valid_positions():
    """All planets should have valid positions calculated."""
    planets = DataLoader.load_planets()["planets"]

    for planet in planets:
        pos = AstronomyEngine.get_planet_position(
            planet["id"],
            date(2024, 1, 1)
        )
        assert "position_au" in pos
        assert "x" in pos["position_au"]
        assert "y" in pos["position_au"]
        assert "z" in pos["position_au"]
        assert pos["distance_from_sun_au"] > 0
