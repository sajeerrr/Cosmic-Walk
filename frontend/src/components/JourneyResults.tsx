import { motion } from "motion/react";
import type { TripCalculationResult } from "../types/trip";
import Badge from "./Badge";
import Button from "./Button";
import SolarSystem from "./solar-system/SolarSystem";
import { formatDistance } from "../data/planets";

interface JourneyResultsProps {
  data: TripCalculationResult;
  onModifyParams: () => void;
}

export default function JourneyResults({ data, onModifyParams }: JourneyResultsProps) {
  const downloadJsonManifest = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CosmicWalk_Manifest_${data.tripId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12 select-none">
      {/* ─── Mission Report Header & Top Telemetry Bar ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-6 sm:p-8 rounded-xs border border-border bg-surface/60 hud-corner-tl hud-corner-tr relative space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Badge variant="accent">[ MISSION MANIFEST: {data.tripId} ]</Badge>
              <Badge variant="success">STATUS: CALCULATION_COMPLETE</Badge>
              <Badge variant="default">MODE: {data.transportMode}</Badge>
            </div>
            <h1 className="font-mono text-2xl sm:text-4xl font-bold tracking-tight text-text-primary">
              {data.origin} → {data.destination}
            </h1>
            <p className="text-text-tertiary font-mono text-xs sm:text-sm mt-1">
              Passenger: <span className="text-text-secondary font-semibold">{data.passenger.name}</span> ({data.passenger.age} yrs, {data.passenger.heightCm}cm, {data.passenger.weightKg}kg)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={onModifyParams}>
              ← Edit Parameters
            </Button>
            <Button size="sm" onClick={downloadJsonManifest}>
              Export Payload (.json)
            </Button>
          </div>
        </div>

        {/* ─── Hero Key Metrics Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCell label="Total Distance" value={formatDistance(data.metrics.distanceKm)} tag="01.DIST" />
          <MetricCell label="Estimated Steps" value={`${(data.metrics.estimatedSteps / 1_000_000).toFixed(1)}M`} detail={`${data.metrics.estimatedSteps.toLocaleString()} steps`} tag="02.STEPS" />
          <MetricCell label="Walking Duration" value={`${data.metrics.walkingDurationYears} Yrs`} detail={`${data.metrics.walkingDurationDays.toLocaleString()} Days`} tag="03.TIME" accent />
          <MetricCell label="Daily Pace" value={`${(data.metrics.dailySteps / 1000).toFixed(0)}k`} detail="Steps per 24h" tag="04.PACE" />
          <MetricCell label="Difficulty" value={data.metrics.difficulty} tag="05.DIFF" danger={data.metrics.difficulty === "Existential"} />
          <MetricCell label="Survival Probability" value={`${data.metrics.survivalProbabilityPercent}%`} detail="Vacuum adjusted" tag="06.SURVIVAL" />
        </div>
      </motion.div>

      {/* ─── 3D Mission Trajectory Map Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="border border-border rounded-xs bg-void overflow-hidden relative shadow-2xl"
      >
        <div className="absolute top-4 left-6 z-20 pointer-events-none font-mono text-[0.65rem] tracking-widest text-text-tertiary flex items-center gap-2 bg-void/80 backdrop-blur-md px-3 py-1.5 border border-border rounded-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
          <span>CELESTIAL TRAJECTORY VECTOR // {data.origin} ──► {data.destination}</span>
        </div>

        <SolarSystem
          className="w-full h-[450px]"
          highlightedPlanets={[data.origin, data.destination]}
          originName={data.origin}
          destinationName={data.destination}
          showTrajectory={true}
        />
      </motion.div>

      {/* ─── Resource Dashboard Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="p-6 sm:p-8 rounded-xs border border-border bg-surface/40 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber inline-block" />
            <h2 className="font-mono text-xl font-bold tracking-tight text-text-primary">
              RESOURCE CONSUMPTION DASHBOARD
            </h2>
          </div>
          <Badge variant="accent">[ LOGISTICAL REQUIREMENTS ]</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ResourceCard
            icon="👟"
            label="Shoes Required"
            value={`${data.resources.shoesRequiredPairs.toLocaleString()} Pairs`}
            subtext="Based on 1.5M steps per sole abrasion limit."
            progressPercent={Math.min(100, (data.resources.shoesRequiredPairs / 200000) * 100)}
          />
          <ResourceCard
            icon="🥫"
            label="Food Calories"
            value={`${(data.resources.foodKcalTotal / 1_000_000_000).toFixed(2)}B kcal`}
            subtext={`2,500 kcal/day × ${data.metrics.walkingDurationDays.toLocaleString()} days.`}
            progressPercent={85}
          />
          <ResourceCard
            icon="💧"
            label="Water Required"
            value={`${(data.resources.waterLitersTotal / 1_000_000).toFixed(2)}M Liters`}
            subtext="3.5 Liters daily hydration allocation."
            progressPercent={70}
          />
          <ResourceCard
            icon="🦺"
            label="Oxygen Tanks"
            value={`${(data.resources.oxygenTanksTotal / 1_000_000).toFixed(2)}M Tanks`}
            subtext="Standard pressurized breathable O₂ tanks."
            progressPercent={92}
          />
          <ResourceCard
            icon="🏋️"
            label="Equipment Mass"
            value={`${data.resources.equipmentWeightKg} kg`}
            subtext="Pressurized suit, repair tools, supplies."
            progressPercent={45}
          />
          <ResourceCard
            icon="📦"
            label="Emergency Packs"
            value={`${data.resources.emergencyPacks.toLocaleString()} Packs`}
            subtext="First aid, hull patches, radio beacons."
            progressPercent={60}
          />
        </div>
      </motion.div>

      {/* ─── Visual Journey Timeline Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="p-6 sm:p-8 rounded-xs border border-border bg-surface/40 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber inline-block" />
            <h2 className="font-mono text-xl font-bold tracking-tight text-text-primary">
              MISSION TIMELINE & EPOCH MILESTONES
            </h2>
          </div>
          <Badge variant="default">DURATION: {data.metrics.walkingDurationYears} YEARS</Badge>
        </div>

        {/* Milestone Node Pipeline */}
        <div className="space-y-4 pt-2">
          {data.timeline.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 font-mono text-xs p-4 rounded-xs border border-border bg-void/40">
              <div className="w-12 text-amber font-bold text-sm shrink-0 pt-0.5">
                {item.percentage}%
              </div>
              <div className="w-28 text-text-tertiary shrink-0 pt-0.5">
                {item.elapsedYears === 0 ? "Year 0" : `+${item.elapsedYears} Yrs`}
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-text-primary font-semibold tracking-wide">
                  {item.label}
                </div>
                <div className="text-text-secondary text-[0.75rem] leading-relaxed">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── AI Generated Mission Report Card Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="p-6 sm:p-8 rounded-xs border border-amber/40 bg-amber/[0.03] space-y-6 hud-corner-tl"
      >
        <div className="flex items-center justify-between border-b border-amber/30 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber inline-block animate-pulse" />
            <h2 className="font-mono text-xl font-bold tracking-tight text-amber">
              AI-GENERATED MISSION REPORT
            </h2>
          </div>
          <Badge variant="accent">[ ENGINE COMPUTED ]</Badge>
        </div>

        <div className="space-y-6 font-mono text-xs">
          {/* Mission Summary */}
          <div>
            <span className="text-label block text-amber mb-1.5">Mission Summary</span>
            <p className="text-text-primary text-sm leading-relaxed font-light">
              {data.aiReport.missionSummary}
            </p>
          </div>

          {/* Major Challenges */}
          <div>
            <span className="text-label block text-amber mb-2">Major Astrodynamic Challenges</span>
            <ul className="space-y-1.5 text-text-secondary list-disc list-inside pl-1">
              {data.aiReport.majorChallenges.map((c, i) => (
                <li key={i} className="leading-relaxed">{c}</li>
              ))}
            </ul>
          </div>

          {/* Personalized Recommendations */}
          <div>
            <span className="text-label block text-amber mb-2">Personalized Recommendations</span>
            <ul className="space-y-1.5 text-text-secondary list-disc list-inside pl-1">
              {data.aiReport.personalizedRecommendations.map((r, i) => (
                <li key={i} className="leading-relaxed">{r}</li>
              ))}
            </ul>
          </div>

          {/* Humorous Observations */}
          <div>
            <span className="text-label block text-amber mb-2">Humorous Mission Observations</span>
            <ul className="space-y-1.5 text-text-tertiary list-disc list-inside pl-1 italic">
              {data.aiReport.humorousObservations.map((h, i) => (
                <li key={i} className="leading-relaxed">{h}</li>
              ))}
            </ul>
          </div>

          {/* Final Travel Verdict */}
          <div className="pt-4 border-t border-amber/20">
            <span className="text-label block text-amber mb-1">Final Travel Verdict</span>
            <div className="p-4 rounded-xs border border-amber/50 bg-amber/10 font-bold text-amber text-sm tracking-wide">
              {data.aiReport.finalVerdict}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Bottom Actions ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 font-mono">
        <Button variant="outline" onClick={onModifyParams}>
          ← Modify Parameters & Re-Calculate
        </Button>
        <Button onClick={downloadJsonManifest}>
          Export Full API Result (.json)
        </Button>
      </div>
    </div>
  );
}

/* ─── Sub-Components ─── */

function MetricCell({
  label,
  value,
  detail,
  tag,
  accent = false,
  danger = false,
}: {
  label: string;
  value: string;
  detail?: string;
  tag: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="p-3.5 rounded-xs border border-border bg-void/50 flex flex-col justify-between font-mono">
      <div className="text-[0.6rem] text-text-tertiary tracking-widest mb-1">{tag}</div>
      <div className="text-label text-[0.65rem] mb-1">{label}</div>
      <div
        className={`text-base sm:text-lg font-bold tracking-tight ${
          danger ? "text-danger" : accent ? "text-amber" : "text-text-primary"
        }`}
      >
        {value}
      </div>
      {detail && <div className="text-[0.6rem] text-text-tertiary mt-0.5">{detail}</div>}
    </div>
  );
}

function ResourceCard({
  icon,
  label,
  value,
  subtext,
  progressPercent,
}: {
  icon: string;
  label: string;
  value: string;
  subtext: string;
  progressPercent: number;
}) {
  return (
    <div className="p-4 rounded-xs border border-border bg-void/40 font-mono space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-label text-[0.6rem]">{label}</span>
      </div>
      <div>
        <div className="text-lg font-bold text-text-primary tracking-tight">{value}</div>
        <div className="text-[0.65rem] text-text-tertiary mt-0.5">{subtext}</div>
      </div>
      <div className="w-full h-1 bg-surface rounded-xs overflow-hidden border border-border">
        <div className="h-full bg-amber" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}
