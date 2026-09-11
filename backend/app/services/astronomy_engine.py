import numpy as np
from datetime import date, datetime
from typing import Tuple

from app.services.data_loader import DataLoader
from app.utils.constants import AU_TO_KM


class AstronomyEngine:
    """
    Calculate planetary positions using Keplerian orbital mechanics.

    All calculations are deterministic - same inputs always produce same outputs.
    """

    # Reference epoch J2000.0 (January 1, 2000, 12:00 TT)
    J2000 = date(2000, 1, 1)

    @staticmethod
    def calculate_mean_anomaly(
        semi_major_axis_au: float,
        orbital_period_days: float,
        target_date: date
    ) -> float:
        """
        Calculate mean anomaly M at target date.

        M = n * (t - t0) where n = 360° / orbital_period
        """
        days_since_epoch = (target_date - AstronomyEngine.J2000).days
        mean_motion = 360.0 / orbital_period_days  # degrees per day

        # Mean anomaly (simplified - assumes M0 = 0 at J2000)
        M_degrees = (mean_motion * days_since_epoch) % 360
        return np.radians(M_degrees)

    @staticmethod
    def solve_kepler_equation(M: float, e: float, tolerance: float = 1e-8) -> float:
        """
        Solve Kepler's equation for eccentric anomaly E.

        M = E - e * sin(E)

        Uses Newton-Raphson iteration.
        """
        E = M  # Initial guess
        for _ in range(100):
            delta = E - e * np.sin(E) - M
            if abs(delta) < tolerance:
                break
            E = E - delta / (1 - e * np.cos(E))
        return E

    @staticmethod
    def calculate_true_anomaly(E: float, e: float) -> float:
        """
        Calculate true anomaly ν from eccentric anomaly E.
        """
        return 2 * np.arctan2(
            np.sqrt(1 + e) * np.sin(E / 2),
            np.sqrt(1 - e) * np.cos(E / 2)
        )

    @staticmethod
    def calculate_heliocentric_position(
        planet_data: dict,
        target_date: date
    ) -> Tuple[float, float, float]:
        """
        Calculate heliocentric position in AU.

        Returns (x, y, z) coordinates with Sun at origin.
        """
        semi_major_axis = planet_data["semi_major_axis_au"]
        eccentricity = planet_data["eccentricity"]
        orbital_period = planet_data["orbital_period_days"]

        # Calculate orbital elements
        M = AstronomyEngine.calculate_mean_anomaly(
            semi_major_axis, orbital_period, target_date
        )
        E = AstronomyEngine.solve_kepler_equation(M, eccentricity)
        nu = AstronomyEngine.calculate_true_anomaly(E, eccentricity)

        # Heliocentric distance
        r = semi_major_axis * (1 - eccentricity * np.cos(E))

        # Position in orbital plane (simplified - assumes 0 inclination)
        x = r * np.cos(nu)
        y = r * np.sin(nu)
        z = 0.0  # Simplified - would need orbital inclination for accurate z

        return (x, y, z)

    @staticmethod
    def get_planet_position(planet_id: str, target_date: date) -> dict:
        """
        Get formatted position data for a planet.
        """
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
            "distance_from_sun_au": float(np.sqrt(x**2 + y**2 + z**2))
        }
