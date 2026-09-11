"""Tests for API endpoints."""
import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "cosmicwalk-api"


def test_list_planets(client: TestClient):
    """Test listing all planets."""
    response = client.get("/api/v1/planets/")
    assert response.status_code == 200
    planets = response.json()
    assert isinstance(planets, list)
    assert len(planets) == 9  # Including Pluto
    assert any(p["id"] == "earth" for p in planets)


def test_get_planet(client: TestClient):
    """Test getting a specific planet."""
    response = client.get("/api/v1/planets/earth")
    assert response.status_code == 200
    planet = response.json()
    assert planet["id"] == "earth"
    assert planet["name"] == "Earth"
    assert "mass_kg" in planet
    assert "radius_km" in planet


def test_get_nonexistent_planet(client: TestClient):
    """Test getting a planet that doesn't exist."""
    response = client.get("/api/v1/planets/nonexistent")
    assert response.status_code == 404


def test_list_travel_modes(client: TestClient):
    """Test listing all travel modes."""
    response = client.get("/api/v1/travel-modes/")
    assert response.status_code == 200
    modes = response.json()
    assert isinstance(modes, list)
    assert len(modes) > 0
    # Check we have all categories
    categories = {m["category"] for m in modes}
    assert "human_powered" in categories
    assert "realistic" in categories
    assert "theoretical" in categories
    assert "absurd" in categories
    assert "impossible" in categories


def test_get_travel_mode(client: TestClient):
    """Test getting a specific travel mode."""
    response = client.get("/api/v1/travel-modes/chemical_rocket")
    assert response.status_code == 200
    mode = response.json()
    assert mode["id"] == "chemical_rocket"
    assert mode["category"] == "realistic"


def test_calculate_mission(client: TestClient):
    """Test mission calculation."""
    request_data = {
        "origin_id": "earth",
        "destination_id": "mars",
        "travel_date": "2024-06-15",
        "mode_id": "chemical_rocket",
        "crew_size": 4
    }
    response = client.post("/api/v1/missions/calculate", json=request_data)
    assert response.status_code == 200
    result = response.json()

    # Check all sections are present
    assert "origin" in result
    assert "destination" in result
    assert "mode" in result
    assert "distance_km" in result
    assert "travel_time" in result
    assert "resources" in result
    assert "cost" in result
    assert "difficulty" in result
    assert "ridiculousness" in result

    # Check values are reasonable
    assert result["distance_km"] > 0
    assert result["travel_time"]["travel_time_seconds"] > 0
    assert result["cost"]["total_usd"] > 0


def test_calculate_mission_walking(client: TestClient):
    """Test mission calculation for walking (human-powered)."""
    request_data = {
        "origin_id": "earth",
        "destination_id": "mars",
        "travel_date": "2024-06-15",
        "mode_id": "walk",
        "crew_size": 1
    }
    response = client.post("/api/v1/missions/calculate", json=request_data)
    assert response.status_code == 200
    result = response.json()

    # Walking to Mars should take millions of years
    assert result["travel_time"]["travel_time_years"] > 100_000
    assert result["ridiculousness"]["score"] > 50


def test_calculate_mission_teleportation(client: TestClient):
    """Test mission calculation for teleportation (impossible)."""
    request_data = {
        "origin_id": "earth",
        "destination_id": "mars",
        "travel_date": "2024-06-15",
        "mode_id": "teleportation",
        "crew_size": 1
    }
    response = client.post("/api/v1/missions/calculate", json=request_data)
    assert response.status_code == 200
    result = response.json()

    # Teleportation should be nearly instant
    assert result["travel_time"]["travel_time_seconds"] < 1


def test_calculate_distance(client: TestClient):
    """Test distance calculation."""
    response = client.post(
        "/api/v1/missions/distance",
        params={
            "origin_id": "earth",
            "destination_id": "mars",
            "travel_date": "2024-06-15"
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert "distance_km" in result
    assert "distance_au" in result
    assert result["distance_km"] > 0


def test_run_race(client: TestClient):
    """Test race between travel modes."""
    request_data = {
        "origin_id": "earth",
        "destination_id": "mars",
        "travel_date": "2024-06-15",
        "participants": [
            {"mode_id": "chemical_rocket", "name": "Rocket Racer"},
            {"mode_id": "ion_drive", "name": "Ion Cruiser"},
            {"mode_id": "teleportation", "name": "Teleporter"}
        ]
    }
    response = client.post("/api/v1/missions/race", json=request_data)
    assert response.status_code == 200
    result = response.json()

    assert "race_id" in result
    assert "winner" in result
    assert "participants" in result
    assert "fun_commentary" in result

    # Teleportation should win
    assert result["winner"]["mode_id"] == "teleportation"


def test_get_challenge(client: TestClient):
    """Test challenge generation."""
    response = client.get("/api/v1/missions/challenge")
    assert response.status_code == 200
    challenge = response.json()

    assert "challenge_id" in challenge
    assert "title" in challenge
    assert "origin_id" in challenge
    assert "destination_id" in challenge
    assert "mode_id" in challenge
    assert "fun_description" in challenge
    assert "reward" in challenge


def test_get_challenge_with_difficulty(client: TestClient):
    """Test challenge generation with specific difficulty."""
    response = client.get("/api/v1/missions/challenge?difficulty=hard")
    assert response.status_code == 200
    challenge = response.json()
    assert challenge["difficulty"] == "hard"


def test_simulate_mission(client: TestClient):
    """Test mission simulation."""
    request_data = {
        "origin_id": "earth",
        "destination_id": "mars",
        "travel_date": "2024-06-15",
        "mode_id": "chemical_rocket",
        "crew_size": 4,
        "modifications": {}
    }
    response = client.post("/api/v1/missions/simulate", json=request_data)
    assert response.status_code == 200
    result = response.json()

    assert "scenario_id" in result
    assert "baseline" in result
    assert "modified" in result
    assert "outcome" in result
    assert "events" in result
    assert "lessons_learned" in result


def test_generate_report(client: TestClient):
    """Test AI report generation."""
    request_data = {
        "origin_id": "earth",
        "destination_id": "mars",
        "travel_date": "2024-06-15",
        "mode_id": "chemical_rocket",
        "crew_size": 4
    }
    response = client.post("/api/v1/missions/report", json=request_data)
    assert response.status_code == 200
    report = response.json()

    assert "report_id" in report
    assert "mission_summary" in report
    assert "journey_narrative" in report
    assert "crew_log" in report
    assert "highlights" in report
    assert "warnings" in report
    assert "recommendations" in report
    assert "fun_rating" in report


def test_invalid_mission_request(client: TestClient):
    """Test mission calculation with invalid planet."""
    request_data = {
        "origin_id": "nonexistent",
        "destination_id": "mars",
        "travel_date": "2024-06-15",
        "mode_id": "chemical_rocket",
        "crew_size": 4
    }
    response = client.post("/api/v1/missions/calculate", json=request_data)
    assert response.status_code == 400
