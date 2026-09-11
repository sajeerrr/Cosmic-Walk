from typing import Dict, Any

from app.utils.constants import (
    WATER_LITERS_PER_DAY,
    FOOD_KG_PER_DAY,
    OXYGEN_LITERS_PER_DAY,
    ELECTRICITY_KWH_PER_DAY
)
import numpy as np


class ResourceEngine:
    """Calculate mission resource requirements."""

    @staticmethod
    def calculate_resources(
        travel_days: float,
        crew_size: int,
        mode_data: Dict[str, Any],
        distance_km: float
    ) -> Dict[str, Any]:
        """
        Calculate all resources needed for a mission.
        """
        # Basic life support
        water_liters = crew_size * travel_days * WATER_LITERS_PER_DAY
        food_kg = crew_size * travel_days * FOOD_KG_PER_DAY
        oxygen_liters = crew_size * travel_days * OXYGEN_LITERS_PER_DAY
        electricity_kwh = crew_size * travel_days * ELECTRICITY_KWH_PER_DAY

        # Safety margin (10%)
        safety_margin = 0.10

        # Fuel calculation (for realistic/theoretical modes)
        category = mode_data.get("category", "realistic")
        if category in ["realistic", "theoretical"]:
            fuel_kg = ResourceEngine._calculate_rocket_fuel(mode_data, distance_km)
        else:
            fuel_kg = 0

        return {
            "life_support": {
                "water_liters": water_liters * (1 + safety_margin),
                "food_kg": food_kg * (1 + safety_margin),
                "oxygen_liters": oxygen_liters * (1 + safety_margin),
                "electricity_kwh": electricity_kwh * (1 + safety_margin)
            },
            "propulsion": {
                "fuel_kg": fuel_kg,
                "fuel_type": mode_data.get("fuel_type", "unknown")
            },
            "total_mass_kg": water_liters + food_kg + fuel_kg,
            "safety_margin_percent": safety_margin * 100,
            "per_crew_member": {
                "water_liters": water_liters / crew_size if crew_size > 0 else 0,
                "food_kg": food_kg / crew_size if crew_size > 0 else 0,
                "oxygen_liters": oxygen_liters / crew_size if crew_size > 0 else 0
            }
        }

    @staticmethod
    def _calculate_rocket_fuel(mode_data: Dict[str, Any], distance_km: float) -> float:
        """
        Estimate fuel using Tsiolkovsky rocket equation.

        This is a simplified estimate.
        """
        # Required delta-v estimate (very simplified)
        delta_v_m_s = min(distance_km * 1000 / 86400, 50000)  # Cap at 50 km/s

        # Exhaust velocity (depends on fuel type)
        fuel_type = mode_data.get("fuel_type", "chemical")
        exhaust_velocities = {
            "liquid_hydrogen_lox": 4500,
            "xenon": 30000,  # Ion drive
            "hydrogen": 9000,
            "deuterium_helium3": 100000,
        }
        exhaust_velocity = exhaust_velocities.get(fuel_type, 3000)

        # Dry mass (payload + structure)
        dry_mass_kg = 10000

        # Tsiolkovsky: m0 = mf * e^(Δv / ve)
        mass_ratio = np.exp(delta_v_m_s / exhaust_velocity)
        wet_mass = dry_mass_kg * mass_ratio

        return max(wet_mass - dry_mass_kg, 0)
