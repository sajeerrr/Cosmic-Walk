import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import SolarSystem from "../components/solar-system/SolarSystem";
import LoadingScreen from "../components/LoadingScreen";
import { PLANETS, formatDistance } from "../data/planets";
import { generateMockTripResult } from "../data/mockTripResult";
import type { TripCalculationResult } from "../types/trip";
import JourneyResults from "../components/JourneyResults";

// Mock planetary information database (marked as MOCK DATA until backend integration)
const PLANET_MOCK_DATA: Record<
  string,
  { gravity: string; temp: string; fact: string; terrain: string }
> = {
  Mercury: {
    gravity: "0.38 G",
    temp: "-180°C to 430°C",
    fact: "Extreme solar radiation. Solar glare will be relentless.",
    terrain: "Impact Craters & Regolith",
  },
  Venus: {
    gravity: "0.90 G",
    temp: "465°C",
    fact: "Crushing atmospheric pressure. Sulfuric acid rain will dissolve shoes.",
    terrain: "Volcanic Basalt Plains",
  },
  Earth: {
    gravity: "1.00 G",
    temp: "15°C",
    fact: "Liquid water, breathable air, and far too many Zoom meetings.",
    terrain: "Paved Highways & Oceans",
  },
  Mars: {
    gravity: "0.38 G",
    temp: "-60°C",
    fact: "Iron oxide dust, thin atmosphere, zero Yelp-rated coffee shops.",
    terrain: "Red Dust & Deep Canyons",
  },
  Jupiter: {
    gravity: "2.53 G",
    temp: "-110°C",
    fact: "Massive gas giant with no solid ground. Locomotion unadvisable.",
    terrain: "Metallic Hydrogen Clouds",
  },
  Saturn: {
    gravity: "1.06 G",
    temp: "-140°C",
    fact: "Stunning ring system from afar. Zero sidewalk space provided.",
    terrain: "Ammonia Ice Shell",
  },
  Uranus: {
    gravity: "0.89 G",
    temp: "-195°C",
    fact: "Rotates on its side at 98 degrees. Perpetual sideways stride.",
    terrain: "Methane Ice & Slush",
  },
  Neptune: {
    gravity: "1.14 G",
    temp: "-200°C",
    fact: "Supersonic winds up to 2,100 km/h will ruin your hair.",
    terrain: "Frozen Methane Atmosphere",
  },
};

const TRANSPORT_MODES = [
  { id: "WALKING", name: "Standard Walk", speedKmh: 5.0, icon: "🏃", desc: "Baseline stride speed." },
  { id: "MOONWALK", name: "Low-G Moonwalk", speedKmh: 3.2, icon: "🦘", desc: "Bounding low-gravity hops." },
  { id: "POWER_STRIDE", name: "Power Stride", speedKmh: 7.5, icon: "⚡", desc: "Aggressive speed-walking." },
  { id: "BAREFOOT", name: "Barefoot Stride", speedKmh: 4.0, icon: "🦶", desc: "Blister acceleration mode." },
  { id: "EVA_SPACEWALK", name: "EVA Suit Glide", speedKmh: 1.2, icon: "🛰️", desc: "Tethered space suit float." },
];

export default function PlanJourney() {
  // ─── State ───
  const [origin, setOrigin] = useState("Earth");
  const [destination, setDestination] = useState("Mars");
  const [travelDate, setTravelDate] = useState("2026-09-12");
  const [transportMode, setTransportMode] = useState("WALKING");
  const [passengerName, setPassengerName] = useState("Commander Arthur Dent");
  const [heightCm, setHeightCm] = useState("178");
  const [weightKg, setWeightKg] = useState("72");
  const [age, setAge] = useState("32");
  const [sex, setSex] = useState("Male");

  const [focusedPlanet, setFocusedPlanet] = useState<string>("Mars");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pendingResult, setPendingResult] = useState<TripCalculationResult | null>(null);
  const [tripResult, setTripResult] = useState<TripCalculationResult | null>(null);

  // Computed distance & time using selected mode speed
  const selectedMode = TRANSPORT_MODES.find((m) => m.id === transportMode) || TRANSPORT_MODES[0];

  // Focused planet details (Origin or Destination or 3D selected)
  const activeInfoPlanet = PLANETS.find((p) => p.name === focusedPlanet) || PLANETS[0];
  const mockInfo = PLANET_MOCK_DATA[activeInfoPlanet.name] || PLANET_MOCK_DATA["Earth"];

  // Swap origin & destination
  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setFocusedPlanet(temp);
  };

  // Planet selection handler from 3D or buttons
  const handlePlanetSelect = (name: string) => {
    setFocusedPlanet(name);
    if (name === origin) return;
    setDestination(name);
  };

  // Submit & validate form
  const handleCalculate = () => {
    setValidationError(null);

    if (origin === destination) {
      setValidationError("Origin and Destination cannot be the same celestial body.");
      return;
    }
    if (!passengerName.trim()) {
      setValidationError("Passenger Name is required for mission manifests.");
      return;
    }
    const h = Number(heightCm);
    const w = Number(weightKg);
    const a = Number(age);

    if (isNaN(h) || h <= 0 || h > 300) {
      setValidationError("Please enter a valid height in centimeters (e.g. 178).");
      return;
    }
    if (isNaN(w) || w <= 0 || w > 500) {
      setValidationError("Please enter a valid weight in kilograms (e.g. 72).");
      return;
    }
    if (isNaN(a) || a <= 0 || a > 120) {
      setValidationError("Please enter a valid passenger age.");
      return;
    }

    // Generate mock calculation result (matching POST /api/trips/calculate schema)
    const result = generateMockTripResult({
      origin,
      destination,
      departureDate: travelDate,
      transportMode,
      passenger: {
        name: passengerName.trim(),
        heightCm: h,
        weightKg: w,
        age: a,
        sex,
      },
    });

    setPendingResult(result);
    setIsCalculating(true);
  };

  return (
    <div className="min-h-screen bg-void text-text-primary pt-24 pb-20 px-4 sm:px-8 bg-radial-gradient select-none">
      {/* ─── Calculation Loading Screen Overlay ─── */}
      {isCalculating && (
        <LoadingScreen
          mode="calculation"
          originName={origin}
          destinationName={destination}
          onComplete={() => {
            setIsCalculating(false);
            if (pendingResult) {
              setTripResult(pendingResult);
            }
          }}
        />
      )}

      <div className="max-w-[1400px] mx-auto">
        {/* Render Results Page View if calculation has completed */}
        {tripResult ? (
          <JourneyResults
            data={tripResult}
            onModifyParams={() => setTripResult(null)}
          />
        ) : (
          <>
            {/* Header Telemetry Bar */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="accent">[ MISSION PLANNER v1.0 ]</Badge>
              <Badge variant="default">BASELINE: 5.0 KM/H STRIDE</Badge>
            </div>
            <h1 className="font-mono text-2xl sm:text-4xl font-bold tracking-tight text-text-primary">
              INTERPLANETARY ROUTE PLANNER
            </h1>
            <p className="text-text-tertiary font-mono text-xs sm:text-sm mt-1">
              Configure celestial coordinates, transportation mode, and biometric telemetry.
            </p>
          </div>

          <Link
            to="/"
            className="font-mono text-xs tracking-wider uppercase text-text-secondary hover:text-amber transition-colors no-underline flex items-center gap-2"
          >
            ← Return to Mission Control
          </Link>
        </div>

        {/* ─── Main Grid: Form Left, 3D Canvas & Info Right ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─── LEFT COLUMN: Configuration Controls ─── */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 01: Waypoint Selection */}
            <div className="p-6 rounded-xs border border-border bg-surface/50 hud-corner-tl relative space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4 font-mono text-xs text-amber">
                <span>01 // WAYPOINT SELECTION</span>
                <span className="w-1.5 h-1.5 bg-amber rounded-full" />
              </div>

              {/* Waypoint Selectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                {/* Origin Selector */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-label block">Origin Planet</label>
                  <select
                    value={origin}
                    onChange={(e) => {
                      setOrigin(e.target.value);
                      setFocusedPlanet(e.target.value);
                    }}
                    className="w-full bg-void border border-border-strong rounded-xs px-3 py-2 font-mono text-xs text-text-primary focus:border-amber focus:outline-none cursor-pointer"
                  >
                    {PLANETS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({formatDistance(p.distanceFromSunKm)} from Sun)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="sm:col-span-1 flex justify-center pt-5 sm:pt-0">
                  <button
                    type="button"
                    onClick={handleSwap}
                    title="Swap Origin and Destination"
                    className="w-9 h-9 rounded-xs border border-border bg-surface hover:border-amber hover:text-amber font-mono text-sm flex items-center justify-center transition-colors cursor-pointer"
                  >
                    ⇄
                  </button>
                </div>

                {/* Destination Selector */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-label block">Destination Planet</label>
                  <select
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setFocusedPlanet(e.target.value);
                    }}
                    className="w-full bg-void border border-border-strong rounded-xs px-3 py-2 font-mono text-xs text-text-primary focus:border-amber focus:outline-none cursor-pointer"
                  >
                    {PLANETS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} ({formatDistance(p.distanceFromSunKm)} from Sun)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Planet Pills */}
              <div className="pt-2">
                <span className="text-label block mb-2 text-[0.6rem]">Quick Select Waypoints:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PLANETS.map((p) => {
                    const isOrigin = p.name === origin;
                    const isDest = p.name === destination;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handlePlanetSelect(p.name)}
                        className={`
                          px-2.5 py-1 rounded-xs font-mono text-[10px] tracking-wider uppercase border transition-all cursor-pointer
                          ${
                            isOrigin
                              ? "bg-[#4a7ab5]/20 border-[#4a7ab5] text-[#a3c4f3] font-semibold"
                              : isDest
                              ? "bg-[#c4634a]/20 border-[#c4634a] text-[#f8a995] font-semibold"
                              : "bg-void/50 border-border text-text-tertiary hover:border-border-strong hover:text-text-secondary"
                          }
                        `}
                      >
                        {isOrigin ? "Origin: " : isDest ? "Target: " : ""}{p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 02: Transportation & Departure Schedule */}
            <div className="p-6 rounded-xs border border-border bg-surface/50 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4 font-mono text-xs text-amber">
                <span>02 // LOCOMOTION & SCHEDULE</span>
                <span className="w-1.5 h-1.5 bg-amber rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Departure Date */}
                <div className="space-y-1.5">
                  <label className="text-label block">Departure Date</label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-void border border-border-strong rounded-xs px-3 py-2 font-mono text-xs text-text-primary focus:border-amber focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Selected Mode Summary */}
                <div className="p-3 border border-border bg-void/50 rounded-xs flex flex-col justify-between font-mono text-xs">
                  <span className="text-text-tertiary text-[0.65rem] tracking-wider uppercase">Active Velocity Factor</span>
                  <div className="text-amber font-semibold text-sm">
                    {selectedMode.icon} {selectedMode.name} ({selectedMode.speedKmh} km/h)
                  </div>
                </div>
              </div>

              {/* Transportation Mode Cards */}
              <div className="space-y-2">
                <label className="text-label block">Locomotion Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TRANSPORT_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTransportMode(mode.id)}
                      className={`
                        p-3 rounded-xs border text-left font-mono transition-all cursor-pointer flex items-center gap-3
                        ${
                          transportMode === mode.id
                            ? "bg-amber/[0.1] border-amber text-text-primary"
                            : "bg-void/40 border-border text-text-tertiary hover:border-border-strong hover:text-text-secondary"
                        }
                      `}
                    >
                      <span className="text-xl">{mode.icon}</span>
                      <div>
                        <div className="text-xs font-semibold tracking-wide">{mode.name}</div>
                        <div className="text-[0.65rem] text-text-tertiary">{mode.speedKmh} km/h · {mode.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 03: Passenger Biometric Telemetry */}
            <div className="p-6 rounded-xs border border-border bg-surface/50 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4 font-mono text-xs text-amber">
                <span>03 // BIOMETRIC TELEMETRY</span>
                <span className="w-1.5 h-1.5 bg-amber rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Passenger Name */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-label block">Passenger Name</label>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Commander Arthur Dent"
                    className="w-full bg-void border border-border-strong rounded-xs px-3 py-2 font-mono text-xs text-text-primary focus:border-amber focus:outline-none"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <label className="text-label block">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="178"
                    className="w-full bg-void border border-border-strong rounded-xs px-3 py-2 font-mono text-xs text-text-primary focus:border-amber focus:outline-none"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-label block">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="72"
                    className="w-full bg-void border border-border-strong rounded-xs px-3 py-2 font-mono text-xs text-text-primary focus:border-amber focus:outline-none"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-label block">Age (Years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="32"
                    className="w-full bg-void border border-border-strong rounded-xs px-3 py-2 font-mono text-xs text-text-primary focus:border-amber focus:outline-none"
                  />
                </div>

                {/* Biological Sex */}
                <div className="space-y-1.5">
                  <label className="text-label block">Biological Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full bg-void border border-border-strong rounded-xs px-3 py-2 font-mono text-xs text-text-primary focus:border-amber focus:outline-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary / Other</option>
                    <option value="Unspecified">Unspecified Walker</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Validation Alert Message Box */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-4 rounded-xs border border-danger/40 bg-danger/10 font-mono text-xs text-danger flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                    <span>[ VALIDATION ERROR ] {validationError}</span>
                  </div>
                  <button
                    onClick={() => setValidationError(null)}
                    className="text-danger hover:text-white font-bold px-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Calculate Button */}
            <div className="pt-2">
              <Button size="lg" className="w-full py-4 text-sm" onClick={handleCalculate}>
                Calculate Journey Telemetry
                <span className="font-mono text-void/80">→</span>
              </Button>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: 3D Scene Viewport & Planetary Info Panel ─── */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* 3D Solar System Canvas */}
            <div className="border border-border rounded-xs bg-void overflow-hidden relative shadow-2xl">
              <div className="absolute top-3 left-4 z-20 pointer-events-none font-mono text-[0.6rem] tracking-widest text-text-tertiary flex items-center gap-2 bg-void/80 backdrop-blur-md px-2.5 py-1 border border-border rounded-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                <span>CLICK PLANET TO SELECT AS TARGET</span>
              </div>

              <SolarSystem
                className="w-full h-[360px]"
                highlightedPlanets={[origin, destination]}
                focusedPlanetName={focusedPlanet}
                onSelectPlanet={(name) => {
                  setFocusedPlanet(name);
                  if (name !== origin) setDestination(name);
                }}
                originName={origin}
                destinationName={destination}
              />
            </div>

            {/* Compact Planetary Information Panel */}
            <div className="p-5 rounded-xs border border-border bg-surface/60 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: activeInfoPlanet.color }}
                  />
                  <span className="font-mono text-sm font-bold tracking-tight text-text-primary">
                    {activeInfoPlanet.name}
                  </span>
                  <span className="text-text-tertiary font-mono text-[0.65rem] uppercase">
                    ({activeInfoPlanet.name === origin ? "Origin" : activeInfoPlanet.name === destination ? "Destination" : "Selected"})
                  </span>
                </div>
                <Badge variant="accent">[ MOCK DATA ]</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div>
                  <span className="text-label block text-[0.6rem] mb-0.5">Distance from Sun</span>
                  <span className="text-text-primary font-semibold">{formatDistance(activeInfoPlanet.distanceFromSunKm)}</span>
                </div>
                <div>
                  <span className="text-label block text-[0.6rem] mb-0.5">Surface Gravity</span>
                  <span className="text-amber font-semibold">{mockInfo.gravity}</span>
                </div>
                <div>
                  <span className="text-label block text-[0.6rem] mb-0.5">Surface Temp</span>
                  <span className="text-text-primary font-semibold">{mockInfo.temp}</span>
                </div>
                <div>
                  <span className="text-label block text-[0.6rem] mb-0.5">Terrain Type</span>
                  <span className="text-text-primary font-semibold">{mockInfo.terrain}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-label block text-[0.6rem] mb-1">Astro-Survey Note</span>
                <p className="font-mono text-xs text-text-secondary leading-relaxed italic">
                  "{mockInfo.fact}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
      )}
    </div>
  </div>
);
}
