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

  return (
    <div className="min-h-screen bg-void">
      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-12 px-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Status line */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3 mb-10"
          >
            <Badge variant="success">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              System Operational
            </Badge>
            <Badge>
              Walking Speed: 5 km/h
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-mono text-[clamp(2.5rem,6vw,5rem)] font-semibold tracking-tight leading-[1.05] text-text-primary mb-4">
              COSMIC
              <span className="text-amber">WALK</span>
            </h1>
            <p className="font-mono text-sm tracking-[0.08em] uppercase text-text-secondary mb-2">
              Interplanetary Walking Route Planner
            </p>
            <p className="text-text-tertiary text-sm max-w-md leading-relaxed">
              Because spacecraft are overrated.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center gap-4"
          >
            <Button size="lg" onClick={() => navigate("/plan")}>
              Plan a Journey
              <span className="text-void/60">→</span>
            </Button>
            <span className="text-text-tertiary text-xs font-mono">
              No spacecraft required
            </span>
          </motion.div>
        </div>
      </section>

      {/* ─── Solar System Visualization ─── */}
      <section className="relative">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-void to-transparent z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.4 }}
          className="w-full"
        >
          <SolarSystem
            className="w-full h-[65vh] min-h-[400px]"
            highlightedPlanets={["Earth", "Mars"]}
          />
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-void to-transparent z-10 pointer-events-none" />

        {/* Controls hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <span className="font-mono text-[0.6rem] tracking-widest uppercase text-text-tertiary">
            Drag to rotate · Scroll to zoom
          </span>
        </motion.div>
      </section>

      {/* ─── Concept + Example Journey ─── */}
      <section className="px-6 py-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <p className="text-label mb-6">What is this</p>
              <h2 className="text-2xl font-medium text-text-primary mb-6 leading-snug">
                Walking directions for the solar system.
              </h2>
              <div className="space-y-4 text-text-secondary text-sm leading-relaxed">
                <p>
                  CosmicWalk calculates precise walking routes between planets,
                  moons, and other celestial bodies. Select your origin, choose
                  your destination, and receive a detailed travel plan.
                </p>
                <p>
                  All calculations use real astronomical distances and a
                  standard walking speed of 5 km/h. We assume flat terrain,
                  no atmosphere, and an extremely patient walker.
                </p>
                <p className="text-text-tertiary text-xs font-mono">
                  The calculations are scientifically accurate.
                  The premise is not.
                </p>
              </div>
            </motion.div>

            {/* Example Journey Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <p className="text-label mb-6">Example Journey</p>

              <div className="border border-border rounded-sm bg-surface p-6">
                {/* Route header */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4a7ab5]" />
                  <span className="font-mono text-sm font-medium text-text-primary tracking-wide">
                    {EXAMPLE_JOURNEY.from}
                  </span>
                  <div className="flex-1 border-t border-dashed border-border-strong" />
                  <span className="font-mono text-xs text-text-tertiary">
                    walking
                  </span>
                  <div className="flex-1 border-t border-dashed border-border-strong" />
                  <span className="font-mono text-sm font-medium text-text-primary tracking-wide">
                    {EXAMPLE_JOURNEY.to}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c4634a]" />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  <DataCell
                    label="Distance"
                    value={formatDistance(EXAMPLE_JOURNEY.distanceKm)}
                  />
                  <DataCell
                    label="Walking Time"
                    value={formatWalkingTime(EXAMPLE_JOURNEY.distanceKm)}
                    accent
                  />
                  <DataCell
                    label="Footwear"
                    value="Durable"
                  />
                </div>

                {/* Footer note */}
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="font-mono text-[0.6rem] tracking-wider uppercase text-text-tertiary leading-relaxed">
                    Assumes continuous walking · No rest stops · Lunch not included · 
                    Gravitational variations disregarded for morale
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber" />
            <span className="font-mono text-xs tracking-wider uppercase text-text-tertiary">
              CosmicWalk
            </span>
          </div>
          <p className="font-mono text-[0.6rem] tracking-wider uppercase text-text-tertiary">
            A scientifically unnecessary service ·{" "}
            <a
              href="https://tinkerhub.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-amber transition-colors"
            >
              TinkerHub Useless Projects
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Data Cell sub-component ─── */
function DataCell({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-label mb-1.5">{label}</p>
      <p
        className={`font-mono text-lg font-medium tracking-tight ${
          accent ? "text-amber" : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
