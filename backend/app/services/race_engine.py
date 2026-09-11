import uuid
from typing import Dict, Any, List

from app.models.race import RaceRequest, RaceResult
from app.services.mission_calculator import MissionCalculator
from app.services.data_loader import DataLoader


class RaceEngine:
    """Simulate races between different travel modes."""

    @staticmethod
    def run_race(request: RaceRequest) -> Dict[str, Any]:
        """Run a race between multiple travel modes."""
        results = []

        for participant in request.participants:
            # Calculate travel time for this mode
            try:
                mission = MissionCalculator.calculate_mission(
                    request.origin_id,
                    request.destination_id,
                    request.travel_date,
                    participant.mode_id,
                    crew_size=1
                )

                mode_data = DataLoader.get_travel_mode(participant.mode_id)

                results.append({
                    "mode_id": participant.mode_id,
                    "mode_name": participant.name,
                    "travel_time_seconds": mission["travel_time"]["travel_time_seconds"],
                    "travel_time_human": mission["travel_time"]["travel_time_human"],
                    "cost_usd": mission["cost"]["total_usd"],
                    "difficulty": mission["difficulty"]["rating"],
                    "survival_probability": 1 - mode_data.get("failure_rate", 0.02)
                })
            except Exception as e:
                # Skip invalid modes
                continue

        if not results:
            raise ValueError("No valid participants for race")

        # Sort by travel time
        results.sort(key=lambda x: x["travel_time_seconds"])

        winner = results[0]

        # Calculate time differences
        time_diffs = {}
        for r in results[1:]:
            diff = r["travel_time_seconds"] - winner["travel_time_seconds"]
            time_diffs[r["mode_name"]] = RaceEngine._format_time_difference(diff)

        # Generate commentary
        commentary = RaceEngine._generate_commentary(results, request)

        return {
            "race_id": str(uuid.uuid4()),
            "origin": request.origin_id,
            "destination": request.destination_id,
            "date": request.travel_date,
            "participants": results,
            "winner": winner,
            "time_differences": time_diffs,
            "fun_commentary": commentary
        }

    @staticmethod
    def _format_time_difference(seconds: float) -> str:
        """Format time difference in human-readable form."""
        if seconds < 0:
            return "Winner"
        elif seconds < 60:
            return f"{seconds:.1f} seconds behind"
        elif seconds < 3600:
            return f"{seconds/60:.1f} minutes behind"
        elif seconds < 86400:
            return f"{seconds/3600:.1f} hours behind"
        elif seconds < 86400 * 365:
            return f"{seconds/86400:.1f} days behind"
        else:
            return f"{seconds/(86400*365):.1f} YEARS behind"

    @staticmethod
    def _generate_commentary(results: List[Dict[str, Any]], request: RaceRequest) -> str:
        """Generate fun race commentary."""
        winner = results[0]
        loser = results[-1]

        commentary = []

        # Winner announcement
        commentary.append(f"🏆 {winner['mode_name']} wins the race to {request.destination_id}!")

        # Time commentary
        if winner['travel_time_seconds'] < 1:
            commentary.append("In the time it took to read this sentence, they arrived.")
        elif winner['travel_time_seconds'] < 3600:
            commentary.append("A quick trip!")
        elif winner['travel_time_seconds'] < 86400 * 365:
            commentary.append(f"Arrived in just {winner['travel_time_human']}!")

        # Compare fastest to slowest
        if loser['travel_time_seconds'] > winner['travel_time_seconds'] * 1000:
            commentary.append(f"Meanwhile, {loser['mode_name']} is still packing their bags...")
            commentary.append(f"They'll arrive in roughly {loser['travel_time_human']}.")

        # Survival warnings
        low_survival = [r for r in results if r['survival_probability'] < 0.5]
        if low_survival:
            commentary.append(f"⚠️ {len(low_survival)} participant(s) may not survive to see the finish line.")

        # Cost commentary
        most_expensive = max(results, key=lambda x: x['cost_usd'])
        cheapest = min(results, key=lambda x: x['cost_usd'])

        if most_expensive['cost_usd'] > cheapest['cost_usd'] * 10:
            commentary.append(
                f"{most_expensive['mode_name']} spent ${most_expensive['cost_usd']:,.0f}, "
                f"while {cheapest['mode_name']} only spent ${cheapest['cost_usd']:,.0f}."
            )

        return " ".join(commentary)
