import numpy as np
from datetime import date
from typing import Tuple, Dict, Any

from app.services.astronomy_engine import AstronomyEngine
from app.services.data_loader import DataLoader
from app.utils.constants import AU_TO_KM, SPEED_OF_LIGHT_KM_S, SUN_MU


class DistanceEngine:
    """Calculate distances between celestial bodies."""

    @staticmethod
    def calculate_distance_km(
        pos1: Tuple[float, float, float],
        pos2: Tuple[float, float, float]
    ) -> float:
        distance_au = np.sqrt(
            (pos2[0] - pos1[0])**2 +
            (pos2[1] - pos1[1])**2 +
            (pos2[2] - pos1[2])**2
        )
        return float(distance_au * AU_TO_KM)

    @staticmethod
    def get_interplanetary_distance(
        origin_id: str,
        destination_id: str,
        travel_date: date
    ) -> Dict[str, Any]:
        if origin_id.lower().strip() == destination_id.lower().strip():
            try:
                obj_data = DataLoader.get_celestial_object(origin_id)
            except ValueError:
                obj_data = DataLoader.get_planet(origin_id)

            return {
                "origin_id": origin_id,
                "origin_name": obj_data["name"],
                "destination_id": destination_id,
                "destination_name": obj_data["name"],
                "date": travel_date.isoformat(),
                "distance_km": 0.0,
                "distance_au": 0.0,
                "light_minutes": 0.0
            }

        try:
            origin_data = DataLoader.get_celestial_object(origin_id)
        except ValueError:
            origin_data = DataLoader.get_planet(origin_id)

        try:
            dest_data = DataLoader.get_celestial_object(destination_id)
        except ValueError:
            dest_data = DataLoader.get_planet(destination_id)

        origin_pos = AstronomyEngine.calculate_heliocentric_position(
            origin_data, travel_date
        )
        dest_pos = AstronomyEngine.calculate_heliocentric_position(
            dest_data, travel_date
        )

        distance_km = DistanceEngine.calculate_distance_km(origin_pos, dest_pos)
        distance_au = distance_km / AU_TO_KM

        return {
            "origin_id": origin_id,
            "origin_name": origin_data["name"],
            "destination_id": destination_id,
            "destination_name": dest_data["name"],
            "date": travel_date.isoformat(),
            "distance_km": distance_km,
            "distance_au": distance_au,
            "light_minutes": distance_km / (SPEED_OF_LIGHT_KM_S * 60)
        }

    @staticmethod
    def calculate_hohmann_transfer_time(r1_au: float, r2_au: float) -> float:
        if r1_au == r2_au:
            return 0.0
        AU_TO_M = 149_597_870_700
        r1_m = r1_au * AU_TO_M
        r2_m = r2_au * AU_TO_M

        transfer_time_seconds = np.pi * np.sqrt((r1_m + r2_m)**3 / (8 * SUN_MU))
        return float(transfer_time_seconds / 86400)
