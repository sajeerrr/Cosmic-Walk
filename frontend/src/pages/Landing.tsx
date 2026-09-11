import { useNavigate } from "react-router";
import { motion } from "motion/react";
import Button from "../components/Button";
import Badge from "../components/Badge";
import SolarSystem from "../components/solar-system/SolarSystem";
import { formatDistance, formatWalkingTime } from "../data/planets";

// Example journey data — Earth to Mars
const EXAMPLE_JOURNEY = {
  from: "Earth",
  to: "Mars",
  distanceKm: 225_000_000,
};

export default function Landing() {
  const navigate = useNavigate();

  const scrollToSolarSystem = () => {
    const el = document.getElementById("solar-system-viewport");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-void bg-radial-gradient text-text-primary">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-28 pb-16 px-6 border-b border-border bg-grid">
        <div className="max-w-[1400px] mx-auto">
          {/* Tactical Status Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <Badge variant="accent">
              [ MISSION CONTROL ]
            </Badge>
            <Badge variant="success">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
              STATUS: OPERATIONAL
            </Badge>
            <Badge variant="default">
              BASELINE: 5.0 KM/H
            </Badge>
          </motion.div>

          {/* Main Headline & Subtitle */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-8 space-y-4"
            >
              <h1 className="font-mono text-[clamp(2.5rem,5.5vw,4.75rem)] font-bold tracking-tight leading-[1.05] text-text-primary select-none">
                COSMIC<span className="text-amber">WALK</span>
              </h1>
              <p className="font-mono text-xs sm:text-sm tracking-[0.2em] uppercase text-text-secondary flex items-center gap-2.5">
                <span className="w-2.5 h-px bg-amber inline-block" />
                Interplanetary Walking Route Planner
              </p>
              <div className="space-y-1.5 pt-1">
                <p className="text-text-primary text-xl sm:text-2xl font-light leading-snug max-w-xl">
                  Mission planning for journeys nobody requested.
                </p>
                <p className="text-text-tertiary text-xs sm:text-sm font-mono leading-relaxed tracking-wide">
                  All calculations are serious. The journey is not.
                </p>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3"
            >
              <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/plan")}>
                Configure Journey
                <span className="text-void/70 group-hover:translate-x-1 transition-transform font-mono">→</span>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={scrollToSolarSystem}>
                View Orbits
                <span className="text-text-tertiary group-hover:translate-y-0.5 transition-transform font-mono">↓</span>
              </Button>
            </motion.div>
          </div>

          {/* Telemetry Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-14 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <TelemetryCard label="Sample Route" value="Earth → Mars" tag="01.WAYPOINT" />
            <TelemetryCard label="Avg Distance" value="225,000,000 km" tag="02.METRIC" />
            <TelemetryCard label="Walking Duration" value="5,136 Years" tag="03.TIME" accent />
            <TelemetryCard label="Footwear Consumed" value="4,500,000 Pairs" tag="04.GEAR" />
          </motion.div>
        </div>
      </section>

      {/* ─── 3D Solar System Viewport Section ─── */}
      <section id="solar-system-viewport" className="relative border-b border-border bg-void">
        {/* Top Vignette Gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-void to-transparent z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="w-full"
        >
          <SolarSystem
            className="w-full h-[70vh] min-h-[460px]"
            highlightedPlanets={["Earth", "Mars"]}
          />
        </motion.div>

        {/* Bottom Vignette Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-void to-transparent z-10 pointer-events-none" />

        {/* Interactive Controls Telemetry Hint */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div className="px-4 py-1.5 rounded-xs border border-border bg-surface/90 backdrop-blur-md flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
            <span className="font-mono text-[0.65rem] tracking-widest uppercase text-text-secondary whitespace-nowrap">
              Drag to rotate · Scroll to zoom · Revolution synchronized
            </span>
          </div>
        </motion.div>
      </section>

      {/* ─── Mission Logic & Parameters Section ─── */}
      <section className="px-6 py-24 border-b border-border bg-surface/30">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-80px" }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-amber inline-block" />
              <span className="text-label">Mission Architecture</span>
            </div>
            <h2 className="font-mono text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
              Walking directions for the solar system.
            </h2>
            <p className="text-text-tertiary font-mono text-xs sm:text-sm mt-2">
              Because spacecraft are overrated.
            </p>
          </motion.div>

          {/* 3-Column Mission Logic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MissionCard
              index="01"
              title="Real Orbital Physics"
              description="Calculations utilize true astronomical orbital radii and semi-major axes based on a baseline walking velocity of 5.0 km/h."
              tag="ASTRODYNAMICS"
            />
            <MissionCard
              index="02"
              title="Continuous Locomotion"
              description="Assumes continuous 24/7 locomotion with zero rest stops. Sleep, meals, and fatigue are strictly outside mission parameters."
              tag="ENDURANCE"
            />
            <MissionCard
              index="03"
              title="Morale Adaptations"
              description="Gravitational anomalies, vacuum pressure, solar radiation, and lack of oxygen are disregarded for walker morale."
              tag="SIMULATION"
            />
          </div>
        </div>
      </section>

      {/* ─── Featured Trail Breakdown Section ─── */}
      <section className="px-6 py-24 bg-void">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-80px" }}
            className="border border-border rounded-xs bg-surface/60 p-8 sm:p-10 hud-corner-tl hud-corner-tr relative"
          >
            {/* Header Tag */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
              <div>
                <span className="text-label text-amber">FEATURED INTERPLANETARY ROUTE</span>
                <h3 className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-text-primary mt-1">
                  EARTH (1.00 AU) → MARS (1.52 AU)
                </h3>
              </div>
              <Badge variant="accent">
                PRIMARY TEST CORRIDOR
              </Badge>
            </div>

            {/* Route Timeline Indicator */}
            <div className="flex items-center gap-3 mb-10 p-4 rounded-xs border border-border bg-void/50 font-mono text-xs">
              <span className="w-3 h-3 rounded-full bg-[#4a7ab5] flex-shrink-0" />
              <span className="text-text-primary font-medium">Earth Base</span>
              <div className="flex-1 border-t border-dashed border-border-strong px-2 text-center text-text-tertiary text-[0.65rem] tracking-widest uppercase">
                5,136 Years Continuous Stride
              </div>
              <span className="text-text-primary font-medium">Mars Arrival</span>
              <span className="w-3 h-3 rounded-full bg-[#c4634a] flex-shrink-0" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <DataCell
                label="Mean Distance"
                value={formatDistance(EXAMPLE_JOURNEY.distanceKm)}
                detail="Direct orbital line"
              />
              <DataCell
                label="Walking Duration"
                value={formatWalkingTime(EXAMPLE_JOURNEY.distanceKm)}
                detail="At constant 5 km/h"
                accent
              />
              <DataCell
                label="Hydration Needed"
                value="3.7 × 10⁹ L"
                detail="Standard intake"
              />
              <DataCell
                label="Oxygen Requirement"
                value="Not Included"
                detail="Pack a lunch"
              />
            </div>

            {/* Dry Humor Footnote */}
            <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[0.65rem] text-text-tertiary uppercase tracking-wider">
              <p>
                * Assumes continuous walking · No rest stops · Gravitational variations disregarded for morale
              </p>
              <span className="text-amber/80 whitespace-nowrap">
                [ VERIFIED BY COSMICWALK ENGINE ]
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border px-6 py-10 bg-surface/20 font-mono">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber" />
            <span className="text-xs font-semibold tracking-widest uppercase text-text-primary">
              CosmicWalk
            </span>
            <span className="text-text-tertiary text-xs border-l border-border pl-3">
              v0.1.0
            </span>
          </div>

          <p className="text-[0.6875rem] tracking-wider uppercase text-text-tertiary text-center sm:text-right">
            A scientifically unnecessary service ·{" "}
            <a
              href="https://tinkerhub.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-amber transition-colors underline underline-offset-4"
            >
              TinkerHub Useless Projects
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-Components ─── */

function TelemetryCard({
  label,
  value,
  tag,
  accent = false,
}: {
  label: string;
  value: string;
  tag: string;
  accent?: boolean;
}) {
  return (
    <div className="p-4 rounded-xs border border-border bg-surface/40 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2 font-mono text-[0.6rem] text-text-tertiary tracking-widest">
        <span>{tag}</span>
        <span className="w-1 h-1 bg-border-strong rounded-full" />
      </div>
      <p className="text-label mb-1">{label}</p>
      <p className={`font-mono text-base sm:text-lg font-semibold tracking-tight ${accent ? "text-amber" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}

function MissionCard({
  index,
  title,
  description,
  tag,
}: {
  index: string;
  title: string;
  description: string;
  tag: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-60px" }}
      className="p-6 rounded-xs border border-border bg-surface/40 hover:border-amber/40 transition-colors flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between font-mono text-xs text-amber mb-4">
          <span>{index} // {tag}</span>
          <span className="w-1.5 h-1.5 bg-amber/40 rounded-full" />
        </div>
        <h3 className="font-mono text-lg font-semibold text-text-primary mb-3">
          {title}
        </h3>
        <p className="text-text-secondary text-xs leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function DataCell({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-label mb-1">{label}</p>
      <p className={`font-mono text-lg sm:text-xl font-bold tracking-tight ${accent ? "text-amber" : "text-text-primary"}`}>
        {value}
      </p>
      {detail && (
        <p className="font-mono text-[0.6rem] text-text-tertiary uppercase tracking-wider mt-0.5">
          {detail}
        </p>
      )}
    </div>
  );
}

