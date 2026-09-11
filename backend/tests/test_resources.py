"""Tests for resource calculations."""
import pytest

from app.services.resource_engine import ResourceEngine
from app.services.data_loader import DataLoader


def test_resource_calculation():
    """Test basic resource calculation."""
    mode = DataLoader.get_travel_mode("chemical_rocket")

    resources = ResourceEngine.calculate_resources(
        travel_days=100,
        crew_size=4,
        mode_data=mode,
        distance_km=225_000_000
    )

    assert "life_support" in resources
    assert "propulsion" in resources
    assert "total_mass_kg" in resources


def test_water_requirement():
    """Test water requirement calculation."""
    mode = DataLoader.get_travel_mode("chemical_rocket")

    resources = ResourceEngine.calculate_resources(
        travel_days=100,
        crew_size=4,
        mode_data=mode,
        distance_km=225_000_000
    )

    # 4 crew × 100 days × 3 liters/day = 1200 liters (plus safety margin)
    expected_min = 4 * 100 * 3 * 1.1  # With 10% safety margin
    assert resources["life_support"]["water_liters"] >= expected_min


def test_food_requirement():
    """Test food requirement calculation."""
    mode = DataLoader.get_travel_mode("chemical_rocket")

    resources = ResourceEngine.calculate_resources(
        travel_days=100,
        crew_size=4,
        mode_data=mode,
        distance_km=225_000_000
    )

    # 4 crew × 100 days × 1.8 kg/day
    expected_min = 4 * 100 * 1.8 * 1.1
    assert resources["life_support"]["food_kg"] >= expected_min


def test_oxygen_requirement():
    """Test oxygen requirement calculation."""
    mode = DataLoader.get_travel_mode("chemical_rocket")

    resources = ResourceEngine.calculate_resources(
        travel_days=100,
        crew_size=4,
        mode_data=mode,
        distance_km=225_000_000
    )

    # 4 crew × 100 days × 550 liters/day
    expected_min = 4 * 100 * 550 * 1.1
    assert resources["life_support"]["oxygen_liters"] >= expected_min


def test_larger_crew_needs_more_resources():
    """Larger crew should need more resources."""
    mode = DataLoader.get_travel_mode("chemical_rocket")

    resources_small = ResourceEngine.calculate_resources(
        travel_days=100,
        crew_size=2,
        mode_data=mode,
        distance_km=225_000_000
    )

    resources_large = ResourceEngine.calculate_resources(
        travel_days=100,
        crew_size=8,
        mode_data=mode,
        distance_km=225_000_000
    )

    assert resources_large["life_support"]["water_liters"] > resources_small["life_support"]["water_liters"]
    assert resources_large["total_mass_kg"] > resources_small["total_mass_kg"]


def test_per_crew_member_calculation():
    """Test per-crew-member resource breakdown."""
    mode = DataLoader.get_travel_mode("chemical_rocket")

    resources = ResourceEngine.calculate_resources(
        travel_days=100,
        crew_size=4,
        mode_data=mode,
        distance_km=225_000_000
    )

    assert "per_crew_member" in resources
    assert resources["per_crew_member"]["water_liters"] == pytest.approx(
        resources["life_support"]["water_liters"] / 4, rel=0.1
    )
