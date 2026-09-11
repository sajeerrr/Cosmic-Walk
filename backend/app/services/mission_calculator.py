from datetime import datetime
from typing import Dict, Any, Optional

from app.services.data_loader import DataLoader
from app.services.astronomy_engine import AstronomyEngine
from app.services.distance_engine import DistanceEngine
from app.services.travel_mode_engine import TravelModeEngine
from app.services.resource_engine import ResourceEngine
from app.services.cost_engine import CostEngine
from app.services.difficulty_engine import DifficultyEngine
from app.services.ridiculousness_engine import RidiculousnessEngine
from app.services.verdict_engine import VerdictEngine
from app.services.scale_engine import ScaleEngine
from app.models.mission import MissionModifier



class MissionCalculator:
    """Orchestrate all engines to calculate a complete mission."""

    @staticmethod
    def calculate_mission(
        origin_id: str,
        destination_id: str,
        travel_date: str,
        mode_id: str,
        crew_size: int = 1,
        modifiers: Optional[MissionModifier] = None,
        seed: Optional[int] = None
    ) -> Dict[str, Any]:
        # Load celestial objects or planets
        try:
            origin = DataLoader.get_celestial_object(origin_id)
        except ValueError:
            origin = DataLoader.get_planet(origin_id)

        try:
            destination = DataLoader.get_celestial_object(destination_id)
        except ValueError:
            destination = DataLoader.get_planet(destination_id)

        mode_data = DataLoader.get_travel_mode(mode_id)

        # Parse date
        date_obj = datetime.strptime(travel_date, "%Y-%m-%d").date()

        # Calculate distance
        distance_result = DistanceEngine.get_interplanetary_distance(
            origin_id, destination_id, date_obj
        )
        distance_km = distance_result["distance_km"]

        # Modifier overrides
        speed_override = modifiers.speed_override_km_h if modifiers else None
        active_hours_override = modifiers.active_hours_per_day if modifiers else None
        unlimited_food = modifiers.unlimited_food if modifiers else False
        unlimited_water = modifiers.unlimited_water if modifiers else False
        unlimited_fuel = modifiers.unlimited_fuel if modifiers else False

        # Calculate travel time
        travel_result = TravelModeEngine.calculate_travel_time(
            mode_data, distance_km, origin, destination,
            speed_override_km_h=speed_override,
            active_hours_override=active_hours_override
        )

        travel_days = travel_result.get("travel_time_days", 0)

        # Calculate resources
        resources = ResourceEngine.calculate_resources(
            travel_days, crew_size, mode_data, distance_km,
            unlimited_food=unlimited_food,
            unlimited_water=unlimited_water,
            unlimited_fuel=unlimited_fuel
        )

        # Add cargo mass if modifier specified
        if modifiers and modifiers.cargo_mass_kg:
            resources["total_mass_kg"] += modifiers.cargo_mass_kg

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

        result_dict = {
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

        # Calculate Verdict
        verdict = VerdictEngine.generate_verdict(origin, destination, mode_data, result_dict)
        result_dict["verdict"] = {
            "classification": verdict.classification,
            "score": verdict.score,
            "title": verdict.title,
            "summary": verdict.summary
        }

        # Calculate Scale Comparisons
        scale_items = ScaleEngine.calculate_scale_comparisons(
            distance_km,
            travel_result.get("travel_time_years", 0),
            travel_days,
            resources.get("life_support", {}).get("food_kcal", 0)
        )
        result_dict["scale_comparison"] = [item.model_dump() for item in scale_items]

        # Generate Random Events
        if not modifiers or modifiers.random_events_enabled:
            from app.services.simulation_engine import SimulationEngine
            result_dict["events"] = SimulationEngine.generate_random_events(
                origin_id, destination_id, travel_date, mode_id, seed=seed
            )
        else:
            result_dict["events"] = []


        return result_dict
