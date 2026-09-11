import numpy as np
import random
from typing import Dict, Any, Tuple, Optional

from app.models.travel_mode import TravelCategory
from app.services.data_loader import DataLoader
from app.utils.constants import (
    AVERAGE_WALKING_SPEED_KM_H,
    AVERAGE_RUNNING_SPEED_KM_H,
    AVERAGE_CYCLING_SPEED_KM_H,
    CALORIES_PER_WALKING_KM,
    CALORIES_PER_RUNNING_KM,
    CALORIES_PER_CYCLING_KM,
    SPEED_OF_LIGHT_KM_S
)


class TravelModeEngine:
    """Calculate travel times for all mode categories."""

    HUMAN_SPEEDS = {
        "walk": AVERAGE_WALKING_SPEED_KM_H,
        "run": AVERAGE_RUNNING_SPEED_KM_H,
        "bicycle": AVERAGE_CYCLING_SPEED_KM_H,
    }

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
        dest_planet: Dict[str, Any],
        speed_override_km_h: Optional[float] = None,
        active_hours_override: Optional[float] = None
    ) -> Dict[str, Any]:
        if distance_km <= 0:
            return {
                "travel_time_seconds": 0.0,
                "travel_time_days": 0.0,
                "travel_time_years": 0.0,
                "travel_time_human": "0 seconds (Already at destination)",
                "max_speed_reached_km_s": 0.0,
                "phase_breakdown": {"acceleration_seconds": 0.0, "cruise_seconds": 0.0, "deceleration_seconds": 0.0}
            }

        category = mode_data.get("category", "realistic")

        if category == TravelCategory.HUMAN_POWERED.value:
            return TravelModeEngine._calculate_human_powered(mode_data, distance_km, speed_override_km_h, active_hours_override)
        elif category == TravelCategory.REALISTIC.value:
            return TravelModeEngine._calculate_realistic(mode_data, distance_km, speed_override_km_h)
        elif category == TravelCategory.THEORETICAL.value:
            return TravelModeEngine._calculate_theoretical(mode_data, distance_km, speed_override_km_h)
        elif category == TravelCategory.ABSURD.value:
            return TravelModeEngine._calculate_absurd(mode_data, distance_km, origin_planet, speed_override_km_h)
        else:  # IMPOSSIBLE
            return TravelModeEngine._calculate_impossible(mode_data, distance_km, speed_override_km_h)

    @staticmethod
    def _format_human_time(years: float) -> str:
        if years <= 0:
            return "0 seconds"
        elif years < (1.0 / 365.25):
            hours = years * 365.25 * 24
            return f"{hours:.1f} hours"
        elif years < 1:
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
    def _calculate_human_powered(
        mode_data: Dict[str, Any],
        distance_km: float,
        speed_override_km_h: Optional[float] = None,
        active_hours_override: Optional[float] = None
    ) -> Dict[str, Any]:
        mode_id = mode_data["id"]
        speed_km_h = speed_override_km_h if speed_override_km_h and speed_override_km_h > 0 else TravelModeEngine.HUMAN_SPEEDS.get(mode_id, 5.0)

        active_hours = distance_km / speed_km_h
        travel_hours_per_day = active_hours_override if active_hours_override and active_hours_override > 0 else mode_data.get("special_rules", {}).get("daily_travel_hours", 8)
        days_needed = active_hours / travel_hours_per_day

        rest_days = days_needed / 6
        total_days = days_needed + rest_days

        cal_per_km = TravelModeEngine.HUMAN_CALORIES.get(mode_id, 60)
        total_calories = distance_km * cal_per_km

        years = total_days / 365.25
        generations = years / 80

        earth_circumference = 40075
        pizza_calories = 285

        fun_comparisons = [
            f"That's {distance_km / earth_circumference:.2f} trips around Earth",
            f"You'd burn {total_calories:,.0f} calories ({total_calories/pizza_calories:.0f} pizzas)",
        ]

        if generations > 1:
            fun_comparisons.append(f"Your great×{int(generations)}-grandchildren could finish this")

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
    def _calculate_realistic(
        mode_data: Dict[str, Any],
        distance_km: float,
        speed_override_km_h: Optional[float] = None
    ) -> Dict[str, Any]:
        max_speed_km_s = (speed_override_km_h / 3600.0) if speed_override_km_h and speed_override_km_h > 0 else mode_data.get("max_speed_km_s", 10.0)
        acceleration = mode_data.get("acceleration_m_s2", 10.0)

        t_accel = (max_speed_km_s * 1000) / max(acceleration, 0.001)
        accel_distance_km = 0.5 * acceleration * (t_accel ** 2) / 1000

        if 2 * accel_distance_km > distance_km:
            t_total = 2 * np.sqrt((distance_km * 1000) / max(acceleration, 0.001))
            max_reached_speed = np.sqrt(distance_km * 1000 * acceleration) / 1000
            t_cruise = 0
        else:
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
                "acceleration_seconds": float(t_accel),
                "cruise_seconds": float(t_cruise),
                "deceleration_seconds": float(t_accel)
            }
        }

    @staticmethod
    def _calculate_theoretical(
        mode_data: Dict[str, Any],
        distance_km: float,
        speed_override_km_h: Optional[float] = None
    ) -> Dict[str, Any]:
        return TravelModeEngine._calculate_realistic(mode_data, distance_km, speed_override_km_h)

    @staticmethod
    def _calculate_absurd(
        mode_data: Dict[str, Any],
        distance_km: float,
        origin_planet: Dict[str, Any],
        speed_override_km_h: Optional[float] = None
    ) -> Dict[str, Any]:
        mode_id = mode_data["id"]
        special_rules = mode_data.get("special_rules", {})

        if mode_id == "giant_slingshot":
            launch_speed = (speed_override_km_h / 3600.0) if speed_override_km_h else mode_data["max_speed_km_s"]
            coast_time = distance_km / max(launch_speed, 0.001)
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
                "fun_notes": ["Acceleration phase: 0.2 seconds of pure terror", "No steering wheel included"]
            }

        elif mode_id == "cosmic_hitchhiking":
            wait_time = float(np.random.exponential(special_rules.get("wait_time_days", 365)))
            return {
                "travel_time_seconds": 0.1,
                "travel_time_days": 0.1 / 86400,
                "travel_time_years": 0.0,
                "travel_time_human": "instant (once you get a ride)",
                "wait_time_for_ride_days": wait_time,
                "probability_of_pickup": special_rules.get("probability_of_pickup", 0.000001),
                "items_needed": ["towel", "thumb"],
                "fun_notes": ["Don't panic", "Always know where your towel is"]
            }

        elif mode_id == "space_elevator":
            speed_km_s = (speed_override_km_h / 3600.0) if speed_override_km_h else mode_data["max_speed_km_s"]
            travel_time = distance_km / max(speed_km_s, 0.0001)
            days = travel_time / 86400
            years = days / 365.25
            return {
                "travel_time_seconds": travel_time,
                "travel_time_days": days,
                "travel_time_years": years,
                "travel_time_human": f"{years:.1f} years (space elevator reaches orbit only)",
                "construction_time_years": special_rules.get("construction_time_years", 50),
                "can_build_at_origin": origin_planet.get("gravity_m_s2", 9.8) < 15,
                "fun_notes": ["Great views during climb!", "No restroom stops available"]
            }

        elif mode_id in ["snail", "horse", "skateboard"]:
            speed_km_s = (speed_override_km_h / 3600.0) if speed_override_km_h else mode_data.get("average_speed_km_s", 0.0001)
            daily_hours = special_rules.get("daily_travel_hours", 4)
            active_hours = distance_km / (speed_km_s * 3600.0)
            days_needed = active_hours / max(daily_hours, 1.0)
            years = days_needed / 365.25
            return {
                "travel_time_seconds": days_needed * 86400,
                "travel_time_days": days_needed,
                "travel_time_years": years,
                "travel_time_human": TravelModeEngine._format_human_time(years),
                "max_speed_reached_km_s": speed_km_s,
                "fun_notes": [f"Traveling via {mode_data['name']}", "Extreme patience required"]
            }

        return TravelModeEngine._calculate_realistic(mode_data, distance_km, speed_override_km_h)

    @staticmethod
    def _calculate_impossible(
        mode_data: Dict[str, Any],
        distance_km: float,
        speed_override_km_h: Optional[float] = None
    ) -> Dict[str, Any]:
        mode_id = mode_data["id"]
        special_rules = mode_data.get("special_rules", {})

        if mode_id in ["teleportation", "instant_travel", "magic_portal"]:
            return {
                "travel_time_seconds": 0.0001,
                "travel_time_days": 0.0,
                "travel_time_years": 0.0,
                "travel_time_human": "instant",
                "max_speed_reached_km_s": 299792458.0,
                "energy_required_joules": 1e30,
                "cool_down_seconds": special_rules.get("cool_down_seconds", 3600),
                "side_effects": ["Existential crisis", "Possible quantum duplication"]
            }

        elif mode_id in ["warp_drive", "black_hole_shortcut", "hyperspace"]:
            speed_km_s = (speed_override_km_h / 3600.0) if speed_override_km_h else mode_data.get("average_speed_km_s", 299792458.0)
            travel_time = distance_km / max(speed_km_s, 1.0)
            result_dict = {
                "travel_time_seconds": travel_time,
                "travel_time_days": travel_time / 86400,
                "travel_time_years": (travel_time / 86400) / 365.25,
                "travel_time_human": f"{travel_time:.2f} seconds across spacetime",
                "max_speed_reached_km_s": speed_km_s,
                "side_effects": ["Spacetime bending", "Negative mass requirement"]
            }
            if mode_id == "warp_drive":
                result_dict["warp_factor"] = special_rules.get("warp_factor", 5)
            return result_dict


        return {
            "travel_time_seconds": 1.0,
            "travel_time_days": 1.0 / 86400,
            "travel_time_years": 0.0,
            "travel_time_human": "nearly instant",
            "max_speed_reached_km_s": SPEED_OF_LIGHT_KM_S
        }
