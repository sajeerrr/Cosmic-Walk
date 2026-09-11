from typing import Dict, Any
import numpy as np

from app.utils.constants import (
    WATER_LITERS_PER_DAY,
    FOOD_KG_PER_DAY,
    OXYGEN_LITERS_PER_DAY,
    ELECTRICITY_KWH_PER_DAY
)


class ResourceEngine:
    """Calculate mission resource requirements."""

    @staticmethod
    def calculate_resources(
        travel_days: float,
        crew_size: int,
        mode_data: Dict[str, Any],
        distance_km: float,
        unlimited_food: bool = False,
        unlimited_water: bool = False,
        unlimited_fuel: bool = False
    ) -> Dict[str, Any]:
        mode_id = mode_data.get("id", "walk")
        category = mode_data.get("category", "realistic")
        special_rules = mode_data.get("special_rules", {})

        safety_margin = 0.10

        # Base life support calculations
        if unlimited_water:
            water_liters = 0.0
        else:
            water_liters = crew_size * travel_days * WATER_LITERS_PER_DAY

        if unlimited_food:
            food_kg = 0.0
        elif mode_id == "snail":
            lettuce_per_day = special_rules.get("lettuce_kg_per_day", 0.1)
            food_kg = travel_days * lettuce_per_day
        elif mode_id == "horse":
            hay_per_day = special_rules.get("hay_kg_per_day", 12.0)
            food_kg = travel_days * hay_per_day
        else:
            food_kg = crew_size * travel_days * FOOD_KG_PER_DAY

        oxygen_liters = crew_size * travel_days * OXYGEN_LITERS_PER_DAY
        electricity_kwh = crew_size * travel_days * ELECTRICITY_KWH_PER_DAY

        # Fuel calculation
        if unlimited_fuel or category in ["human_powered", "impossible"]:
            fuel_kg = 0.0
        else:
            fuel_kg = ResourceEngine._calculate_rocket_fuel(mode_data, distance_km)

        total_mass = water_liters + food_kg + fuel_kg

        return {
            "life_support": {
                "water_liters": float(water_liters * (1 + safety_margin)),
                "food_kg": float(food_kg * (1 + safety_margin)),
                "food_kcal": float(food_kg * 2500.0),
                "oxygen_liters": float(oxygen_liters * (1 + safety_margin)),
                "oxygen_kg": float(oxygen_liters * 0.0014),
                "electricity_kwh": float(electricity_kwh * (1 + safety_margin))
            },
            "propulsion": {
                "fuel_kg": float(fuel_kg),
                "fuel_type": mode_data.get("fuel_type", "calories")
            },
            "total_mass_kg": float(total_mass),
            "safety_margin_percent": float(safety_margin * 100),
            "per_crew_member": {
                "water_liters": float(water_liters / crew_size if crew_size > 0 else 0),
                "food_kg": float(food_kg / crew_size if crew_size > 0 else 0),
                "oxygen_liters": float(oxygen_liters / crew_size if crew_size > 0 else 0)
            }
        }

    @staticmethod
    def _calculate_rocket_fuel(mode_data: Dict[str, Any], distance_km: float) -> float:
        delta_v_m_s = min(distance_km * 1000 / 86400, 50000)
        fuel_type = mode_data.get("fuel_type", "chemical")
        exhaust_velocities = {
            "liquid_hydrogen_lox": 4500,
            "xenon": 30000,
            "hydrogen": 9000,
            "deuterium_helium3": 100000,
            "nuclear_bombs": 50000,
        }
        exhaust_velocity = exhaust_velocities.get(fuel_type, 3000)
        dry_mass_kg = 10000
        mass_ratio = np.exp(delta_v_m_s / exhaust_velocity)
        wet_mass = dry_mass_kg * mass_ratio
        return float(max(wet_mass - dry_mass_kg, 0))
