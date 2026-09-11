import numpy as np
import random
from typing import Dict, Any, Tuple

from app.models.travel_mode import TravelCategory
from app.services.data_loader import DataLoader
from app.utils.constants import (
    AVERAGE_WALKING_SPEED_KM_H,
    AVERAGE_RUNNING_SPEED_KM_H,
    AVERAGE_CYCLING_SPEED_KM_H,
    AVERAGE_SWIMMING_SPEED_KM_H,
    CALORIES_PER_WALKING_KM,
    CALORIES_PER_RUNNING_KM,
    CALORIES_PER_CYCLING_KM,
    SPEED_OF_LIGHT_KM_S
)


class TravelModeEngine:
    """Calculate travel times for all mode categories."""

    # Human-powered speed map
    HUMAN_SPEEDS = {
        "walk": AVERAGE_WALKING_SPEED_KM_H,
        "run": AVERAGE_RUNNING_SPEED_KM_H,
        "bicycle": AVERAGE_CYCLING_SPEED_KM_H,
    }

    # Human-powered calorie map
    HUMAN_CALORIES = {
        "walk": CALORIES_PER_WALKING_KM,
        "run": CALORIES_PER_RUNNING_KM,
        "bicycle": CALORIES_PER_CYCLING_KM,
    }

    @staticmethod
    def calculate_travel_time(
        mode_data: Dict[str, Any],
        distance_km: float,
        origin_planet: Dict[str, Any],
        dest_planet: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate travel time based on mode category.
        """
        category = mode_data["category"]

        if category == TravelCategory.HUMAN_POWERED.value:
            return TravelModeEngine._calculate_human_powered(mode_data, distance_km)
        elif category == TravelCategory.REALISTIC.value:
            return TravelModeEngine._calculate_realistic(mode_data, distance_km)
        elif category == TravelCategory.THEORETICAL.value:
            return TravelModeEngine._calculate_theoretical(mode_data, distance_km)
        elif category == TravelCategory.ABSURD.value:
            return TravelModeEngine._calculate_absurd(mode_data, distance_km, origin_planet)
        else:  # IMPOSSIBLE
            return TravelModeEngine._calculate_impossible(mode_data, distance_km)

    @staticmethod
    def _format_human_time(years: float) -> str:
        """Convert years to human-readable format."""
        if years < 1:
            days = years * 365.25
            return f"{days:.1f} days"
        elif years < 100:
            return f"{years:.1f} years"
        elif years < 1000:
            lifetimes = years / 80
            return f"{years:.0f} years ({lifetimes:.1f} human lifetimes)"
        elif years < 1_000_000:
            lifetimes = years / 80
            return f"{years:,.0f} years ({lifetimes:,.0f} human lifetimes)"
        else:
            return f"{years/1_000_000:.2f} million years"

    @staticmethod
    def _calculate_human_powered(mode_data: Dict[str, Any], distance_km: float) -> Dict[str, Any]:
        """Calculate travel time for human-powered modes."""
        mode_id = mode_data["id"]
        speed_km_h = TravelModeEngine.HUMAN_SPEEDS.get(mode_id, 5.0)

        # Calculate active travel time
        active_hours = distance_km / speed_km_h

        # Account for daily rest (can only travel ~8 hours/day)
        travel_hours_per_day = mode_data.get("special_rules", {}).get("daily_travel_hours", 8)
        days_needed = active_hours / travel_hours_per_day

        # Add rest days (1 rest day per 6 travel days)
        rest_days = days_needed / 6
        total_days = days_needed + rest_days

        # Calculate calories
        cal_per_km = TravelModeEngine.HUMAN_CALORIES.get(mode_id, 60)
        total_calories = distance_km * cal_per_km

        # Calculate years and generations
        years = total_days / 365.25
        generations = years / 80

        # Generate fun comparisons
        earth_circumference = 40075
        pizza_calories = 285

        fun_comparisons = [
            f"That's {distance_km / earth_circumference:.2f} trips around Earth",
            f"You'd burn {total_calories:,.0f} calories ({total_calories/pizza_calories:.0f} pizzas)",
        ]

        if years > 66000000:
            fun_comparisons.append(
                f"If you started when dinosaurs went extinct, you'd be {(66000000/years)*100:.2f}% done"
            )

        if generations > 1:
            fun_comparisons.append(
                f"Your great×{int(generations)}-grandchildren could finish this"
            )

        return {
            "travel_time_seconds": total_days * 86400,
            "travel_time_days": total_days,
            "travel_time_years": years,
            "travel_time_human": TravelModeEngine._format_human_time(years),
            "max_speed_reached_km_s": speed_km_h / 3600,
            "active_travel_hours": active_hours,
            "rest_days": rest_days,
            "total_calories_burned": total_calories,
            "equivalent_pizzas": total_calories / pizza_calories,
            "generations_needed": generations,
            "fun_comparisons": fun_comparisons
        }

    @staticmethod
    def _calculate_realistic(mode_data: Dict[str, Any], distance_km: float) -> Dict[str, Any]:
        """Calculate travel time for realistic propulsion."""
        max_speed_km_s = mode_data["max_speed_km_s"]
        acceleration = mode_data["acceleration_m_s2"]

        # Time to accelerate to max speed (in seconds)
        t_accel = (max_speed_km_s * 1000) / acceleration

        # Distance covered during acceleration (in km)
        accel_distance_km = 0.5 * acceleration * t_accel**2 / 1000

        # Check if we reach max speed
        if 2 * accel_distance_km > distance_km:
            # Never reach max speed - accelerate halfway, decelerate halfway
            t_total = 2 * np.sqrt((distance_km * 1000) / acceleration)
            max_reached_speed = np.sqrt(distance_km * 1000 * acceleration) / 1000
            t_cruise = 0
        else:
            # Accelerate, cruise, decelerate
            cruise_distance = distance_km - 2 * accel_distance_km
            t_cruise = cruise_distance / max_speed_km_s
            t_total = 2 * t_accel + t_cruise
            max_reached_speed = max_speed_km_s

        days = t_total / 86400
        years = days / 365.25

        return {
            "travel_time_seconds": float(t_total),
            "travel_time_days": days,
            "travel_time_years": years,
            "travel_time_human": TravelModeEngine._format_human_time(years),
            "max_speed_reached_km_s": max_reached_speed,
            "phase_breakdown": {
                "acceleration_seconds": t_accel,
                "cruise_seconds": t_cruise,
                "deceleration_seconds": t_accel
            }
        }

    @staticmethod
    def _calculate_theoretical(mode_data: Dict[str, Any], distance_km: float) -> Dict[str, Any]:
        """Calculate travel time for theoretical propulsion."""
        # Similar to realistic but may have special rules
        return TravelModeEngine._calculate_realistic(mode_data, distance_km)

    @staticmethod
    def _calculate_absurd(
        mode_data: Dict[str, Any],
        distance_km: float,
        origin_planet: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate travel for absurd modes."""
        mode_id = mode_data["id"]
        special_rules = mode_data.get("special_rules", {})

        if mode_id == "giant_slingshot":
            launch_speed = mode_data["max_speed_km_s"]
            coast_time = distance_km / launch_speed

            deviation = random.uniform(
                -special_rules.get("random_deviation_km", 10000000),
                special_rules.get("random_deviation_km", 10000000)
            )

            days = coast_time / 86400

            return {
                "travel_time_seconds": coast_time,
                "travel_time_days": days,
                "travel_time_years": days / 365.25,
                "travel_time_human": TravelModeEngine._format_human_time(days / 365.25),
                "max_speed_reached_km_s": launch_speed,
                "launch_g_force": special_rules.get("launch_g_force", 47),
                "survival_probability": 1 - mode_data["failure_rate"],
                "destination_deviation_km": deviation,
                "fun_notes": [
                    "Acceleration phase: 0.2 seconds of pure terror",
                    "Survivors report seeing their ancestors",
                    "No steering wheel included (or possible)",
                    f"You'll arrive {deviation/1000:,.0f} km off target"
                ]
            }

        elif mode_id == "cosmic_hitchhiking":
            wait_time = random.exponential(special_rules.get("wait_time_days", 365))

            return {
                "travel_time_seconds": 0.1,
                "travel_time_days": 0.1 / 86400,
                "travel_time_years": 0.0,
                "travel_time_human": "instant (once you get a ride)",
                "wait_time_for_ride_days": wait_time,
                "probability_of_pickup": special_rules.get("probability_of_pickup", 0.000001),
                "items_needed": ["towel", "thumb"],
                "fun_notes": [
                    "Don't panic",
                    "Always know where your towel is",
                    f"Expected wait time: {wait_time:.0f} days",
                    "Ride quality depends on alien species"
                ]
            }

        elif mode_id == "space_elevator":
            speed_km_s = mode_data["max_speed_km_s"]
            travel_time = distance_km / speed_km_s if distance_km < 100000 else float('inf')

            return {
                "travel_time_seconds": travel_time if travel_time != float('inf') else None,
                "travel_time_days": travel_time / 86400 if travel_time != float('inf') else None,
                "travel_time_years": 0,
                "travel_time_human": "Not applicable - space elevator only reaches orbit",
                "construction_time_years": special_rules.get("construction_time_years", 50),
                "can_build_at_origin": origin_planet["gravity_m_s2"] < 15,
                "fun_notes": [
                    "Great views during the climb!",
                    "No restroom stops available",
                    "You're still just in orbit, not going anywhere"
                ]
            }

        # Default absurd calculation
        return TravelModeEngine._calculate_realistic(mode_data, distance_km)

    @staticmethod
    def _calculate_impossible(mode_data: Dict[str, Any], distance_km: float) -> Dict[str, Any]:
        """Calculate travel for impossible modes."""
        mode_id = mode_data["id"]
        special_rules = mode_data.get("special_rules", {})

        if mode_id == "teleportation":
            return {
                "travel_time_seconds": 0.0001,
                "travel_time_days": 0.0,
                "travel_time_years": 0.0,
                "travel_time_human": "instant",
                "max_speed_reached_km_s": float('inf'),
                "energy_required_joules": float('inf'),
                "cool_down_seconds": special_rules.get("cool_down_seconds", 3600),
                "side_effects": [
                    "Possible existential crisis",
                    "You may or may not be the same person after",
                    "0.001% chance of matter duplication",
                    "Insurance companies refuse coverage"
                ]
            }

        elif mode_id == "warp_drive":
            warp_factor = special_rules.get("warp_factor", 5)
            # Warp speed formula: warp^3.333 × c
            speed_multiple = warp_factor ** 3.333
            effective_speed = SPEED_OF_LIGHT_KM_S * speed_multiple

            travel_time = distance_km / effective_speed

            return {
                "travel_time_seconds": travel_time,
                "travel_time_days": travel_time / 86400,
                "travel_time_years": 0.0,
                "travel_time_human": f"{travel_time:.2f} seconds at Warp {warp_factor}",
                "max_speed_reached_km_s": effective_speed,
                "warp_factor": warp_factor,
                "effective_speed_times_c": speed_multiple,
                "side_effects": [
                    "Requires negative mass (doesn't exist)",
                    "Creates a bubble of normal space around ship",
                    "May anger physics professors everywhere"
                ]
            }

        elif mode_id == "hyperspace":
            effective_speed = 1_000_000_000  # Very fast
            travel_time = distance_km / effective_speed

            return {
                "travel_time_seconds": travel_time,
                "travel_time_days": travel_time / 86400,
                "travel_time_years": 0.0,
                "travel_time_human": f"{travel_time:.2f} seconds in hyperspace",
                "max_speed_reached_km_s": effective_speed,
                "dangers": [
                    "Flying through a star",
                    "Bouncing too close to a supernova",
                    "Ending the trip inside a planet"
                ],
                "fun_notes": [
                    "Travel through another dimension",
                    "Navicomputer calculates safe route (usually)",
                    "Bring snacks - hyperspace makes everyone hungry"
                ]
            }

        # Default impossible calculation
        return {
            "travel_time_seconds": 1.0,
            "travel_time_days": 1.0 / 86400,
            "travel_time_years": 0.0,
            "travel_time_human": "nearly instant",
            "max_speed_reached_km_s": SPEED_OF_LIGHT_KM_S
        }
