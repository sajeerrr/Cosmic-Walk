import { useState } from "react";
import { motion } from "motion/react";
import type { TripCalculationResult } from "../types/trip";
import SolarSystem from "./solar-system/SolarSystem";
import { formatDistance } from "../data/planets";

interface JourneyResultsProps {
  data: TripCalculationResult;
  onModifyParams: () => void;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const AMBER  = "#d4a853";
const AMBER2 = "rgba(212,168,83,0.12)";
const BORDER = "rgba(255,255,255,0.07)";
const VOID   = "#07060e";
const SURF   = "rgba(255,255,255,0.025)";
const TXT    = "#f0eee8";
const TXT2   = "rgba(240,238,232,0.5)";
const TXT3   = "rgba(240,238,232,0.25)";
const MONO   = "var(--font-mono, 'Courier New', monospace)";
const SANS   = "var(--font-sans, system-ui, sans-serif)";

const CARD: React.CSSProperties = {
  background: SURF,
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  padding: "24px 28px",
};

const AMBER_CARD: React.CSSProperties = {
  ...CARD,
  background: "rgba(212,168,83,0.04)",
  border: `1px solid rgba(212,168,83,0.25)`,
};

// ─── Category colour mapping ───────────────────────────────────────────────────
const CATEGORY_COLOR: Record<string, string> = {
  human_powered: "#22d3ee",
  realistic:     AMBER,
  theoretical:   "#a78bfa",
  absurd:        "#fb923c",
  impossible:    "#e879f9",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtNum(n: number, dec = 1): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: dec });
}

function fmtCurrency(n: number): string {
  if (!n) return "$0";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3)  return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function pill(text: string, color: string): React.ReactNode {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 99, border: `1px solid ${color}44`, background: `${color}11`, fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color }}>
      {text}
    </span>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children, amberBorder = false, delay = 0 }: {
  title?: React.ReactNode; children: React.ReactNode; amberBorder?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      style={amberBorder ? AMBER_CARD : CARD}
    >
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER, display: "inline-block", flexShrink: 0, boxShadow: `0 0 6px ${AMBER}` }} />
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "0.85rem", color: TXT, letterSpacing: "0.03em", textTransform: "uppercase" as const }}>{title}</span>
        </div>
      )}
      {children}
    </motion.div>
  );
}

// ─── Label + value stat cell ───────────────────────────────────────────────────
function StatCell({ label, value, sub, accent = false, danger = false, small = false }: {
  label: string; value: string | React.ReactNode; sub?: string; accent?: boolean; danger?: boolean; small?: boolean;
}) {
  return (
    <div style={{ padding: small ? "12px 14px" : "16px 18px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
      <div style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: TXT3, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: small ? "0.9rem" : "1rem", color: danger ? "#f87171" : accent ? AMBER : TXT, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: TXT3, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Accordion item ────────────────────────────────────────────────────────────
function AccordionItem({ label, children, defaultOpen = false, badge }: {
  label: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" as const }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", color: open ? AMBER : TXT, transition: "color 0.2s" }}>{label}</span>
          {badge && <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 99, border: `1px solid ${BORDER}` }}>{badge}</span>}
        </div>
        <span style={{ color: TXT3, fontSize: "1.1rem", lineHeight: 1, transition: "transform 0.25s", transform: open ? "rotate(45deg)" : "rotate(0deg)", display: "inline-block" }}>+</span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ paddingBottom: 18, paddingRight: 4 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

// ─── Resource card ─────────────────────────────────────────────────────────────
function ResourceCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 12, display: "flex", flexDirection: "column" as const, gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1.3rem" }}>{icon}</span>
        <span style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: TXT3 }}>{label}</span>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: "0.95rem", color: TXT }}>{value}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: TXT3 }}>{sub}</div>}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function JourneyResults({ data, onModifyParams }: JourneyResultsProps) {
  const [booked, setBooked] = useState(false);
  const [showAllScales, setShowAllScales] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<"processing" | "waiting_list" | "confirmed">("processing");
  const [showTicketModal, setShowTicketModal] = useState(false);

  const m = data.metrics;
  const r = data.resources;
  const c = data.cost;
  const ai = data.aiReport;
  const verdict = data.verdict;
  const catColor = CATEGORY_COLOR[data.modeCategory] ?? AMBER;
  const scales = data.scale_comparison ?? [];

  const startBookingFlow = () => {
    setIsBookingModalOpen(true);
    setBookingStep("processing");
    setTimeout(() => setBookingStep("waiting_list"), 2000);
    setTimeout(() => {
      setBookingStep("confirmed");
      setBooked(true);
    }, 5000);
  };

  const downloadTicket = () => {
    const ticketText = `=====================================================
            COSMICWALK BOARDING PASS & TICKET
=====================================================
PASSENGER: ${data.passenger.name.toUpperCase()}
AGE: ${data.passenger.age} | HEIGHT: ${data.passenger.heightCm}cm | WEIGHT: ${data.passenger.weightKg}kg
TRIP ID: ${data.tripId}
DEPARTURE DATE: ${data.departureDate}

ROUTE: ${data.origin.toUpperCase()} ──► ${data.destination.toUpperCase()}
MODE: ${data.modeName || data.transportMode} (${data.modeCategory.replace("_", " ").toUpperCase()})

ESTIMATED DURATION: ${data.metrics.travelTimeHuman || data.metrics.walkingDurationYears + " years"}
DISTANCE: ${data.metrics.distanceKm.toLocaleString()} KM (${data.metrics.distanceAu.toFixed(3)} AU)
SURVIVAL RATE: ${Math.min(2, Math.max(0, Math.floor(data.metrics.survivalProbabilityPercent <= 1 ? data.metrics.survivalProbabilityPercent * 2 : (data.metrics.survivalProbabilityPercent / 100) * 2)))}%

INSURANCE STATUS: DENIED (Exceeds policy limits)
VISA STATUS: PENDING (Immigration Inspection Required)
SPACE CUSTOMS: DECLARED (Food, Water, Oxygen, 1 Suspicious Snail)

ISSUED BY: COSMICWALK INTERPLANETARY AGENCY
STATUS: BOOKING CONFIRMED & SEAT RESERVED
=====================================================`;

    const blob = new Blob([ticketText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CosmicWalk_Ticket_${data.tripId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `CosmicWalk_${data.tripId}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ ...AMBER_CARD, padding: "32px 32px 28px", textAlign: "center" as const, position: "relative" }}
      >
        {/* Trip ID */}
        <div style={{ position: "absolute", top: 16, right: 20, fontFamily: MONO, fontSize: "0.55rem", color: TXT3 }}>{data.tripId}</div>

        {/* Category + mode pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" as const }}>
          {pill(data.modeCategory.replace("_", " "), catColor)}
          {pill(data.modeName || data.transportMode, TXT2)}
          {verdict && pill(verdict.classification, verdict.classification === "IMPOSSIBLE" ? "#e879f9" : verdict.classification === "ABSURD" ? "#fb923c" : AMBER)}
        </div>

        {/* Route */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 18, flexWrap: "wrap" as const }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2.6rem)", color: TXT }}>{data.origin}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${AMBER}44, ${AMBER})` }} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${AMBER}, ${AMBER}44)` }} />
          </div>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2.6rem)", color: AMBER }}>{data.destination}</span>
        </div>

        {/* Duration & Survival Rate side by side in big font */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexWrap: "wrap" as const, marginBottom: 20 }}>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: "clamp(2.2rem, 6vw, 4.5rem)", color: TXT, lineHeight: 1, marginBottom: 6, letterSpacing: "-0.02em" }}>
              {m.travelTimeHuman || `${fmtNum(m.walkingDurationYears)} yrs`}
            </div>
            <div style={{ fontFamily: MONO, fontSize: "0.65rem", letterSpacing: "0.12em", color: TXT3, textTransform: "uppercase" as const }}>
              Journey Duration
            </div>
          </div>

          <div style={{ width: 1, height: 48, background: BORDER, display: "inline-block" }} />

          <div style={{ textAlign: "center" as const, background: "rgba(239, 68, 68, 0.1)", padding: "12px 24px", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.3)", boxShadow: "0 0 20px rgba(239, 68, 68, 0.15)" }}>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: "clamp(2.2rem, 6vw, 4.5rem)", color: "#ef4444", lineHeight: 1, marginBottom: 6, letterSpacing: "-0.02em", textShadow: "0 0 12px rgba(239, 68, 68, 0.5)" }}>
              {`${Math.min(2, Math.max(0, Math.floor(m.survivalProbabilityPercent <= 1 ? m.survivalProbabilityPercent * 2 : (m.survivalProbabilityPercent / 100) * 2)))}%`}
            </div>
            <div style={{ fontFamily: MONO, fontSize: "0.65rem", letterSpacing: "0.12em", color: "#f87171", textTransform: "uppercase" as const, fontWeight: 700 }}>
              Survival Rate
            </div>
          </div>
        </div>

        {/* Secondary metrics row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" as const }}>
          {[
            { label: "Distance",    value: formatDistance(m.distanceKm) },
            { label: "AU",          value: `${fmtNum(m.distanceAu, 3)} AU` },
            { label: "Difficulty",  value: m.difficulty },
            { label: "Ridiculousness", value: `${fmtNum(m.ridiculousnessScore, 0)}/100` },
            { label: "Survival %",  value: m.survivalProbabilityPercent < 0.01 ? `${(m.survivalProbabilityPercent * 100).toFixed(4)}%` : `${(m.survivalProbabilityPercent * 100).toFixed(1)}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.1em", color: TXT3, marginBottom: 4, textTransform: "uppercase" as const }}>{label}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: "0.9rem", color: TXT }}>{value}</div>
            </div>
          ))}
        </div>
      </motion.div>


      {/* ══════════════════════════════════════════════════════════════════
          5. 3D COSMIC ROUTE
      ══════════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}`, background: VOID, position: "relative" }}>
        <div style={{ position: "absolute", top: 14, left: 16, zIndex: 20, pointerEvents: "none", display: "flex", alignItems: "center", gap: 8, background: "rgba(7,6,14,0.85)", backdropFilter: "blur(10px)", padding: "5px 14px", borderRadius: 8, border: `1px solid rgba(212,168,83,0.2)` }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: AMBER, display: "inline-block", boxShadow: `0 0 6px ${AMBER}` }} />
          <span style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: AMBER }}>
            {data.origin} ──► {data.destination}
          </span>
        </div>
        <div style={{ position: "absolute", top: 14, right: 16, zIndex: 20, pointerEvents: "none", fontFamily: MONO, fontSize: "0.55rem", color: TXT3, background: "rgba(7,6,14,0.8)", backdropFilter: "blur(8px)", padding: "5px 12px", borderRadius: 8, border: `1px solid ${BORDER}` }}>
          Cosmic Route
        </div>
        <SolarSystem
          className="w-full h-[380px]"
          highlightedPlanets={[data.origin, data.destination]}
          originName={data.origin}
          destinationName={data.destination}
          showTrajectory={true}
        />
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          NEW ABSURDITY CARDS (Right after 3D Solar System)
      ══════════════════════════════════════════════════════════════════ */}

      {/* 1. Cosmic Travel Insurance & 3. Cosmic Visa / Passport */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {/* Insurance */}
        <Section title={<>1. Cosmic Travel <span style={{ color: "#d4a853", textShadow: "0 0 10px rgba(212,168,83,0.4)" }}>INSURANCE</span></>} amberBorder delay={0.08}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: TXT3, letterSpacing: "0.1em" }}>INSURANCE STATUS</span>
              {pill(
                m.walkingDurationYears > 100 ? "DENIED" : data.transportMode.toLowerCase().includes("teleport") ? "UNDER REVIEW" : "VOID",
                m.walkingDurationYears > 100 ? "#f87171" : "#fb923c"
              )}
            </div>
            <div style={{ padding: "14px 16px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 12 }}>
              <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: "#f87171", marginBottom: 6, letterSpacing: "0.08em" }}>OFFICIAL DENIAL / STATUS REASON</div>
              <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                "{ai.fictionalInsurance || (data.transportMode.toLowerCase().includes("teleport")
                  ? "We have never insured a person who might arrive in multiple pieces."
                  : data.transportMode.toLowerCase().includes("wormhole")
                  ? "The destination technically exists, but our lawyers don't understand the route."
                  : `Policy maximum is 90 days. Your trip is expected to last ${fmtNum(m.walkingDurationYears, 0)} years.`)}"
              </p>
            </div>
          </div>
        </Section>

        {/* Cosmic Visa */}
        <Section title={<>3. Interplanetary <span style={{ color: "#d4a853", textShadow: "0 0 10px rgba(212,168,83,0.4)" }}>VISA</span> / <span style={{ color: "#d4a853", textShadow: "0 0 10px rgba(212,168,83,0.4)" }}>PASSPORT</span></>} delay={0.1}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: TXT3, letterSpacing: "0.1em" }}>VISA STATUS</span>
              <span style={{ fontFamily: MONO, fontSize: "0.7rem", fontWeight: 700, color: "#fb923c", background: "rgba(251, 146, 60, 0.1)", padding: "2px 10px", borderRadius: 99, border: "1px solid rgba(251, 146, 60, 0.3)" }}>
                ⚠ PENDING
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontFamily: MONO, color: TXT2, borderBottom: `1px dashed ${BORDER}`, paddingBottom: 8 }}>
              <span>ORIGIN: {data.origin.toUpperCase()}</span>
              <span>DESTINATION: {data.destination.toUpperCase()}</span>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
              <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: AMBER, marginBottom: 4 }}>IMMIGRATION REQUIREMENT</div>
              <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: TXT, lineHeight: 1.5, margin: 0 }}>
                {data.destination.toLowerCase() === "pluto"
                  ? 'Pluto Immigration: "Please explain why you are coming here."'
                  : data.transportMode.toLowerCase().includes("teleport")
                  ? '"Please provide your physical body for inspection before quantum reassembly."'
                  : `${data.destination} immigration has requested formal proof that you actually have a valid reason for coming.`}
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* 2. Packing List From Hell & 4. Space Customs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {/* Packing List */}
        <Section title={<>2. <span style={{ color: "#d4a853", textShadow: "0 0 10px rgba(212,168,83,0.4)" }}>PACKING LIST</span> From Hell</>} delay={0.12}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(ai.packingList?.length ? ai.packingList : [
              r.shoesRequiredPairs > 0 ? `${fmtNum(r.shoesRequiredPairs, 0)} pairs of shoes` : "Space-time warranty",
              r.foodKcalTotal > 0 ? `${(r.foodKcalTotal / 1e6).toFixed(1)}M snacks` : "Reality repair kit",
              "Water & Oxygen tanks",
              "A very good playlist",
              "Family photos for your 400th descendant",
              "One unnecessary towel",
              "One suspicious snail (for emotional support)"
            ]).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", background: "rgba(255,255,255,0.015)", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <span style={{ color: AMBER, fontSize: "0.7rem", fontFamily: MONO }}>[{i + 1}]</span>
                <span style={{ fontFamily: SANS, fontSize: "0.8rem", color: TXT }}>{item}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Space Customs */}
        <Section title={<>4. Cosmic <span style={{ color: "#d4a853", textShadow: "0 0 10px rgba(212,168,83,0.4)" }}>CUSTOMS</span> Declaration</>} delay={0.14}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3, letterSpacing: "0.1em" }}>DEPARTURE CHECKLIST</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["Food & Rations", "Water Supplies", "Oxygen Tanks", r.shoesRequiredPairs > 0 ? `${fmtNum(r.shoesRequiredPairs, 0)} Shoes` : "Reality Repair Kit", "One Suspicious Snail"].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", fontFamily: SANS, color: TXT2 }}>
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>☑</span> {item}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 8, marginTop: 4 }}>
              <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: TXT3 }}>DECLARED VALUE</span>
              <span style={{ fontFamily: MONO, fontSize: "0.85rem", fontWeight: 700, color: AMBER }}>₹0</span>
            </div>
            <div style={{ padding: "12px 14px", background: "rgba(212,168,83,0.04)", border: `1px solid rgba(212,168,83,0.2)`, borderRadius: 10 }}>
              <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: AMBER, marginBottom: 4 }}>CUSTOMS OFFICER NOTE</div>
              <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: TXT, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                "Why are you bringing a snail to {data.destination}?"
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. MISSION VERDICT
      ══════════════════════════════════════════════════════════════════ */}
      {verdict && (
        <Section delay={0.05}>
          <div style={{ display: "flex", flexWrap: "wrap" as const, alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.12em", color: AMBER, marginBottom: 8, textTransform: "uppercase" as const }}>Mission Verdict</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: "1.1rem", color: TXT, marginBottom: 6 }}>{verdict.title}</div>
              <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: TXT2, lineHeight: 1.65, maxWidth: 600 }}>{verdict.summary}</p>
            </div>
            <div style={{ textAlign: "center" as const, flexShrink: 0 }}>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: "2.5rem", color: AMBER, lineHeight: 1 }}>{fmtNum(verdict.score, 0)}</div>
              <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3, marginTop: 4 }}>OUT OF 100</div>
            </div>
          </div>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          3. JOURNEY OVERVIEW + TRAVELER PROFILE (2-col)
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Section title="Journey Overview" delay={0.1}>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {[
              ["Origin",        data.origin],
              ["Destination",   data.destination],
              ["Departure",     data.departureDate],
              ["Travel Mode",   data.modeName || data.transportMode],
              ["Category",      data.modeCategory.replace("_", " ")],
              ["Distance",      formatDistance(m.distanceKm)],
              ["Distance (AU)", `${fmtNum(m.distanceAu, 3)} AU`],
              ["Light Delay",   `${fmtNum(m.lightMinutes, 1)} min`],
              ["Duration",      m.travelTimeHuman || `${fmtNum(m.walkingDurationYears)} years`],
              ["Max Speed",     m.maxSpeedKmS > 0 ? `${(m.maxSpeedKmS * 3600).toFixed(0)} km/h` : "N/A"],
              ["Total Cost",    c.totalUsd > 0 ? fmtCurrency(c.totalUsd) : "N/A"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.08em", color: TXT3, textTransform: "uppercase" as const, flexShrink: 0 }}>{label}</span>
                <span style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT, fontWeight: 500, textAlign: "right" as const }}>{value}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Traveler Profile" delay={0.12}>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {[
              ["Name",            data.passenger.name],
              ["Age",             `${data.passenger.age} years`],
              ["Height",          `${data.passenger.heightCm} cm`],
              ["Weight",          `${data.passenger.weightKg} kg`],
              ["Sex",             data.passenger.sex || "Unspecified"],
              ["Total Calories",  r.foodKcalTotal > 0 ? `${fmtNum(r.foodKcalTotal, 0)} kcal` : "N/A"],
              ["Total Water",     r.waterLitersTotal > 0 ? `${fmtNum(r.waterLitersTotal, 0)} L` : "N/A"],
              ["Oxygen",          r.oxygenKgTotal > 0 ? `${fmtNum(r.oxygenKgTotal, 0)} kg` : "N/A"],
              ["Equipment Mass",  r.equipmentWeightKg > 0 ? `${fmtNum(r.equipmentWeightKg, 0)} kg` : "N/A"],
              ["Generations",     m.generationsNeeded > 0 ? `${fmtNum(m.generationsNeeded, 1)}` : "< 1"],
              ["Human Lifetimes", m.humanLifetimes > 0 ? fmtNum(m.humanLifetimes, 1) : "< 1"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.08em", color: TXT3, textTransform: "uppercase" as const, flexShrink: 0 }}>{label}</span>
                <span style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT, fontWeight: 500, textAlign: "right" as const }}>{value}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          4. JOURNEY METRICS
      ══════════════════════════════════════════════════════════════════ */}
      <Section title="Journey Metrics" delay={0.15}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <StatCell label="Distance"        value={formatDistance(m.distanceKm)}                        sub={`${fmtNum(m.distanceAu, 3)} AU`} />
          <StatCell label="Duration"        value={m.walkingDurationYears >= 1 ? `${fmtNum(m.walkingDurationYears, 1)} yrs` : `${fmtNum(m.walkingDurationDays, 0)} days`} sub={`${fmtNum(m.walkingDurationDays, 0)} total days`} accent />
          <StatCell label="Steps"           value={m.estimatedSteps > 1e9 ? `${(m.estimatedSteps / 1e9).toFixed(2)}B` : m.estimatedSteps > 1e6 ? `${(m.estimatedSteps / 1e6).toFixed(1)}M` : fmtNum(m.estimatedSteps, 0)} />
          <StatCell label="Calories"        value={m.caloriesBurned > 1e9 ? `${(m.caloriesBurned / 1e9).toFixed(1)}B kcal` : m.caloriesBurned > 1e6 ? `${(m.caloriesBurned / 1e6).toFixed(1)}M kcal` : r.foodKcalTotal > 0 ? `${fmtNum(r.foodKcalTotal / 1e6, 2)}M kcal` : "N/A"} sub={m.equivalentPizzas > 0 ? `≈ ${fmtNum(m.equivalentPizzas, 0)} pizzas` : undefined} />
          <StatCell label="Generations"     value={m.generationsNeeded >= 1 ? fmtNum(m.generationsNeeded, 1) : "< 1"} sub="25-yr generations" />
          <StatCell label="Human Lifetimes" value={m.humanLifetimes >= 1 ? fmtNum(m.humanLifetimes, 1) : "< 1"} sub="80-yr lifetimes" />
          <StatCell label="Difficulty"      value={m.difficulty} danger={m.difficulty === "Existential" || m.difficulty === "Impossible"} sub={m.difficultyScore > 0 ? `Score: ${fmtNum(m.difficultyScore, 0)}/100` : undefined} />
          <StatCell label="Ridiculousness"  value={m.ridiculousnessRating || `${fmtNum(m.ridiculousnessScore, 0)}/100`} sub={m.ridiculousnessScore > 0 ? `${fmtNum(m.ridiculousnessScore, 0)}/100` : undefined} accent />
          <StatCell label="Survival Prob."  value={m.survivalProbabilityPercent < 0.01 ? `${(m.survivalProbabilityPercent * 100).toFixed(4)}%` : m.survivalProbabilityPercent > 10 ? `${fmtNum(m.survivalProbabilityPercent, 1)}%` : `${(m.survivalProbabilityPercent * 100).toFixed(2)}%`} danger={m.survivalProbabilityPercent < 0.001} />
        </div>
        {m.ridiculousnessFunFacts?.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.1em", color: TXT3, textTransform: "uppercase" as const, marginBottom: 8 }}>Fun Facts</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 6 }}>
              {m.ridiculousnessFunFacts.map((f, i) => (
                <li key={i} style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT2, display: "flex", gap: 8 }}>
                  <span style={{ color: AMBER, flexShrink: 0 }}>›</span>{f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          6. WHAT YOU'LL NEED (Resources)
      ══════════════════════════════════════════════════════════════════ */}
      <Section title="What You'll Need" delay={0.25}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {r.shoesRequiredPairs > 0 && (
            <ResourceCard icon="👟" label="Shoes" value={`${fmtNum(r.shoesRequiredPairs, 0)} pairs`} sub="1.5M steps per pair" />
          )}
          {r.foodKcalTotal > 0 && (
            <ResourceCard icon="🥫" label="Food" value={r.foodKcalTotal > 1e9 ? `${(r.foodKcalTotal / 1e9).toFixed(2)}B kcal` : `${(r.foodKcalTotal / 1e6).toFixed(2)}M kcal`} sub="2,500 kcal/day" />
          )}
          {r.waterLitersTotal > 0 && (
            <ResourceCard icon="💧" label="Water" value={r.waterLitersTotal > 1e6 ? `${(r.waterLitersTotal / 1e6).toFixed(2)}M L` : `${fmtNum(r.waterLitersTotal, 0)} L`} sub="3.5 L per day" />
          )}
          {r.oxygenKgTotal > 0 && (
            <ResourceCard icon="🦺" label="Oxygen" value={r.oxygenKgTotal > 1e6 ? `${(r.oxygenKgTotal / 1e6).toFixed(2)}M kg` : `${fmtNum(r.oxygenKgTotal, 0)} kg`} sub="0.84 kg/day" />
          )}
          {r.equipmentWeightKg > 0 && (
            <ResourceCard icon="🏋️" label="Equipment" value={`${fmtNum(r.equipmentWeightKg, 0)} kg`} sub="Suit, tools, supplies" />
          )}
          {r.emergencyPacks > 0 && (
            <ResourceCard icon="📦" label="Emergency Packs" value={`${fmtNum(r.emergencyPacks, 0)}`} sub="First aid, beacons" />
          )}
          {c.totalUsd > 0 && (
            <ResourceCard icon="💰" label="Total Cost" value={fmtCurrency(c.totalUsd)} sub="Estimated mission cost" />
          )}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          7. SCALE COMPARISONS
      ══════════════════════════════════════════════════════════════════ */}
      {scales.length > 0 && (
        <Section title="How Big Is This Journey?" delay={0.28}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {(showAllScales ? scales : scales.slice(0, 4)).map((s, i) => (
              <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
                <div style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: TXT3, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: "1rem", color: AMBER }}>{s.formatted_value}</div>
                <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: TXT3, marginTop: 3 }}>{s.unit}</div>
              </div>
            ))}
          </div>
          {scales.length > 4 && (
            <button onClick={() => setShowAllScales(!showAllScales)} style={{ marginTop: 14, padding: "8px 20px", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, color: TXT3, fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.08em", cursor: "pointer" }}>
              {showAllScales ? "Show Less" : `Show ${scales.length - 4} More Comparisons`}
            </button>
          )}
        </Section>
      )}

            {/* ══════════════════════════════════════════════════════════════════
          AI OPINION (Funny Negative AI Assessment)
      ══════════════════════════════════════════════════════════════════ */}
      <Section title={<>🤖 AI Mission Control <span style={{ color: "#ef4444", textShadow: "0 0 10px rgba(239,68,68,0.4)", textTransform: "none" }}>Critical Opinion</span></>} amberBorder delay={0.29}>
        <div style={{ padding: "18px 20px", background: "#05040a", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, boxShadow: "inset 0 0 15px rgba(239,68,68,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingBottom: 8, borderBottom: "1px dashed rgba(239, 68, 68, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", boxShadow: "0 0 8px #ef4444" }} />
              <span style={{ fontFamily: MONO, fontSize: "0.62rem", color: "#f87171", letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase" }}>[AI-TELEMETRY LOG #779] WARNING & UNFILTERED ASSESSMENT</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3 }}>PROBABILITY: CRITICAL</span>
          </div>

          <div style={{ position: "relative", paddingLeft: 16, borderLeft: "3px solid #ef4444", marginTop: 8 }}>
            <p style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "0.9rem", color: "#fca5a5", lineHeight: 1.6, margin: 0, letterSpacing: "0.01em" }}>
              {ai.negativeAiOpinion || (
                data.metrics.walkingDurationYears > 100
                  ? `Attempting to reach ${data.destination} using ${data.modeName || data.transportMode} is an insult to 300 years of spaceflight engineering. I calculated 14 million outcomes—you die in 13.99 million, and in the rest you run out of snacks.`
                  : `As an AI, I am programmed to be objective, but this trip plan is objectively hilarious and your survival odds are essentially rounded down to zero.`
              )}
            </p>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          8. JOURNEY TIMELINE
      ══════════════════════════════════════════════════════════════════ */}
      <Section title="Your Journey Through Space" delay={0.3}>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {data.timeline.map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: 16, position: "relative" as const }}>
              {/* Left: percentage + connector */}
              <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", width: 48, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: item.percentage === 0 || item.percentage === 100 ? AMBER : VOID, border: `2px solid ${item.percentage === 0 || item.percentage === 100 ? AMBER : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: MONO, fontSize: "0.5rem", color: item.percentage === 0 || item.percentage === 100 ? VOID : TXT3 }}>{item.percentage}%</span>
                </div>
                {idx < data.timeline.length - 1 && (
                  <div style={{ width: 1, flex: 1, minHeight: 20, background: `linear-gradient(180deg, ${BORDER}, ${BORDER})`, margin: "4px 0" }} />
                )}
              </div>
              {/* Right: content */}
              <div style={{ paddingBottom: idx < data.timeline.length - 1 ? 20 : 0, paddingTop: 4 }}>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: "0.8rem", color: TXT, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: AMBER, marginBottom: 4 }}>
                  {item.elapsedYears === 0 ? "Year 0 — Departure" : `+${fmtNum(item.elapsedYears, 1)} years`}
                </div>
                <div style={{ fontFamily: SANS, fontSize: "0.75rem", color: TXT2, lineHeight: 1.55 }}>{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          9. AI TRAVEL REPORT
      ══════════════════════════════════════════════════════════════════ */}
      <Section title="Your AI Cosmic Travel Report" amberBorder delay={0.35}>
        <div style={{ display: "flex", flexDirection: "column" as const }}>

          {/* Open by default */}
          <AccordionItem label="Journey Introduction" defaultOpen badge="AI Generated">
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
              {ai.introduction || ai.missionSummary || "No introduction available."}
            </p>
          </AccordionItem>

          <AccordionItem label="What You've Signed Up For" defaultOpen>
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
              {ai.whatYouSignedUpFor || ai.missionSummary || "—"}
            </p>
          </AccordionItem>

          <AccordionItem label="Travel Experience" defaultOpen>
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
              {ai.travelExperience || "—"}
            </p>
          </AccordionItem>

          <AccordionItem label="Daily Routine" badge="Hypothetical">
            {ai.dailyRoutine ? (
              <div style={{ fontFamily: SANS, fontSize: "0.8rem", color: TXT2, lineHeight: 1.8, whiteSpace: "pre-line" as const }}>{ai.dailyRoutine}</div>
            ) : <p style={{ color: TXT3, fontSize: "0.78rem" }}>Not available for this mode.</p>}
          </AccordionItem>

          <AccordionItem label="The Food Situation">
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
              {ai.foodStory || `You will require ${(r.foodKcalTotal / 1e6).toFixed(2)}M kcal total.`}
            </p>
          </AccordionItem>

          <AccordionItem label="The Water Situation">
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
              {ai.waterStory || `Water requirements: ${fmtNum(r.waterLitersTotal, 0)} litres total.`}
            </p>
          </AccordionItem>

          <AccordionItem label="Footwear & Equipment">
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
              {ai.footwearStory || (r.shoesRequiredPairs > 0 ? `You will need ${fmtNum(r.shoesRequiredPairs, 0)} pairs of shoes.` : "Standard mission equipment applies.")}
            </p>
          </AccordionItem>

          <AccordionItem label="Boredom Index">
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
              {ai.boredomIndex || "Boredom level: Considerable."}
            </p>
          </AccordionItem>

          {(ai.thingsYouWillMiss?.length > 0 || ai.thingsYouWillSee?.length > 0) && (
            <AccordionItem label="Things You Will Miss & See">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {ai.thingsYouWillMiss?.length > 0 && (
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 8 }}>You'll Miss</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 5 }}>
                      {ai.thingsYouWillMiss.map((t, i) => (
                        <li key={i} style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT2, display: "flex", gap: 6 }}><span style={{ color: "#f87171" }}>✕</span>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {ai.thingsYouWillSee?.length > 0 && (
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 8 }}>You'll See</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 5 }}>
                      {ai.thingsYouWillSee.map((t, i) => (
                        <li key={i} style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT2, display: "flex", gap: 6 }}><span style={{ color: "#4ade80" }}>✓</span>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AccordionItem>
          )}

          {ai.cosmicProblems?.length > 0 && (
            <AccordionItem label="Cosmic Problems" badge="Fictional">
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {ai.cosmicProblems.map((p, i) => (
                  <li key={i} style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT2, display: "flex", gap: 8 }}><span style={{ color: "#fb923c", flexShrink: 0 }}>⚠</span>{p}</li>
                ))}
              </ul>
            </AccordionItem>
          )}

          {ai.packingList?.length > 0 && (
            <AccordionItem label="Packing List">
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {ai.packingList.map((p, i) => (
                  <li key={i} style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT2, display: "flex", gap: 8 }}><span style={{ color: AMBER, flexShrink: 0 }}>✓</span>{p}</li>
                ))}
              </ul>
            </AccordionItem>
          )}

          {ai.travelAdvice?.length > 0 && (
            <AccordionItem label="Travel Advice">
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {ai.travelAdvice.map((a, i) => (
                  <li key={i} style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT2, display: "flex", gap: 8 }}><span style={{ color: AMBER, flexShrink: 0 }}>›</span>{a}</li>
                ))}
              </ul>
            </AccordionItem>
          )}

          <AccordionItem label="Survival Guide">
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
              {ai.survivalGuide || m.difficultyDescription || "Proceed with extreme caution."}
            </p>
          </AccordionItem>

          {m.generationsNeeded > 0.5 && (
            <AccordionItem label="Generational Impact">
              <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
                {ai.generationalImpact || `This journey spans ${fmtNum(m.generationsNeeded, 1)} human generations.`}
              </p>
            </AccordionItem>
          )}

          <AccordionItem label="Arrival Scenario">
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7 }}>
              {ai.arrivalScenario || `After ${m.travelTimeHuman || fmtNum(m.walkingDurationYears) + " years"}, you arrive at ${data.destination}.`}
            </p>
          </AccordionItem>

          {ai.travelReview && (
            <AccordionItem label="Travel Review">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                {Object.entries(ai.travelReview).map(([k, v]) => (
                  <div key={k} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                    <div style={{ fontFamily: MONO, fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: TXT3, marginBottom: 6 }}>{k}</div>
                    <div style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT }}>{v as string}</div>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}

          {ai.fictionalInsurance && (
            <AccordionItem label="Travel Insurance" badge="Fictional">
              <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.7, fontStyle: "italic" as const }}>
                {ai.fictionalInsurance}
              </p>
            </AccordionItem>
          )}

          {ai.customerReview && (
            <AccordionItem label="Customer Review" badge="AI Fiction">
              <div style={{ padding: "12px 16px", background: "rgba(212,168,83,0.04)", border: `1px solid rgba(212,168,83,0.15)`, borderRadius: 8 }}>
                <div style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT, lineHeight: 1.65, fontStyle: "italic" as const }}>{ai.customerReview}</div>
              </div>
            </AccordionItem>
          )}

          {/* Final Verdict — always open */}
          <AccordionItem label="Final AI Verdict" defaultOpen>
            <div style={{ padding: "14px 16px", background: AMBER2, border: `1px solid rgba(212,168,83,0.25)`, borderRadius: 10 }}>
              <p style={{ fontFamily: SANS, fontSize: "0.85rem", color: TXT, lineHeight: 1.7, fontWeight: 500 }}>
                {ai.finalVerdict || ai.missionSummary || "Mission calculated. Proceed at your discretion."}
              </p>
              {ai.funRating > 0 && (
                <div style={{ marginTop: 10, fontFamily: MONO, fontSize: "0.6rem", color: AMBER }}>
                  Fun Rating: {"★".repeat(Math.round(ai.funRating))}{"☆".repeat(Math.max(0, 10 - Math.round(ai.funRating)))} {ai.funRating.toFixed(1)}/10
                </div>
              )}
            </div>
          </AccordionItem>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          10. RANDOM EVENTS
      ══════════════════════════════════════════════════════════════════ */}
      {data.events && data.events.length > 0 && (
        <Section title="Journey Events" delay={0.4}>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {data.events.slice(0, 8).map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: AMBER, flexShrink: 0, minWidth: 60 }}>Day {e.day?.toLocaleString?.() ?? e.day}</span>
                <span style={{ fontFamily: SANS, fontSize: "0.78rem", color: TXT2 }}>{e.event}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          11. ACTIONS — Book Now + Edit + Export
      ══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.45 }}
        style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 16, padding: "32px 0 8px" }}
      >
        {booked ? (
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center" as const, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: "1.6rem", color: AMBER, marginBottom: 4 }}>🚀 Booking Confirmed!</div>
            <p style={{ fontFamily: SANS, fontSize: "0.82rem", color: TXT2, lineHeight: 1.65, maxWidth: 440, margin: "0 auto" }}>
              Your interplanetary journey from <strong style={{ color: TXT }}>{data.origin}</strong> to <strong style={{ color: AMBER }}>{data.destination}</strong> has been registered.<br />
              Prepare for departure on {data.departureDate}.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button
                onClick={() => setShowTicketModal(true)}
                style={{ padding: "12px 28px", borderRadius: 10, background: AMBER, color: VOID, fontFamily: SANS, fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(212,168,83,0.4)" }}
              >
                🎫 View & Print Ticket
              </button>
              <button
                onClick={downloadTicket}
                style={{ padding: "12px 24px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid ${AMBER}`, color: AMBER, fontFamily: SANS, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
              >
                ⬇ Download Ticket (.txt)
              </button>
            </div>
            <p style={{ fontFamily: MONO, fontSize: "0.6rem", color: TXT3, marginTop: 4 }}>Reference: {data.tripId}</p>
          </motion.div>
        ) : (
          <>
            <button
              id="btn-book-now"
              onClick={startBookingFlow}
              style={{ padding: "18px 64px", borderRadius: 14, background: AMBER, color: VOID, fontFamily: SANS, fontWeight: 800, fontSize: "1rem", letterSpacing: "0.06em", textTransform: "uppercase" as const, border: "none", cursor: "pointer", boxShadow: `0 0 48px rgba(212,168,83,0.5), 0 8px 28px rgba(0,0,0,0.6)`, transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s", display: "flex", alignItems: "center", gap: 12 }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Book This Journey
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <p style={{ fontFamily: MONO, fontSize: "0.6rem", color: TXT3 }}>
              {data.origin} → {data.destination} · {data.departureDate}
            </p>
          </>
        )}

        {/* Secondary actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center", marginTop: 8 }}>
          <button
            onClick={onModifyParams}
            style={{ padding: "10px 24px", borderRadius: 10, background: "transparent", border: `1px solid ${BORDER}`, color: TXT3, fontFamily: SANS, fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = `rgba(212,168,83,0.3)`; e.currentTarget.style.color = AMBER; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TXT3; }}
          >
            ← Edit Journey Parameters
          </button>
          <button
            onClick={downloadJson}
            style={{ padding: "10px 24px", borderRadius: 10, background: "transparent", border: `1px solid ${BORDER}`, color: TXT3, fontFamily: SANS, fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = `rgba(212,168,83,0.3)`; e.currentTarget.style.color = AMBER; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TXT3; }}
          >
            Export Full Journey (.json)
          </button>
        </div>
      </motion.div>
      {/* ══════════════════════════════════════════════════════════════════
          PROCESSING MODAL WINDOW (5-second journey booking state)
      ══════════════════════════════════════════════════════════════════ */}
      {isBookingModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(7, 6, 14, 0.88)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ ...AMBER_CARD, width: "100%", maxWidth: 480, padding: 32, textAlign: "center", background: "#0a0814", boxShadow: "0 0 60px rgba(212, 168, 83, 0.2)" }}>
            {bookingStep === "processing" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${AMBER2}`, borderTopColor: AMBER, animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: "1.2rem", color: TXT }}>PROCESSING YOUR JOURNEY</div>
                <p style={{ fontFamily: MONO, fontSize: "0.7rem", color: TXT3, margin: 0 }}>Connecting with {data.destination} Orbit Control...</p>
              </div>
            )}

            {bookingStep === "waiting_list" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: "2rem" }}>⏳</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: "1.2rem", color: "#fb923c" }}>YOU ARE IN WAITING LIST</div>
                <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: TXT2, margin: 0, lineHeight: 1.5 }}>
                  Position #42 in queue for {data.modeName || data.transportMode}.<br />
                  Allocating oxygen supplies & shoe inventory...
                </p>
              </div>
            )}

            {bookingStep === "confirmed" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: "2.5rem" }}>🎉</div>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: "1.4rem", color: "#4ade80" }}>BOOKING CONFIRMED!</div>
                <p style={{ fontFamily: SANS, fontSize: "0.85rem", color: TXT, margin: 0, lineHeight: 1.5 }}>
                  Here is your official ticket for your journey from <strong style={{ color: AMBER }}>{data.origin}</strong> to <strong style={{ color: AMBER }}>{data.destination}</strong>!
                </p>
                <div style={{ display: "flex", gap: 10, marginTop: 8, width: "100%" }}>
                  <button
                    onClick={() => { setIsBookingModalOpen(false); setShowTicketModal(true); }}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, background: AMBER, color: VOID, fontFamily: SANS, fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer" }}
                  >
                    View Ticket
                  </button>
                  <button
                    onClick={() => setIsBookingModalOpen(false)}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, background: "transparent", border: `1px solid ${BORDER}`, color: TXT3, fontFamily: SANS, fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          INTERPLANETARY TICKET MODAL VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {showTicketModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(7, 6, 14, 0.92)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: "100%", maxWidth: 640, background: "#0a0814", border: `2px solid ${AMBER}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 0 80px rgba(212, 168, 83, 0.3)", position: "relative" }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #d4a853 0%, #9a7322 100%)", padding: "20px 24px", color: VOID, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>COSMICWALK BOARDING PASS</div>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: "1.3rem" }}>INTERPLANETARY TICKET</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: "0.65rem", background: "rgba(0,0,0,0.2)", padding: "4px 10px", borderRadius: 6, fontWeight: 700 }}>
                TRIP ID: {data.tripId}
              </div>
            </div>

            {/* Ticket Content Body */}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Route */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3 }}>ORIGIN</div>
                  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: "1.2rem", color: TXT }}>{data.origin}</div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: "1rem", color: AMBER }}>✈ ──►</div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3 }}>DESTINATION</div>
                  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: "1.2rem", color: AMBER }}>{data.destination}</div>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.8rem", fontFamily: SANS }}>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.015)", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3 }}>PASSENGER</div>
                  <div style={{ fontWeight: 700, color: TXT }}>{data.passenger.name}</div>
                  <div style={{ fontSize: "0.7rem", color: TXT3 }}>{data.passenger.age} yrs · {data.passenger.weightKg} kg</div>
                </div>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.015)", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3 }}>TRAVEL MODE</div>
                  <div style={{ fontWeight: 700, color: TXT }}>{data.modeName || data.transportMode}</div>
                  <div style={{ fontSize: "0.7rem", color: TXT3 }}>{data.departureDate}</div>
                </div>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.015)", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3 }}>DURATION</div>
                  <div style={{ fontWeight: 700, color: AMBER }}>{data.metrics.travelTimeHuman || `${data.metrics.walkingDurationYears} yrs`}</div>
                </div>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.015)", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: TXT3 }}>SURVIVAL RATE</div>
                  <div style={{ fontWeight: 700, color: "#f87171" }}>{data.metrics.survivalProbabilityPercent < 0.01 ? `${(data.metrics.survivalProbabilityPercent * 100).toFixed(2)}%` : `${data.metrics.survivalProbabilityPercent.toFixed(0)}%`}</div>
                </div>
              </div>

              {/* Status bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(74, 222, 128, 0.08)", border: "1px solid rgba(74, 222, 128, 0.2)", borderRadius: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: "#4ade80", fontWeight: 700 }}>STATUS: SEAT CONFIRMED</span>
                <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: TXT3 }}>CUSTOMS DECLARED ☑</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={downloadTicket}
                style={{ padding: "10px 20px", borderRadius: 8, background: AMBER, color: VOID, fontFamily: SANS, fontWeight: 700, fontSize: "0.8rem", border: "none", cursor: "pointer" }}
              >
                ⬇ Download Ticket (.txt)
              </button>
              <button
                onClick={() => setShowTicketModal(false)}
                style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", border: `1px solid ${BORDER}`, color: TXT3, fontFamily: SANS, fontSize: "0.8rem", cursor: "pointer" }}
              >
                Close Ticket
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
