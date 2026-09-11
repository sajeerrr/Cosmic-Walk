import uuid
import json
from typing import Dict, Any, List, Optional

try:
    from groq import Groq
except ImportError:
    Groq = None

from app.models.report import TravelReport, TravelReviewRatings
from app.services.mission_calculator import MissionCalculator
from app.services.simulation_engine import SimulationEngine
from app.services.data_loader import DataLoader
from app.config import settings


class AIReportEngine:
    """Generate rich narrative travel reports using Groq LLM."""

    def __init__(self):
        self.provider = None
        self.client = None

        if settings.groq_api_key and Groq is not None:
            self.provider = "groq"
            self.client = Groq(api_key=settings.groq_api_key)
        elif settings.anthropic_api_key:
            try:
                from anthropic import Anthropic
                self.provider = "anthropic"
                self.client = Anthropic(api_key=settings.anthropic_api_key)
            except ImportError:
                self.client = None

    async def generate_report(
        self,
        origin_id: str,
        destination_id: str,
        travel_date: str,
        mode_id: str,
        crew_size: int,
        passenger: Optional[Dict[str, Any]] = None
    ) -> TravelReport:
        """
        Generate a rich, entertaining travel report.
        All numerical values come from deterministic calculations.
        Groq only generates narrative text.
        """
        mission_data = MissionCalculator.calculate_mission(
            origin_id, destination_id, travel_date, mode_id, crew_size
        )

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

        origin = DataLoader.get_planet(origin_id)
        destination = DataLoader.get_planet(destination_id)
        mode = DataLoader.get_travel_mode(mode_id)

        if not self.client:
            return self._generate_mock_report(mission_data, events, passenger)

        prompt = self._build_prompt(origin, destination, mode, mission_data, events, passenger)

        try:
            if self.provider == "groq":
                response = self.client.chat.completions.create(
                    model=settings.groq_model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are CosmicWalk's AI travel guide — a witty, entertaining assistant "
                                "that writes hilarious interplanetary travel reports. "
                                "You NEVER invent or modify supplied numerical values. "
                                "You write creative narrative, jokes, and humorous observations. "
                                "Always respond with valid JSON only."
                            )
                        },
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=3000,
                    temperature=0.8,
                    response_format={"type": "json_object"}
                )
                report_text = response.choices[0].message.content
            elif self.provider == "anthropic":
                message = self.client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=3000,
                    messages=[{"role": "user", "content": prompt}]
                )
                report_text = message.content[0].text
            else:
                return self._generate_mock_report(mission_data, events, passenger)

            return self._parse_response(report_text, mission_data, passenger)

        except Exception:
            return self._generate_mock_report(mission_data, events, passenger)

    # ─────────────────────────────────────────────────────────────────────────
    # Prompt builder
    # ─────────────────────────────────────────────────────────────────────────

    def _build_prompt(
        self,
        origin: Dict[str, Any],
        destination: Dict[str, Any],
        mode: Dict[str, Any],
        mission_data: Dict[str, Any],
        events: List[Any],
        passenger: Optional[Dict[str, Any]] = None
    ) -> str:
        travel_time = mission_data.get("travel_time", {})
        difficulty = mission_data.get("difficulty", {})
        ridiculousness = mission_data.get("ridiculousness", {})
        resources = mission_data.get("resources", {})
        life_support = resources.get("life_support", {})
        cost = mission_data.get("cost", {})
        verdict = mission_data.get("verdict", {})
        scale = mission_data.get("scale_comparison", [])
        category = mode.get("category", "realistic")

        p_name = (passenger or {}).get("name", "Commander")
        p_age  = (passenger or {}).get("age", 30)

        years       = travel_time.get("travel_time_years", 0)
        generations = travel_time.get("generations_needed", years / 25 if years > 0 else 0)
        lifetimes   = years / 80 if years > 0 else 0
        calories    = travel_time.get("total_calories_burned", life_support.get("food_kcal", 0))
        pizzas      = travel_time.get("equivalent_pizzas", calories / 285 if calories > 0 else 0)

        scale_str = "\n".join(
            f"  - {s.get('label')}: {s.get('formatted_value')} {s.get('unit')}"
            for s in scale[:8]
        )

        events_str = "\n".join(
            f"  - Day {e.get('day', 0) if isinstance(e, dict) else getattr(e, 'day', 0)}: "
            f"{e.get('event', '') if isinstance(e, dict) else getattr(e, 'event', '')}"
            for e in events[:8]
        )

        verdict_str = (
            f"{verdict.get('classification','?')} — {verdict.get('title','')} "
            f"(Score: {verdict.get('score',0):.0f}/100)"
        )

        fun_facts_str = "\n".join(f"  - {f}" for f in ridiculousness.get("fun_facts", [])[:4])

        # Category-specific instruction
        tone_map = {
            "human_powered": (
                "Focus heavily on the absurdity of the distance, shoe consumption, "
                "generational endurance, food mountains, and existential boredom. "
                "Maximum humour. This is genuinely impossible."
            ),
            "realistic": (
                "Informative with light humour. Focus on engineering achievement, "
                "life support logistics, and the genuine challenge of space travel."
            ),
            "theoretical": (
                "Speculative and wondrous. Mix real physics with creative speculation. "
                "Medium humour. Wonder over comedy."
            ),
            "absurd": (
                "Maximum absurd creativity. Invent ridiculous fictional logistics. "
                "This is comedy-first, information-second."
            ),
            "impossible": (
                "Full sci-fi comedy. Embrace physics violations. Create fictional "
                "bureaucracy, existential consequences, and impossible side-effects."
            ),
        }
        tone_instruction = tone_map.get(category, "Balance humour and information.")

        return f"""You are the AI travel guide for CosmicWalk — the galaxy's most unnecessarily detailed interplanetary booking service.

Write an entertaining, personalized travel report for this mission.

=== TRAVELER INFO ===
Name: {p_name} (age {p_age})
Origin: {origin.get('name', '?')}
Destination: {destination.get('name', '?')}
Travel Mode: {mode.get('name', '?')} (category: {category})
Departure: {mission_data.get('travel_date', '?')}

=== AUTHORITATIVE FACTS — DO NOT MODIFY OR INVENT NEW NUMBERS ===
Distance: {mission_data.get('distance_km', 0):,.0f} km
Distance in AU: {mission_data.get('distance_au', 0):.3f} AU
Travel Time: {travel_time.get('travel_time_human', '?')}
Travel Days: {travel_time.get('travel_time_days', 0):,.1f} days
Travel Years: {years:,.1f} years
Human Lifetimes: {lifetimes:.1f}
Generations: {generations:.1f}
Calories Burned: {calories:,.0f} kcal total
Equivalent Pizzas: {pizzas:,.0f} pizzas
Food Required: {life_support.get('food_kcal', 0):,.0f} kcal
Water Required: {life_support.get('water_liters', 0):,.0f} liters
Oxygen Required: {life_support.get('oxygen_kg', 0):,.0f} kg
Total Cost: ${cost.get('total_usd', 0):,.2f}
Difficulty: {difficulty.get('rating', '?')} (score: {difficulty.get('score', 0):.0f}/100)
Ridiculousness: {ridiculousness.get('rating', '?')} (score: {ridiculousness.get('score', 0):.0f}/100)
Verdict: {verdict_str}

=== SCALE COMPARISONS (reference these in your report) ===
{scale_str}

=== RIDICULOUSNESS FUN FACTS (weave these in) ===
{fun_facts_str}

=== JOURNEY EVENTS ===
{events_str}

=== ORIGIN: {origin.get('name','?')} ===
{origin.get('description', '')}

=== DESTINATION: {destination.get('name','?')} ===
{destination.get('description', '')}

=== TRAVEL MODE: {mode.get('name','?')} ===
{mode.get('fun_description', mode.get('description', ''))}

=== TONE INSTRUCTION ===
{tone_instruction}
Reference {p_name} by name naturally (2-3 times). Do not invent personal facts about them.

=== INSTRUCTIONS ===
1. NEVER change or invent numerical values. Use the exact numbers above.
2. You MAY write creative fiction, jokes, and humorous observations.
3. Clearly distinguish AI fiction from calculated facts in your narrative.
4. Match length to journey absurdity: absurd/impossible = longer and funnier.
5. Each field should be appropriately concise (2-4 sentences or a short list).

=== REQUIRED JSON RESPONSE ===
Return ONLY valid JSON with EXACTLY these fields:
{{
  "introduction": "2-3 sentences dramatic intro mentioning {p_name} and the travel mode",
  "what_you_signed_up_for": "2-3 sentences honestly explaining what this journey entails",
  "travel_experience": "2-3 sentences describing the physical/emotional journey experience",
  "daily_routine": "A string with 4-6 bullet-point items describing a typical day (use \\n• format)",
  "food_story": "2-3 sentences about food requirements referencing the exact calculated total",
  "water_story": "1-2 sentences about water requirements using exact calculated values",
  "footwear_story": "1-2 sentences about shoes/equipment relevant to this travel mode",
  "boredom_index": "1-2 sentences qualitative boredom assessment",
  "things_you_will_miss": ["item1", "item2", "item3", "item4", "item5"],
  "things_you_will_see": ["sight1", "sight2", "sight3", "sight4"],
  "cosmic_problems": ["problem1", "problem2", "problem3", "problem4", "problem5"],
  "packing_list": ["item - reason", "item - reason", "item - reason", "item - reason", "item - reason"],
  "travel_advice": ["advice1", "advice2", "advice3", "advice4"],
  "survival_guide": "2-3 sentences about the main risks and survival strategy",
  "generational_impact": "2-3 sentences about generational scale for long journeys (or brief note for short ones)",
  "arrival_scenario": "2-3 sentences describing the hypothetical arrival experience",
  "travel_review": {{
    "comfort": "⭐ rating (1-5 stars) + 1 funny sentence",
    "speed": "⭐ rating + 1 sentence",
    "safety": "⭐ rating + 1 sentence",
    "convenience": "⭐ rating + 1 sentence",
    "ridiculousness": "⭐ rating (could be 10/5) + 1 sentence"
  }},
  "fictional_insurance": "1-2 sentences of fictional insurance commentary (clearly labeled as fiction)",
  "customer_review": "A short fictional ★★★★★ one-liner travel review",
  "final_verdict": "2-3 sentences strong, funny conclusion",
  "mission_summary": "1-2 sentence concise factual summary",
  "fun_rating": <number 1-10>
}}

Respond with ONLY valid JSON. No markdown. No extra text."""

    # ─────────────────────────────────────────────────────────────────────────
    # Response parser
    # ─────────────────────────────────────────────────────────────────────────

    def _parse_response(
        self, text: str, mission_data: Dict[str, Any],
        passenger: Optional[Dict[str, Any]] = None
    ) -> TravelReport:
        try:
            cleaned = text.strip()
            for prefix in ("```json", "```"):
                if cleaned.startswith(prefix):
                    cleaned = cleaned[len(prefix):]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            data = json.loads(cleaned.strip())
        except Exception:
            return self._generate_mock_report(mission_data, [], passenger)

        review_data = data.get("travel_review", {})
        review = TravelReviewRatings(
            comfort=review_data.get("comfort", "★★ Standard space-walk discomfort."),
            speed=review_data.get("speed", "★ Not our fastest option."),
            safety=review_data.get("safety", "★★ Survivable (probably)."),
            convenience=review_data.get("convenience", "★ Highly inconvenient."),
            ridiculousness=review_data.get("ridiculousness", "★★★★★ Completely ridiculous."),
        ) if review_data else None

        travel_time = mission_data.get("travel_time", {})

        return TravelReport(
            report_id=str(uuid.uuid4()),
            introduction=data.get("introduction", ""),
            what_you_signed_up_for=data.get("what_you_signed_up_for", ""),
            travel_experience=data.get("travel_experience", ""),
            daily_routine=data.get("daily_routine", ""),
            food_story=data.get("food_story", ""),
            water_story=data.get("water_story", ""),
            footwear_story=data.get("footwear_story", ""),
            boredom_index=data.get("boredom_index", ""),
            things_you_will_miss=data.get("things_you_will_miss", []),
            things_you_will_see=data.get("things_you_will_see", []),
            cosmic_problems=data.get("cosmic_problems", []),
            packing_list=data.get("packing_list", []),
            travel_advice=data.get("travel_advice", []),
            survival_guide=data.get("survival_guide", ""),
            generational_impact=data.get("generational_impact", ""),
            arrival_scenario=data.get("arrival_scenario", ""),
            travel_review=review,
            fictional_insurance=data.get("fictional_insurance", ""),
            customer_review=data.get("customer_review", ""),
            final_verdict=data.get("final_verdict", ""),
            # Legacy
            mission_summary=data.get("mission_summary", ""),
            journey_narrative=data.get("journey_narrative", ""),
            crew_log=data.get("crew_log", []),
            highlights=data.get("highlights", []),
            warnings=data.get("warnings", []),
            recommendations=data.get("recommendations", ""),
            fun_rating=float(data.get("fun_rating", 7.0)),
        )

    # ─────────────────────────────────────────────────────────────────────────
    # Rich mock fallback (when Groq is unavailable)
    # ─────────────────────────────────────────────────────────────────────────

    def _generate_mock_report(
        self, mission_data: Dict[str, Any], events: List[Any],
        passenger: Optional[Dict[str, Any]] = None
    ) -> TravelReport:
        mode = mission_data.get("mode", {})
        category = mode.get("category", "realistic")
        origin_name = mission_data.get("origin", {}).get("name", "Origin")
        dest_name   = mission_data.get("destination", {}).get("name", "Destination")
        mode_name   = mode.get("name", "transport")
        travel_time = mission_data.get("travel_time", {})
        years       = travel_time.get("travel_time_years", 0)
        days        = travel_time.get("travel_time_days", 0)
        time_human  = travel_time.get("travel_time_human", f"{years:.1f} years")
        generations = travel_time.get("generations_needed", years / 25)
        distance_km = mission_data.get("distance_km", 0)
        cost        = mission_data.get("cost", {}).get("total_usd", 0)
        resources   = mission_data.get("resources", {})
        life_support= resources.get("life_support", {})
        food_kcal   = life_support.get("food_kcal", days * 2500)
        water_l     = life_support.get("water_liters", days * 3.5)
        difficulty  = mission_data.get("difficulty", {}).get("rating", "Moderate")
        ridic_score = mission_data.get("ridiculousness", {}).get("score", 5)
        fun_facts   = mission_data.get("ridiculousness", {}).get("fun_facts", [])

        p_name = (passenger or {}).get("name", "Commander")

        intros = {
            "human_powered": (
                f"Congratulations, {p_name}. You have selected {mode_name} as your preferred "
                f"mode of transportation to {dest_name}. This is either a sign of extraordinary "
                f"determination or a profound misunderstanding of interplanetary distances."
            ),
            "realistic": (
                f"Welcome aboard, {p_name}. Your {mode_name} mission to {dest_name} has been "
                f"confirmed. This is a genuine space mission requiring serious preparation."
            ),
            "absurd": (
                f"Well, {p_name}, you've done it. You've booked passage to {dest_name} via "
                f"{mode_name}. The booking system registered this without complaint, "
                f"which says more about the system than about the wisdom of your choice."
            ),
            "impossible": (
                f"{p_name}, you have selected an operationally impossible travel mode. "
                f"Physics has filed an official objection. We've overruled it on your behalf."
            ),
        }
        signed_up = {
            "human_powered": (
                f"You have signed up for a {time_human} journey covering {distance_km:,.0f} km "
                f"on foot. This is approximately {generations:.0f} human generations. "
                f"Your great-grandchildren's great-grandchildren may or may not complete this journey."
            ),
            "realistic": (
                f"You are undertaking a {time_human} mission to {dest_name}, covering "
                f"{distance_km:,.0f} km. Life support systems, fuel logistics, and mission "
                f"control will keep you (mostly) alive."
            ),
            "absurd": (
                f"You have committed to travelling {distance_km:,.0f} km using {mode_name}. "
                f"The journey will take {time_human}. Engineering has several questions."
            ),
            "impossible": (
                f"You have committed to a journey that defies known physics. The distance is "
                f"{distance_km:,.0f} km. The travel time is {time_human}. Reality is concerned."
            ),
        }

        return TravelReport(
            report_id=str(uuid.uuid4()),
            introduction=intros.get(category, intros["realistic"]),
            what_you_signed_up_for=signed_up.get(category, signed_up["realistic"]),
            travel_experience=(
                f"The journey from {origin_name} to {dest_name} will be characterized by "
                f"an extraordinary amount of empty space, occasional solar events, and the "
                f"growing realisation that {dest_name} is very far away."
            ),
            daily_routine=(
                f"• Wake up\n• Check life support systems\n• Travel via {mode_name}\n"
                f"• Consume calculated food ration\n• Watch {dest_name} fail to get noticeably closer\n"
                f"• Sleep\n• Repeat for {days:,.0f} days"
            ),
            food_story=(
                f"You will require {food_kcal:,.0f} total calories for this mission. "
                f"That is roughly {food_kcal/550:,.0f} standard burgers, or enough to make "
                f"a large catering company very nervous."
            ),
            water_story=(
                f"Water requirements total {water_l:,.0f} litres. "
                f"At 3.5 litres per day, hydration is manageable — assuming an "
                f"unlimited water supply in the void of space."
            ),
            footwear_story=(
                f"For {mode_name} travel, standard mission equipment applies. "
                f"Replace footwear and equipment at recommended intervals."
                if category != "human_powered" else
                f"Your shoes are now a consumable resource. At 1.5 million steps per pair, "
                f"you will need approximately {distance_km * 1000 / 1_500_000 / 0.75:,.0f} pairs. "
                f"Budget accordingly."
            ),
            boredom_index=(
                f"Boredom level: {'Astronomical' if years > 100 else 'Significant' if years > 1 else 'Manageable'}. "
                f"At {time_human}, entertainment options are strongly recommended."
            ),
            things_you_will_miss=[
                "Weekends", "Normal gravity", "Fresh air", "Internet connectivity",
                "Anyone who was alive when you departed"
            ],
            things_you_will_see=[
                f"The shrinking dot of {origin_name}",
                "An extraordinary quantity of empty space",
                f"The growing dot of {dest_name}",
                "Stars. Many, many stars."
            ],
            cosmic_problems=[
                "Micrometeorite concerns",
                "Solar radiation exposure",
                "Navigation recalibration requirements",
                f"The existential weight of {distance_km:,.0f} km of vacuum",
                "Equipment maintenance in zero-g"
            ],
            packing_list=[
                f"Life support — mandatory",
                "Entertainment — sanity-critical",
                "Emergency rations — non-negotiable",
                "A towel — always know where it is",
                "Optimism — bring extra"
            ],
            travel_advice=[
                "Do not look at how far you have left to go.",
                "Maintain regular exercise to counteract muscle atrophy.",
                "Keep a journal. Future historians will thank you.",
                f"Remember: {dest_name} will still be there when you arrive."
            ],
            survival_guide=(
                f"The primary risks of this journey are radiation, equipment failure, "
                f"and the psychological impact of {time_human} of travel. "
                f"Difficulty rating: {difficulty}. Plan accordingly."
            ),
            generational_impact=(
                f"This journey spans {generations:.1f} human generations. "
                f"Your descendants — or the crew's descendants — will complete what you started. "
                "Make sure the mission briefing is clearly documented."
                if years > 80 else
                f"This journey will be completed within a single human lifespan. "
                f"At {time_human}, you will personally arrive at {dest_name}."
            ),
            arrival_scenario=(
                f"After {time_human}, {dest_name} will finally occupy a substantial "
                f"portion of the viewscreen. Arrival procedures will commence. "
                f"The journey will be complete. Whether anyone remembers why it started is another matter."
            ),
            travel_review=TravelReviewRatings(
                comfort=f"{'★' * max(1, 5 - int(ridic_score / 20))} Space is not comfortable.",
                speed=f"{'★' * (1 if years > 100 else 3 if years > 1 else 5)} At {mode_name} speeds.",
                safety=f"{'★' * max(1, 3 - int(ridic_score / 40))} Survivable with preparation.",
                convenience="★ Not convenient in any conventional sense.",
                ridiculousness=f"{'★' * min(5, max(1, int(ridic_score / 20)))} Ridiculousness index: {ridic_score:.0f}/100.",
            ),
            fictional_insurance=(
                f"[FICTIONAL] CosmicWalk Travel Insurance has reviewed your mission. "
                f"Coverage has been declined on the grounds that '{time_human}' exceeds "
                f"our standard policy duration of 30 days. We wish you well."
            ),
            customer_review=(
                f"★★★★★ — \"{dest_name} was exactly where the map said it would be. "
                f"The journey was character-building.\" — Anonymous Traveler"
            ),
            final_verdict=(
                f"CosmicWalk has computed your mission. The verdict is technically valid. "
                f"Ridiculousness score: {ridic_score:.0f}/100. "
                f"If you proceed, history will note your commitment to {mode_name} travel "
                f"over {distance_km:,.0f} km. We suggest proceeding with full awareness of the facts."
            ),
            # Legacy
            mission_summary=(
                f"A {time_human} journey covering {distance_km:,.0f} km from {origin_name} "
                f"to {dest_name} via {mode_name}."
            ),
            journey_narrative=(
                f"The journey from {origin_name} to {dest_name} will be an adventure. "
                f"Covering {distance_km:,.0f} km took {time_human} and cost ${cost:,.2f}."
            ),
            crew_log=[
                f"Day 1: Departure from {origin_name}.",
                f"Day {int(days * 0.25):,}: Quarter-distance milestone reached.",
                f"Day {int(days * 0.5):,}: Halfway point. Morale sustained.",
                f"Day {int(days * 0.75):,}: Final approach phase begins.",
                f"Day {int(days):,}: Arrival at {dest_name}.",
            ],
            highlights=fun_facts[:3] or [
                f"Covered {distance_km:,.0f} km total",
                f"Difficulty: {difficulty}",
                f"Total mission cost: ${cost:,.2f}",
            ],
            warnings=[
                "Always check life support systems twice.",
                "Bring more snacks than you think you need.",
                "Space is big. Really, really big.",
            ],
            recommendations="Pack light, bring entertainment, and always know where your towel is.",
            fun_rating=min(10.0, max(1.0, ridic_score / 10)),
        )
