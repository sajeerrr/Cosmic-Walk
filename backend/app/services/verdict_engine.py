from typing import Dict, Any
from app.models.mission import MissionVerdict


class VerdictEngine:
    """Generate structured mission verdicts."""

    @staticmethod
    def generate_verdict(
        origin: Dict[str, Any],
        destination: Dict[str, Any],
        mode: Dict[str, Any],
        mission_data: Dict[str, Any]
    ) -> MissionVerdict:
        category = mode.get("category", "realistic")
        travel_years = mission_data.get("travel_time", {}).get("travel_time_years", 0.0)
        difficulty_score = mission_data.get("difficulty", {}).get("score", 50.0)
        ridiculousness_score = mission_data.get("ridiculousness", {}).get("score", 50.0)
        origin_name = origin.get("name", "Origin")
        dest_name = destination.get("name", "Destination")
        mode_name = mode.get("name", "Locomotion")

        if category == "impossible":
            classification = "IMPOSSIBLE"
            score = 99.0
            title = "Physics-Defying Spacetime Paradox"
            summary = f"Attempting travel from {origin_name} to {dest_name} via {mode_name} transcends known physical law. Reality itself requires a disclaimer."
        elif category == "absurd":
            classification = "ABSURD"
            score = max(85.0, min(98.0, ridiculousness_score))
            title = "Comically Questionable Decision"
            summary = f"Taking {mode_name} from {origin_name} to {dest_name} is technically a journey, but scientifically and practically unadvisable."
        elif travel_years > 100 or difficulty_score > 80:
            classification = "EXTREME"
            score = min(95.0, difficulty_score)
            title = "Multi-Generational Endurance Trial"
            summary = f"Covering {mission_data.get('distance_km', 0):,.0f} km using {mode_name} requires severe endurance spanning generations."
        elif travel_years > 2 or difficulty_score > 50:
            classification = "DIFFICULT"
            score = difficulty_score
            title = "Challenging Interplanetary Transit"
            summary = f"A serious mission from {origin_name} to {dest_name} demanding careful supply planning and physical preparation."
        else:
            classification = "SENSIBLE"
            score = max(10.0, difficulty_score)
            title = "Standard Routine Trajectory"
            summary = f"A swift and practical journey from {origin_name} to {dest_name} using standard high-efficiency velocity."

        return MissionVerdict(
            classification=classification,
            score=round(score, 1),
            title=title,
            summary=summary
        )
