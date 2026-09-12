import type { TripCalculationResult, MissionModifierParams, AiTravelReview } from "../types/trip";
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
    POWER_STRIDE: "run",
    bicycle: "bicycle",
    rowing: "walk",
    skateboard: "skateboard",
    horse: "horse",
  };
  return map[mode] || mode.toLowerCase();
}

function fmtNum(n: number, decimals = 1): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}

export async function calculateTrip(params: MissionParams): Promise<TripCalculationResult> {
  const originId = toPlanetId(params.origin);
  const destId   = toPlanetId(params.destination);
  const modeId   = toModeId(params.transportMode);

  try {
    // ── Fire both calls in parallel ──────────────────────────────────────
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
          passenger_name:      params.passenger.name,
          passenger_age:       params.passenger.age,
          passenger_height_cm: params.passenger.heightCm,
          passenger_weight_kg: params.passenger.weightKg,
          passenger_sex:       params.passenger.sex,
        }),
      }),
    ]);

    if (!calcRes.ok) {
      console.warn(`Backend calculate response status: ${calcRes.status}`);
      throw new Error("Backend calculation failed");
    }

    const calcData = await calcRes.json();
    let reportData: Record<string, unknown> | null = null;
    if (reportRes.ok) {
      try { reportData = await reportRes.json(); } catch { /* ignore */ }
    }

    // ── Extract travel time fields ───────────────────────────────────────
    const tt               = calcData.travel_time ?? {};
    const distanceKm       = calcData.distance_km  ?? 0;
    const distanceAu       = calcData.distance_au  ?? 0;
    const lightMinutes     = calcData.light_minutes ?? 0;
    const travelTimeDays   = tt.travel_time_days   ?? 0;
    const travelTimeYears  = tt.travel_time_years  ?? (travelTimeDays / 365.25);
    const travelTimeHuman  = tt.travel_time_human  ?? `${fmtNum(travelTimeYears)} years`;
    const generationsNeeded= tt.generations_needed ?? (travelTimeYears / 25);
    const humanLifetimes   = travelTimeYears / 80;
    const restDays         = tt.rest_days           ?? 0;
    const caloriesBurned   = tt.total_calories_burned ?? 0;
    const equivalentPizzas = tt.equivalent_pizzas   ?? 0;
    const maxSpeedKmS      = tt.max_speed_reached_km_s ?? 0;

    // ── Difficulty ───────────────────────────────────────────────────────
    const diff = calcData.difficulty ?? {};
    const difficultyMap: Record<string, "Moderate" | "Extreme" | "Existential" | "Impossible"> = {
      Easy: "Moderate", Moderate: "Moderate", Hard: "Extreme",
      Extreme: "Existential", Impossible: "Impossible", Ridiculous: "Impossible",
    };

    // ── Ridiculousness ───────────────────────────────────────────────────
    const ridic = calcData.ridiculousness ?? {};

    // ── Resources ────────────────────────────────────────────────────────
    const res        = calcData.resources ?? {};
    const ls         = res.life_support   ?? {};
    const foodKcal   = ls.food_kcal       ?? travelTimeDays * 2500;
    const waterL     = ls.water_liters    ?? travelTimeDays * 3.5;
    const oxygenKg   = ls.oxygen_kg       ?? travelTimeDays * 0.84;

    const strideMeters   = (params.passenger.heightCm * 0.415) / 100;
    const estimatedSteps = Math.round((distanceKm * 1000) / Math.max(strideMeters, 0.01));
    const shoesRequired  = Math.max(1, Math.round(estimatedSteps / 1_500_000));

    // ── Survival probability ─────────────────────────────────────────────
    const survivalProb = travelTimeYears > 1000 ? 0.00001
      : travelTimeYears > 100 ? 0.0001
      : travelTimeYears > 10  ? 0.001
      : travelTimeYears > 1   ? 0.01
      : 95;

    // ── Cost ─────────────────────────────────────────────────────────────
    const cost = calcData.cost ?? {};

    // ── Mode info ────────────────────────────────────────────────────────
    const mode = calcData.mode ?? {};

    // ── AI report mapping ────────────────────────────────────────────────
    const r = reportData as Record<string, unknown> | null;
    const reviewRaw = r?.travel_review as Record<string, string> | null;
    const travelReview: AiTravelReview | null = reviewRaw
      ? {
          comfort:       reviewRaw.comfort       ?? "",
          speed:         reviewRaw.speed         ?? "",
          safety:        reviewRaw.safety        ?? "",
          convenience:   reviewRaw.convenience   ?? "",
          ridiculousness:reviewRaw.ridiculousness ?? "",
        }
      : null;

    const aiReport = {
      // Rich new fields from expanded report
      negativeAiOpinion:    (r?.negative_ai_opinion as string) ?? "",
      introduction:         (r?.introduction       as string) ?? "",
      whatYouSignedUpFor:   (r?.what_you_signed_up_for as string) ?? "",
      travelExperience:     (r?.travel_experience  as string) ?? "",
      dailyRoutine:         (r?.daily_routine      as string) ?? "",
      foodStory:            (r?.food_story         as string) ?? "",
      waterStory:           (r?.water_story        as string) ?? "",
      footwearStory:        (r?.footwear_story     as string) ?? "",
      boredomIndex:         (r?.boredom_index      as string) ?? "",
      thingsYouWillMiss:    (r?.things_you_will_miss as string[]) ?? [],
      thingsYouWillSee:     (r?.things_you_will_see  as string[]) ?? [],
      cosmicProblems:       (r?.cosmic_problems    as string[]) ?? [],
      packingList:          (r?.packing_list       as string[]) ?? [],
      travelAdvice:         (r?.travel_advice      as string[]) ?? [],
      survivalGuide:        (r?.survival_guide     as string) ?? "",
      generationalImpact:   (r?.generational_impact as string) ?? "",
      arrivalScenario:      (r?.arrival_scenario   as string) ?? "",
      travelReview,
      fictionalInsurance:   (r?.fictional_insurance as string) ?? "",
      customerReview:       (r?.customer_review   as string) ?? "",
      finalVerdict:         (r?.final_verdict      as string) ?? (r?.journey_narrative as string ?? "").substring(0, 300),
      funRating:            (r?.fun_rating as number) ?? 7,
      // Legacy
      missionSummary:       (r?.mission_summary    as string) ?? `A ${fmtNum(travelTimeYears)} year mission covering ${fmtNum(distanceKm, 0)} km from ${params.origin} to ${params.destination}.`,
      majorChallenges:      (r?.warnings           as string[]) ?? [`Vacuum environment across ${fmtNum(distanceKm, 0)} km.`],
      personalizedRecommendations: r?.recommendations ? [(r.recommendations as string)] : [`Ensure adequate preparation, Commander ${params.passenger.name}.`],
      humorousObservations: (r?.highlights         as string[]) ?? (r?.crew_log as string[]) ?? [`Ridiculousness index: ${ridic.score ?? 5}/100.`],
    };

    return {
      tripId:        `CW-${Math.floor(1000 + Math.random() * 9000)}-${params.origin.substring(0, 3).toUpperCase()}`,
      origin:        params.origin,
      destination:   params.destination,
      departureDate: params.departureDate,
      transportMode: params.transportMode,
      modeName:      mode.name  ?? params.transportMode,
      modeCategory:  mode.category ?? "realistic",
      passenger:     params.passenger,

      metrics: {
        distanceKm,
        distanceAu,
        lightMinutes,
        estimatedSteps,
        walkingDurationYears: travelTimeYears,
        walkingDurationDays:  Math.round(travelTimeDays),
        travelTimeHuman,
        dailySteps:           30_000,
        difficulty:           difficultyMap[diff.rating ?? ""] ?? "Extreme",
        survivalProbabilityPercent: survivalProb,
        generationsNeeded,
        humanLifetimes,
        restDays,
        caloriesBurned,
        equivalentPizzas,
        ridiculousnessScore:  ridic.score  ?? 0,
        ridiculousnessRating: ridic.rating ?? "Unknown",
        ridiculousnessFunFacts: ridic.fun_facts ?? [],
        difficultyScore:      diff.score  ?? 0,
        difficultyDescription:diff.description ?? "",
        maxSpeedKmS,
      },

      resources: {
        shoesRequiredPairs:  shoesRequired,
        foodKcalTotal:       Math.round(foodKcal),
        waterLitersTotal:    Math.round(waterL),
        oxygenKgTotal:       Math.round(oxygenKg),
        oxygenTanksTotal:    Math.round(oxygenKg * 2),
        equipmentWeightKg:   Math.round(res.total_mass_kg ?? params.passenger.weightKg * 1.8),
        emergencyPacks:      Math.max(12, Math.round(travelTimeYears * 2)),
        totalMassKg:         res.total_mass_kg ?? 0,
        propulsion:          res.propulsion ?? {},
      },

      cost: {
        launchCostUsd:        cost.launch_cost_usd       ?? 0,
        fuelCostUsd:          cost.fuel_cost_usd         ?? 0,
        crewCostUsd:          cost.crew_cost_usd         ?? 0,
        spacecraftRentalUsd:  cost.spacecraft_rental_usd ?? 0,
        missionControlUsd:    cost.mission_control_usd   ?? 0,
        insuranceUsd:         cost.insurance_usd         ?? 0,
        exoticFeesUsd:        cost.exotic_fees_usd       ?? 0,
        contingencyUsd:       cost.contingency_usd       ?? 0,
        totalUsd:             cost.total_usd             ?? 0,
      },

      timeline: [
        { percentage: 0,   label: "Departure",        elapsedYears: 0,                                      description: `Depart ${params.origin} via ${mode.name ?? params.transportMode}.` },
        { percentage: 25,  label: "Quarter Way",       elapsedYears: +(travelTimeYears * 0.25).toFixed(1),   description: `First waypoint reached. ${fmtNum(distanceKm * 0.25, 0)} km covered.` },
        { percentage: 50,  label: "Halfway Point",     elapsedYears: +(travelTimeYears * 0.5).toFixed(1),    description: `Midpoint. ${fmtNum(distanceKm / 2, 0)} km remaining to ${params.destination}.` },
        { percentage: 75,  label: "Final Stretch",     elapsedYears: +(travelTimeYears * 0.75).toFixed(1),   description: `Entering target orbital zone of ${params.destination}.` },
        { percentage: 100, label: "Arrival",           elapsedYears: +travelTimeYears.toFixed(1),            description: `Touchdown on ${params.destination}. Mission complete.` },
      ],

      aiReport,
      verdict:          calcData.verdict,
      scale_comparison: calcData.scale_comparison,
      events:           calcData.events,
    };

  } catch (err) {
    console.warn("Backend unavailable — falling back to client-side calculation:", err);
    return generateMockTripResult(params);
  }
}
