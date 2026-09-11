from typing import Dict, Any
from dataclasses import dataclass

from app.utils.constants import (
    LAUNCH_COST_PER_KG_LEO,
    MISSION_CONTROL_PER_DAY,
    CREW_TRAINING_PER_PERSON,
    INSURANCE_RATE
)
from app.models.travel_mode import TravelCategory


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

    @staticmethod
    def calculate_mission_cost(
        distance_km: float,
        travel_days: float,
        crew_size: int,
        mode_data: Dict[str, Any],
        resources: Dict[str, Any]
    ) -> CostBreakdown:
        """Calculate complete mission cost."""
        category = mode_data.get("category", "realistic")

        if category == TravelCategory.HUMAN_POWERED.value:
            return CostEngine._calculate_human_powered_cost(
                distance_km, travel_days, crew_size
            )
        elif category in [TravelCategory.REALISTIC.value, TravelCategory.THEORETICAL.value]:
            return CostEngine._calculate_realistic_cost(
                distance_km, travel_days, crew_size, mode_data, resources
            )
        else:
            return CostEngine._calculate_exotic_cost(
                distance_km, travel_days, crew_size, mode_data
            )

    @staticmethod
    def _calculate_realistic_cost(
        distance_km: float,
        travel_days: float,
        crew_size: int,
        mode_data: Dict[str, Any],
        resources: Dict[str, Any]
    ) -> CostBreakdown:
        """Calculate cost for realistic propulsion."""
        total_mass = resources.get("total_mass_kg", 10000)

        # Launch cost
        launch_cost = total_mass * LAUNCH_COST_PER_KG_LEO
        if distance_km > 100_000_000:
            launch_cost *= 10  # Deep space premium

        # Fuel cost
        fuel_kg = resources.get("propulsion", {}).get("fuel_kg", 0)
        fuel_cost = fuel_kg * 100  # ~$100/kg for rocket fuel

        # Crew costs
        crew_cost = crew_size * CREW_TRAINING_PER_PERSON
        crew_cost += crew_size * travel_days * 1000

        # Spacecraft rental
        spacecraft_cost = travel_days * 500_000

        # Mission control
        mission_control = travel_days * MISSION_CONTROL_PER_DAY

        # Exotic fees
        exotic_fees = mode_data.get("cost_per_km_usd", 0) * distance_km

        # Subtotal and insurance
        subtotal = launch_cost + fuel_cost + crew_cost + spacecraft_cost + mission_control + exotic_fees
        insurance = subtotal * INSURANCE_RATE
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
        crew_size: int
    ) -> CostBreakdown:
        """Calculate cost for walking/running/cycling."""
        food_cost = crew_size * travel_days * 50
        shoe_cost = (distance_km / 800) * 100
        snack_cost = distance_km * 0.10

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
    def _calculate_exotic_cost(
        distance_km: float,
        travel_days: float,
        crew_size: int,
        mode_data: Dict[str, Any]
    ) -> CostBreakdown:
        """Calculate cost for absurd/impossible modes."""
        mode_id = mode_data.get("id", "")

        if mode_id == "teleportation":
            return CostBreakdown(
                launch_cost_usd=0,
                fuel_cost_usd=0,
                crew_cost_usd=0,
                spacecraft_rental_usd=0,
                mission_control_usd=0,
                insurance_usd=1_000_000_000,
                exotic_fees_usd=999_999,
                contingency_usd=0,
                total_usd=1_001_000_000
            )

        if mode_id == "cosmic_hitchhiking":
            return CostBreakdown(
                launch_cost_usd=0,
                fuel_cost_usd=0,
                crew_cost_usd=50,  # Towel
                spacecraft_rental_usd=0,
                mission_control_usd=0,
                insurance_usd=0,
                exotic_fees_usd=0,
                contingency_usd=25,
                total_usd=75
            )

        # Default exotic cost
        base_cost = mode_data.get("cost_per_km_usd", 1000) * distance_km
        return CostBreakdown(
            launch_cost_usd=0,
            fuel_cost_usd=0,
            crew_cost_usd=0,
            spacecraft_rental_usd=0,
            mission_control_usd=0,
            insurance_usd=base_cost * 0.1,
            exotic_fees_usd=base_cost,
            contingency_usd=base_cost * 0.15,
            total_usd=base_cost * 1.25
        )
