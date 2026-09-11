from typing import Dict, Any, List
from dataclasses import dataclass

from app.models.travel_mode import TravelCategory


@dataclass
class RidiculousnessAssessment:
    score: float
    rating: str
    factors: Dict[str, float]
    fun_facts: List[str]


class RidiculousnessEngine:
    """Calculate how ridiculous a mission is."""

    @staticmethod
    def calculate_ridiculousness(
        origin: Dict[str, Any],
        destination: Dict[str, Any],
        mode_data: Dict[str, Any],
        distance_km: float,
        travel_days: float,
        total_cost: float
    ) -> RidiculousnessAssessment:
        """Calculate ridiculousness score."""
        factors = {}

        # Mode category base score
        category = mode_data.get("category", "realistic")
        category_scores = {
            TravelCategory.HUMAN_POWERED.value: 80,
            TravelCategory.REALISTIC.value: 10,
            TravelCategory.THEORETICAL.value: 30,
            TravelCategory.ABSURD.value: 70,
            TravelCategory.IMPOSSIBLE.value: 90
        }
        factors["mode_choice"] = category_scores.get(category, 50)

        # Distance vs mode mismatch
        if category == TravelCategory.HUMAN_POWERED.value and distance_km > 1_000_000:
            factors["distance_mode_mismatch"] = 100
        elif category == TravelCategory.REALISTIC.value and distance_km < 10_000:
            factors["distance_mode_mismatch"] = 70
        else:
            factors["distance_mode_mismatch"] = 10

        # Cost absurdity
        if category == TravelCategory.HUMAN_POWERED.value and total_cost < 1000:
            factors["cost_absurdity"] = 90
        elif total_cost > 1_000_000_000_000:
            factors["cost_absurdity"] = 100
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
            origin, destination, mode_data, distance_km, travel_days, total_cost
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
            score=round(score, 1),
            rating=rating,
            factors={k: round(v, 1) for k, v in factors.items()},
            fun_facts=fun_facts
        )

    @staticmethod
    def _generate_fun_facts(
        origin: Dict[str, Any],
        destination: Dict[str, Any],
        mode_data: Dict[str, Any],
        distance_km: float,
        travel_days: float,
        total_cost: float
    ) -> List[str]:
        """Generate humorous facts about the mission."""
        facts = []
        category = mode_data.get("category", "realistic")
        mode_id = mode_data.get("id", "")

        if category == TravelCategory.HUMAN_POWERED.value:
            years = travel_days / 365.25
            if years > 4500:
                progress = min(100, (4500 * 365.25 / travel_days) * 100)
                facts.append(
                    f"If you started when the pyramids were built, you'd be {progress:.1f}% done"
                )
            facts.append(f"You'd need {travel_days * 3 / 365:.0f} years worth of snacks")
            facts.append("Your Fitbit would explode")

        if total_cost > 1_000_000_000:
            countries = int(total_cost / 1_000_000_000)
            facts.append(
                f"This costs more than the GDP of {max(1, countries)} small countries"
            )
            cars = int(total_cost / 400000)
            facts.append(f"You could buy {cars:,} luxury cars instead")

        if mode_id == "teleportation":
            facts.append("Philosophers are still debating if you'd survive")
            facts.append("Your clone might disagree about who is the real you")

        if mode_id == "cosmic_hitchhiking":
            facts.append("Don't forget your towel!")
            facts.append("You look silly with your thumb out in space")

        if mode_id == "giant_slingshot":
            facts.append("47 Gs of pure existential regret")
            facts.append("No refunds on the splatter pattern")

        if not facts:
            facts.append(f"Travel from {origin['name']} to {destination['name']}!")
            facts.append("A journey of a billion kilometers begins with a single step")

        return facts
