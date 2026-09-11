import numpy as np
from datetime import date, datetime
from typing import Tuple, Dict, Any

from app.services.data_loader import DataLoader
from app.utils.constants import AU_TO_KM


class AstronomyEngine:
    """
    Calculate celestial positions using approximate Keplerian orbital mechanics.

    All calculations are deterministic - same inputs always produce same outputs.
    """

    J2000 = date(2000, 1, 1)

    @staticmethod
    def calculate_mean_anomaly(
        semi_major_axis_au: float,
        orbital_period_days: float,
        target_date: date
    ) -> float:
        if orbital_period_days <= 0:
            return 0.0
        days_since_epoch = (target_date - AstronomyEngine.J2000).days
        mean_motion = 360.0 / orbital_period_days
        M_degrees = (mean_motion * days_since_epoch) % 360
        return np.radians(M_degrees)

    @staticmethod
    def solve_kepler_equation(M: float, e: float, tolerance: float = 1e-8) -> float:
        E = M
        for _ in range(100):
            delta = E - e * np.sin(E) - M
            if abs(delta) < tolerance:
                break
            E = E - delta / (1 - e * np.cos(E))
        return E

    @staticmethod
    def calculate_true_anomaly(E: float, e: float) -> float:
        return 2 * np.arctan2(
            np.sqrt(1 + e) * np.sin(E / 2),
            np.sqrt(1 - e) * np.cos(E / 2)
        )

    @staticmethod
    def calculate_heliocentric_position(
        planet_data: dict,
        target_date: date
    ) -> Tuple[float, float, float]:
        if planet_data.get("id") == "sun" or planet_data.get("semi_major_axis_au", 0) == 0:
            return (0.0, 0.0, 0.0)

        semi_major_axis = planet_data.get("semi_major_axis_au", 1.0)
        eccentricity = planet_data.get("eccentricity", 0.0)
        orbital_period = planet_data.get("orbital_period_days", 365.25)

        M = AstronomyEngine.calculate_mean_anomaly(
            semi_major_axis, orbital_period, target_date
        )
        E = AstronomyEngine.solve_kepler_equation(M, eccentricity)
        nu = AstronomyEngine.calculate_true_anomaly(E, eccentricity)

        r = semi_major_axis * (1 - eccentricity * np.cos(E))

        x = r * np.cos(nu)
        y = r * np.sin(nu)
        z = 0.0

        return (x, y, z)

    @staticmethod
    def get_planet_position(planet_id: str, target_date: date) -> Dict[str, Any]:
        try:
            planet_data = DataLoader.get_celestial_object(planet_id)
        except ValueError:
            planet_data = DataLoader.get_planet(planet_id)

        x, y, z = AstronomyEngine.calculate_heliocentric_position(
            planet_data, target_date
        )

        return {
            "planet_id": planet_id,
            "planet_name": planet_data["name"],
            "date": target_date.isoformat(),
            "x_au": float(x),
            "y_au": float(y),
            "z_au": float(z),
            "position_au": {"x": float(x), "y": float(y), "z": float(z)},
            "distance_from_sun_au": float(np.sqrt(x**2 + y**2 + z**2))
        }

    @staticmethod
    def get_celestial_object_position(object_id: str, target_date: date) -> Dict[str, Any]:
        return AstronomyEngine.get_planet_position(object_id, target_date)
