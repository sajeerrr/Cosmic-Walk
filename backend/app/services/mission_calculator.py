from datetime import date, datetime
from typing import Dict, Any

from app.services.data_loader import DataLoader
from app.services.astronomy_engine import AstronomyEngine
from app.services.distance_engine import DistanceEngine
from app.services.travel_mode_engine import TravelModeEngine
from app.services.resource_engine import ResourceEngine
from app.services.cost_engine import CostEngine, CostBreakdown
from app.services.difficulty_engine import DifficultyEngine
from app.services.ridiculousness_engine import RidiculousnessEngine


class MissionCalculator:
    """Orchestrate all engines to calculate a complete mission."""

    @staticmethod
    def calculate_mission(
        origin_id: str,
        destination_id: str,
        travel_date: str,
        mode_id: str,
        crew_size: int
    ) -> Dict[str, Any]:
        """
        Calculate complete mission details using all engines.
        """
        # Load data
        origin = DataLoader.get_planet(origin_id)
        destination = DataLoader.get_planet(destination_id)
        mode_data = DataLoader.get_travel_mode(mode_id)

        # Parse date
        date_obj = datetime.strptime(travel_date, "%Y-%m-%d").date()

        # Calculate distance
        distance_result = DistanceEngine.get_interplanetary_distance(
            origin_id, destination_id, date_obj
        )
        distance_km = distance_result["distance_km"]

        # Calculate travel time
        travel_result = TravelModeEngine.calculate_travel_time(
            mode_data, distance_km, origin, destination
        )

        travel_days = travel_result.get("travel_time_days", 0)

        # Calculate resources
        resources = ResourceEngine.calculate_resources(
            travel_days, crew_size, mode_data, distance_km
        )

        # Calculate cost
        cost = CostEngine.calculate_mission_cost(
            distance_km, travel_days, crew_size, mode_data, resources
        )

        # Calculate difficulty
        difficulty = DifficultyEngine.calculate_difficulty(
            origin, destination, mode_data,
            distance_km, travel_days, cost.total_usd
        )

        # Calculate ridiculousness
        ridiculousness = RidiculousnessEngine.calculate_ridiculousness(
            origin, destination, mode_data,
            distance_km, travel_days, cost.total_usd
        )

        return {
            "origin": origin,
            "destination": destination,
            "mode": mode_data,
            "travel_date": travel_date,
            "distance_km": distance_km,
            "distance_au": distance_result["distance_au"],
            "light_minutes": distance_result["light_minutes"],
            "travel_time": travel_result,
            "crew_size": crew_size,
            "resources": resources,
            "cost": {
                "launch_cost_usd": cost.launch_cost_usd,
                "fuel_cost_usd": cost.fuel_cost_usd,
                "crew_cost_usd": cost.crew_cost_usd,
                "spacecraft_rental_usd": cost.spacecraft_rental_usd,
                "mission_control_usd": cost.mission_control_usd,
                "insurance_usd": cost.insurance_usd,
                "exotic_fees_usd": cost.exotic_fees_usd,
                "contingency_usd": cost.contingency_usd,
                "total_usd": cost.total_usd
            },
            "difficulty": {
                "score": difficulty.score,
                "rating": difficulty.rating,
                "factors": difficulty.factors,
                "description": difficulty.description
            },
            "ridiculousness": {
                "score": ridiculousness.score,
                "rating": ridiculousness.rating,
                "factors": ridiculousness.factors,
                "fun_facts": ridiculousness.fun_facts
            }
        }
