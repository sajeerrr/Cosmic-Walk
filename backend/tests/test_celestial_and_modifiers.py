import pytest
from datetime import date

from app.services.data_loader import DataLoader
from app.services.astronomy_engine import AstronomyEngine
from app.services.distance_engine import DistanceEngine
from app.services.travel_mode_engine import TravelModeEngine
from app.services.mission_calculator import MissionCalculator
from app.services.simulation_engine import SimulationEngine
from app.models.mission import MissionModifier


def test_celestial_objects_loading():
    objects = DataLoader.load_celestial_objects()["celestial_objects"]
    assert len(objects) >= 12
    ids = {o["id"] for o in objects}
    assert "sun" in ids
    assert "moon" in ids
    assert "halleys_comet" in ids
    assert "ceres" in ids


def test_sun_and_moon_positions():
    sun_pos = AstronomyEngine.get_celestial_object_position("sun", date(2026, 9, 12))
    assert sun_pos["x_au"] == 0.0
    assert sun_pos["y_au"] == 0.0

    moon_pos = AstronomyEngine.get_celestial_object_position("moon", date(2026, 9, 12))
    assert "x_au" in moon_pos
    assert moon_pos["distance_from_sun_au"] > 0


def test_same_origin_distance():
    dist = DistanceEngine.get_interplanetary_distance("earth", "earth", date(2026, 9, 12))
    assert dist["distance_km"] == 0.0
    assert dist["distance_au"] == 0.0


def test_new_travel_modes_calculation():
    earth = DataLoader.get_celestial_object("earth")
    mars = DataLoader.get_celestial_object("mars")

    snail = DataLoader.get_travel_mode("snail")
    snail_res = TravelModeEngine.calculate_travel_time(snail, 225_000_000, earth, mars)
    assert snail_res["travel_time_years"] > 1_000_000

    portal = DataLoader.get_travel_mode("magic_portal")
    portal_res = TravelModeEngine.calculate_travel_time(portal, 225_000_000, earth, mars)
    assert portal_res["travel_time_seconds"] < 1.0


def test_mission_modifiers_and_verdict():
    modifiers = MissionModifier(
        speed_override_km_h=50.0,
        cargo_mass_kg=1000.0,
        unlimited_food=True
    )
    result = MissionCalculator.calculate_mission(
        "earth", "mars", "2026-09-12", "walk", crew_size=1, modifiers=modifiers
    )

    assert "verdict" in result
    assert result["verdict"]["classification"] in ["SENSIBLE", "DIFFICULT", "EXTREME", "ABSURD", "IMPOSSIBLE"]
    assert "scale_comparison" in result
    assert len(result["scale_comparison"]) > 0


def test_seeded_events_reproducibility():
    events1 = SimulationEngine.generate_random_events("earth", "mars", "2026-09-12", "walk", seed=42)
    events2 = SimulationEngine.generate_random_events("earth", "mars", "2026-09-12", "walk", seed=42)
    events3 = SimulationEngine.generate_random_events("earth", "mars", "2026-09-12", "walk", seed=99)

    assert events1 == events2
    assert events1 != events3
