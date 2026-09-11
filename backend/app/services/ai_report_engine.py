from anthropic import Anthropic
import uuid
import json
from typing import Dict, Any, List

from app.models.report import TravelReport
from app.services.mission_calculator import MissionCalculator
from app.services.simulation_engine import SimulationEngine
from app.services.data_loader import DataLoader
from app.config import settings


class AIReportEngine:
    """Generate narrative reports using LLM."""

    def __init__(self):
        if settings.anthropic_api_key:
            self.client = Anthropic(api_key=settings.anthropic_api_key)
        else:
            self.client = None

    async def generate_report(
        self,
        origin_id: str,
        destination_id: str,
        travel_date: str,
        mode_id: str,
        crew_size: int
    ) -> TravelReport:
        """
        Generate an engaging travel report.

        IMPORTANT: LLM only generates narrative text.
        All calculations (time, distance, cost) are deterministic
        and passed as facts to the LLM.
        """
        # Calculate mission data
        mission_data = MissionCalculator.calculate_mission(
            origin_id, destination_id, travel_date, mode_id, crew_size
        )

        # Generate events
        from app.models.simulation import WhatIfScenario
        scenario = WhatIfScenario(
            origin_id=origin_id,
            destination_id=destination_id,
            travel_date=travel_date,
            mode_id=mode_id,
            crew_size=crew_size,
            modifications={}
        )
        events = SimulationEngine._generate_events(scenario, mission_data)

        # Load additional data
        origin = DataLoader.get_planet(origin_id)
        destination = DataLoader.get_planet(destination_id)
        mode = DataLoader.get_travel_mode(mode_id)

        # If no API key, generate mock report
        if not self.client:
            return self._generate_mock_report(mission_data, events)

        # Build prompt with factual data
        prompt = self._build_prompt(origin, destination, mode, mission_data, events)

        try:
            # Call LLM
            message = self.client.messages.create(
                model="claude-sonnet-5",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )

            # Parse response into structured report
            report_text = message.content[0].text
            return self._parse_response(report_text, mission_data)
        except Exception as e:
            # Fallback to mock report on error
            return self._generate_mock_report(mission_data, events)

    def _build_prompt(
        self,
        origin: Dict[str, Any],
        destination: Dict[str, Any],
        mode: Dict[str, Any],
        mission_data: Dict[str, Any],
        events: List[Any]
    ) -> str:
        """Build prompt with all factual mission data."""
        events_str = "\n".join([f"Day {e.day}: {e.event}" for e in events[:10]])

        return f"""You are the ship's AI computer aboard a {mode['name']} vessel.

Generate a travel report for a mission from {origin['name']} to {destination['name']}.

IMPORTANT FACTUAL DATA (do not modify these):
- Distance: {mission_data['distance_km']:,.0f} km
- Travel Time: {mission_data['travel_time']['travel_time_human']}
- Cost: ${mission_data['cost']['total_usd']:,.2f}
- Crew Size: {mission_data['crew_size']}
- Difficulty: {mission_data['difficulty']['rating']}
- Mode: {mode['name']} ({mode['category']})

JOURNEY EVENTS:
{events_str}

ORIGIN PLANET: {origin['name']}
{origin['description']}

DESTINATION PLANET: {destination['name']}
{destination['description']}

TRAVEL MODE: {mode['name']}
{mode.get('fun_description', mode['description'])}

Generate a JSON response with:
1. "mission_summary": A 2-3 sentence overview with humorous tone
2. "journey_narrative": A paragraph about the journey (be creative and funny)
3. "crew_log": 3-5 log entries from the crew's perspective
4. "highlights": 3 memorable moments from the trip
5. "warnings": 2-3 things future travelers should know
6. "recommendations": Advice for anyone crazy enough to try this
7. "fun_rating": A number 1-10

Keep the tone entertaining and match the absurdity level of the travel mode.
For human-powered modes, emphasize the sheer impossibility.
For impossible modes, embrace the sci-fi absurdity.

Respond ONLY with valid JSON, no additional text."""

    def _parse_response(self, text: str, mission_data: Dict[str, Any]) -> TravelReport:
        """Parse LLM response into structured report."""
        try:
            # Try to parse as JSON
            # Remove markdown code blocks if present
            cleaned_text = text.strip()
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith('```'):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]

            data = json.loads(cleaned_text.strip())
        except:
            # Fallback if not valid JSON
            data = {
                "mission_summary": text[:200] if len(text) > 200 else text,
                "journey_narrative": text,
                "crew_log": ["Log entry not available"],
                "highlights": ["Journey completed"],
                "warnings": ["Results may vary"],
                "recommendations": "Bring snacks",
                "fun_rating": 7.0
            }

        return TravelReport(
            report_id=str(uuid.uuid4()),
            mission_summary=data.get("mission_summary", ""),
            journey_narrative=data.get("journey_narrative", ""),
            crew_log=data.get("crew_log", []),
            highlights=data.get("highlights", []),
            warnings=data.get("warnings", []),
            recommendations=data.get("recommendations", ""),
            fun_rating=data.get("fun_rating", 7.0)
        )

    def _generate_mock_report(self, mission_data: Dict[str, Any], events: List[Any]) -> TravelReport:
        """Generate a mock report when LLM is not available."""
        mode = mission_data.get("mode", {})
        category = mode.get("category", "realistic")

        summaries = {
            "human_powered": f"What an absolutely terrible idea! Traveling {mission_data['distance_km']:,.0f} km "
                           f"by {mode.get('name', 'walking')} took {mission_data['travel_time']['travel_time_human']}. "
                           f"Your great×{int(mission_data['travel_time'].get('generations_needed', 1000))}-grandchildren "
                           f"finally made it!",

            "realistic": f"A textbook journey from {mission_data['origin']['name']} to {mission_data['destination']['name']} "
                        f"using {mode.get('name', 'a rocket')}. The crew arrived safely after "
                        f"{mission_data['travel_time']['travel_time_human']}.",

            "theoretical": f"Pushing the boundaries of physics! The {mode.get('name', 'experimental drive')} "
                         f"made the journey in {mission_data['travel_time']['travel_time_human']}. "
                         f"Scientists are still arguing about how it worked.",

            "absurd": f"In a stunning display of questionable judgment, the crew used {mode.get('name', 'an absurd method')} "
                    f"to travel {mission_data['distance_km']:,.0f} km. Miraculously, they survived!",

            "impossible": f"Physics took a back seat on this journey! The {mode.get('name', 'impossible drive')} "
                        f"defied all known laws and delivered the crew in {mission_data['travel_time']['travel_time_human']}. "
                        f"Reality may never recover."
        }

        return TravelReport(
            report_id=str(uuid.uuid4()),
            mission_summary=summaries.get(category, "A journey was completed."),
            journey_narrative=f"The journey from {mission_data['origin']['name']} to {mission_data['destination']['name']} "
                            f"was an adventure that will be remembered for generations. "
                            f"Covering {mission_data['distance_km']:,.0f} km took {mission_data['travel_time']['travel_time_human']} "
                            f"and cost ${mission_data['cost']['total_usd']:,.2f}. The crew showed remarkable resilience.",
            crew_log=[
                f"Day 1: Departure from {mission_data['origin']['name']} - excitement in the air!",
                f"Day {int(mission_data['travel_time']['travel_time_days'] * 0.5)}: Midpoint reached - morale is high!",
                f"Day {int(mission_data['travel_time']['travel_time_days'] * 0.75)}: Final approach begun - destination in sight!",
                f"Day {int(mission_data['travel_time']['travel_time_days'])}: Arrival at {mission_data['destination']['name']}!"
            ],
            highlights=[
                "Seeing the destination planet grow larger in the viewscreen",
                "The crew's celebration when halfway was reached",
                "First footsteps on a new world"
            ],
            warnings=[
                "Always check your life support systems twice",
                "Bring more snacks than you think you'll need",
                "Space is big - really, really big"
            ],
            recommendations="Pack light, bring entertainment, and always know where your towel is.",
            fun_rating=8.5
        )
