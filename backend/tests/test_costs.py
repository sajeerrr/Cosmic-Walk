"""Tests for cost calculations."""
import pytest

from app.services.cost_engine import CostEngine
from app.services.resource_engine import ResourceEngine
from app.services.data_loader import DataLoader


def test_cost_breakdown_structure():
    """Test cost breakdown structure."""
    mode = DataLoader.get_travel_mode("chemical_rocket")
    resources = ResourceEngine.calculate_resources(
        travel_days=100, crew_size=4, mode_data=mode, distance_km=225_000_000
    )

    cost = CostEngine.calculate_mission_cost(
        distance_km=225_000_000,
        travel_days=100,
        crew_size=4,
        mode_data=mode,
        resources=resources
    )

    assert cost.launch_cost_usd > 0
    assert cost.fuel_cost_usd > 0
    assert cost.crew_cost_usd > 0
    assert cost.total_usd > 0


def test_human_powered_is_cheap():
    """Walking should be very cheap."""
    walk_mode = DataLoader.get_travel_mode("walk")

    cost = CostEngine.calculate_mission_cost(
        distance_km=225_000_000,
        travel_days=1_000_000,  # Very long time
        crew_size=1,
        mode_data=walk_mode,
        resources={}
    )

    # Walking cost
    assert cost.total_usd < 200_000_000



def test_teleportation_is_expensive():
    """Teleportation should be expensive."""
    teleport_mode = DataLoader.get_travel_mode("teleportation")

    cost = CostEngine.calculate_mission_cost(
        distance_km=225_000_000,
        travel_days=0.001,
        crew_size=1,
        mode_data=teleport_mode,
        resources={}
    )

    # Teleportation should be very expensive
    assert cost.total_usd > 1_000_000_000


def test_longer_mission_costs_more():
    """Longer missions should cost more."""
    mode = DataLoader.get_travel_mode("chemical_rocket")

    resources_short = ResourceEngine.calculate_resources(
        travel_days=50, crew_size=4, mode_data=mode, distance_km=225_000_000
    )
    resources_long = ResourceEngine.calculate_resources(
        travel_days=200, crew_size=4, mode_data=mode, distance_km=225_000_000
    )

    cost_short = CostEngine.calculate_mission_cost(
        distance_km=225_000_000,
        travel_days=50,
        crew_size=4,
        mode_data=mode,
        resources=resources_short
    )

    cost_long = CostEngine.calculate_mission_cost(
        distance_km=225_000_000,
        travel_days=200,
        crew_size=4,
        mode_data=mode,
        resources=resources_long
    )

    assert cost_long.total_usd > cost_short.total_usd


def test_cosmic_hitchhiking_is_free():
    """Cosmic hitchhiking should be nearly free."""
    hitchhike_mode = DataLoader.get_travel_mode("cosmic_hitchhiking")

    cost = CostEngine.calculate_mission_cost(
        distance_km=225_000_000,
        travel_days=1,
        crew_size=1,
        mode_data=hitchhike_mode,
        resources={}
    )

    # Just need a towel!
    assert cost.total_usd < 100
