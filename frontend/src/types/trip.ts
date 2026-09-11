export interface PassengerTelemetry {
  name: string;
  heightCm: number;
  weightKg: number;
  age: number;
  sex: string;
}

export interface TripMetrics {
  distanceKm: number;
  estimatedSteps: number;
  walkingDurationYears: number;
  walkingDurationDays: number;
  dailySteps: number;
  difficulty: "Moderate" | "Extreme" | "Existential" | "Impossible";
  survivalProbabilityPercent: number;
}

export interface TripResources {
  shoesRequiredPairs: number;
  foodKcalTotal: number;
  waterLitersTotal: number;
  oxygenTanksTotal: number;
  equipmentWeightKg: number;
  emergencyPacks: number;
}

export interface TimelineMilestone {
  percentage: number;
  label: string;
  elapsedYears: number;
  description: string;
}

export interface AiMissionReport {
  missionSummary: string;
  majorChallenges: string[];
  personalizedRecommendations: string[];
  humorousObservations: string[];
  finalVerdict: string;
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
  passenger: PassengerTelemetry;
  metrics: TripMetrics;
  resources: TripResources;
  timeline: TimelineMilestone[];
  aiReport: AiMissionReport;
  verdict?: MissionVerdict;
  scale_comparison?: ScaleComparisonItem[];
  events?: Array<{ day: number; event: string; type?: string }>;
}
