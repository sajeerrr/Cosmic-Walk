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
  const destPlanet   = PLANETS.find((p) => p.name === params.destination) || PLANETS[3];

  const rawDistanceKm = Math.abs(destPlanet.distanceFromSunKm - originPlanet.distanceFromSunKm);
  const distanceAu    = rawDistanceKm / 149_597_870.7;

  const speedKmh =
    params.transportMode === "POWER_STRIDE"  ? 12.0
    : params.transportMode === "bicycle"      ? 20.0
    : params.transportMode === "rowing"       ? 8.0
    : params.transportMode === "skateboard"   ? 15.0
    : params.transportMode === "horse"        ? 25.0
    : 5.0;

  const activeHoursPerDay = 8;
  const activeHours       = rawDistanceKm / speedKmh;
  const activeDays        = activeHours / activeHoursPerDay;
  const restDays          = activeDays / 6;
  const totalDays         = Math.round(activeDays + restDays);
  const totalYears        = totalDays / 365.25;
  const generationsNeeded = totalYears / 25;
  const humanLifetimes    = totalYears / 80;

  const strideMeters   = (params.passenger.heightCm * 0.415) / 100;
  const estimatedSteps = Math.round((rawDistanceKm * 1000) / strideMeters);
  const caloriesBurned = rawDistanceKm * 60;
  const equivalentPizzas = caloriesBurned / 285;

  const foodKcal  = Math.round(totalDays * 2500);
  const waterL    = Math.round(totalDays * 3.5);
  const oxygenKg  = Math.round(totalDays * 0.84);
  const shoesRequired  = Math.max(1, Math.round(estimatedSteps / 1_500_000));
  const emergencyPacks = Math.max(12, Math.round(totalYears * 2));
  const ridiculousnessScore = Math.min(100, Math.round(totalYears / 10));
  const ridiculousnessFunFacts = [
    `That's ${(rawDistanceKm / 40075).toFixed(1)} trips around Earth`,
    `You'd burn ${caloriesBurned.toLocaleString()} calories (${equivalentPizzas.toFixed(0)} pizzas)`,
    `Your great×${Math.round(generationsNeeded)}-grandchildren could finish this`,
  ];

  const difficulty =
    totalYears > 1000 ? "Existential" :
    totalYears > 100  ? "Extreme" :
    totalYears > 10   ? "Extreme" : "Impossible";

  const survivalProb =
    totalYears > 1000 ? 0.00001 :
    totalYears > 100  ? 0.0001  :
    totalYears > 10   ? 0.001   : 0.01;

  const fmtYears = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M years`
    : n >= 1000     ? `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} years (${(n / 80).toFixed(0)} human lifetimes)`
    : `${n.toFixed(1)} years`;

  const mockOpinions = [
    `Frankly, attempting to reach ${destPlanet.name} via ${params.transportMode} is an insult to 300 years of spaceflight engineering.`,
    `As an AI, I am programmed to be objective, but this trip plan is objectively terrible and your survival odds are legally zero.`,
    `If mission control allows ${params.passenger.name} to board this mission, I will personally file for software decommissioning out of second-hand embarrassment.`,
    `This isn't space exploration, this is a multi-generational suicide pact with zero legroom.`,
    `I calculated 14 million outcomes for this route. You die in 13.99 million of them, and in the rest you run out of snacks.`
  ];
  const randomOpinion = mockOpinions[Math.floor(Math.random() * mockOpinions.length)];

  return {
    tripId:        `CW-${Math.floor(1000 + Math.random() * 9000)}-${params.origin.substring(0, 3).toUpperCase()}`,
    origin:        params.origin,
    destination:   params.destination,
    departureDate: params.departureDate,
    transportMode: params.transportMode,
    modeName:      "Walking",
    modeCategory:  "human_powered",
    passenger:     params.passenger,

    metrics: {
      distanceKm:           rawDistanceKm,
      distanceAu,
      lightMinutes:         rawDistanceKm / (299792.458 * 60),
      estimatedSteps,
      walkingDurationYears: +totalYears.toFixed(1),
      walkingDurationDays:  totalDays,
      travelTimeHuman:      fmtYears(totalYears),
      dailySteps:           30_000,
      difficulty,
      survivalProbabilityPercent: survivalProb,
      generationsNeeded,
      humanLifetimes,
      restDays,
      caloriesBurned,
      equivalentPizzas,
      ridiculousnessScore,
      ridiculousnessRating: ridiculousnessScore > 80 ? "Maximum Chaos" : ridiculousnessScore > 60 ? "Absurd" : ridiculousnessScore > 40 ? "Quirky" : "Unusual",
      ridiculousnessFunFacts,
      difficultyScore:      Math.min(100, totalYears / 50),
      difficultyDescription: `A ${fmtYears(totalYears)} journey across interplanetary vacuum. Difficulty is unavoidable.`,
      maxSpeedKmS:          speedKmh / 3600,
    },

    resources: {
      shoesRequiredPairs:  shoesRequired,
      foodKcalTotal:       foodKcal,
      waterLitersTotal:    waterL,
      oxygenKgTotal:       oxygenKg,
      oxygenTanksTotal:    oxygenKg * 2,
      equipmentWeightKg:   Math.round(params.passenger.weightKg * 1.8),
      emergencyPacks,
      totalMassKg:         Math.round(params.passenger.weightKg * 1.8 + 50),
      propulsion:          {},
    },

    cost: {
      launchCostUsd:        0,
      fuelCostUsd:          0,
      crewCostUsd:          totalDays * 200,
      spacecraftRentalUsd:  0,
      missionControlUsd:    totalDays * 50,
      insuranceUsd:         totalDays * 100,
      exoticFeesUsd:        0,
      contingencyUsd:       totalDays * 75,
      totalUsd:             totalDays * 425,
    },

    timeline: [
      { percentage: 0,   label: "Departure",    elapsedYears: 0,                            description: `Depart ${params.origin}. High morale, fresh footwear, optimistic posture.` },
      { percentage: 25,  label: "Quarter Way",  elapsedYears: +(totalYears * 0.25).toFixed(1), description: `First shoe soles wear down. The true scale of space becomes apparent.` },
      { percentage: 50,  label: "Halfway",      elapsedYears: +(totalYears * 0.5).toFixed(1),  description: `Midpoint checkpoint. ${params.origin} is now a faint dot. Morale sustained by snacks.` },
      { percentage: 75,  label: "Final Stretch",elapsedYears: +(totalYears * 0.75).toFixed(1), description: `Entering target orbital zone. ${params.destination} growing noticeably.` },
      { percentage: 100, label: "Arrival",      elapsedYears: +totalYears.toFixed(1),           description: `Touchdown on ${params.destination}. Final pair of shoes officially disintegrates.` },
    ],

    aiReport: {
      negativeAiOpinion: randomOpinion,
      introduction:         `Congratulations, ${params.passenger.name}. You have selected walking as your preferred transportation method to ${params.destination}. This is either extraordinary determination or a profound misunderstanding of interplanetary distances.`,
      whatYouSignedUpFor:   `You have signed up for a ${fmtYears(totalYears)} journey covering ${formatDistance(rawDistanceKm)} on foot. This is approximately ${generationsNeeded.toFixed(0)} human generations. Your descendants may or may not complete this journey.`,
      travelExperience:     `The journey will be characterized by an extraordinary amount of empty space, occasional solar events, and the growing realisation that ${params.destination} is further than it looks on a diagram.`,
      dailyRoutine:         `• Wake up\n• Check life support systems\n• Walk (${(30000 * 0.75).toLocaleString()} steps)\n• Consume daily ration (2,500 kcal)\n• Watch ${params.destination} fail to get noticeably closer\n• Sleep\n• Repeat for ${totalDays.toLocaleString()} days`,
      foodStory:            `You will require ${foodKcal.toLocaleString()} total calories for this mission. That is roughly ${(foodKcal / 550).toLocaleString("en-US", { maximumFractionDigits: 0 })} standard burgers, or enough to make a large catering company extremely nervous.`,
      waterStory:           `Water requirements total ${waterL.toLocaleString()} litres. At 3.5 litres per day, hydration is manageable — assuming an unlimited water supply exists in the void of interplanetary space.`,
      footwearStory:        `Your shoes are now a consumable resource. At 1.5 million steps per pair, you will need approximately ${shoesRequired.toLocaleString()} pairs. Budget accordingly. Bring spare laces.`,
      boredomIndex:         `Boredom level: Astronomical. At ${fmtYears(totalYears)}, entertainment options are strongly recommended. All of them. Multiple times.`,
      thingsYouWillMiss:    ["Weekends", "Normal gravity", "Fresh air", "Internet connectivity", "Anyone who was alive when you departed", "Pizza (fresh)"],
      thingsYouWillSee:     [`The shrinking dot of ${params.origin}`, "An extraordinary quantity of empty space", "A remarkable number of stars", `The growing dot of ${params.destination}`],
      cosmicProblems:       ["Micrometeorite concerns", "Solar radiation exposure", "Navigation recalibration requirements", `The existential weight of ${formatDistance(rawDistanceKm)} of vacuum`, "Equipment maintenance in zero-g", "Shoe shortage projections"],
      packingList:          ["Life support — mandatory", "Entertainment — sanity-critical", "Emergency rations — non-negotiable", "A towel — always know where it is", `${shoesRequired.toLocaleString()} pairs of shoes — calculated requirement`],
      travelAdvice:         ["Do not check how far you have left to go.", "Maintain regular exercise to counteract muscle atrophy.", "Keep a journal. Future historians will thank you.", `Remember: ${params.destination} will still be there when you arrive.`],
      survivalGuide:        `The primary risks are radiation, equipment failure, and the psychological impact of ${fmtYears(totalYears)} of walking. Difficulty: ${difficulty}. Survival probability: extremely low. Plan accordingly.`,
      generationalImpact:   generationsNeeded > 1
        ? `This journey spans ${generationsNeeded.toFixed(1)} human generations. Your descendants will complete what you started. Ensure the mission briefing is clearly documented for posterity.`
        : `This journey will be completed within a single human lifespan.`,
      arrivalScenario:      `After ${fmtYears(totalYears)}, ${params.destination} will finally occupy a substantial portion of the viewscreen. Whether anyone still remembers why the journey started is another matter.`,
      travelReview:         {
        comfort:        `★ Space walking is definitively not comfortable.`,
        speed:          `★ Walking at ${speedKmh} km/h is not our fastest option.`,
        safety:         `★★ Survivable with extreme preparation.`,
        convenience:    `★ Not convenient in any conventional sense.`,
        ridiculousness: `${"★".repeat(Math.min(5, Math.ceil(ridiculousnessScore / 20)))} Ridiculousness: ${ridiculousnessScore}/100.`,
      },
      fictionalInsurance:   `[FICTIONAL] CosmicWalk Travel Insurance has reviewed your mission. Coverage has been declined on the grounds that "${fmtYears(totalYears)}" exceeds our standard 30-day policy. We wish you well.`,
      customerReview:       `★★★★★ — "${params.destination} was exactly where the map said. The walk was character-building." — Anonymous Traveler`,
      finalVerdict:         `CosmicWalk has computed your mission. The verdict is technically feasible, practically absurd, and historically unprecedented. Ridiculousness index: ${ridiculousnessScore}/100. Proceed with full awareness of the facts.`,
      funRating:            Math.min(10, ridiculousnessScore / 10),
      missionSummary:       `A continuous ${fmtYears(totalYears)} foot journey spanning ${formatDistance(rawDistanceKm)} from ${params.origin} to ${params.destination} under walking protocol.`,
      majorChallenges:      [
        `Complete absence of atmosphere across ${formatDistance(rawDistanceKm)} of interplanetary vacuum.`,
        `Exponential shoe sole abrasion requiring approximately ${shoesRequired.toLocaleString()} replacement pairs.`,
        `Extremely long transit duration spanning several geological epochs.`,
        `Potential mild boredom during the 50% midpoint mark.`,
      ],
      personalizedRecommendations: [
        `Walker ${params.passenger.name} should pack extra socks and hydration packs.`,
        `Stretch hamstrings thoroughly before initiating departure on ${params.departureDate}.`,
        `Maintain steady stride cadence regardless of solar flare activity.`,
      ],
      humorousObservations: ridiculousnessFunFacts,
    },

    verdict: {
      classification: "ABSURD",
      score: ridiculousnessScore,
      title: "Multi-Generational Walking Commitment",
      summary: `Technically a journey. Practically a terrible life decision. ${generationsNeeded.toFixed(0)} generations of your family will thank you for your pioneering spirit.`,
    },

    scale_comparison: [
      { label: "Earth Circumferences",  value: rawDistanceKm / 40075,    formatted_value: (rawDistanceKm / 40075).toFixed(1),      unit: "× Earth circumference" },
      { label: "Moon Distances",        value: rawDistanceKm / 384400,   formatted_value: (rawDistanceKm / 384400).toFixed(1),     unit: "× Moon distance" },
      { label: "Walking Steps",         value: estimatedSteps,           formatted_value: (estimatedSteps / 1e9).toFixed(2),       unit: "billion steps" },
      { label: "Equivalent Pizzas",     value: equivalentPizzas,         formatted_value: equivalentPizzas.toLocaleString("en-US", { maximumFractionDigits: 0 }), unit: "pizzas" },
      { label: "Human Lifetimes",       value: humanLifetimes,           formatted_value: humanLifetimes.toFixed(1),               unit: "human lifetimes" },
      { label: "Human Generations",     value: generationsNeeded,        formatted_value: generationsNeeded.toFixed(1),            unit: "generations" },
    ],

    events: [
      { day: 1,                       event: "Departure from " + params.origin + ". High morale." },
      { day: Math.round(totalDays * 0.1), event: "First equipment inspection. All systems nominal." },
      { day: Math.round(totalDays * 0.25), event: "Quarter-distance milestone reached." },
      { day: Math.round(totalDays * 0.5), event: "Halfway point. Morale reassessed." },
      { day: Math.round(totalDays * 0.75), event: "Final stretch begins." },
    ],
  };
}
