import uuid
import random
from datetime import datetime
from typing import Dict, Any, List

from app.models.simulation import WhatIfScenario, SimulationResult, SimulationEvent
from app.services.mission_calculator import MissionCalculator
from app.services.data_loader import DataLoader


class SimulationEngine:
    """Run what-if scenarios and journey simulations."""

    EVENT_TEMPLATES = {
        "realistic": [
            ("Course correction burn completed", "minor_fuel_use", "minor"),
            ("Solar panel efficiency check - optimal", "minor_event", "minor"),
            ("Crew health check - all systems nominal", "minor_event", "minor"),
            ("Navigation calibration updated", "minor_event", "minor"),
            ("Minor debris avoidance maneuver", "minor_event", "minor"),
            ("Life support systems check", "minor_event", "minor"),
            ("Communication relay established", "minor_event", "minor"),
        ],
        "theoretical": [
            ("Reactor efficiency at 94%", "minor_event", "minor"),
            ("Magnetic containment field stable", "minor_event", "minor"),
            ("Fuel injection system optimized", "minor_event", "minor"),
            ("Radiation shielding integrity check", "minor_event", "minor"),
            ("Propulsion system diagnostic", "minor_event", "minor"),
        ],
        "absurd": [
            ("Aliens spotted! (It was space debris)", "minor_event", "minor"),
            ("Crew ran out of snacks", "morale_drop", "minor"),
            ("Someone pressed the red button (false alarm)", "critical_event", "major"),
            ("Space pigeon attacked solar panels", "minor_damage", "minor"),
            ("Unexpected cosmic ray hit the navigation computer", "minor_event", "minor"),
            ("Crew member told a space joke - laughter detected", "morale_boost", "minor"),
            ("Artificial gravity glitch - everyone floated for 10 minutes", "minor_event", "minor"),
        ],
        "impossible": [
            ("Reality glitch detected - universe rebooting", "dimensional_event", "major"),
            ("Time loop encountered (or was it?)", "temporal_event", "major"),
            ("Physics engine complained about impossible velocities", "impossible_event", "minor"),
            ("Paradox averted successfully", "temporal_event", "minor"),
            ("Hyperspace turbulence detected", "dimensional_event", "minor"),
            ("Warp bubble stabilized", "dimensional_event", "minor"),
        ],
        "human_powered": [
            ("Rest stop taken - legs are sore", "rest_stop", "minor"),
            ("Beautiful cosmic view observed", "sightseeing", "minor"),
            ("Shoelace retied", "minor_event", "minor"),
            ("Hydration break completed", "minor_event", "minor"),
            ("Generations passed - new walker takes over", "generational", "major"),
            ("Historic moment documented for future generations", "milestone", "minor"),
        ],
    }

    @staticmethod
    def run_what_if(scenario: WhatIfScenario) -> SimulationResult:
        """Run a modified scenario and compare to baseline."""
        # Calculate baseline mission
        baseline = MissionCalculator.calculate_mission(
            scenario.origin_id,
            scenario.destination_id,
            scenario.travel_date,
            scenario.mode_id,
            scenario.crew_size
        )

        # Apply modifications to create modified scenario
        modified = baseline.copy()
        for key, value in scenario.modifications.items():
            if key in modified:
                modified[key] = SimulationEngine._apply_modification(
                    modified[key], value, key
                )

        # Recalculate dependent values
        modified = SimulationEngine._recalculate_dependencies(modified, scenario)

        # Compare baseline and modified
        comparison = SimulationEngine._compare_scenarios(baseline, modified)

        # Generate journey events
        events = SimulationEngine._generate_events(scenario, modified)

        # Determine outcome
        outcome = SimulationEngine._determine_outcome(scenario, modified, events)

        # Generate lessons learned
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
    def _apply_modification(current_value: Any, modification: Any, key: str) -> Any:
        """Apply a modification to a value."""
        if isinstance(modification, dict) and isinstance(current_value, dict):
            # Deep merge
            result = current_value.copy()
            result.update(modification)
            return result
        elif isinstance(modification, (int, float)) and isinstance(current_value, (int, float)):
            # Apply multiplier or setter
            if isinstance(modification, float) and 0 < modification < 10:
                return current_value * modification
            return modification
        else:
            return modification

    @staticmethod
    def _recalculate_dependencies(modified: Dict[str, Any], scenario: WhatIfScenario) -> Dict[str, Any]:
        """Recalculate dependent values after modifications."""
        # If distance changed, recalculate travel time
        if "distance_km" in scenario.modifications:
            mode_data = DataLoader.get_travel_mode(scenario.mode_id)
            from app.services.travel_mode_engine import TravelModeEngine
            origin = DataLoader.get_planet(scenario.origin_id)
            dest = DataLoader.get_planet(scenario.destination_id)

            travel_result = TravelModeEngine.calculate_travel_time(
                mode_data, modified["distance_km"], origin, dest
            )
            modified["travel_time"] = travel_result

        # If travel time changed, recalculate resources and costs
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
        """Compare baseline and modified scenarios."""
        comparison = {}

        # Compare key metrics
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
        """Generate journey events based on scenario."""
        events = []

        mode_data = DataLoader.get_travel_mode(scenario.mode_id)
        category = mode_data.get("category", "realistic")

        # Seed random for reproducibility
        seed = hash(f"{scenario.origin_id}{scenario.destination_id}{scenario.travel_date}{scenario.mode_id}")
        random.seed(seed)

        # Calculate number of events (1 per month, min 3, max 20)
        travel_days = modified.get("travel_time", {}).get("travel_time_days", 30)
        num_events = max(3, min(int(travel_days / 30), 20))

        # Get appropriate event templates
        templates = SimulationEngine.EVENT_TEMPLATES.get(
            category,
            SimulationEngine.EVENT_TEMPLATES["realistic"]
        )

        # Generate events
        for i in range(num_events):
            template = random.choice(templates)
            events.append(SimulationEvent(
                day=int((i + 1) * travel_days / num_events),
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
        """Determine mission outcome."""
        mode_data = DataLoader.get_travel_mode(scenario.mode_id)
        failure_rate = mode_data.get("failure_rate", 0.02)

        # Count major events
        major_events = sum(1 for e in events if e.severity == "major")

        # Adjust failure rate based on events
        adjusted_failure = failure_rate + (major_events * 0.05)

        # Seed random for reproducibility
        seed = hash(f"{scenario.origin_id}{scenario.destination_id}{scenario.travel_date}{scenario.mode_id}outcome")
        random.seed(seed)
        roll = random.random()

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
        """Generate lessons learned from the simulation."""
        lessons = []

        # Add outcome-specific lessons
        if outcome == "success":
            lessons.append("Mission parameters were well-optimized")
            lessons.append("Crew training proved effective")
        elif outcome == "partial_failure":
            lessons.append("Consider increasing safety margins")
            lessons.append("Redundant systems would improve reliability")
        else:
            lessons.append("Mission parameters need significant revision")
            lessons.append("Consider alternative travel modes")

        # Add comparison-specific lessons
        if "distance_km" in comparison and comparison["distance_km"].get("changed"):
            diff_pct = comparison["distance_km"].get("difference_percent", 0)
            if diff_pct > 0:
                lessons.append(f"Increased distance required {abs(diff_pct):.1f}% more resources")
            else:
                lessons.append(f"Shorter distance saved {abs(diff_pct):.1f}% on resources")

        if "cost" in comparison and comparison["cost"].get("changed"):
            lessons.append("Budget adjustments impacted mission feasibility")

        # Add mode-specific lessons
        mode_data = DataLoader.get_travel_mode(scenario.mode_id)
        category = mode_data.get("category", "realistic")

        if category == "human_powered":
            lessons.append("Multi-generational commitment is essential")
            lessons.append("Consider pack animals for heavy supplies")
        elif category == "absurd":
            lessons.append("Did you really expect this to work?")
            lessons.append("Sometimes the journey IS the destination")
        elif category == "impossible":
            lessons.append("Physics is more of a guideline than a rule here")
            lessons.append("Remember: reality is what you make of it")

        return lessons
