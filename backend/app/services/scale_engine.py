from typing import Dict, Any, List
from app.models.mission import ScaleComparisonItem


class ScaleEngine:
    """Calculate deterministic human-readable scale comparisons."""

    EARTH_CIRCUMFERENCE_KM = 40075.0
    MARATHON_KM = 42.195
    MOON_DISTANCE_KM = 384400.0
    HUMAN_LIFETIME_YEARS = 80.0
    GENERATION_YEARS = 25.0

    @staticmethod
    def calculate_scale_comparisons(
        distance_km: float,
        travel_time_years: float,
        travel_time_days: float,
        total_calories: float = 0.0
    ) -> List[ScaleComparisonItem]:
        comparisons: List[ScaleComparisonItem] = []

        # 1. Earth Circumferences
        earth_trips = distance_km / ScaleEngine.EARTH_CIRCUMFERENCE_KM
        comparisons.append(ScaleComparisonItem(
            label="Earth Circumferences",
            value=round(earth_trips, 1),
            formatted_value=f"{earth_trips:,.1f}",
            unit="trips around Earth"
        ))

        # 2. Moon-Distance Equivalents
        moon_eqs = distance_km / ScaleEngine.MOON_DISTANCE_KM
        comparisons.append(ScaleComparisonItem(
            label="Moon Distance Trips",
            value=round(moon_eqs, 1),
            formatted_value=f"{moon_eqs:,.1f}",
            unit="Earth-to-Moon distances"
        ))

        # 3. Marathons
        marathons = distance_km / ScaleEngine.MARATHON_KM
        if marathons < 1e9:
            comparisons.append(ScaleComparisonItem(
                label="Marathons",
                value=round(marathons, 0),
                formatted_value=f"{marathons:,.0f}",
                unit="standard marathons"
            ))

        # 4. Human Lifetimes (if duration is notable)
        if travel_time_years >= 0.1:
            lifetimes = travel_time_years / ScaleEngine.HUMAN_LIFETIME_YEARS
            comparisons.append(ScaleComparisonItem(
                label="Human Lifetimes",
                value=round(lifetimes, 2),
                formatted_value=f"{lifetimes:,.2f}",
                unit="lifetimes (80 yrs)"
            ))

            generations = travel_time_years / ScaleEngine.GENERATION_YEARS
            if generations >= 1.0:
                comparisons.append(ScaleComparisonItem(
                    label="Human Generations",
                    value=round(generations, 1),
                    formatted_value=f"{generations:,.1f}",
                    unit="generations"
                ))
        else:
            comparisons.append(ScaleComparisonItem(
                label="Transit Time in Hours",
                value=round(travel_time_days * 24, 2),
                formatted_value=f"{travel_time_days * 24:,.2f}",
                unit="hours"
            ))

        # 5. Food / Pizzas if calories burned
        if total_calories > 0:
            pizzas = total_calories / 285.0
            comparisons.append(ScaleComparisonItem(
                label="Pizzas Burned",
                value=round(pizzas, 0),
                formatted_value=f"{pizzas:,.0f}",
                unit="large pepperoni pizzas"
            ))

        return comparisons
