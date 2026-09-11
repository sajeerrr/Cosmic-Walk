# CosmicWalk Backend Development Plan

## Overview

CosmicWalk is an interplanetary hypothetical travel simulator. The backend provides a calculation and simulation API that computes astronomical distances, simulates journeys using various travel methods (from realistic to absurd), and generates engaging travel reports.

**Scope**: This plan covers a stateless calculation API. No database, authentication, or deployment infrastructure.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| Validation | Pydantic |
| Calculations | NumPy, SciPy |
| Data | Static NASA/JPL planetary data |
| LLM | Claude API (for travel reports) |

---

## Architecture

```
Frontend
    ↓
FastAPI Routes (app/routes/)
    ↓
Services (app/services/)
    ├── AstronomyEngine      — Planet positions, orbital mechanics
    ├── DistanceEngine       — Interplanetary distance calculations
    ├── TravelModeEngine     — All travel mode physics (realistic to absurd)
    ├── ResourceEngine       — Fuel, supplies, energy requirements
    ├── CostEngine           — Mission cost calculations
    ├── DifficultyEngine     — Mission difficulty scoring
    ├── RidiculousnessEngine — Absurdity measurement
    ├── SimulationEngine     — Journey simulation and events
    ├── RaceEngine           — Multi-traveler race simulation
    ├── ChallengeEngine      — Random challenge generation
    └── AIReportEngine       — Narrative generation
    ↓
Static Data (app/data/)
    └── planets.json, travel_modes.json
```

**Key Principle**: Routes handle HTTP concerns. Services contain all business logic. Everything is stateless and testable in isolation.

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry
│   ├── config.py                  # Settings via Pydantic
│   ├── models/                    # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── planet.py
│   │   ├── travel_mode.py
│   │   ├── mission.py
│   │   ├── simulation.py
│   │   ├── race.py
│   │   └── report.py
│   ├── routes/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── planets.py
│   │   ├── travel_modes.py
│   │   ├── missions.py
│   │   ├── simulations.py
│   │   ├── races.py
│   │   └── reports.py
│   ├── services/                  # Business logic
│   │   ├── __init__.py
│   │   ├── astronomy_engine.py
│   │   ├── distance_engine.py
│   │   ├── travel_mode_engine.py
│   │   ├── resource_engine.py
│   │   ├── cost_engine.py
│   │   ├── difficulty_engine.py
│   │   ├── ridiculousness_engine.py
│   │   ├── simulation_engine.py
│   │   ├── race_engine.py
│   │   ├── challenge_engine.py
│   │   └── ai_report_engine.py
│   ├── data/                      # Static JSON data
│   │   ├── planets.json
│   │   └── travel_modes.json
│   └── utils/
│       ├── __init__.py
│       ├── constants.py           # Physical constants
│       └── helpers.py             # Utility functions
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_astronomy.py
│   ├── test_distance.py
│   ├── test_travel_modes.py
│   ├── test_resources.py
│   ├── test_costs.py
│   ├── test_difficulty.py
│   ├── test_ridiculousness.py
│   ├── test_simulation.py
│   ├── test_race.py
│   ├── test_challenge.py
│   └── test_api.py
├── requirements.txt
└── README.md
```

---

## Development Sections

---

### 1. FastAPI Foundation

**Goal**: Establish the application structure and development environment.

#### 1.1 Application Setup

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CosmicWalk API",
    description="Interplanetary travel simulator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(planets.router, prefix="/api/v1/planets", tags=["planets"])
app.include_router(travel_modes.router, prefix="/api/v1/travel-modes", tags=["travel-modes"])
app.include_router(missions.router, prefix="/api/v1/missions", tags=["missions"])
# ... other routers
```

#### 1.2 Configuration

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "CosmicWalk"
    debug: bool = True
    anthropic_api_key: str = ""  # For AI reports

    class Config:
        env_file = ".env"
```

#### 1.3 Dependencies

```
# requirements.txt
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
numpy>=1.26.0
scipy>=1.12.0
httpx>=0.26.0
anthropic>=0.18.0
pytest>=7.4.0
pytest-asyncio>=0.23.0
```

#### 1.4 Health Check

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cosmicwalk-api"}
```

---

### 2. Planetary Data

**Goal**: Define and load accurate planetary data from NASA/JPL sources.

#### 2.1 Planet Model

```python
# app/models/planet.py
from pydantic import BaseModel
from typing import Dict, Optional

class Planet(BaseModel):
    id: str
    name: str
    mass_kg: float
    radius_km: float
    semi_major_axis_au: float        # Orbital radius
    eccentricity: float              # Orbital shape
    orbital_period_days: float       # Year length
    rotation_period_hours: float     # Day length
    avg_temp_celsius: float
    gravity_m_s2: float
    atmosphere_composition: Dict[str, float]  # {"N2": 78.0, "O2": 21.0}
    moons_count: int
    description: str
    fun_facts: list[str]
```

#### 2.2 Static Data

```json
// app/data/planets.json
{
  "planets": [
    {
      "id": "mercury",
      "name": "Mercury",
      "mass_kg": 3.3011e23,
      "radius_km": 2439.7,
      "semi_major_axis_au": 0.387,
      "eccentricity": 0.2056,
      "orbital_period_days": 87.97,
      "rotation_period_hours": 1407.6,
      "avg_temp_celsius": 167,
      "gravity_m_s2": 3.7,
      "atmosphere_composition": {},
      "moons_count": 0,
      "description": "The swift messenger of the gods",
      "fun_facts": [
        "A year on Mercury is only 88 Earth days",
        "Mercury has the most extreme temperature swings in the solar system"
      ]
    },
    // ... Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
  ]
}
```

#### 2.3 Data Loading

```python
# app/services/data_loader.py
import json
from pathlib import Path

class DataLoader:
    _planets_cache: dict = None
    _travel_modes_cache: dict = None

    @classmethod
    def load_planets(cls) -> dict:
        if cls._planets_cache is None:
            path = Path(__file__).parent.parent / "data" / "planets.json"
            with open(path) as f:
                cls._planets_cache = json.load(f)
        return cls._planets_cache

    @classmethod
    def get_planet(cls, planet_id: str) -> dict:
        planets = cls.load_planets()["planets"]
        for p in planets:
            if p["id"] == planet_id:
                return p
        raise ValueError(f"Planet {planet_id} not found")
```

#### 2.4 API Endpoints

```python
# app/routes/planets.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_planets() -> list[Planet]:
    """List all available planets."""
    return DataLoader.load_planets()["planets"]

@router.get("/{planet_id}")
async def get_planet(planet_id: str) -> Planet:
    """Get details for a specific planet."""
    return DataLoader.get_planet(planet_id)
```

---

### 3. Astronomy Calculations

**Goal**: Calculate planetary positions at any given date using Keplerian mechanics.

#### 3.1 Position Calculation

```python
# app/services/astronomy_engine.py
import numpy as np
from datetime import date
from typing import Tuple

class AstronomyEngine:
    """
    Calculate planetary positions using Keplerian orbital elements.

    All calculations are deterministic - same inputs always produce same outputs.
    """

    # Reference epoch (J2000.0)
    J2000 = date(2000, 1, 1, 12, 0, 0)

    @staticmethod
    def calculate_mean_anomaly(planet: Planet, target_date: date) -> float:
        """
        Calculate mean anomaly M at target date.

        M = M0 + n * (t - t0)

        Where:
        - M0 is mean anomaly at epoch
        - n is mean motion (360° / orbital_period)
        - t - t0 is days since epoch
        """
        days_since_epoch = (target_date - AstronomyEngine.J2000).days
        mean_motion = 360.0 / planet.orbital_period_days  # degrees per day

        # Mean anomaly (simplified - assumes M0 = 0 at J2000)
        M = (mean_motion * days_since_epoch) % 360
        return np.radians(M)

    @staticmethod
    def solve_kepler_equation(M: float, e: float, tolerance: float = 1e-8) -> float:
        """
        Solve Kepler's equation for eccentric anomaly E.

        M = E - e * sin(E)

        Uses Newton-Raphson iteration.
        """
        E = M  # Initial guess
        for _ in range(100):
            delta = E - e * np.sin(E) - M
            if abs(delta) < tolerance:
                break
            E = E - delta / (1 - e * np.cos(E))
        return E

    @staticmethod
    def calculate_true_anomaly(E: float, e: float) -> float:
        """
        Calculate true anomaly ν from eccentric anomaly E.
        """
        return 2 * np.arctan2(
            np.sqrt(1 + e) * np.sin(E / 2),
            np.sqrt(1 - e) * np.cos(E / 2)
        )

    @staticmethod
    def calculate_heliocentric_position(
        planet: Planet,
        target_date: date
    ) -> Tuple[float, float, float]:
        """
        Calculate heliocentric position in AU.

        Returns (x, y, z) coordinates with Sun at origin.
        """
        M = AstronomyEngine.calculate_mean_anomaly(planet, target_date)
        E = AstronomyEngine.solve_kepler_equation(M, planet.eccentricity)
        nu = AstronomyEngine.calculate_true_anomaly(E, planet.eccentricity)

        # Heliocentric distance
        r = planet.semi_major_axis_au * (1 - planet.eccentricity * np.cos(E))

        # Position in orbital plane (simplified - assumes inclination = 0)
        x = r * np.cos(nu)
        y = r * np.sin(nu)
        z = 0.0  # Simplified - would need inclination for accurate z

        return (x, y, z)

    @staticmethod
    def get_planet_position(planet_id: str, target_date: date) -> dict:
        """Get formatted position for a planet."""
        planet_data = DataLoader.get_planet(planet_id)
        planet = Planet(**planet_data)
        x, y, z = AstronomyEngine.calculate_heliocentric_position(planet, target_date)

        return {
            "planet_id": planet_id,
            "date": target_date.isoformat(),
            "position_au": {"x": x, "y": y, "z": z},
            "distance_from_sun_au": np.sqrt(x**2 + y**2 + z**2)
        }
```

#### 3.2 Why Deterministic

Astronomical positions are pure physics. Using LLM for calculations would introduce hallucination risk. The Keplerian equations have been validated for centuries.

---

### 4. Distance Calculation

**Goal**: Calculate interplanetary distances at any given date.

#### 4.1 Distance Engine

```python
# app/services/distance_engine.py
import numpy as np
from datetime import date

class DistanceEngine:
    """Calculate distances between celestial bodies."""

    AU_TO_KM = 149_597_870.7  # 1 AU in kilometers

    @staticmethod
    def calculate_distance_km(
        pos1: Tuple[float, float, float],
        pos2: Tuple[float, float, float]
    ) -> float:
        """
        Calculate Euclidean distance between two positions.

        d = sqrt((x2-x1)² + (y2-y1)² + (z2-z1)²)
        """
        return np.sqrt(
            (pos2[0] - pos1[0])**2 +
            (pos2[1] - pos1[1])**2 +
            (pos2[2] - pos1[2])**2
        ) * DistanceEngine.AU_TO_KM

    @staticmethod
    def get_interplanetary_distance(
        origin_id: str,
        destination_id: str,
        travel_date: date
    ) -> dict:
        """
        Calculate distance between two planets at a specific date.
        """
        origin_pos = AstronomyEngine.get_planet_position(origin_id, travel_date)
        dest_pos = AstronomyEngine.get_planet_position(destination_id, travel_date)

        distance_km = DistanceEngine.calculate_distance_km(
            origin_pos["position_au"].values(),
            dest_pos["position_au"].values()
        )

        return {
            "origin": origin_id,
            "destination": destination_id,
            "date": travel_date.isoformat(),
            "distance_km": distance_km,
            "distance_au": distance_km / DistanceEngine.AU_TO_KM,
            "light_minutes": distance_km / (299_792.458 * 60)  # Speed of light
        }
```

#### 4.2 Transfer Window Calculation

```python
@staticmethod
def calculate_hohmann_transfer_time(r1_au: float, r2_au: float) -> float:
    """
    Calculate Hohmann transfer time between two circular orbits.

    T = π * sqrt((r1 + r2)³ / (8 * μ_sun))

    Where μ_sun = 1.327×10²⁰ m³/s² (standard gravitational parameter)

    Returns transfer time in days.
    """
    MU_SUN = 1.32712440018e20  # m³/s²
    AU_TO_M = 149_597_870_700  # meters

    r1_m = r1_au * AU_TO_M
    r2_m = r2_au * AU_TO_M

    transfer_time_seconds = np.pi * np.sqrt((r1_m + r2_m)**3 / (8 * MU_SUN))
    return transfer_time_seconds / 86400  # Convert to days
```

---

### 5. Travel Mode Engine

**Goal**: Implement travel calculations for all mode categories.

#### 5.1 Travel Mode Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Human-Powered** | Walking, running, cycling, swimming | Walk, Run, Bicycle, Swim |
| **Realistic** | Current or near-future technology | Chemical Rocket, Ion Drive, Nuclear Thermal |
| **Theoretical** | Physics-compliant but unproven | Nuclear Pulse, Solar Sail, Fusion Drive |
| **Absurd** | Comical but internally consistent | Giant Slingshot, Space Elevator, Cosmic Hitchhiking |
| **Impossible** | Breaks physics rules entirely | Teleportation, Warp Drive, Hyperspace |

#### 5.2 Travel Mode Model

```python
# app/models/travel_mode.py
from pydantic import BaseModel
from enum import Enum

class TravelCategory(str, Enum):
    HUMAN_POWERED = "human_powered"
    REALISTIC = "realistic"
    THEORETICAL = "theoretical"
    ABSURD = "absurd"
    IMPOSSIBLE = "impossible"

class TravelMode(BaseModel):
    id: str
    name: str
    category: TravelCategory
    description: str
    max_speed_km_s: float              # Maximum velocity
    average_speed_km_s: float          # Sustainable velocity
    acceleration_m_s2: float           # Acceleration capability
    fuel_type: str
    fuel_efficiency: float             # km per kg of fuel
    crew_capacity_min: int
    crew_capacity_max: int
    failure_rate: float                # 0.0 to 1.0
    cost_per_km_usd: float
    special_rules: dict                # Mode-specific behaviors
    fun_description: str               # Humorous explanation
```

#### 5.3 Travel Mode Engine

```python
# app/services/travel_mode_engine.py
import numpy as np
from datetime import timedelta

class TravelModeEngine:
    """Calculate travel times for all mode categories."""

    @staticmethod
    def calculate_travel_time(
        mode: TravelMode,
        distance_km: float,
        origin_planet: Planet,
        dest_planet: Planet
    ) -> dict:
        """
        Calculate travel time based on mode physics.

        Returns dict with time, speed profile, and mode-specific data.
        """
        if mode.category == TravelCategory.HUMAN_POWERED:
            return TravelModeEngine._calculate_human_powered(mode, distance_km)
        elif mode.category == TravelCategory.REALISTIC:
            return TravelModeEngine._calculate_realistic(mode, distance_km)
        elif mode.category == TravelCategory.THEORETICAL:
            return TravelModeEngine._calculate_theoretical(mode, distance_km)
        elif mode.category == TravelCategory.ABSURD:
            return TravelModeEngine._calculate_absurd(mode, distance_km, origin_planet)
        else:  # IMPOSSIBLE
            return TravelModeEngine._calculate_impossible(mode, distance_km)

    @staticmethod
    def _calculate_realistic(mode: TravelMode, distance_km: float) -> dict:
        """
        Calculate travel time for realistic propulsion.

        Accounts for acceleration and deceleration phases.
        """
        # Time to accelerate to max speed
        t_accel = mode.max_speed_km_s * 1000 / mode.acceleration_m_s2
        accel_distance = 0.5 * mode.acceleration_m_s2 * t_accel**2 / 1000  # km

        # Check if we reach max speed
        if 2 * accel_distance > distance_km:
            # Never reach max speed - accelerate halfway, decelerate halfway
            t_total = 2 * np.sqrt(distance_km * 1000 / mode.acceleration_m_s2)
            max_reached_speed = np.sqrt(distance_km * 1000 * mode.acceleration_m_s2) / 1000
        else:
            # Accelerate, cruise, decelerate
            cruise_distance = distance_km - 2 * accel_distance
            t_cruise = cruise_distance / mode.max_speed_km_s
            t_total = 2 * t_accel + t_cruise
            max_reached_speed = mode.max_speed_km_s

        return {
            "travel_time_seconds": t_total,
            "travel_time_days": t_total / 86400,
            "travel_time_years": t_total / (86400 * 365.25),
            "max_speed_reached_km_s": max_reached_speed,
            "acceleration_time_seconds": t_accel,
            "cruise_time_seconds": max(0, t_total - 2 * t_accel),
            "phase_breakdown": {
                "acceleration": t_accel,
                "cruise": max(0, t_total - 2 * t_accel),
                "deceleration": t_accel
            }
        }
```

---

### 6. Walking/Running/Cycling Calculations

**Goal**: Calculate human-powered interplanetary travel (for entertainment/absurdity value).

#### 6.1 Human-Powered Modes

```python
# Human-powered constants
AVERAGE_WALKING_SPEED_KM_H = 5.0      # 5 km/h
AVERAGE_RUNNING_SPEED_KM_H = 10.0     # 10 km/h
AVERAGE_CYCLING_SPEED_KM_H = 20.0     # 20 km/h
AVERAGE_SWIMMING_SPEED_KM_H = 3.0     # 3 km/h

# Human endurance
CALORIES_PER_WALKING_KM = 60          # ~60 cal/km walking
CALORIES_PER_RUNNING_KM = 100         # ~100 cal/km running
CALORIES_PER_CYCLING_KM = 30          # ~30 cal/km cycling

# Rest requirements
SLEEP_HOURS_PER_DAY = 8
REST_DAYS_PER_MONTH = 4
```

#### 6.2 Human-Powered Calculation

```python
@staticmethod
def _calculate_human_powered(mode: TravelMode, distance_km: float) -> dict:
    """
    Calculate travel time for human-powered modes.

    Includes rest periods, caloric needs, and generations required.
    """
    # Get base speed
    speed_map = {
        "walk": AVERAGE_WALKING_SPEED_KM_H,
        "run": AVERAGE_RUNNING_SPEED_KM_H,
        "bicycle": AVERAGE_CYCLING_SPEED_KM_H,
        "swim": AVERAGE_SWIMMING_SPEED_KM_H
    }
    speed_km_h = speed_map.get(mode.id, 5.0)

    # Calculate active travel time (no rest)
    active_hours = distance_km / speed_km_h

    # Account for rest (can only travel ~8 hours/day effectively)
    travel_hours_per_day = 8
    days_needed = active_hours / travel_hours_per_day

    # Add rest days (1 rest day per 6 travel days)
    rest_days = days_needed / 6
    total_days = days_needed + rest_days

    # Calculate calories
    cal_map = {
        "walk": CALORIES_PER_WALKING_KM,
        "run": CALORIES_PER_RUNNING_KM,
        "bicycle": CALORIES_PER_CYCLING_KM,
        "swim": CALORIES_PER_SWIMMING_KM
    }
    total_calories = distance_km * cal_map.get(mode.id, 60)

    # Calculate generations (assuming 80-year lifespan)
    years = total_days / 365.25
    generations = years / 80

    # Calculate meals needed
    meals_per_day = 3
    total_meals = total_days * meals_per_day

    return {
        "travel_time_hours": active_hours,
        "travel_time_days": total_days,
        "travel_time_years": years,
        "human_readable_time": TravelModeEngine._format_human_time(years),
        "total_distance_km": distance_km,
        "average_speed_km_h": speed_km_h,
        "effective_travel_hours_per_day": travel_hours_per_day,
        "rest_days_included": rest_days,
        "total_calories_burned": total_calories,
        "equivalent_pizzas": total_calories / 285,  # Avg pizza calories
        "generations_needed": generations,
        "meals_required": total_meals,
        "pairs_of_shoes_needed": distance_km / 800,  # ~800km per pair
        "fun_comparisons": [
            f"That's {distance_km / 40075:.2f} trips around Earth",
            f"You'd burn {total_calories:,.0f} calories ({total_calories/285:.0f} pizzas)",
            f"If you started when dinosaurs went extinct, you'd be {(66000000/years):.1f}% done",
            f"Your great{x{int(generations)}}-grandchildren could finish this"
        ]
    }

@staticmethod
def _format_human_time(years: float) -> str:
    """Convert years to human-readable format."""
    if years < 1:
        days = years * 365.25
        return f"{days:.0f} days"
    elif years < 100:
        return f"{years:.1f} years"
    elif years < 1000:
        return f"{years:.0f} years ({years/80:.1f} human lifetimes)"
    elif years < 1_000_000:
        return f"{years:,.0f} years ({years/80:,.0f} human lifetimes)"
    else:
        return f"{years/1_000_000:.2f} million years"
```

#### 6.3 Example Output

Walking from Earth to Mars (average 225 million km):
```json
{
  "travel_time_years": 616438,
  "human_readable_time": "616,438 years (7,705 human lifetimes)",
  "total_calories_burned": 13500000000000,
  "equivalent_pizzas": 47368421053,
  "generations_needed": 7705,
  "fun_comparisons": [
    "That's 5619 trips around Earth",
    "If you started when dinosaurs went extinct, you'd be 0.01% done",
    "Your great×7705-grandchildren could finish this"
  ]
}
```

---

### 7. Absurd Travel Modes

**Goal**: Implement comical travel methods with internally consistent rules.

#### 7.1 Absurd Mode Definitions

```python
# app/data/travel_modes.json - absurd section
{
  "id": "giant_slingshot",
  "name": "Giant Slingshot",
  "category": "absurd",
  "description": "A Y-shaped structure the size of Mount Everest",
  "physics": {
    "max_speed_km_s": 50,
    "acceleration_g": 47,  // Absolutely lethal
    "success_rate": 0.001,
    "requires_planet_surface": true
  },
  "rules": {
    "can_only_launch_from_surface": true,
    "no_steering": true,
    "random_destination_deviation_km": 10000000
  },
  "fun_description": "NASA's most budget-friendly option. Drawbacks include: instant death from G-forces, no way to aim, and the slingshot itself would collapse under its own weight. But think of the savings!"
}
```

#### 7.2 Absurd Mode Calculations

```python
@staticmethod
def _calculate_absurd(
    mode: TravelMode,
    distance_km: float,
    origin_planet: Planet
) -> dict:
    """
    Calculate travel for absurd modes.

    These follow comedy physics - internally consistent but ridiculous.
    """
    result = {}

    if mode.id == "giant_slingshot":
        # One giant acceleration, then coast
        launch_speed_km_s = 50  # Ludicrous speed

        # Time = distance / speed
        coast_time_seconds = distance_km / launch_speed_km_s

        # Massive random deviation
        deviation = np.random.uniform(-10_000_000, 10_000_000)

        result = {
            "travel_time_seconds": coast_time_seconds,
            "travel_time_days": coast_time_seconds / 86400,
            "launch_g_force": 47,  # Instantly lethal
            "survival_probability": 0.001,
            "destination_deviation_km": deviation,
            "warning": "You will almost certainly miss your target by millions of kilometers",
            "fun_notes": [
                "Acceleration phase: 0.2 seconds of pure terror",
                "Survivors report seeing their ancestors",
                "No steering wheel included (or possible)",
                f"You'll arrive {deviation/1000:,.0f} km off target"
            ]
        }

    elif mode.id == "cosmic_hitchhiking":
        # Based on "The Hitchhiker's Guide to the Galaxy"
        wait_time_days = np.random.exponential(365)  # Random wait

        # Once picked up, travel is instant(ish)
        result = {
            "travel_time_seconds": 0.1,  # Nearly instant
            "travel_time_days": 0.1 / 86400,
            "wait_time_for_ride_days": wait_time_days,
            "probability_of_pickup": 0.000001,
            "items_needed": ["towel", "thumb"],
            "fun_notes": [
                "Don't panic",
                "Always know where your towel is",
                f"Expected wait time: {wait_time_days:.0f} days",
                "Ride quality depends on alien species"
            ]
        }

    elif mode.id == "space_elevator":
        # Only works if origin has one
        climb_time_hours = distance_km / 300  # Slow climb

        result = {
            "travel_time_hours": climb_time_hours,
            "can_build_at_origin": origin_planet.gravity_m_s2 < 15,
            "construction_time_years": 50,
            "cost_usd": 10_000_000_000_000,
            "fun_notes": [
                "Great views during the 2-year climb",
                "No restroom stops available",
                "Destination: Nowhere in particular (you're still in orbit)"
            ]
        }

    return result
```

---

### 8. Impossible Travel Modes

**Goal**: Implement physics-breaking travel for maximum fun.

#### 8.1 Impossible Mode Definitions

```python
{
  "id": "teleportation",
  "name": "Teleportation",
  "category": "impossible",
  "description": "Instant transmission of matter",
  "physics": {
    "is_instant": true,
    "energy_cost_per_kg": "infinite",
    "side_effects": ["possible_duplication", "ethics_violation"]
  },
  "rules": {
    "cool_down_seconds": 3600,
    "max_mass_kg": 100,
    "requires_both_end_stations": true
  },
  "fun_description": "Warning: Teleportation may result in philosophical crises, loss of continuity of consciousness, or arriving as a fine mist. Insurance not available."
}

{
  "id": "warp_drive",
  "name": "Warp Drive",
  "category": "impossible",
  "description": "Bend spacetime to travel faster than light",
  "physics": {
    "max_warp_factor": 9.9,
    "warp_factor_to_speed": "warp^3.333 × c"
  },
  "fun_description": "Requires negative mass, which doesn't exist. But if you ignore that minor detail, you can cross the galaxy in minutes!"
}
```

#### 8.2 Impossible Mode Calculations

```python
@staticmethod
def _calculate_impossible(mode: TravelMode, distance_km: float) -> dict:
    """
    Calculate travel for impossible modes.

    These break physics entirely - pure sci-fi/fantasy.
    """
    SPEED_OF_LIGHT_KM_S = 299_792.458

    if mode.id == "teleportation":
        return {
            "travel_time_seconds": 0.0001,  # Practically instant
            "travel_time_human": "instant",
            "energy_required_joules": float('inf'),
            "cool_down_seconds": 3600,
            "side_effects": [
                "Possible existential crisis",
                "You may or may not be the same person after",
                "0.001% chance of matter duplication",
                "Insurance companies refuse to cover teleportation accidents"
            ],
            "requirements": [
                "Teleportation station at origin",
                "Teleportation station at destination",
                "Waiver signed by next of kin"
            ]
        }

    elif mode.id == "warp_drive":
        warp_factor = 5  # Default cruise
        speed_multiple = warp_factor ** 3.333
        effective_speed_km_s = SPEED_OF_LIGHT_KM_S * speed_multiple

        travel_time_seconds = distance_km / effective_speed_km_s

        return {
            "travel_time_seconds": travel_time_seconds,
            "travel_time_human": f"{travel_time_seconds:.2f} seconds at Warp {warp_factor}",
            "warp_factor": warp_factor,
            "effective_speed_times_c": speed_multiple,
            "energy_required_negative_mass_kg": 1000,
            "side_effects": [
                "Requires matter with negative mass (doesn't exist)",
                "Creates a bubble of normal space around ship",
                "Passengers experience no time dilation",
                "May anger physics professors everywhere"
            ]
        }

    elif mode.id == "hyperspace":
        # Star Wars style - different dimension
        return {
            "travel_time_seconds": distance_km / 10_000_000_000,  # Very fast
            "hyperspace_lanes": "Calculated by navicomputer",
            "requires_hyperdrive": True,
            "dangers": [
                "Flying through a star",
                "Bouncing too close to a supernova",
                "Ending the trip inside a planet"
            ],
            "fun_notes": [
                "Travel through another dimension where physics is more of a suggestion",
                "Navicomputer calculates safe route (usually)",
                "Bring snacks - hyperspace makes everyone hungry"
            ]
        }
```

---

### 9. Resource Estimation

**Goal**: Calculate mission resource requirements.

#### 9.1 Resource Engine

```python
# app/services/resource_engine.py
import numpy as np

class ResourceEngine:
    """Calculate mission resource requirements."""

    # Per-person per-day requirements
    WATER_LITERS_PER_DAY = 3.0
    FOOD_KG_PER_DAY = 1.8
    OXYGEN_LITERS_PER_DAY = 550
    ELECTRICITY_KWH_PER_DAY = 5.0

    @staticmethod
    def calculate_resources(
        travel_days: float,
        crew_size: int,
        mode: TravelMode
    ) -> dict:
        """
        Calculate all resources needed for a mission.
        """
        # Basic life support
        water_liters = crew_size * travel_days * ResourceEngine.WATER_LITERS_PER_DAY
        food_kg = crew_size * travel_days * ResourceEngine.FOOD_KG_PER_DAY
        oxygen_liters = crew_size * travel_days * ResourceEngine.OXYGEN_LITERS_PER_DAY
        electricity_kwh = crew_size * travel_days * ResourceEngine.ELECTRICITY_KWH_PER_DAY

        # Apply mode-specific multipliers
        multiplier = mode.fuel_efficiency  # Higher efficiency = less resources
        water_liters *= (2 - multiplier)
        food_kg *= (2 - multiplier)

        # Fuel calculation (for realistic modes)
        if mode.category in [TravelCategory.REALISTIC, TravelCategory.THEORETICAL]:
            fuel_kg = ResourceEngine.calculate_rocket_fuel(mode, distance_km)
        else:
            fuel_kg = 0  # Absurd/impossible modes don't use conventional fuel

        # Safety margin (10%)
        safety_margin = 0.10

        return {
            "life_support": {
                "water_liters": water_liters * (1 + safety_margin),
                "food_kg": food_kg * (1 + safety_margin),
                "oxygen_liters": oxygen_liters * (1 + safety_margin),
                "electricity_kwh": electricity_kwh * (1 + safety_margin)
            },
            "propulsion": {
                "fuel_kg": fuel_kg,
                "fuel_type": mode.fuel_type
            },
            "total_mass_kg": (
                water_liters + food_kg + fuel_kg
            ),
            "safety_margin_percent": safety_margin * 100,
            "per_crew_member": {
                "water_liters": water_liters / crew_size,
                "food_kg": food_kg / crew_size,
                "oxygen_liters": oxygen_liters / crew_size
            }
        }

    @staticmethod
    def calculate_rocket_fuel(mode: TravelMode, distance_km: float) -> float:
        """
        Calculate fuel using Tsiolkovsky rocket equation.

        Δv = ve * ln(m0 / mf)

        Rearranged: m0 = mf * e^(Δv / ve)
        """
        # Required delta-v (simplified)
        delta_v_m_s = distance_km * 1000 / 86400  # Rough estimate

        # Exhaust velocity (depends on fuel type)
        exhaust_velocity_m_s = 3000  # Typical chemical rocket

        # Dry mass (payload + structure)
        dry_mass_kg = 10000  # Typical spacecraft

        # Calculate wet mass (with fuel)
        mass_ratio = np.exp(delta_v_m_s / exhaust_velocity_m_s)
        wet_mass_kg = dry_mass_kg * mass_ratio

        # Fuel mass
        fuel_kg = wet_mass_kg - dry_mass_kg

        return max(fuel_kg, 0)
```

---

### 10. Cost Estimation

**Goal**: Calculate mission costs with realistic and humorous elements.

#### 10.1 Cost Engine

```python
# app/services/cost_engine.py
from dataclasses import dataclass

@dataclass
class CostBreakdown:
    launch_cost_usd: float
    fuel_cost_usd: float
    crew_cost_usd: float
    spacecraft_rental_usd: float
    mission_control_usd: float
    insurance_usd: float
    exotic_fees_usd: float
    contingency_usd: float
    total_usd: float

class CostEngine:
    """Calculate mission costs."""

    # Cost constants (approximate 2024 rates)
    LAUNCH_COST_PER_KG_LEO = 2700  # SpaceX Falcon 9
    LAUNCH_COST_PER_KG_MARS = 500_000  # Estimated
    MISSION_CONTROL_PER_DAY = 1_000_000
    CREW_TRAINING_PER_PERSON = 10_000_000
    INSURANCE_RATE = 0.15  # 15% of total

    @staticmethod
    def calculate_mission_cost(
        distance_km: float,
        travel_days: float,
        crew_size: int,
        mode: TravelMode,
        resources: dict
    ) -> CostBreakdown:
        """
        Calculate complete mission cost.
        """
        if mode.category == TravelCategory.HUMAN_POWERED:
            return CostEngine._calculate_human_powered_cost(
                distance_km, travel_days, crew_size, mode
            )
        elif mode.category in [TravelCategory.REALISTIC, TravelCategory.THEORETICAL]:
            return CostEngine._calculate_realistic_cost(
                distance_km, travel_days, crew_size, mode, resources
            )
        else:
            return CostEngine._calculate_absurd_cost(
                distance_km, travel_days, crew_size, mode
            )

    @staticmethod
    def _calculate_realistic_cost(
        distance_km: float,
        travel_days: float,
        crew_size: int,
        mode: TravelMode,
        resources: dict
    ) -> CostBreakdown:
        """Calculate cost for realistic propulsion."""
        total_mass = resources["total_mass_kg"]

        # Launch cost (to LEO then to destination)
        launch_cost = total_mass * CostEngine.LAUNCH_COST_PER_KG_LEO
        if distance_km > 100_000_000:  # Interplanetary
            launch_cost *= 10  # Higher cost for deep space

        # Fuel cost
        fuel_cost = resources["propulsion"]["fuel_kg"] * 100  # ~$100/kg for rocket fuel

        # Crew costs
        crew_cost = crew_size * CostEngine.CREW_TRAINING_PER_PERSON
        crew_cost += crew_size * travel_days * 1000  # Daily stipend

        # Spacecraft rental
        spacecraft_cost = travel_days * 500_000  # $500k/day

        # Mission control
        mission_control = travel_days * CostEngine.MISSION_CONTROL_PER_DAY

        # Exotic fees (for special modes)
        exotic_fees = mode.cost_per_km_usd * distance_km

        # Subtotal
        subtotal = (launch_cost + fuel_cost + crew_cost +
                   spacecraft_cost + mission_control + exotic_fees)

        # Insurance
        insurance = subtotal * CostEngine.INSURANCE_RATE

        # Contingency (15%)
        contingency = subtotal * 0.15

        total = subtotal + insurance + contingency

        return CostBreakdown(
            launch_cost_usd=launch_cost,
            fuel_cost_usd=fuel_cost,
            crew_cost_usd=crew_cost,
            spacecraft_rental_usd=spacecraft_cost,
            mission_control_usd=mission_control,
            insurance_usd=insurance,
            exotic_fees_usd=exotic_fees,
            contingency_usd=contingency,
            total_usd=total
        )

    @staticmethod
    def _calculate_human_powered_cost(
        distance_km: float,
        travel_days: float,
        crew_size: int,
        mode: TravelMode
    ) -> CostBreakdown:
        """Calculate cost for walking/running/cycling."""
        # Just food, shoes, and snacks
        food_cost = crew_size * travel_days * 50  # $50/day for food
        shoe_cost = (distance_km / 800) * 100  # New shoes every 800km
        snack_cost = distance_km * 0.10  # $0.10/km for snacks

        total = food_cost + shoe_cost + snack_cost

        return CostBreakdown(
            launch_cost_usd=0,
            fuel_cost_usd=0,
            crew_cost_usd=food_cost,
            spacecraft_rental_usd=0,
            mission_control_usd=0,
            insurance_usd=0,
            exotic_fees_usd=shoe_cost + snack_cost,
            contingency_usd=total * 0.10,
            total_usd=total * 1.10
        )

    @staticmethod
    def _calculate_absurd_cost(
        distance_km: float,
        travel_days: float,
        crew_size: int,
        mode: TravelMode
    ) -> CostBreakdown:
        """Calculate cost for absurd/impossible modes."""
        if mode.id == "teleportation":
            return CostBreakdown(
                launch_cost_usd=0,
                fuel_cost_usd=0,
                crew_cost_usd=0,
                spacecraft_rental_usd=0,
                mission_control_usd=0,
                insurance_usd=1_000_000_000,  # Expensive insurance
                exotic_fees_usd=999_999,  # Teleportation fee
                contingency_usd=0,
                total_usd=1_001_000_000
            )

        elif mode.id == "cosmic_hitchhiking":
            return CostBreakdown(
                launch_cost_usd=0,
                fuel_cost_usd=0,
                crew_cost_usd=50,  # Towel cost
                spacecraft_rental_usd=0,
                mission_control_usd=0,
                insurance_usd=0,
                exotic_fees_usd=0,  # Free ride!
                contingency_usd=25,  # Emergency snack fund
                total_usd=75
            )
```

---

### 11. Difficulty Scoring

**Goal**: Score mission difficulty for gamification.

#### 11.1 Difficulty Engine

```python
# app/services/difficulty_engine.py
from dataclasses import dataclass

@dataclass
class DifficultyAssessment:
    score: float              # 0-100
    rating: str               # Easy/Medium/Hard/Extreme/Impossible
    factors: dict[str, float]
    description: str

class DifficultyEngine:
    """Calculate mission difficulty."""

    WEIGHTS = {
        "distance": 0.20,
        "travel_time": 0.15,
        "mode_reliability": 0.25,
        "destination_environment": 0.20,
        "transfer_window": 0.10,
        "resource_requirements": 0.10
    }

    @staticmethod
    def calculate_difficulty(
        origin: Planet,
        destination: Planet,
        mode: TravelMode,
        distance_km: float,
        travel_days: float
    ) -> DifficultyAssessment:
        """
        Calculate difficulty score 0-100.
        """
        factors = {}

        # Distance factor (normalize to max possible in solar system ~4.5 billion km)
        max_distance = 4_500_000_000
        factors["distance"] = min(100, (distance_km / max_distance) * 100)

        # Travel time factor (longer = harder)
        max_reasonable_days = 365 * 5  # 5 years
        factors["travel_time"] = min(100, (travel_days / max_reasonable_days) * 100)

        # Mode reliability (inverse failure rate)
        factors["mode_reliability"] = (1 - mode.failure_rate) * 100

        # Destination environment
        factors["destination_environment"] = DifficultyEngine._assess_environment(destination)

        # Transfer window (placeholder - would need real calculation)
        factors["transfer_window"] = 50  # Default medium

        # Resource requirements
        factors["resource_requirements"] = min(100, travel_days * 0.1)

        # Calculate weighted score
        score = sum(
            factors[key] * DifficultyEngine.WEIGHTS[key]
            for key in DifficultyEngine.WEIGHTS
        )

        # Determine rating
        if score < 20:
            rating = "Easy"
            desc = "A pleasant journey for beginners"
        elif score < 40:
            rating = "Medium"
            desc = "Challenging but achievable"
        elif score < 60:
            rating = "Hard"
            desc = "Experienced travelers only"
        elif score < 80:
            rating = "Extreme"
            desc = "Only the bravest should attempt"
        else:
            rating = "Impossible"
            desc = "Not recommended for the living"

        return DifficultyAssessment(
            score=score,
            rating=rating,
            factors=factors,
            description=desc
        )

    @staticmethod
    def _assess_environment(planet: Planet) -> float:
        """Assess difficulty of destination environment."""
        score = 0

        # Temperature extremes
        if planet.avg_temp_celsius > 200 or planet.avg_temp_celsius < -100:
            score += 30
        elif planet.avg_temp_celsius > 100 or planet.avg_temp_celsius < -50:
            score += 20
        else:
            score += 10

        # Atmosphere
        if not planet.atmosphere_composition:
            score += 25  # No atmosphere = hard
        elif "O2" not in planet.atmosphere_composition:
            score += 15  # No oxygen = need suits

        # Gravity
        if planet.gravity_m_s2 > 15 or planet.gravity_m_s2 < 1:
            score += 20  # Extreme gravity
        else:
            score += 10

        return min(100, score)
```

---

### 12. Ridiculousness Scoring

**Goal**: Score how absurd a mission is (for entertainment value).

#### 12.1 Ridiculousness Engine

```python
# app/services/ridiculousness_engine.py
from dataclasses import dataclass

@dataclass
class RidiculousnessAssessment:
    score: float              # 0-100
    rating: str               # Sensible/Unusual/Quirky/Absurd/Maximum Chaos
    factors: dict[str, float]
    fun_facts: list[str]

class RidiculousnessEngine:
    """Calculate how ridiculous a mission is."""

    @staticmethod
    def calculate_ridiculousness(
        origin: Planet,
        destination: Planet,
        mode: TravelMode,
        distance_km: float,
        travel_days: float,
        cost_usd: float
    ) -> RidiculousnessAssessment:
        """
        Calculate ridiculousness score.

        Higher score = more entertainingly absurd.
        """
        factors = {}

        # Mode category base score
        category_scores = {
            TravelCategory.HUMAN_POWERED: 80,  # Walking to Mars = very ridiculous
            TravelCategory.REALISTIC: 10,
            TravelCategory.THEORETICAL: 30,
            TravelCategory.ABSURD: 70,
            TravelCategory.IMPOSSIBLE: 90
        }
        factors["mode_choice"] = category_scores.get(mode.category, 50)

        # Distance vs mode mismatch
        if mode.category == TravelCategory.HUMAN_POWERED and distance_km > 1_000_000:
            factors["distance_mode_mismatch"] = 100
        elif mode.category == TravelCategory.REALISTIC and distance_km < 10_000:
            factors["distance_mode_mismatch"] = 70  # Rocket for short trip = wasteful
        else:
            factors["distance_mode_mismatch"] = 10

        # Cost absurdity
        if mode.category == TravelCategory.HUMAN_POWERED and cost_usd < 1000:
            factors["cost_absurdity"] = 90  # Walking is cheap but takes forever
        elif cost_usd > 1_000_000_000_000:
            factors["cost_absurdity"] = 100  # Trillion dollar mission
        else:
            factors["cost_absurdity"] = 30

        # Time absurdity
        if travel_days > 365 * 1000:
            factors["time_absurdity"] = 100
        elif travel_days > 365 * 10:
            factors["time_absurdity"] = 70
        else:
            factors["time_absurdity"] = 20

        # Calculate average
        score = sum(factors.values()) / len(factors)

        # Generate fun facts
        fun_facts = RidiculousnessEngine._generate_fun_facts(
            origin, destination, mode, distance_km, travel_days, cost_usd
        )

        # Determine rating
        if score < 20:
            rating = "Sensible"
        elif score < 40:
            rating = "Unusual"
        elif score < 60:
            rating = "Quirky"
        elif score < 80:
            rating = "Absurd"
        else:
            rating = "Maximum Chaos"

        return RidiculousnessAssessment(
            score=score,
            rating=rating,
            factors=factors,
            fun_facts=fun_facts
        )

    @staticmethod
    def _generate_fun_facts(
        origin: Planet,
        destination: Planet,
        mode: TravelMode,
        distance_km: float,
        travel_days: float,
        cost_usd: float
    ) -> list[str]:
        """Generate humorous facts about the mission."""
        facts = []

        if mode.category == TravelCategory.HUMAN_POWERED:
            facts.append(f"If you started walking when the pyramids were built, you'd be {min(100, (4500*365/travel_days)*100):.1f}% done")
            facts.append(f"You'd need {travel_days*3/365:,.0f} years of snacks")
            facts.append("Your Fitbit would explode")

        if cost_usd > 1_000_000_000:
            facts.append(f"This costs more than the GDP of {max(1, int(cost_usd/1e9))} small countries")
            facts.append(f"You could buy {int(cost_usd/400000):,} luxury cars instead")

        if mode.id == "teleportation":
            facts.append("Philosophers are still debating if you'd survive")
            facts.append("Your clone might disagree about who is the real you")

        if mode.id == "cosmic_hitchhiking":
            facts.append("Don't forget your towel!")
            facts.append("Trust us, you look silly with your thumb out")

        return facts
```

---

### 13. What-If Simulation

**Goal**: Allow users to explore "what if" scenarios with modified parameters.

#### 13.1 Simulation Model

```python
# app/models/simulation.py
from pydantic import BaseModel
from typing import Optional

class WhatIfScenario(BaseModel):
    origin_id: str
    destination_id: str
    travel_date: str
    mode_id: str
    crew_size: int
    modifications: dict[str, any]  # User-defined changes

class SimulationResult(BaseModel):
    scenario_id: str
    baseline: dict                  # Original calculation
    modified: dict                  # Modified calculation
    comparison: dict                # Differences
    outcome: str                    # success/partial_failure/failure
    events: list[dict]              # Journey events
    lessons_learned: list[str]      # What the simulation taught
```

#### 13.2 Simulation Engine

```python
# app/services/simulation_engine.py
import uuid
import random

class SimulationEngine:
    """Run what-if scenarios and journey simulations."""

    @staticmethod
    def run_what_if(scenario: WhatIfScenario) -> SimulationResult:
        """
        Run a modified scenario and compare to baseline.
        """
        # Calculate baseline
        baseline = MissionCalculator.calculate_mission(
            scenario.origin_id,
            scenario.destination_id,
            scenario.travel_date,
            scenario.mode_id,
            scenario.crew_size
        )

        # Apply modifications
        modified = baseline.copy()
        for key, value in scenario.modifications.items():
            if key in modified:
                modified[key] = SimulationEngine._apply_modification(
                    modified[key], value
                )

        # Recalculate dependent values
        modified = SimulationEngine._recalculate(modified, scenario)

        # Compare
        comparison = SimulationEngine._compare(baseline, modified)

        # Generate events
        events = SimulationEngine._generate_events(scenario, modified)

        # Determine outcome
        outcome = SimulationEngine._determine_outcome(scenario, modified, events)

        # Lessons learned
        lessons = SimulationEngine._generate_lessons(comparison, outcome)

        return SimulationResult(
            scenario_id=str(uuid.uuid4()),
            baseline=baseline,
            modified=modified,
            comparison=comparison,
            outcome=outcome,
            events=events,
            lessons_learned=lessons
        )

    @staticmethod
    def _generate_events(scenario: WhatIfScenario, modified: dict) -> list[dict]:
        """Generate journey events based on scenario."""
        events = []
        mode = DataLoader.get_travel_mode(scenario.mode_id)

        # Seed random for reproducibility
        random.seed(hash(f"{scenario.origin_id}{scenario.destination_id}{scenario.travel_date}"))

        # Generate events at regular intervals
        num_events = int(modified["travel_time_days"] / 30)  # ~1 event per month
        num_events = max(3, min(num_events, 20))  # 3-20 events

        event_templates = {
            "realistic": [
                ("Course correction burn", "minor_fuel_use"),
                ("Solar panel efficiency check", "minor_event"),
                ("Crew health check", "minor_event"),
                ("Navigation calibration", "minor_event")
            ],
            "absurd": [
                ("Aliens spotted! (It was space debris)", "minor_event"),
                ("Crew ran out of snacks", "morale_drop"),
                ("Someone pressed the red button", "critical_event"),
                ("Space pigeon attacked solar panels", "minor_damage")
            ],
            "impossible": [
                ("Reality glitch detected", "dimensional_event"),
                ("Time loop encountered", "temporal_event"),
                ("Physics engine complained", "impossible_event")
            ]
        }

        category = mode["category"]
        templates = event_templates.get(category, event_templates["realistic"])

        for i in range(num_events):
            template = random.choice(templates)
            events.append({
                "day": int((i + 1) * modified["travel_time_days"] / num_events),
                "event": template[0],
                "type": template[1],
                "severity": "minor" if "minor" in template[1] else "major"
            })

        return events

    @staticmethod
    def _determine_outcome(scenario: WhatIfScenario, modified: dict, events: dict) -> str:
        """Determine mission outcome."""
        mode = DataLoader.get_travel_mode(scenario.mode_id)
        failure_rate = mode["failure_rate"]

        # Count major events
        major_events = sum(1 for e in events if e["severity"] == "major")

        # Adjust failure rate based on events
        adjusted_failure = failure_rate + (major_events * 0.1)

        # Roll for outcome
        roll = random.random()
        if roll < adjusted_failure:
            return "failure"
        elif roll < adjusted_failure + 0.1:
            return "partial_failure"
        else:
            return "success"
```

---

### 14. Cosmic Travel Race

**Goal**: Allow comparison of multiple travel modes racing to the same destination.

#### 14.1 Race Model

```python
# app/models/race.py
from pydantic import BaseModel

class RaceParticipant(BaseModel):
    mode_id: str
    name: str

class RaceRequest(BaseModel):
    origin_id: str
    destination_id: str
    travel_date: str
    participants: list[RaceParticipant]

class RaceResult(BaseModel):
    race_id: str
    origin: str
    destination: str
    date: str
    participants: list[dict]
    winner: dict
    time_differences: dict[str, str]
    fun_commentary: str
```

#### 14.2 Race Engine

```python
# app/services/race_engine.py
import uuid

class RaceEngine:
    """Simulate races between different travel modes."""

    @staticmethod
    def run_race(request: RaceRequest) -> RaceResult:
        """
        Run a race between multiple travel modes.
        """
        results = []

        for participant in request.participants:
            # Calculate travel time for this mode
            mission = MissionCalculator.calculate_mission(
                request.origin_id,
                request.destination_id,
                request.travel_date,
                participant.mode_id,
                crew_size=1
            )

            results.append({
                "mode_id": participant.mode_id,
                "mode_name": participant.name,
                "travel_time_seconds": mission["travel_time_seconds"],
                "travel_time_human": mission["travel_time_human"],
                "cost_usd": mission["cost_usd"],
                "difficulty": mission["difficulty"]["rating"],
                "survival_probability": 1 - DataLoader.get_travel_mode(participant.mode_id)["failure_rate"]
            })

        # Sort by travel time
        results.sort(key=lambda x: x["travel_time_seconds"])

        winner = results[0]

        # Calculate time differences
        time_diffs = {}
        for r in results[1:]:
            diff = r["travel_time_seconds"] - winner["travel_time_seconds"]
            time_diffs[r["mode_name"]] = RaceEngine._format_time_difference(diff)

        # Generate commentary
        commentary = RaceEngine._generate_commentary(results, request)

        return RaceResult(
            race_id=str(uuid.uuid4()),
            origin=request.origin_id,
            destination=request.destination_id,
            date=request.travel_date,
            participants=results,
            winner=winner,
            time_differences=time_diffs,
            fun_commentary=commentary
        )

    @staticmethod
    def _format_time_difference(seconds: float) -> str:
        """Format time difference in human-readable form."""
        if seconds < 60:
            return f"{seconds:.1f} seconds behind"
        elif seconds < 3600:
            return f"{seconds/60:.1f} minutes behind"
        elif seconds < 86400:
            return f"{seconds/3600:.1f} hours behind"
        elif seconds < 86400 * 365:
            return f"{seconds/86400:.1f} days behind"
        else:
            return f"{seconds/(86400*365):.1f} YEARS behind"

    @staticmethod
    def _generate_commentary(results: list[dict], request: RaceRequest) -> str:
        """Generate fun race commentary."""
        winner = results[0]
        loser = results[-1]

        commentary = []

        commentary.append(f"🏆 {winner['mode_name']} wins the race to {request.destination_id}!")

        if winner['travel_time_seconds'] < 1:
            commentary.append("In the time it took to read this sentence, they arrived.")
        elif winner['travel_time_seconds'] < 3600:
            commentary.append("A quick trip!")
        elif winner['travel_time_seconds'] < 86400 * 365:
            commentary.append(f"Arrived in just {winner['travel_time_human']}!")

        if loser['travel_time_seconds'] > winner['travel_time_seconds'] * 1000:
            commentary.append(f"Meanwhile, {loser['mode_name']} is still packing their bags...")
            commentary.append(f"They'll arrive in roughly {loser['travel_time_human']}.")

        if any(r['survival_probability'] < 0.5 for r in results):
            commentary.append("⚠️ Some participants may not survive to see the finish line.")

        return " ".join(commentary)
```

---

### 15. Random Challenge Generator

**Goal**: Generate random travel challenges for users to attempt.

#### 15.1 Challenge Model

```python
# app/models/challenge.py
from pydantic import BaseModel
from enum import Enum

class ChallengeDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    IMPOSSIBLE = "impossible"
    RIDICULOUS = "ridiculous"

class Challenge(BaseModel):
    challenge_id: str
    title: str
    description: str
    origin_id: str
    destination_id: str
    mode_id: str
    constraints: dict
    difficulty: ChallengeDifficulty
    time_limit_seconds: float
    cost_limit_usd: float
    success_criteria: dict
    fun_description: str
    reward: str
```

#### 15.2 Challenge Engine

```python
# app/services/challenge_engine.py
import random
import uuid

class ChallengeEngine:
    """Generate random travel challenges."""

    CHALLENGE_TEMPLATES = [
        {
            "title": "Budget Traveler",
            "description": "Complete the journey under budget",
            "constraint_type": "cost",
            "difficulty_range": (20, 40)
        },
        {
            "title": "Speed Demon",
            "description": "Get there as fast as possible",
            "constraint_type": "time",
            "difficulty_range": (30, 60)
        },
        {
            "title": "Survival Mode",
            "description": "Choose a mode with low failure rate",
            "constraint_type": "survival",
            "difficulty_range": (10, 30)
        },
        {
            "title": "The Long Way Round",
            "description": "Use the slowest possible method",
            "constraint_type": "time_max",
            "difficulty_range": (50, 80)
        },
        {
            "title": "Interplanetary Cheapskate",
            "description": "Spend less than $100 on your journey",
            "constraint_type": "cost_min",
            "difficulty_range": (60, 90)
        }
    ]

    @staticmethod
    def generate_challenge(difficulty: str = None) -> Challenge:
        """Generate a random challenge."""
        planets = DataLoader.load_planets()["planets"]
        modes = DataLoader.load_travel_modes()["modes"]

        # Pick random origin/destination (different)
        origin, destination = random.sample(planets, 2)

        # Pick challenge template
        template = random.choice(ChallengeEngine.CHALLENGE_TEMPLATES)

        # Pick appropriate mode
        mode = ChallengeEngine._select_mode_for_challenge(
            template, difficulty, modes
        )

        # Generate constraints
        constraints = ChallengeEngine._generate_constraints(
            template, origin, destination, mode
        )

        # Calculate baseline mission
        baseline = MissionCalculator.calculate_mission(
            origin["id"],
            destination["id"],
            "2024-01-01",  # Default date
            mode["id"],
            1
        )

        # Set limits based on constraint type
        if template["constraint_type"] == "cost":
            cost_limit = baseline["cost_usd"] * random.uniform(0.5, 0.8)
            time_limit = baseline["travel_time_seconds"] * 2
        elif template["constraint_type"] == "time":
            time_limit = baseline["travel_time_seconds"] * random.uniform(0.6, 0.9)
            cost_limit = baseline["cost_usd"] * 2
        else:
            time_limit = baseline["travel_time_seconds"] * 1.5
            cost_limit = baseline["cost_usd"] * 1.5

        # Generate fun description
        fun_desc = ChallengeEngine._generate_fun_description(
            origin, destination, mode, template
        )

        # Generate reward
        reward = ChallengeEngine._generate_reward(difficulty)

        return Challenge(
            challenge_id=str(uuid.uuid4()),
            title=template["title"],
            description=template["description"],
            origin_id=origin["id"],
            destination_id=destination["id"],
            mode_id=mode["id"],
            constraints=constraints,
            difficulty=difficulty or "medium",
            time_limit_seconds=time_limit,
            cost_limit_usd=cost_limit,
            success_criteria={
                "complete_journey": True,
                "within_budget": True,
                "within_time": True
            },
            fun_description=fun_desc,
            reward=reward
        )

    @staticmethod
    def _generate_fun_description(origin, destination, mode, template) -> str:
        """Generate humorous challenge description."""
        descriptions = {
            "Budget Traveler": f"Your accountant said you can't spend more than {random.randint(100, 1000)} spacebucks. "
                             f"Prove them wrong by getting from {origin['name']} to {destination['name']} on a shoestring budget!",
            "Speed Demon": f"A cosmic event is happening on {destination['name']} in just a short while! "
                          f"Race there using {mode['name']} before you miss the best fireworks show in the solar system!",
            "The Long Way Round": f"Some say the journey is the destination. "
                                 f"You're about to test that theory with a {mode['name']} trip. "
                                 f"Bring a good playlist. And snacks. Lots of snacks."
        }
        return descriptions.get(template["title"],
            f"Travel from {origin['name']} to {destination['name']} using {mode['name']}. "
            f"What could possibly go wrong?"
        )

    @staticmethod
    def _generate_reward(difficulty: str) -> str:
        """Generate reward text."""
        rewards = {
            "easy": "Bronze Space Explorer Badge + 100 cosmic credits",
            "medium": "Silver Space Explorer Badge + 500 cosmic credits",
            "hard": "Gold Space Explorer Badge + 1000 cosmic credits",
            "impossible": "Platinum Space Explorer Badge + 5000 cosmic credits + bragging rights",
            "ridiculous": "Diamond Space Explorer Badge + 10000 cosmic credits + a certificate suitable for framing"
        }
        return rewards.get(difficulty, rewards["medium"])
```

---

### 16. AI Travel Report

**Goal**: Generate engaging narrative reports using LLM.

#### 16.1 AI Report Model

```python
# app/models/report.py
from pydantic import BaseModel

class TravelReport(BaseModel):
    report_id: str
    mission_summary: str
    journey_narrative: str
    crew_log: list[str]
    highlights: list[str]
    warnings: list[str]
    recommendations: str
    fun_rating: float  # 1-10
```

#### 16.2 AI Report Engine

```python
# app/services/ai_report_engine.py
from anthropic import Anthropic
import uuid

class AIReportEngine:
    """Generate narrative reports using LLM."""

    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)

    async def generate_report(
        self,
        origin: Planet,
        destination: Planet,
        mode: TravelMode,
        mission_data: dict,
        events: list[dict]
    ) -> TravelReport:
        """
        Generate an engaging travel report.

        IMPORTANT: LLM only generates narrative text.
        All calculations (time, distance, cost) are deterministic
        and passed as facts to the LLM.
        """
        # Build prompt with factual data
        prompt = self._build_prompt(origin, destination, mode, mission_data, events)

        # Call LLM
        message = self.client.messages.create(
            model="claude-sonnet-5",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        # Parse response into structured report
        report_text = message.content[0].text

        return self._parse_response(report_text, mission_data)

    def _build_prompt(
        self,
        origin: Planet,
        destination: Planet,
        mode: TravelMode,
        mission_data: dict,
        events: list[dict]
    ) -> str:
        """Build prompt with all factual mission data."""
        return f"""You are the ship's AI computer aboard a {mode.name} vessel.

Generate a travel report for a mission from {origin.name} to {destination.name}.

IMPORTANT FACTUAL DATA (do not modify these):
- Distance: {mission_data['distance_km']:,.0f} km
- Travel Time: {mission_data['travel_time_human']}
- Cost: ${mission_data['cost_usd']:,.2f}
- Crew Size: {mission_data['crew_size']}
- Difficulty: {mission_data['difficulty']['rating']}
- Mode: {mode.name} ({mode.category})

JOURNEY EVENTS:
{self._format_events(events)}

ORIGIN PLANET: {origin.name}
{origin.description}

DESTINATION PLANET: {destination.name}
{destination.description}

TRAVEL MODE: {mode.name}
{mode.fun_description}

Generate a JSON response with:
1. "mission_summary": A 2-3 sentence overview with humorous tone
2. "journey_narrative": A paragraph about the journey (be creative and funny)
3. "crew_log": 3-5 log entries from the crew's perspective
4. "highlights": 3 memorable moments from the trip
5. "warnings": 2-3 things future travelers should know
6. "recommendations": Advice for anyone crazy enough to try this
7. "fun_rating": A number 1-10

Keep the tone entertaining and match the absurdity level of the travel mode.
For human-powered modes, emphasize the sheer impossibility.
For impossible modes, embrace the sci-fi absurdity.
"""

    def _format_events(self, events: list[dict]) -> str:
        """Format events for prompt."""
        formatted = []
        for e in events:
            formatted.append(f"Day {e['day']}: {e['event']}")
        return "\n".join(formatted)

    def _parse_response(self, text: str, mission_data: dict) -> TravelReport:
        """Parse LLM response into structured report."""
        import json

        try:
            # Try to parse as JSON
            data = json.loads(text)
        except:
            # Fallback if not valid JSON
            data = {
                "mission_summary": text[:200],
                "journey_narrative": text,
                "crew_log": ["Log entry not available"],
                "highlights": ["Journey completed"],
                "warnings": ["Results may vary"],
                "recommendations": "Bring snacks",
                "fun_rating": 7.0
            }

        return TravelReport(
            report_id=str(uuid.uuid4()),
            mission_summary=data.get("mission_summary", ""),
            journey_narrative=data.get("journey_narrative", ""),
            crew_log=data.get("crew_log", []),
            highlights=data.get("highlights", []),
            warnings=data.get("warnings", []),
            recommendations=data.get("recommendations", ""),
            fun_rating=data.get("fun_rating", 7.0)
        )
```

---

### 17. API Integration

**Goal**: Define all API endpoints.

#### 17.1 Mission Calculator (Orchestrator)

```python
# app/services/mission_calculator.py
class MissionCalculator:
    """Orchestrate all engines to calculate a complete mission."""

    @staticmethod
    def calculate_mission(
        origin_id: str,
        destination_id: str,
        travel_date: str,
        mode_id: str,
        crew_size: int
    ) -> dict:
        """
        Calculate complete mission details using all engines.
        """
        # Load data
        origin = DataLoader.get_planet(origin_id)
        destination = DataLoader.get_planet(destination_id)
        mode_data = DataLoader.get_travel_mode(mode_id)

        origin_planet = Planet(**origin)
        dest_planet = Planet(**destination)
        mode = TravelMode(**mode_data)

        # Calculate position
        date_obj = datetime.strptime(travel_date, "%Y-%m-%d").date()
        origin_pos = AstronomyEngine.calculate_heliocentric_position(origin_planet, date_obj)

        # Calculate distance
        distance_km = DistanceEngine.get_interplanetary_distance(
            origin_id, destination_id, date_obj
        )["distance_km"]

        # Calculate travel time
        travel_result = TravelModeEngine.calculate_travel_time(
            mode, distance_km, origin_planet, dest_planet
        )

        # Calculate resources
        resources = ResourceEngine.calculate_resources(
            travel_result["travel_time_days"],
            crew_size,
            mode
        )

        # Calculate cost
        cost = CostEngine.calculate_mission_cost(
            distance_km,
            travel_result["travel_time_days"],
            crew_size,
            mode,
            resources
        )

        # Calculate difficulty
        difficulty = DifficultyEngine.calculate_difficulty(
            origin_planet, dest_planet, mode,
            distance_km, travel_result["travel_time_days"]
        )

        # Calculate ridiculousness
        ridiculousness = RidiculousnessEngine.calculate_ridiculousness(
            origin_planet, dest_planet, mode,
            distance_km, travel_result["travel_time_days"],
            cost.total_usd
        )

        return {
            "origin": origin,
            "destination": destination,
            "mode": mode_data,
            "travel_date": travel_date,
            "distance_km": distance_km,
            "travel_time_seconds": travel_result.get("travel_time_seconds", 0),
            "travel_time_days": travel_result.get("travel_time_days", 0),
            "travel_time_years": travel_result.get("travel_time_years", 0),
            "travel_time_human": travel_result.get("travel_time_human", ""),
            "crew_size": crew_size,
            "resources": resources,
            "cost": cost.__dict__,
            "difficulty": difficulty.__dict__,
            "ridiculousness": ridiculousness.__dict__
        }
```

#### 17.2 Complete API Router

```python
# app/routes/missions.py
from fastapi import APIRouter

router = APIRouter()

@router.post("/calculate")
async def calculate_mission(request: MissionRequest) -> MissionResult:
    """
    Calculate a complete mission.

    Returns distance, travel time, resources, cost, difficulty, and ridiculousness.
    """
    return MissionCalculator.calculate_mission(
        request.origin_id,
        request.destination_id,
        request.travel_date,
        request.mode_id,
        request.crew_size
    )

@router.post("/simulate")
async def simulate_mission(request: SimulationRequest) -> SimulationResult:
    """Run a mission simulation with events."""
    return SimulationEngine.run_what_if(request.scenario)

@router.post("/race")
async def run_race(request: RaceRequest) -> RaceResult:
    """Run a race between multiple travel modes."""
    return RaceEngine.run_race(request)

@router.get("/challenge")
async def get_challenge(difficulty: str = None) -> Challenge:
    """Get a random challenge."""
    return ChallengeEngine.generate_challenge(difficulty)

@router.post("/report")
async def generate_report(request: ReportRequest) -> TravelReport:
    """Generate an AI travel report."""
    # First calculate mission
    mission = MissionCalculator.calculate_mission(...)

    # Generate events
    events = SimulationEngine._generate_events(...)

    # Generate report
    return await AIReportEngine.generate_report(...)

@router.get("/planets/{planet_id}/position")
async def get_planet_position(planet_id: str, date: str) -> dict:
    """Get planet position at a specific date."""
    date_obj = datetime.strptime(date, "%Y-%m-%d").date()
    return AstronomyEngine.get_planet_position(planet_id, date_obj)

@router.post("/distance")
async def calculate_distance(request: DistanceRequest) -> dict:
    """Calculate distance between two planets."""
    return DistanceEngine.get_interplanetary_distance(
        request.origin_id,
        request.destination_id,
        request.date
    )
```

---

### 18. Testing Strategy

**Goal**: Comprehensive testing for all components.

#### 18.1 Test Categories

| Category | What to Test | Tools |
|----------|--------------|-------|
| Unit Tests | Individual engine methods | pytest |
| Integration Tests | Full calculation pipelines | pytest |
| API Tests | Endpoint responses | pytest + httpx |
| Determinism Tests | Same inputs = same outputs | pytest |

#### 18.2 Example Tests

```python
# tests/test_astronomy.py
import pytest
from datetime import date

def test_planet_position_is_deterministic():
    """Same planet and date must always return same position."""
    pos1 = AstronomyEngine.get_planet_position("earth", date(2024, 6, 15))
    pos2 = AstronomyEngine.get_planet_position("earth", date(2024, 6, 15))

    assert pos1["position_au"] == pos2["position_au"]

def test_planet_position_changes_over_time():
    """Planet position should change over time."""
    pos1 = AstronomyEngine.get_planet_position("earth", date(2024, 1, 1))
    pos2 = AstronomyEngine.get_planet_position("earth", date(2024, 7, 1))

    assert pos1["position_au"] != pos2["position_au"]

def test_mars_year_is_longer():
    """Mars orbital period should be longer than Earth's."""
    earth = DataLoader.get_planet("earth")
    mars = DataLoader.get_planet("mars")

    assert mars["orbital_period_days"] > earth["orbital_period_days"]


# tests/test_distance.py
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

    assert distance["distance_km"] < 1_000_000  # Less than 1 million km


# tests/test_travel_modes.py
def test_walking_takes_very_long_time():
    """Walking to Mars should take millions of years."""
    result = TravelModeEngine.calculate_travel_time(
        walk_mode, 225_000_000, earth, mars
    )

    assert result["travel_time_years"] > 100_000

def test_teleportation_is_instant():
    """Teleportation should be near-instant."""
    result = TravelModeEngine.calculate_travel_time(
        teleport_mode, 225_000_000, earth, mars
    )

    assert result["travel_time_seconds"] < 1

def test_realistic_mode_respects_physics():
    """Realistic modes should not exceed speed of light."""
    result = TravelModeEngine.calculate_travel_time(
        ion_drive_mode, 225_000_000, earth, mars
    )

    min_time = 225_000_000 / 299_792  # Speed of light in km/s
    assert result["travel_time_seconds"] > min_time


# tests/test_determinism.py
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

    assert result1["distance_km"] == result2["distance_km"]
    assert result1["travel_time_days"] == result2["travel_time_days"]
    assert result1["cost"]["total_usd"] == result2["cost"]["total_usd"]
```

#### 18.3 Test Coverage Goals

| Component | Target Coverage |
|-----------|-----------------|
| Astronomy Engine | 95% |
| Distance Engine | 95% |
| Travel Mode Engine | 90% |
| Resource Engine | 90% |
| Cost Engine | 85% |
| Difficulty Engine | 85% |
| Ridiculousness Engine | 80% |
| Simulation Engine | 80% |
| Race Engine | 80% |
| Challenge Engine | 75% |
| AI Report Engine | 70% (mock LLM) |

---

## Implementation Order

### Phase 1: Foundation (Week 1)
1. Project structure
2. FastAPI setup
3. Pydantic models
4. Static data (planets, modes)
5. Basic endpoints

### Phase 2: Core Calculations (Week 2)
1. Astronomy Engine
2. Distance Engine
3. Travel Mode Engine (realistic)

### Phase 3: Travel Modes (Week 3)
1. Human-powered calculations
2. Absurd travel modes
3. Impossible travel modes

### Phase 4: Mission Data (Week 4)
1. Resource Engine
2. Cost Engine
3. Difficulty Engine
4. Ridiculousness Engine

### Phase 5: Features (Week 5)
1. Simulation Engine
2. Race Engine
3. Challenge Generator

### Phase 6: AI Integration (Week 6)
1. AI Report Engine
2. API polish
3. Documentation

### Phase 7: Testing & Polish (Week 7)
1. Comprehensive tests
2. Performance optimization
3. Error handling
4. Final documentation

---

## API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /api/v1/planets | List all planets |
| GET | /api/v1/planets/{id} | Get planet details |
| GET | /api/v1/planets/{id}/position | Get position at date |
| GET | /api/v1/travel-modes | List all travel modes |
| GET | /api/v1/travel-modes/{id} | Get mode details |
| POST | /api/v1/missions/calculate | Calculate mission |
| POST | /api/v1/missions/simulate | Run simulation |
| POST | /api/v1/missions/race | Run race |
| GET | /api/v1/missions/challenge | Get random challenge |
| POST | /api/v1/missions/report | Generate AI report |
| POST | /api/v1/distance | Calculate distance |

---

## Ready for Implementation

This plan is ready for your approval. Once approved, I will begin with Phase 1: Foundation, starting with the project structure and FastAPI setup.
