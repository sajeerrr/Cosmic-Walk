export interface PassengerTelemetry {
  name: string;
  heightCm: number;
  weightKg: number;
  age: number;
  sex: string;
}

export interface TripMetrics {
  distanceKm: number;
  distanceAu: number;
  lightMinutes: number;
  estimatedSteps: number;
  walkingDurationYears: number;
  walkingDurationDays: number;
  travelTimeHuman: string;
  dailySteps: number;
  difficulty: "Moderate" | "Extreme" | "Existential" | "Impossible";
  survivalProbabilityPercent: number;
  generationsNeeded: number;
  humanLifetimes: number;
  restDays: number;
  caloriesBurned: number;
  equivalentPizzas: number;
  ridiculousnessScore: number;
  ridiculousnessRating: string;
  ridiculousnessFunFacts: string[];
  difficultyScore: number;
  difficultyDescription: string;
  maxSpeedKmS: number;
}

export interface TripResources {
  shoesRequiredPairs: number;
  foodKcalTotal: number;
  waterLitersTotal: number;
  oxygenKgTotal: number;
  oxygenTanksTotal: number;
  equipmentWeightKg: number;
  emergencyPacks: number;
  totalMassKg: number;
  propulsion: Record<string, unknown>;
}

export interface TripCost {
  launchCostUsd: number;
  fuelCostUsd: number;
  crewCostUsd: number;
  spacecraftRentalUsd: number;
  missionControlUsd: number;
  insuranceUsd: number;
  exoticFeesUsd: number;
  contingencyUsd: number;
  totalUsd: number;
}

export interface TimelineMilestone {
  percentage: number;
  label: string;
  elapsedYears: number;
  description: string;
}

export interface AiTravelReview {
  comfort: string;
  speed: string;
  safety: string;
  convenience: string;
  ridiculousness: string;
}

export interface AiMissionReport {
  negativeAiOpinion?: string;
  // ── Rich new sections ────────────────────────────────────────────────────
  introduction: string;
  whatYouSignedUpFor: string;
  travelExperience: string;
  dailyRoutine: string;
  foodStory: string;
  waterStory: string;
  footwearStory: string;
  boredomIndex: string;
  thingsYouWillMiss: string[];
  thingsYouWillSee: string[];
  cosmicProblems: string[];
  packingList: string[];
  travelAdvice: string[];
  survivalGuide: string;
  generationalImpact: string;
  arrivalScenario: string;
  travelReview: AiTravelReview | null;
  fictionalInsurance: string;
  customerReview: string;
  finalVerdict: string;
  funRating: number;
  // ── Legacy fields (always populated as fallback) ─────────────────────────
  missionSummary: string;
  majorChallenges: string[];
  personalizedRecommendations: string[];
  humorousObservations: string[];
}

export interface MissionVerdict {
  classification: "SENSIBLE" | "DIFFICULT" | "EXTREME" | "ABSURD" | "IMPOSSIBLE";
  score: number;
  title: string;
  summary: string;
}

export interface ScaleComparisonItem {
  label: string;
  value: number;
  formatted_value: string;
  unit: string;
}

export interface MissionModifierParams {
  speed_override_km_h?: number;
  cargo_mass_kg?: number;
  unlimited_food?: boolean;
  unlimited_water?: boolean;
  unlimited_fuel?: boolean;
  random_events_enabled?: boolean;
}

export interface TripCalculationResult {
  tripId: string;
  origin: string;
  destination: string;
  departureDate: string;
  transportMode: string;
  modeName: string;
  modeCategory: string;
  passenger: PassengerTelemetry;
  metrics: TripMetrics;
  resources: TripResources;
  cost: TripCost;
  timeline: TimelineMilestone[];
  aiReport: AiMissionReport;
  verdict?: MissionVerdict;
  scale_comparison?: ScaleComparisonItem[];
  events?: Array<{ day: number; event: string; type?: string }>;
}
