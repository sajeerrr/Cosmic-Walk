import random
import uuid
from typing import Optional

from app.models.challenge import Challenge, ChallengeDifficulty
from app.services.mission_calculator import MissionCalculator
from app.services.data_loader import DataLoader


class ChallengeEngine:
    """Generate random travel challenges."""

    CHALLENGE_TEMPLATES = [
        {
            "title": "Budget Traveler",
            "description": "Complete the journey under budget",
            "constraint_type": "cost",
            "difficulty_range": (20, 40)
        },
        {
            "title": "Speed Demon",
            "description": "Get there as fast as possible",
            "constraint_type": "time",
            "difficulty_range": (30, 60)
        },
        {
            "title": "Survival Mode",
            "description": "Choose a mode with low failure rate",
            "constraint_type": "survival",
            "difficulty_range": (10, 30)
        },
        {
            "title": "The Long Way Round",
            "description": "Use the slowest possible method",
            "constraint_type": "time_max",
            "difficulty_range": (50, 80)
        },
        {
            "title": "Interplanetary Cheapskate",
            "description": "Spend less than $100 on your journey",
            "constraint_type": "cost_min",
            "difficulty_range": (60, 90)
        },
        {
            "title": "Daredevil",
            "description": "Use the most dangerous travel mode",
            "constraint_type": "danger",
            "difficulty_range": (70, 95)
        },
        {
            "title": "Eco-Friendly",
            "description": "Use sustainable propulsion",
            "constraint_type": "sustainable",
            "difficulty_range": (30, 50)
        },
        {
            "title": "The Impossible Dream",
            "description": "Attempt an impossible travel mode",
            "constraint_type": "impossible",
            "difficulty_range": (80, 100)
        },
    ]

    @staticmethod
    def generate_challenge(difficulty: Optional[str] = None) -> Challenge:
        """Generate a random challenge."""
        planets = DataLoader.load_planets()["planets"]
        modes = DataLoader.load_travel_modes()["modes"]

        # Pick random origin/destination (different)
        origin, destination = random.sample(planets, 2)

        # Pick challenge template
        template = random.choice(ChallengeEngine.CHALLENGE_TEMPLATES)

        # Pick appropriate mode
        mode = ChallengeEngine._select_mode_for_challenge(
            template, difficulty, modes
        )

        # Generate constraints
        constraints = ChallengeEngine._generate_constraints(
            template, origin, destination, mode
        )

        # Calculate baseline mission
        baseline = MissionCalculator.calculate_mission(
            origin["id"],
            destination["id"],
            "2024-01-01",
            mode["id"],
            1
        )

        # Set limits based on constraint type
        if template["constraint_type"] == "cost":
            cost_limit = baseline["cost"]["total_usd"] * random.uniform(0.5, 0.8)
            time_limit = baseline["travel_time"]["travel_time_seconds"] * 2
        elif template["constraint_type"] == "time":
            time_limit = baseline["travel_time"]["travel_time_seconds"] * random.uniform(0.6, 0.9)
            cost_limit = baseline["cost"]["total_usd"] * 2
        elif template["constraint_type"] == "cost_min":
            cost_limit = 100.0
            time_limit = baseline["travel_time"]["travel_time_seconds"] * 10
        elif template["constraint_type"] == "time_max":
            time_limit = baseline["travel_time"]["travel_time_seconds"] * 100
            cost_limit = baseline["cost"]["total_usd"] * 0.5
        else:
            time_limit = baseline["travel_time"]["travel_time_seconds"] * 1.5
            cost_limit = baseline["cost"]["total_usd"] * 1.5

        # Generate fun description
        fun_desc = ChallengeEngine._generate_fun_description(
            origin, destination, mode, template
        )

        # Generate reward
        challenge_difficulty = difficulty or "medium"
        reward = ChallengeEngine._generate_reward(challenge_difficulty)

        return Challenge(
            challenge_id=str(uuid.uuid4()),
            title=template["title"],
            description=template["description"],
            origin_id=origin["id"],
            destination_id=destination["id"],
            mode_id=mode["id"],
            constraints=constraints,
            difficulty=ChallengeDifficulty(challenge_difficulty),
            time_limit_seconds=time_limit,
            cost_limit_usd=cost_limit,
            success_criteria={
                "complete_journey": True,
                "within_budget": template["constraint_type"] in ["cost", "cost_min"],
                "within_time": template["constraint_type"] in ["time", "time_max"]
            },
            fun_description=fun_desc,
            reward=reward
        )

    @staticmethod
    def _select_mode_for_challenge(
        template: dict,
        difficulty: Optional[str],
        modes: list
    ) -> dict:
        """Select appropriate travel mode for challenge."""
        constraint_type = template["constraint_type"]

        if constraint_type == "cost_min":
            # Need cheap modes
            candidates = [m for m in modes if m["cost_per_km_usd"] < 10]
        elif constraint_type == "time":
            # Need fast modes
            candidates = [m for m in modes if m["category"] in ["impossible", "theoretical"]]
        elif constraint_type == "time_max":
            # Need slow modes
            candidates = [m for m in modes if m["category"] == "human_powered"]
        elif constraint_type == "survival":
            # Need safe modes
            candidates = [m for m in modes if m["failure_rate"] < 0.02]
        elif constraint_type == "danger":
            # Need dangerous modes
            candidates = [m for m in modes if m["failure_rate"] > 0.5]
        elif constraint_type == "sustainable":
            # Need eco-friendly modes
            candidates = [m for m in modes if m["fuel_type"] in ["sunlight", "calories"]]
        elif constraint_type == "impossible":
            # Need impossible modes
            candidates = [m for m in modes if m["category"] == "impossible"]
        else:
            candidates = modes

        if not candidates:
            candidates = modes

        return random.choice(candidates)

    @staticmethod
    def _generate_constraints(
        template: dict,
        origin: dict,
        destination: dict,
        mode: dict
    ) -> dict:
        """Generate challenge constraints."""
        constraints = {
            "origin_planet": origin["name"],
            "destination_planet": destination["name"],
            "travel_mode": mode["name"],
        }

        constraint_type = template["constraint_type"]

        if constraint_type == "cost":
            constraints["budget_percentage"] = random.randint(50, 80)
            constraints["hint"] = "Pack light to save money!"
        elif constraint_type == "time":
            constraints["time_percentage"] = random.randint(60, 90)
            constraints["hint"] = "No time for sightseeing!"
        elif constraint_type == "cost_min":
            constraints["max_budget_usd"] = 100
            constraints["hint"] = "Budget travel at its finest!"
        elif constraint_type == "survival":
            constraints["min_survival_rate"] = 0.95
            constraints["hint"] = "Safety first!"
        elif constraint_type == "danger":
            constraints["min_failure_rate"] = 0.5
            constraints["hint"] = "Live dangerously!"
        elif constraint_type == "sustainable":
            constraints["renewable_fuel_only"] = True
            constraints["hint"] = "Think green!"
        elif constraint_type == "impossible":
            constraints["must_break_physics"] = True
            constraints["hint"] = "Physics is just a suggestion!"

        return constraints

    @staticmethod
    def _generate_fun_description(
        origin: dict,
        destination: dict,
        mode: dict,
        template: dict
    ) -> str:
        """Generate humorous challenge description."""
        descriptions = {
            "Budget Traveler":
                f"Your accountant said you can't spend more than {random.randint(100, 1000)} spacebucks. "
                f"Prove them wrong by getting from {origin['name']} to {destination['name']} on a shoestring budget!",

            "Speed Demon":
                f"A cosmic event is happening on {destination['name']} in just a short while! "
                f"Race there using {mode['name']} before you miss the best fireworks show in the solar system!",

            "Survival Mode":
                f"The insurance company refuses to cover high-risk travel. "
                f"Get from {origin['name']} to {destination['name']} using the safest method possible. "
                f"Your family will thank you!",

            "The Long Way Round":
                f"Some say the journey is the destination. "
                f"You're about to test that theory with a {mode['name']} trip from {origin['name']} to {destination['name']}. "
                f"Bring a good playlist. And snacks. Lots of snacks.",

            "Interplanetary Cheapskate":
                f"Your wallet is empty but your dreams are full! "
                f"Travel from {origin['name']} to {destination['name']} using {mode['name']} "
                f"for less than the cost of a fancy dinner. Hint: Walking is free!",

            "Daredevil":
                f"Adrenaline junkie? We've got the perfect trip for you! "
                f"Travel from {origin['name']} to {destination['name']} using {mode['name']}. "
                f"Survival not guaranteed. Excitement absolutely guaranteed!",

            "Eco-Friendly":
                f"Save the planet (any planet) by using sustainable travel! "
                f"Journey from {origin['name']} to {destination['name']} using only renewable energy. "
                f"Mother Nature (of any world) will thank you!",

            "The Impossible Dream":
                f"They said it couldn't be done. They were probably right. "
                f"But you're going to try anyway! Travel from {origin['name']} to {destination['name']} "
                f"using {mode['name']}. Physics professors everywhere will be confused!"
        }

        return descriptions.get(
            template["title"],
            f"Travel from {origin['name']} to {destination['name']} using {mode['name']}. "
            f"What could possibly go wrong?"
        )

    @staticmethod
    def _generate_reward(difficulty: str) -> str:
        """Generate reward text."""
        rewards = {
            "easy": "🥉 Bronze Space Explorer Badge + 100 cosmic credits",
            "medium": "🥈 Silver Space Explorer Badge + 500 cosmic credits",
            "hard": "🥇 Gold Space Explorer Badge + 1000 cosmic credits",
            "impossible": "💎 Platinum Space Explorer Badge + 5000 cosmic credits + bragging rights",
            "ridiculous": "👑 Diamond Space Explorer Badge + 10000 cosmic credits + a certificate suitable for framing"
        }
        return rewards.get(difficulty, rewards["medium"])
