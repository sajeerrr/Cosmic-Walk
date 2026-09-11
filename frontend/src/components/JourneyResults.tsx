import { useState } from "react";
import { motion } from "motion/react";
import type { TripCalculationResult } from "../types/trip";
import SolarSystem from "./solar-system/SolarSystem";
import { formatDistance } from "../data/planets";

interface JourneyResultsProps {
  data: TripCalculationResult;
  onModifyParams: () => void;
}

/* ─── shared style tokens ─── */
const card: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.02)",
  padding: "24px 28px",
};

export default function JourneyResults({ data, onModifyParams }: JourneyResultsProps) {
  const [booked, setBooked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* ══ 1 — 3D SOLAR SYSTEM (full width, top) ══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#030209", position: "relative" }}
      >
        {/* Trajectory label */}
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 20, pointerEvents: "none", display: "flex", alignItems: "center", gap: 8, background: "rgba(3,2,9,0.8)", backdropFilter: "blur(10px)", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(212,168,83,0.2)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d4a853", display: "inline-block", animation: "pulse-slow 2s infinite", boxShadow: "0 0 6px rgba(212,168,83,0.8)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#d4a853" }}>
            {data.origin} ──► {data.destination}
          </span>
        </div>

        {/* Trip ID badge */}
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 20, pointerEvents: "none", background: "rgba(3,2,9,0.8)", backdropFilter: "blur(10px)", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(240,238,232,0.3)" }}>
            ID: {data.tripId}
          </span>
        </div>

        <SolarSystem
          className="w-full h-[420px]"
          highlightedPlanets={[data.origin, data.destination]}
          originName={data.origin}
          destinationName={data.destination}
          showTrajectory={true}
        />
      </motion.div>

      {/* ══ 2 — ROUTE HEADER ══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        style={{ ...card }}
      >
        {/* Origin → Destination */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2.2rem)", color: "#f0eee8", lineHeight: 1 }}>{data.origin}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", color: "rgba(240,238,232,0.35)", marginTop: 4, textTransform: "uppercase" }}>Origin</div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80 }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 6 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(212,168,83,0.4), rgba(212,168,83,0.1))" }} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(212,168,83,0.1), rgba(212,168,83,0.4))" }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em", color: "rgba(240,238,232,0.3)", textTransform: "uppercase" }}>
              {data.transportMode.replace(/_/g, " ")}
            </span>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2.2rem)", color: "#d4a853", lineHeight: 1 }}>{data.destination}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", color: "rgba(240,238,232,0.35)", marginTop: 4, textTransform: "uppercase" }}>Destination</div>
          </div>
        </div>

        {/* Passenger & Date row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { label: "Passenger",  value: data.passenger.name },
            { label: "Departure",  value: data.departureDate },
            { label: "Age",        value: `${data.passenger.age} yrs` },
          ].map((f) => (
            <div key={f.label}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(240,238,232,0.3)", textTransform: "uppercase", marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.85rem", color: "#f0eee8" }}>{f.value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══ 3 — KEY STATS ══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}
      >
        {[
          { label: "Total Distance",      value: formatDistance(data.metrics.distanceKm),                              accent: false },
          { label: "Journey Duration",    value: `${data.metrics.walkingDurationYears} yrs`,                           accent: true  },
          { label: "Total Steps",         value: `${(data.metrics.estimatedSteps / 1_000_000).toFixed(1)}M`,           accent: false },
          { label: "Difficulty",          value: data.metrics.difficulty,                                               danger: data.metrics.difficulty === "Existential" || data.metrics.difficulty === "Impossible" },
          { label: "Survival Chance",     value: `${data.metrics.survivalProbabilityPercent}%`,                        accent: false },
          { label: "Verdict",             value: data.verdict?.classification ?? "—",                                  accent: true  },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: "16px 18px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,238,232,0.3)", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1rem", color: (s as any).danger ? "#f87171" : (s as any).accent ? "#d4a853" : "#f0eee8", lineHeight: 1.2 }}>{s.value}</div>
          </div>
        ))}
      </motion.div>

      {/* ══ 4 — MISSION VERDICT ══ */}
      {data.verdict && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ ...card, border: "1px solid rgba(212,168,83,0.3)", background: "rgba(212,168,83,0.04)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#d4a853", background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.3)", padding: "3px 10px", borderRadius: 99 }}>
              Mission Verdict
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#d4a853", fontWeight: 700 }}>[{data.verdict.score}/100]</span>
          </div>
          <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.05rem", color: "#f0eee8", marginBottom: 8 }}>{data.verdict.title}</h3>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "rgba(240,238,232,0.55)", lineHeight: 1.65 }}>{data.verdict.summary}</p>
        </motion.div>
      )}

      {/* ══ 5 — AI MISSION REPORT ══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        style={{ ...card }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#d4a853", display: "inline-block", animation: "pulse-slow 2s infinite" }} />
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.9rem", color: "#f0eee8" }}>AI Mission Report</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Summary */}
          <ReportSection label="Mission Summary">
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "rgba(240,238,232,0.65)", lineHeight: 1.7 }}>{data.aiReport.missionSummary}</p>
          </ReportSection>

          {/* Challenges */}
          <ReportSection label="Key Challenges">
            <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {data.aiReport.majorChallenges.map((c, i) => (
                <li key={i} style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "rgba(240,238,232,0.55)", lineHeight: 1.6 }}>{c}</li>
              ))}
            </ul>
          </ReportSection>

          {/* Recommendations */}
          <ReportSection label="Recommendations">
            <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {data.aiReport.personalizedRecommendations.map((r, i) => (
                <li key={i} style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "rgba(240,238,232,0.55)", lineHeight: 1.6 }}>{r}</li>
              ))}
            </ul>
          </ReportSection>

          {/* Final verdict */}
          <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4a853", marginBottom: 10 }}>Final Verdict</div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.85rem", color: "#f0eee8", lineHeight: 1.6, padding: "14px 18px", borderRadius: 10, border: "1px solid rgba(212,168,83,0.25)", background: "rgba(212,168,83,0.05)", fontStyle: "italic" }}>
              "{data.aiReport.finalVerdict}"
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══ 6 — BOOK NOW CTA ══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 0 8px" }}
      >
        {booked ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "1.4rem", color: "#d4a853", marginBottom: 8 }}>🚀 Booking Confirmed!</div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "rgba(240,238,232,0.45)", lineHeight: 1.6, maxWidth: 400 }}>
              Your interplanetary journey from <strong style={{ color: "#f0eee8" }}>{data.origin}</strong> to <strong style={{ color: "#d4a853" }}>{data.destination}</strong> has been registered. Prepare for departure on {data.departureDate}.
            </p>
          </motion.div>
        ) : (
          <>
            <button
              id="btn-book-now"
              onClick={() => setBooked(true)}
              style={{
                padding: "16px 56px",
                borderRadius: 14,
                background: "#d4a853",
                color: "#07060e",
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: "0.95rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 40px rgba(212,168,83,0.5), 0 6px 24px rgba(0,0,0,0.5)",
                transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(212,168,83,0.65), 0 10px 32px rgba(0,0,0,0.5)"; }}
              onMouseOut={(e)  => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = "0 0 40px rgba(212,168,83,0.5), 0 6px 24px rgba(0,0,0,0.5)"; }}
            >
              Book Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "rgba(240,238,232,0.25)", letterSpacing: "0.02em" }}>
              {data.origin} → {data.destination} · Departing {data.departureDate}
            </p>
          </>
        )}

        {/* Edit params ghost button */}
        <button
          onClick={onModifyParams}
          style={{ marginTop: 4, padding: "10px 28px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,238,232,0.4)", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "0.75rem", letterSpacing: "0.04em", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,83,0.3)"; e.currentTarget.style.color = "#d4a853"; }}
          onMouseOut={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(240,238,232,0.4)"; }}
        >
          ← Edit Journey Parameters
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Helpers ─── */
function ReportSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4a853", marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}
