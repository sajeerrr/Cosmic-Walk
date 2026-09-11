import type { TripCalculationResult } from "../types/trip";
import { PLANETS, formatDistance } from "./planets";

export function generateMockTripResult(params: {
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
}): TripCalculationResult {
  const originPlanet = PLANETS.find((p) => p.name === params.origin) || PLANETS[2];
  const destPlanet = PLANETS.find((p) => p.name === params.destination) || PLANETS[3];

  const rawDistanceKm = Math.abs(destPlanet.distanceFromSunKm - originPlanet.distanceFromSunKm);
  const speedKmh =
    params.transportMode === "MOONWALK"
      ? 3.2
      : params.transportMode === "POWER_STRIDE"
      ? 7.5
      : params.transportMode === "BAREFOOT"
      ? 4.0
      : params.transportMode === "EVA_SPACEWALK"
      ? 1.2
      : 5.0;

  const totalHours = rawDistanceKm / speedKmh;
  const totalDays = Math.round(totalHours / 24);
  const totalYears = Number((totalHours / (24 * 365.25)).toFixed(1));

  // Stride length based on height
  const strideMeters = (params.passenger.heightCm * 0.415) / 100;
  const estimatedSteps = Math.round((rawDistanceKm * 1000) / strideMeters);
  const dailySteps = 30_000;

  // Resource calculations
  const shoesRequired = Math.round(estimatedSteps / 1_500_000);
  const foodKcalTotal = Math.round(totalDays * 2500);
  const waterLitersTotal = Math.round(totalDays * 3.5);
  const oxygenTanksTotal = Math.round(totalDays * 2);
  const equipmentWeightKg = Math.round(params.passenger.weightKg * 1.8);
  const emergencyPacks = Math.max(12, Math.round(totalYears * 2));

  const difficulty = totalYears > 1000 ? "Existential" : totalYears > 100 ? "Extreme" : "Impossible";
  const survivalProb = totalYears > 500 ? 0.00001 : totalYears > 10 ? 0.001 : 0.01;

  return {
    tripId: `CW-${Math.floor(1000 + Math.random() * 9000)}-${params.origin.substring(0, 3).toUpperCase()}`,
    origin: params.origin,
    destination: params.destination,
    departureDate: params.departureDate,
    transportMode: params.transportMode,
    passenger: params.passenger,
    metrics: {
      distanceKm: rawDistanceKm,
      estimatedSteps,
      walkingDurationYears: totalYears,
      walkingDurationDays: totalDays,
      dailySteps,
      difficulty,
      survivalProbabilityPercent: survivalProb,
    },
    resources: {
      shoesRequiredPairs: shoesRequired,
      foodKcalTotal,
      waterLitersTotal,
      oxygenTanksTotal,
      equipmentWeightKg,
      emergencyPacks,
    },
    timeline: [
      {
        percentage: 0,
        label: "Departure Epoch",
        elapsedYears: 0,
        description: `Depart ${params.origin} base. High morale, fresh footwear, optimistic posture.`,
      },
      {
        percentage: 25,
        label: "Quarter Distance",
        elapsedYears: Number((totalYears * 0.25).toFixed(1)),
        description: `First shoe soles wear down. Walker realizes the true magnitude of astronomical space.`,
      },
      {
        percentage: 50,
        label: "Heliocentric Midpoint",
        elapsedYears: Number((totalYears * 0.5).toFixed(1)),
        description: `Midway checkpoint. ${params.origin} appears as a small dot. Morale sustained by snacks.`,
      },
      {
        percentage: 75,
        label: "Orbital Insertion Phase",
        elapsedYears: Number((totalYears * 0.75).toFixed(1)),
        description: `Entering target orbital zone. Gravitational pull of ${params.destination} becomes noticeable.`,
      },
      {
        percentage: 100,
        label: "Final Destination Stride",
        elapsedYears: totalYears,
        description: `Touchdown on ${params.destination}. Final pair of shoes officially disintegrates.`,
      },
    ],
    aiReport: {
      missionSummary: `A continuous ${totalYears.toLocaleString()} year foot journey spanning ${formatDistance(
        rawDistanceKm
      )} from ${params.origin} to ${params.destination} under ${params.transportMode} protocol.`,
      majorChallenges: [
        `Complete absence of atmosphere and breathable oxygen across ${rawDistanceKm.toLocaleString()} km of interplanetary vacuum.`,
        `Exponential shoe sole abrasion requiring approximately ${shoesRequired.toLocaleString()} replacement pairs.`,
        `Extremely long transit duration spanning several geological epochs.`,
        `Potential mild boredom during the 50% midpoint mark.`,
      ],
      personalizedRecommendations: [
        `Walker ${params.passenger.name} should pack extra socks and hydration packs.`,
        `Stretch hamstrings thoroughly before initiating departure on ${params.departureDate}.`,
        `Maintain steady stride cadence regardless of solar flare activity.`,
      ],
      humorousObservations: [
        `The walker will consume ${foodKcalTotal.toLocaleString()} calories, equivalent to approximately ${Math.round(
          foodKcalTotal / 550
        ).toLocaleString()} Big Macs.`,
        `Gravitational anomalies and lack of lunch stops disregarded per standard mission protocol.`,
        `Passenger has registered height of ${params.passenger.heightCm} cm — ideal for taking 1.5 million strides per shoe pair.`,
      ],
      finalVerdict: `POSSIBLY UNWISE, BUT SCIENTIFICALLY COMPUTE-VALIDATED. PROCEED WITH CAUTION AND EXTREME PATIENCE.`,
    },
  };
}
