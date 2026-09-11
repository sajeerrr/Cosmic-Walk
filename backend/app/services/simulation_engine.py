import uuid
import random
from typing import Dict, Any, List, Optional

from app.models.simulation import WhatIfScenario, SimulationResult, SimulationEvent
from app.services.mission_calculator import MissionCalculator
from app.services.data_loader import DataLoader


class SimulationEngine:
    """Run what-if scenarios and journey simulations."""

    COSMIC_EVENTS = [
        ("Alien Toll Booth encountered - exact change required", "bureaucracy", "minor", 1.0),
        ("Cosmic Traffic Jam around asteroid belt", "delay", "minor", 3.0),
        ("Space Pirates demanded 10% of emergency snacks", "pirate", "minor", 0.0),
        ("Hit an Asteroid Pothole - hull patch deployed", "damage", "minor", 0.5),
        ("Cosmic Snack Shortage - rationing initiated", "supplies", "minor", 0.0),
        ("Space Construction Zone slowdown", "delay", "minor", 2.0),
        ("Lost Navigation System - asked alien for directions", "navigation", "minor", 1.0),
        ("Snail Strike - locomotion halted for 24h", "strike", "minor", 1.0),
        ("Alien Hitchhiker picked up - brought good music", "hitchhiker", "minor", 0.0),
        ("Cosmic Bureaucracy Checkpoint - paperwork filed", "bureaucracy", "minor", 0.5),
        ("Unexpected Wormhole boost - travel accelerated!", "wormhole", "boost", -5.0),
    ]

    EVENT_TEMPLATES = {
        "realistic": [
            ("Course correction burn completed", "minor_fuel_use", "minor"),
            ("Solar panel efficiency check - optimal", "minor_event", "minor"),
            ("Crew health check - all systems nominal", "minor_event", "minor"),
            ("Navigation calibration updated", "minor_event", "minor"),
            ("Minor debris avoidance maneuver", "minor_event", "minor"),
            ("Life support systems check", "minor_event", "minor"),
        ],
        "theoretical": [
            ("Reactor efficiency at 94%", "minor_event", "minor"),
            ("Magnetic containment field stable", "minor_event", "minor"),
            ("Fuel injection system optimized", "minor_event", "minor"),
            ("Radiation shielding integrity check", "minor_event", "minor"),
        ],
        "absurd": [
            ("Aliens spotted! (It was space debris)", "minor_event", "minor"),
            ("Crew ran out of snacks", "morale_drop", "minor"),
            ("Someone pressed the red button (false alarm)", "critical_event", "major"),
            ("Space pigeon attacked solar panels", "minor_damage", "minor"),
            ("Unexpected cosmic ray hit navigation computer", "minor_event", "minor"),
        ],
        "impossible": [
            ("Reality glitch detected - universe rebooting", "dimensional_event", "major"),
            ("Time loop encountered (or was it?)", "temporal_event", "major"),
            ("Physics engine complained about impossible velocities", "impossible_event", "minor"),
            ("Paradox averted successfully", "temporal_event", "minor"),
        ],
        "human_powered": [
            ("Rest stop taken - legs are sore", "rest_stop", "minor"),
            ("Beautiful cosmic view observed", "sightseeing", "minor"),
            ("Shoelace retied", "minor_event", "minor"),
            ("Generations passed - new walker takes over", "generational", "major"),
        ],
    }

    @staticmethod
    def run_what_if(scenario: WhatIfScenario) -> SimulationResult:
        baseline = MissionCalculator.calculate_mission(
            scenario.origin_id,
            scenario.destination_id,
            scenario.travel_date,
            scenario.mode_id,
            scenario.crew_size
        )

        modified = baseline.copy()
        for key, value in scenario.modifications.items():
            if key in modified:
                modified[key] = SimulationEngine._apply_modification(
                    modified[key], value, key
                )

        modified = SimulationEngine._recalculate_dependencies(modified, scenario)
        comparison = SimulationEngine._compare_scenarios(baseline, modified)
        events = SimulationEngine._generate_events(scenario, modified)
        outcome = SimulationEngine._determine_outcome(scenario, modified, events)
        lessons = SimulationEngine._generate_lessons(comparison, outcome, scenario)

        return SimulationResult(
            scenario_id=str(uuid.uuid4()),
            baseline=baseline,
            modified=modified,
            comparison=comparison,
            outcome=outcome,
            events=events,
            lessons_learned=lessons
        )

    @staticmethod
    def generate_random_events(
        origin_id: str,
        destination_id: str,
        travel_date: str,
        mode_id: str,
        seed: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        if seed is not None:
            rng = random.Random(seed)
        else:
            seed_val = hash(f"{origin_id}{destination_id}{travel_date}{mode_id}")
            rng = random.Random(seed_val)

        events_count = rng.randint(2, 5)
        selected = rng.sample(SimulationEngine.COSMIC_EVENTS, min(events_count, len(SimulationEngine.COSMIC_EVENTS)))

        results = []
        for idx, item in enumerate(selected):
            results.append({
                "day": (idx + 1) * 15,
                "event": item[0],
                "type": item[1],
                "severity": item[2],
                "time_impact_days": item[3]
            })

        return results

    @staticmethod
    def _apply_modification(current_value: Any, modification: Any, key: str) -> Any:
        if isinstance(modification, dict) and isinstance(current_value, dict):
            result = current_value.copy()
            result.update(modification)
            return result
        elif isinstance(modification, (int, float)) and isinstance(current_value, (int, float)):
            if isinstance(modification, float) and 0 < modification < 10:
                return current_value * modification
            return modification
        else:
            return modification

    @staticmethod
    def _recalculate_dependencies(modified: Dict[str, Any], scenario: WhatIfScenario) -> Dict[str, Any]:
        if "distance_km" in scenario.modifications:
            mode_data = DataLoader.get_travel_mode(scenario.mode_id)
            from app.services.travel_mode_engine import TravelModeEngine
            try:
                origin = DataLoader.get_celestial_object(scenario.origin_id)
            except ValueError:
                origin = DataLoader.get_planet(scenario.origin_id)

            try:
                dest = DataLoader.get_celestial_object(scenario.destination_id)
            except ValueError:
                dest = DataLoader.get_planet(scenario.destination_id)

            travel_result = TravelModeEngine.calculate_travel_time(
                mode_data, modified["distance_km"], origin, dest
            )
            modified["travel_time"] = travel_result

        if "travel_time" in modified:
            travel_days = modified["travel_time"].get("travel_time_days", 0)
            mode_data = DataLoader.get_travel_mode(scenario.mode_id)

            from app.services.resource_engine import ResourceEngine
            resources = ResourceEngine.calculate_resources(
                travel_days, scenario.crew_size, mode_data,
                modified.get("distance_km", 0)
            )
            modified["resources"] = resources

            from app.services.cost_engine import CostEngine
            cost = CostEngine.calculate_mission_cost(
                modified.get("distance_km", 0),
                travel_days,
                scenario.crew_size,
                mode_data,
                resources
            )
            modified["cost"] = {
                "launch_cost_usd": cost.launch_cost_usd,
                "fuel_cost_usd": cost.fuel_cost_usd,
                "crew_cost_usd": cost.crew_cost_usd,
                "spacecraft_rental_usd": cost.spacecraft_rental_usd,
                "mission_control_usd": cost.mission_control_usd,
                "insurance_usd": cost.insurance_usd,
                "exotic_fees_usd": cost.exotic_fees_usd,
                "contingency_usd": cost.contingency_usd,
                "total_usd": cost.total_usd
            }

        return modified

    @staticmethod
    def _compare_scenarios(baseline: Dict[str, Any], modified: Dict[str, Any]) -> Dict[str, Any]:
        comparison = {}
        metrics = ["distance_km", "travel_time", "cost"]
        for metric in metrics:
            if metric in baseline and metric in modified:
                if isinstance(baseline[metric], dict):
                    comparison[metric] = {
                        "baseline": baseline[metric],
                        "modified": modified[metric],
                        "changed": baseline[metric] != modified[metric]
                    }
                else:
                    base_val = baseline[metric]
                    mod_val = modified[metric]
                    if isinstance(base_val, (int, float)) and isinstance(mod_val, (int, float)):
                        diff = mod_val - base_val
                        diff_pct = ((mod_val - base_val) / base_val * 100) if base_val != 0 else 0
                        comparison[metric] = {
                            "baseline": base_val,
                            "modified": mod_val,
                            "difference": diff,
                            "difference_percent": diff_pct,
                            "changed": diff != 0
                        }
        return comparison

    @staticmethod
    def _generate_events(scenario: WhatIfScenario, modified: Dict[str, Any]) -> List[SimulationEvent]:
        events = []
        mode_data = DataLoader.get_travel_mode(scenario.mode_id)
        category = mode_data.get("category", "realistic")

        seed = hash(f"{scenario.origin_id}{scenario.destination_id}{scenario.travel_date}{scenario.mode_id}")
        rng = random.Random(seed)

        travel_days = modified.get("travel_time", {}).get("travel_time_days", 30)
        num_events = max(3, min(int(travel_days / 30), 10))

        templates = SimulationEngine.EVENT_TEMPLATES.get(
            category,
            SimulationEngine.EVENT_TEMPLATES["realistic"]
        )

        for i in range(num_events):
            template = rng.choice(templates)
            events.append(SimulationEvent(
                day=int((i + 1) * max(travel_days, 1) / num_events),
                event=template[0],
                type=template[1],
                severity=template[2]
            ))

        return events

    @staticmethod
    def _determine_outcome(
        scenario: WhatIfScenario,
        modified: Dict[str, Any],
        events: List[SimulationEvent]
    ) -> str:
        mode_data = DataLoader.get_travel_mode(scenario.mode_id)
        failure_rate = mode_data.get("failure_rate", 0.02)
        major_events = sum(1 for e in events if e.severity == "major")
        adjusted_failure = failure_rate + (major_events * 0.05)

        seed = hash(f"{scenario.origin_id}{scenario.destination_id}{scenario.travel_date}{scenario.mode_id}outcome")
        rng = random.Random(seed)
        roll = rng.random()

        if roll < adjusted_failure:
            return "failure"
        elif roll < adjusted_failure + 0.15:
            return "partial_failure"
        else:
            return "success"

    @staticmethod
    def _generate_lessons(
        comparison: Dict[str, Any],
        outcome: str,
        scenario: WhatIfScenario
    ) -> List[str]:
        lessons = []
        if outcome == "success":
            lessons.append("Mission parameters were well-optimized")
            lessons.append("Crew training proved effective")
        elif outcome == "partial_failure":
            lessons.append("Consider increasing safety margins")
            lessons.append("Redundant systems would improve reliability")
        else:
            lessons.append("Mission parameters need significant revision")
            lessons.append("Consider alternative travel modes")

        if "distance_km" in comparison and comparison["distance_km"].get("changed"):
            diff_pct = comparison["distance_km"].get("difference_percent", 0)
            if diff_pct > 0:
                lessons.append(f"Increased distance required {abs(diff_pct):.1f}% more resources")
            else:
                lessons.append(f"Shorter distance saved {abs(diff_pct):.1f}% on resources")

        mode_data = DataLoader.get_travel_mode(scenario.mode_id)
        category = mode_data.get("category", "realistic")

        if category == "human_powered":
            lessons.append("Multi-generational commitment is essential")
        elif category == "absurd":
            lessons.append("Did you really expect this to work?")
        elif category == "impossible":
            lessons.append("Physics is more of a guideline than a rule here")

        return lessons
