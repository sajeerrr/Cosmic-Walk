import type { TripCalculationResult, MissionModifierParams } from "../types/trip";
import { generateMockTripResult } from "../data/mockTripResult";

export interface BackendPlanet {
  id: string;
  name: string;
  type?: string;
  mass_kg: number;
  radius_km: number;
  semi_major_axis_au: number;
  avg_temp_celsius: number;
  gravity_m_s2: number;
  description: string;
  fun_facts: string[];
}

export interface BackendTravelMode {
  id: string;
  name: string;
  category: string;
  description: string;
  max_speed_km_s: number;
  average_speed_km_s: number;
  fuel_type: string;
  fun_description?: string;
}

export interface MissionParams {
  origin: string;
  destination: string;
  departureDate: string;
  transportMode: string;
  passenger: {
    name: string;
    heightCm: number;
    weightKg: number;
    age: number;
    sex: string;
  };
  modifiers?: MissionModifierParams;
  seed?: number;
}

const API_BASE = "/api/v1";

export async function fetchPlanets(): Promise<BackendPlanet[]> {
  try {
    const res = await fetch(`${API_BASE}/celestial-objects/`);
    if (!res.ok) {
      const fallbackRes = await fetch(`${API_BASE}/planets/`);
      if (!fallbackRes.ok) throw new Error(`API error: ${fallbackRes.statusText}`);
      return await fallbackRes.json();
    }
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch celestial objects from backend, using default list.", err);
    return [];
  }
}

export async function fetchTravelModes(): Promise<BackendTravelMode[]> {
  try {
    const res = await fetch(`${API_BASE}/travel-modes/`);
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch travel modes from backend.", err);
    return [];
  }
}

function toPlanetId(name: string): string {
  return name.toLowerCase().trim();
}

function toModeId(mode: string): string {
  const map: Record<string, string> = {
    WALKING: "walk",
    MOONWALK: "run",
    POWER_STRIDE: "run",
    BAREFOOT: "walk",
    EVA_SPACEWALK: "walk",
  };
  return map[mode] || mode.toLowerCase();
}

export async function calculateTrip(params: MissionParams): Promise<TripCalculationResult> {
  const originId = toPlanetId(params.origin);
  const destId = toPlanetId(params.destination);
  const modeId = toModeId(params.transportMode);

  try {
    const [calcRes, reportRes] = await Promise.all([
      fetch(`${API_BASE}/missions/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_id: originId,
          destination_id: destId,
          travel_date: params.departureDate,
          mode_id: modeId,
          crew_size: 1,
          modifiers: params.modifiers,
          seed: params.seed,
        }),
      }),
      fetch(`${API_BASE}/missions/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_id: originId,
          destination_id: destId,
          travel_date: params.departureDate,
          mode_id: modeId,
          crew_size: 1,
        }),
      }),
    ]);

    if (!calcRes.ok) {
      console.warn(`Backend calculate response status: ${calcRes.status}`);
      throw new Error("Backend calculation failed");
    }

    const calcData = await calcRes.json();
    let reportData = null;
    if (reportRes.ok) {
      reportData = await reportRes.json();
    }

    const distanceKm = calcData.distance_km || 0;
    const travelTimeDays = calcData.travel_time?.travel_time_days || 0;
    const travelTimeYears = calcData.travel_time?.travel_time_years || Number((travelTimeDays / 365.25).toFixed(1));

    const strideMeters = (params.passenger.heightCm * 0.415) / 100;
    const estimatedSteps = Math.round((distanceKm * 1000) / strideMeters);
    const shoesRequired = Math.round(estimatedSteps / 1_500_000);

    const difficultyRating = calcData.difficulty?.rating || "Moderate";
    const difficultyMap: Record<string, "Moderate" | "Extreme" | "Existential" | "Impossible"> = {
      Easy: "Moderate",
      Moderate: "Moderate",
      Hard: "Extreme",
      Extreme: "Existential",
      Impossible: "Impossible",
      Ridiculous: "Impossible",
    };

    return {
      tripId: `CW-${Math.floor(1000 + Math.random() * 9000)}-${params.origin.substring(0, 3).toUpperCase()}`,
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      transportMode: params.transportMode,
      passenger: params.passenger,
      metrics: {
        distanceKm,
        estimatedSteps,
        walkingDurationYears: travelTimeYears,
        walkingDurationDays: Math.round(travelTimeDays),
        dailySteps: 30_000,
        difficulty: difficultyMap[difficultyRating] || "Extreme",
        survivalProbabilityPercent: travelTimeYears > 1000 ? 0.00001 : travelTimeYears > 10 ? 0.001 : 0.01,
      },
      resources: {
        shoesRequiredPairs: Math.max(1, shoesRequired),
        foodKcalTotal: Math.round(calcData.resources?.life_support?.food_kcal || travelTimeDays * 2500),
        waterLitersTotal: Math.round(calcData.resources?.life_support?.water_liters || travelTimeDays * 3.5),
        oxygenTanksTotal: Math.round(calcData.resources?.life_support?.oxygen_kg ? calcData.resources.life_support.oxygen_kg * 2 : travelTimeDays * 2),
        equipmentWeightKg: Math.round(calcData.resources?.total_mass_kg || params.passenger.weightKg * 1.8),
        emergencyPacks: Math.max(12, Math.round(travelTimeYears * 2)),
      },
      timeline: [
        {
          percentage: 0,
          label: "Departure Epoch",
          elapsedYears: 0,
          description: `Depart ${params.origin} base under ${calcData.mode?.name || params.transportMode} protocol.`,
        },
        {
          percentage: 25,
          label: "Quarter Distance",
          elapsedYears: Number((travelTimeYears * 0.25).toFixed(1)),
          description: `First waypoint milestone reached across ${params.origin}-${params.destination} vector.`,
        },
        {
          percentage: 50,
          label: "Heliocentric Midpoint",
          elapsedYears: Number((travelTimeYears * 0.5).toFixed(1)),
          description: `Midway checkpoint. Distance covered: ${(distanceKm / 2).toLocaleString()} km.`,
        },
        {
          percentage: 75,
          label: "Orbital Insertion Phase",
          elapsedYears: Number((travelTimeYears * 0.75).toFixed(1)),
          description: `Entering target gravity well of ${params.destination}.`,
        },
        {
          percentage: 100,
          label: "Final Destination Stride",
          elapsedYears: travelTimeYears,
          description: `Touchdown on ${params.destination}. Mission complete.`,
        },
      ],
      aiReport: {
        missionSummary: reportData?.mission_summary || `A ${travelTimeYears} year mission covering ${distanceKm.toLocaleString()} km from ${params.origin} to ${params.destination}.`,
        majorChallenges: reportData?.warnings || [
          `Vacuum environment and temperature extremes between ${params.origin} and ${params.destination}.`,
          `Distance of ${distanceKm.toLocaleString()} km requiring massive resource stockpiling.`,
        ],
        personalizedRecommendations: reportData?.recommendations ? [reportData.recommendations] : [
          `Commander ${params.passenger.name} should ensure adequate physical conditioning and supply reserves.`,
        ],
        humorousObservations: reportData?.highlights || reportData?.crew_log || [
          `Mission difficulty rated: ${calcData.difficulty?.rating || "High"}.`,
          `Ridiculousness index score: ${calcData.ridiculousness?.score || 10}/10.`,
        ],
        finalVerdict: reportData?.journey_narrative?.substring(0, 250) || calcData.difficulty?.description || "COMMENCE MISSION AT OWN RISK.",
      },
      verdict: calcData.verdict,
      scale_comparison: calcData.scale_comparison,
      events: calcData.events,
    };
  } catch (err) {
    console.warn("Backend unavailable or returned error, falling back to client-side calculation:", err);
    return generateMockTripResult(params);
  }
}
