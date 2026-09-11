from typing import Dict, Any
from dataclasses import dataclass


@dataclass
class DifficultyAssessment:
    score: float
    rating: str
    factors: Dict[str, float]
    description: str


class DifficultyEngine:
    """Calculate mission difficulty."""

    WEIGHTS = {
        "distance": 0.20,
        "travel_time": 0.15,
        "mode_reliability": 0.25,
        "destination_environment": 0.20,
        "resource_requirements": 0.10,
        "cost": 0.10
    }

    @staticmethod
    def calculate_difficulty(
        origin: Dict[str, Any],
        destination: Dict[str, Any],
        mode_data: Dict[str, Any],
        distance_km: float,
        travel_days: float,
        total_cost: float
    ) -> DifficultyAssessment:
        """Calculate difficulty score 0-100."""
        factors = {}

        # Distance factor (normalize to max ~4.5 billion km for Pluto at aphelion from Mercury)
        max_distance = 4_500_000_000
        factors["distance"] = min(100, (distance_km / max_distance) * 100)

        # Travel time factor
        max_reasonable_days = 365 * 5  # 5 years
        factors["travel_time"] = min(100, (travel_days / max_reasonable_days) * 100)

        # Mode reliability (inverse failure rate)
        failure_rate = mode_data.get("failure_rate", 0.5)
        factors["mode_reliability"] = (1 - failure_rate) * 100

        # Destination environment
        factors["destination_environment"] = DifficultyEngine._assess_environment(destination)

        # Resource requirements
        factors["resource_requirements"] = min(100, travel_days * 0.01)

        # Cost factor
        if total_cost > 1_000_000_000_000:
            factors["cost"] = 100
        elif total_cost > 100_000_000_000:
            factors["cost"] = 80
        elif total_cost > 10_000_000_000:
            factors["cost"] = 60
        elif total_cost > 1_000_000_000:
            factors["cost"] = 40
        else:
            factors["cost"] = 20

        # Calculate weighted score
        score = sum(
            factors[key] * DifficultyEngine.WEIGHTS.get(key, 0.1)
            for key in factors
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
            score=round(score, 1),
            rating=rating,
            factors={k: round(v, 1) for k, v in factors.items()},
            description=desc
        )

    @staticmethod
    def _assess_environment(planet: Dict[str, Any]) -> float:
        """Assess difficulty of destination environment."""
        score = 0

        # Temperature extremes
        temp = planet.get("avg_temp_celsius", 15)
        if temp > 200 or temp < -100:
            score += 30
        elif temp > 100 or temp < -50:
            score += 20
        else:
            score += 10

        # Atmosphere
        atmosphere = planet.get("atmosphere_composition", {})
        if not atmosphere:
            score += 25
        elif "O2" not in atmosphere:
            score += 15

        # Gravity
        gravity = planet.get("gravity_m_s2", 9.8)
        if gravity > 15 or gravity < 1:
            score += 20
        else:
            score += 10

        return min(100, score)
