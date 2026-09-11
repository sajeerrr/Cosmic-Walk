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
}
