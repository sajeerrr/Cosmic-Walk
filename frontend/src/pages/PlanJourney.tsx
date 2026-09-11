import { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import SolarSystem from "../components/solar-system/SolarSystem";
import LoadingScreen from "../components/LoadingScreen";
import { PLANETS, formatDistance } from "../data/planets";
import { calculateTrip } from "../api/client";
import type { TripCalculationResult } from "../types/trip";
import JourneyResults from "../components/JourneyResults";

const PLANET_INFO: Record<string, { gravity: string; temp: string; terrain: string; fact: string }> = {
  Mercury: { gravity: "0.38 G", temp: "-180°C to 430°C", terrain: "Impact Craters", fact: "Extreme solar radiation. No atmosphere to speak of." },
  Venus:   { gravity: "0.90 G", temp: "465°C",           terrain: "Volcanic Plains",  fact: "Crushing pressure and sulfuric acid clouds." },
  Earth:   { gravity: "1.00 G", temp: "15°C",            terrain: "Oceans & Land",    fact: "Liquid water, breathable air — origin of all journeys." },
  Mars:    { gravity: "0.38 G", temp: "-60°C",           terrain: "Red Dust & Canyons",fact: "Iron oxide dust, thin CO₂ atmosphere." },
  Jupiter: { gravity: "2.53 G", temp: "-110°C",          terrain: "Gas Clouds",        fact: "No solid surface. Entry is inadvisable." },
  Saturn:  { gravity: "1.06 G", temp: "-140°C",          terrain: "Ammonia Ice",       fact: "Stunning ring system. Zero solid ground." },
  Uranus:  { gravity: "0.89 G", temp: "-195°C",          terrain: "Methane Ice",       fact: "Rotates on its side at 98°. Perpetual tilt." },
  Neptune: { gravity: "1.14 G", temp: "-200°C",          terrain: "Frozen Atmosphere", fact: "Supersonic winds up to 2,100 km/h." },
};

const TRANSPORT_MODES = [
  { id: "WALKING",          name: "Standard Walk",     speedKmh: 5.0,           icon: "🚶" },
  { id: "POWER_STRIDE",     name: "Power Stride",      speedKmh: 7.5,           icon: "⚡" },
  { id: "horse",            name: "Space Stallion",    speedKmh: 49.6,          icon: "🐎" },
  { id: "skateboard",       name: "Hover Board",       speedKmh: 24.8,          icon: "🛹" },
  { id: "chemical_rocket",  name: "Chemical Rocket",   speedKmh: 28800.0,       icon: "🚀" },
  { id: "warp_drive",       name: "Warp Drive",        speedKmh: 1_079_252_848, icon: "✨" },
];

export default function PlanJourney() {
  const location = useLocation();
  const navState = (location.state as { origin?: string; destination?: string; travelDate?: string; transportMode?: string } | null) ?? {};

  const [origin,        setOrigin]        = useState(navState.origin        ?? "Earth");
  const [destination,   setDestination]   = useState(navState.destination   ?? "Mars");
  const [travelDate,    setTravelDate]    = useState(navState.travelDate    ?? "2027-03-15");
  const [transportMode, setTransportMode] = useState(navState.transportMode ?? "chemical_rocket");
  const [passengerName, setPassengerName] = useState("");
  const [age,           setAge]           = useState("30");
  const [sex,           setSex]           = useState("Male");
  const [focusedPlanet, setFocusedPlanet] = useState(navState.destination   ?? "Mars");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCalculating,   setIsCalculating]   = useState(false);
  const [pendingResult,   setPendingResult]   = useState<TripCalculationResult | null>(null);
  const [tripResult,      setTripResult]      = useState<TripCalculationResult | null>(null);

  const activeInfo = PLANET_INFO[focusedPlanet] ?? PLANET_INFO["Earth"];
  const activePlanet = PLANETS.find((p) => p.name === focusedPlanet) ?? PLANETS[0];

  const handleSwap = () => {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
    setFocusedPlanet(tmp);
  };

  const handleCalculate = async () => {
    setValidationError(null);
    if (origin === destination) { setValidationError("Origin and destination cannot be the same planet."); return; }
    if (!passengerName.trim())  { setValidationError("Passenger name is required."); return; }
    const a = Number(age);
    if (isNaN(a) || a <= 0 || a > 120) { setValidationError("Please enter a valid age."); return; }

    setIsCalculating(true);
    const result = await calculateTrip({
      origin,
      destination,
      departureDate: travelDate,
      transportMode,
      passenger: { name: passengerName.trim(), heightCm: 175, weightKg: 70, age: a, sex },
      modifiers: { unlimited_food: false, unlimited_fuel: false },
    });
    setPendingResult(result);
  };

  /* ─── input / select shared style ─── */
  const field: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontFamily: "var(--font-sans)",
    fontSize: "0.8rem",
    color: "#f0eee8",
    outline: "none",
    colorScheme: "dark",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#03020a", color: "#f0eee8", padding: "32px 24px 80px" }}>

      {/* ── Loading overlay ── */}
      {isCalculating && (
        <LoadingScreen
          mode="calculation"
          originName={origin}
          destinationName={destination}
          onComplete={() => { setIsCalculating(false); if (pendingResult) setTripResult(pendingResult); }}
        />
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Results view ── */}
        {tripResult ? (
          <JourneyResults data={tripResult} onModifyParams={() => setTripResult(null)} />
        ) : (
          <>
            {/* ── Page header ── */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d4a853", boxShadow: "0 0 6px rgba(212,168,83,0.8)", display: "inline-block", animation: "pulse-slow 2s infinite" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#d4a853" }}>
                    Mission Planner
                  </span>
                </div>
                <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "clamp(1.4rem,3vw,2rem)", letterSpacing: "-0.02em", lineHeight: 1, color: "#f0eee8", marginBottom: 8 }}>
                  Plan Your Journey
                </h1>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "rgba(240,238,232,0.38)", lineHeight: 1.5 }}>
                  Select your route, transport mode, and crew details.
                </p>
              </div>
              <Link
                to="/"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,238,232,0.35)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#d4a853")}
                onMouseOut={(e)  => ((e.currentTarget as HTMLElement).style.color = "rgba(240,238,232,0.35)")}
              >
                ← Back to Home
              </Link>
            </div>

            {/* ── Main 2-col grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 28, alignItems: "start" }}>

              {/* ══ LEFT: Form ══ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* ── Card 1: Route ── */}
                <Card label="Route">
                  {/* Origin / Destination row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 12, alignItems: "end" }}>
                    <div>
                      <FieldLabel>From</FieldLabel>
                      <select
                        value={origin}
                        onChange={(e) => { setOrigin(e.target.value); setFocusedPlanet(e.target.value); }}
                        style={{ ...field, appearance: "none", cursor: "pointer" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,83,0.5)")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      >
                        {PLANETS.map((p) => <option key={p.name} value={p.name} style={{ background: "#0a0a14" }}>{p.name}</option>)}
                      </select>
                    </div>

                    <button
                      onClick={handleSwap}
                      title="Swap"
                      style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.25)", color: "#d4a853", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s", padding: 0, marginBottom: 0, alignSelf: "flex-end" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/>
                      </svg>
                    </button>

                    <div>
                      <FieldLabel>To</FieldLabel>
                      <select
                        value={destination}
                        onChange={(e) => { setDestination(e.target.value); setFocusedPlanet(e.target.value); }}
                        style={{ ...field, appearance: "none", cursor: "pointer" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,83,0.5)")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      >
                        {PLANETS.map((p) => <option key={p.name} value={p.name} style={{ background: "#0a0a14" }}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Departure date */}
                  <div style={{ marginTop: 16 }}>
                    <FieldLabel>Departure Date</FieldLabel>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      style={field}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,83,0.5)")}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                  </div>
                </Card>

                {/* ── Card 2: Transport ── */}
                <Card label="Transport Mode">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {TRANSPORT_MODES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setTransportMode(m.id)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: `1px solid ${transportMode === m.id ? "rgba(212,168,83,0.6)" : "rgba(255,255,255,0.08)"}`,
                          background: transportMode === m.id ? "rgba(212,168,83,0.08)" : "rgba(255,255,255,0.02)",
                          color: transportMode === m.id ? "#f0eee8" : "rgba(240,238,232,0.45)",
                          fontFamily: "var(--font-sans)",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{m.icon}</span>
                        <div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.2 }}>{m.name}</div>
                          <div style={{ fontSize: "0.6rem", color: transportMode === m.id ? "#d4a853" : "rgba(240,238,232,0.3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                            {m.speedKmh >= 1_000_000 ? `${(m.speedKmh / 1_000_000).toFixed(0)}M km/h` : `${m.speedKmh.toLocaleString()} km/h`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* ── Card 3: Crew ── */}
                <Card label="Crew Details">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <FieldLabel>Passenger Name</FieldLabel>
                      <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="e.g. Commander Dent"
                        style={field}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,83,0.5)")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div>
                      <FieldLabel>Age</FieldLabel>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="30"
                        style={field}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,83,0.5)")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div style={{ gridColumn: "2 / -1" }}>
                      <FieldLabel>Biological Sex</FieldLabel>
                      <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        style={{ ...field, appearance: "none", cursor: "pointer" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,168,83,0.5)")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                      >
                        <option value="Male"       style={{ background: "#0a0a14" }}>Male</option>
                        <option value="Female"     style={{ background: "#0a0a14" }}>Female</option>
                        <option value="Non-Binary" style={{ background: "#0a0a14" }}>Non-Binary</option>
                        <option value="Unspecified"style={{ background: "#0a0a14" }}>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* ── Validation error ── */}
                <AnimatePresence>
                  {validationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(184,74,74,0.4)", background: "rgba(184,74,74,0.08)", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f87171", display: "inline-block", flexShrink: 0 }} />
                        {validationError}
                      </div>
                      <button onClick={() => setValidationError(null)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 }}>✕</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Calculate CTA ── */}
                <button
                  id="btn-calculate"
                  onClick={handleCalculate}
                  style={{
                    width: "100%",
                    padding: "14px 0",
                    borderRadius: 12,
                    background: "#d4a853",
                    color: "#07060e",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 0 28px rgba(212,168,83,0.35), 0 4px 16px rgba(0,0,0,0.4)",
                    transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={(e)  => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Calculate Journey
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              {/* ══ RIGHT: 3D + Planet Info ══ */}
              <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* 3D Solar System */}
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#030209", position: "relative" }}>
                  <div style={{ position: "absolute", top: 12, left: 12, zIndex: 20, pointerEvents: "none", display: "flex", alignItems: "center", gap: 6, background: "rgba(3,2,9,0.75)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d4a853", display: "inline-block", animation: "pulse-slow 2s infinite" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,238,232,0.4)" }}>Click planet to select</span>
                  </div>
                  <SolarSystem
                    className="w-full h-[320px]"
                    highlightedPlanets={[origin, destination]}
                    focusedPlanetName={focusedPlanet}
                    onSelectPlanet={(name) => { setFocusedPlanet(name); if (name !== origin) setDestination(name); }}
                    originName={origin}
                    destinationName={destination}
                  />
                </div>

                {/* Planet info card */}
                <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "18px 20px" }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: activePlanet.color, display: "inline-block", boxShadow: `0 0 8px ${activePlanet.color}60` }} />
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.9rem", color: "#f0eee8" }}>{activePlanet.name}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em", color: "rgba(240,238,232,0.3)", textTransform: "uppercase", marginLeft: "auto" }}>
                      {activePlanet.name === origin ? "Origin" : activePlanet.name === destination ? "Destination" : "Selected"}
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    {[
                      { label: "From Sun",  value: formatDistance(activePlanet.distanceFromSunKm), accent: false },
                      { label: "Gravity",   value: activeInfo.gravity,  accent: true  },
                      { label: "Surface Temp", value: activeInfo.temp,  accent: false },
                      { label: "Terrain",   value: activeInfo.terrain,  accent: false },
                    ].map((s) => (
                      <div key={s.label}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,238,232,0.3)", marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.78rem", color: s.accent ? "#d4a853" : "#f0eee8" }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Fact */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "rgba(240,238,232,0.4)", lineHeight: 1.6, fontStyle: "italic" }}>
                      "{activeInfo.fact}"
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

/* ─── Helpers ─── */
function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.82rem", color: "#f0eee8", letterSpacing: "0.02em" }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,238,232,0.35)", marginBottom: 6 }}>
      {children}
    </div>
  );
}
