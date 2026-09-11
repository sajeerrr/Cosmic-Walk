"""Tests for distance calculations."""
import pytest
from datetime import date

from app.services.distance_engine import DistanceEngine


def test_earth_to_mars_distance_reasonable():
    """Earth-Mars distance should be in expected range."""
    distance = DistanceEngine.get_interplanetary_distance(
        "earth", "mars", date(2024, 1, 1)
    )

    # Average distance is ~225 million km, varies 55-400 million
    assert 50_000_000 < distance["distance_km"] < 450_000_000


def test_same_planet_distance_is_near_zero():
    """Distance from planet to itself should be near zero."""
    distance = DistanceEngine.get_interplanetary_distance(
        "earth", "earth", date(2024, 1, 1)
    )

    # Should be very small (same position)
    assert distance["distance_km"] < 10_000_000


def test_distance_includes_all_units():
    """Distance result should include km, AU, and light minutes."""
    distance = DistanceEngine.get_interplanetary_distance(
        "earth", "mars", date(2024, 1, 1)
    )

    assert "distance_km" in distance
    assert "distance_au" in distance
    assert "light_minutes" in distance

    # Verify conversions
    assert distance["distance_au"] == pytest.approx(
        distance["distance_km"] / 149_597_870.7, rel=0.01
    )


def test_hohmann_transfer_time():
    """Test Hohmann transfer time calculation."""
    # Earth to Mars Hohmann transfer
    r1_au = 1.0  # Earth orbital radius
    r2_au = 1.524  # Mars orbital radius

    transfer_days = DistanceEngine.calculate_hohmann_transfer_time(r1_au, r2_au)

    # Earth to Mars Hohmann transfer takes ~259 days
    assert 200 < transfer_days < 300


def test_distance_is_symmetric():
    """Distance from A to B should equal distance from B to A."""
    dist1 = DistanceEngine.get_interplanetary_distance(
        "earth", "mars", date(2024, 6, 15)
    )
    dist2 = DistanceEngine.get_interplanetary_distance(
        "mars", "earth", date(2024, 6, 15)
    )

    assert dist1["distance_km"] == pytest.approx(dist2["distance_km"])
