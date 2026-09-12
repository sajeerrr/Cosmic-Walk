import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import SolarSystem from "../components/solar-system/SolarSystem";

export default function Landing() {
  const navigate = useNavigate();
  const [isFullView, setIsFullView] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 56px)", minHeight: "600px", overflow: "hidden", background: "#03020a" }}>

      {/* ── 3-D Solar System — full viewport ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <SolarSystem
          className="w-full h-full"
          highlightedPlanets={["Earth", "Mars"]}
          originName="Earth"
          destinationName="Mars"
        />
      </div>

      {/* ── Exit Full View Button (Shown when in Full 3D Solar System View) ── */}
      {isFullView && (
        <div style={{ position: "absolute", top: 24, left: 24, zIndex: 30, display: "flex", gap: 12 }}>
          <button
            onClick={() => setIsFullView(false)}
            style={{
              padding: "10px 20px", borderRadius: "10px",
              background: "rgba(7, 6, 14, 0.85)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(212,168,83,0.4)", color: "#d4a853",
              fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 700,
              cursor: "pointer", boxShadow: "0 0 20px rgba(0,0,0,0.8)",
              display: "flex", alignItems: "center", gap: 8
            }}
          >
            ← Exit Full Solar System View
          </button>
          <button
            onClick={() => navigate("/plan")}
            style={{
              padding: "10px 20px", borderRadius: "10px",
              background: "#d4a853", color: "#07060e",
              fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 700,
              cursor: "pointer", border: "none", boxShadow: "0 0 20px rgba(212,168,83,0.4)"
            }}
          >
            Plan Journey →
          </button>
        </div>
      )}

      {/* ── Deep vignette overlay (hidden in full 3D view mode) ── */}
      {!isFullView && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          background: "radial-gradient(ellipse at 50% 60%, rgba(3,2,10,0.3) 0%, rgba(3,2,10,0.72) 55%, rgba(3,2,10,0.95) 100%)",
        }} />
      )}

      {/* ── Bottom amber atmospheric glow ── */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "80%", height: "260px", zIndex: 3, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 100%, rgba(212,168,83,0.22) 0%, rgba(180,120,30,0.10) 40%, transparent 70%)",
        filter: "blur(18px)",
      }} />

      {/* ── Subtle top vignette ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "180px", zIndex: 3, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(3,2,10,0.7) 0%, transparent 100%)",
      }} />

      {/* ── Floating amber particle dots ── */}
      {[
        { top: "22%", left: "12%", size: 3, delay: 0 },
        { top: "35%", left: "82%", size: 2, delay: 0.6 },
        { top: "65%", left: "8%",  size: 2, delay: 1.2 },
        { top: "70%", left: "88%", size: 3, delay: 0.4 },
        { top: "18%", left: "68%", size: 2, delay: 0.9 },
      ].map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ delay: p.delay + 1.5, duration: 3, repeat: Infinity, repeatDelay: 2 }}
          style={{
            position: "absolute", top: p.top, left: p.left, zIndex: 4,
            width: p.size, height: p.size, borderRadius: "50%",
            background: "#d4a853",
            boxShadow: `0 0 ${p.size * 3}px rgba(212,168,83,0.8)`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Centered hero content ── */}
      {!isFullView && (
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 24px",
      }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "5px 16px", borderRadius: "99px",
            border: "1px solid rgba(212,168,83,0.35)",
            background: "rgba(212,168,83,0.07)",
            marginBottom: "28px",
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#d4a853", display: "inline-block",
            boxShadow: "0 0 6px rgba(212,168,83,0.9)",
            animation: "pulse-slow 2s infinite",
          }} />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.62rem",
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#d4a853",
          }}>
            Explore · Plan · Journey
          </span>
        </motion.div>

        {/* Main brand / title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            fontSize: "clamp(3.2rem, 8vw, 7.5rem)",
            letterSpacing: "0.08em",
            lineHeight: 1,
            color: "#f0eee8",
            textTransform: "uppercase",
            marginBottom: "16px",
            textShadow: "0 0 80px rgba(212,168,83,0.25), 0 2px 40px rgba(0,0,0,0.8)",
          }}
        >
          COSMIC
          <span style={{ color: "#d4a853", textShadow: "0 0 40px rgba(212,168,83,0.6), 0 0 80px rgba(212,168,83,0.2)" }}>
            WALK
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(240,238,232,0.55)",
            marginBottom: "18px",
          }}
        >
          Stop Dreaming — Start Travelling
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.05 }}
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "clamp(0.72rem, 1.1vw, 0.85rem)",
            lineHeight: 1.7,
            letterSpacing: "0.02em",
            color: "rgba(240,238,232,0.35)",
            maxWidth: "420px",
            marginBottom: "40px",
          }}
        >
          Interplanetary journey planning for the bold. Real-time departure data, crew manifests, and mission briefings — all in one place.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.25 }}
          style={{ display: "flex", alignItems: "center", gap: "14px" }}
        >
          {/* Primary */}
          <button
            id="cta-plan-journey"
            onClick={() => navigate("/plan")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "13px 32px",
              borderRadius: "10px",
              background: "#d4a853",
              color: "#07060e",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 28px rgba(212,168,83,0.45), 0 4px 20px rgba(0,0,0,0.4)",
              transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = "0.88";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(212,168,83,0.65), 0 8px 28px rgba(0,0,0,0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 0 28px rgba(212,168,83,0.45), 0 4px 20px rgba(0,0,0,0.4)";
            }}
          >
            Plan My Journey
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Secondary */}
          <button
            id="cta-explore"
            onClick={() => setIsFullView(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 28px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(240,238,232,0.6)",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "0.75rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(212,168,83,0.08)";
              e.currentTarget.style.borderColor = "rgba(212,168,83,0.3)";
              e.currentTarget.style.color = "#d4a853";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(240,238,232,0.6)";
            }}
          >
            Explore Solar System
          </button>
        </motion.div>
      </div>
      )}

      {/* ── Bottom hint ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        style={{
          position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)",
          zIndex: 10, fontFamily: "var(--font-mono)",
          fontSize: "0.55rem", letterSpacing: "0.16em",
          textTransform: "uppercase", color: "rgba(240,238,232,0.18)",
          pointerEvents: "none", whiteSpace: "nowrap",
        }}
      >
        Drag to explore · Scroll to zoom
      </motion.p>
    </div>
  );
}
