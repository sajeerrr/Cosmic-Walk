import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface LoadingScreenProps {
  mode?: "initial" | "calculation";
  onComplete?: () => void;
  progress?: number;
  customStage?: string;
  isSimulated?: boolean;
  originName?: string;
  destinationName?: string;
  className?: string;
}

const INITIAL_MESSAGES = [
  "Initializing unnecessary mission-control systems...",
  "Calibrating planetary walking distances...",
  "Checking whether humans can walk through space...",
  "Consulting several highly unqualified scientists...",
  "Loading the possibility of walking to Pluto...",
  "Establishing communication with common sense...",
  "Common sense unavailable.",
  "System operational. Welcome to CosmicWalk.",
];

const CALCULATION_STAGES = [
  { stage: "STAGE 01/07", title: "Reading planetary parameters", log: "PARMS: Fetching orbital inclination & semi-major axes..." },
  { stage: "STAGE 02/07", title: "Acquiring orbital data", log: "ORBIT: Synchronizing heliocentric vector positions..." },
  { stage: "STAGE 03/07", title: "Estimating interplanetary distance", log: "DIST: Integrating line-of-sight distance across epochs..." },
  { stage: "STAGE 03.5", title: "Estimating number of shoes required", log: "HUMOR: Friction coefficient 0.85 — Sole wear exponential." },
  { stage: "STAGE 04/07", title: "Calculating walking trajectory", log: "TRAJ: Applying 5.0 km/h constant stride vector..." },
  { stage: "STAGE 04.5", title: "Checking whether the passenger has legs", log: "HUMOR: Biological locomotion capability verified." },
  { stage: "STAGE 05/07", title: "Estimating resource consumption", log: "GEAR: Caloric baseline: 2,500 kcal/day × 5,000+ years." },
  { stage: "STAGE 06/07", title: "Evaluating survival probability", log: "PROB: Radiative & vacuum survival index: 0.00001%." },
  { stage: "STAGE 06.5", title: "Calculating the consequences of this decision", log: "HUMOR: Irreversible existential realization in progress." },
  { stage: "STAGE 07/07", title: "Generating mission report", log: "REPORT: Mission itinerary payload prepared." },
];

export default function LoadingScreen({
  mode = "initial",
  onComplete,
  progress: externalProgress,
  customStage,
  isSimulated = true,
  originName = "Earth",
  destinationName = "Mars",
  className = "",
}: LoadingScreenProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const logContainerRef = useRef<HTMLDivElement>(null);

  const effectiveProgress = externalProgress !== undefined ? externalProgress : internalProgress;

  // Timer for Elapsed Time counter
  useEffect(() => {
    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      setElapsedTime((Date.now() - startTimeRef.current) / 1000);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Simulated progress controller
  useEffect(() => {
    if (!isSimulated || externalProgress !== undefined) return;

    if (mode === "initial") {
      // 4.0 seconds total sequence
      const totalDuration = 4000;
      const intervalMs = 50;
      const step = 100 / (totalDuration / intervalMs);

      const interval = setInterval(() => {
        setInternalProgress((prev) => {
          const next = prev + step;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 300);
            return 100;
          }
          return next;
        });
      }, intervalMs);

      return () => clearInterval(interval);
    } else {
      // Calculation mode sequence ~5.0 seconds
      const totalDuration = 5000;
      const intervalMs = 50;
      const step = 100 / (totalDuration / intervalMs);

      const interval = setInterval(() => {
        setInternalProgress((prev) => {
          const next = prev + step;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 400);
            return 100;
          }
          return next;
        });
      }, intervalMs);

      return () => clearInterval(interval);
    }
  }, [mode, isSimulated, externalProgress, onComplete]);

  // Update initial mode message based on progress
  useEffect(() => {
    if (mode === "initial") {
      const idx = Math.min(
        INITIAL_MESSAGES.length - 1,
        Math.floor((effectiveProgress / 100) * INITIAL_MESSAGES.length)
      );
      if (idx !== currentMessageIndex) {
        setCurrentMessageIndex(idx);
      }
    }
  }, [mode, effectiveProgress, currentMessageIndex]);

  // Update calculation mode log & stages based on progress
  useEffect(() => {
    if (mode === "calculation") {
      const stageIdx = Math.min(
        CALCULATION_STAGES.length - 1,
        Math.floor((effectiveProgress / 100) * CALCULATION_STAGES.length)
      );

      const currentStageObj = CALCULATION_STAGES[stageIdx];
      const timeStamp = elapsedTime.toFixed(2).padStart(5, "0");
      const logEntry = `[${timeStamp}s] ${currentStageObj.log}`;

      setLogs((prevLogs) => {
        if (prevLogs.length === 0 || prevLogs[prevLogs.length - 1] !== logEntry) {
          return [...prevLogs.slice(-6), logEntry];
        }
        return prevLogs;
      });
    }
  }, [mode, effectiveProgress, elapsedTime]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const activeStage = mode === "calculation"
    ? customStage || CALCULATION_STAGES[Math.min(CALCULATION_STAGES.length - 1, Math.floor((effectiveProgress / 100) * CALCULATION_STAGES.length))].title
    : INITIAL_MESSAGES[currentMessageIndex];

  const stageTag = mode === "calculation"
    ? CALCULATION_STAGES[Math.min(CALCULATION_STAGES.length - 1, Math.floor((effectiveProgress / 100) * CALCULATION_STAGES.length))].stage
    : "INITIALIZATION";

  return (
    <div
      className={`fixed inset-0 z-50 bg-void text-text-primary flex flex-col items-center justify-between p-6 sm:p-12 select-none overflow-hidden bg-grid ${className}`}
    >
      {/* ─── Top Telemetry Header ─── */}
      <div className="w-full max-w-4xl flex items-center justify-between font-mono text-[0.65rem] sm:text-xs tracking-widest text-text-tertiary">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber animate-ping" />
          <span className="text-text-secondary font-semibold uppercase">
            COSMICWALK // {mode === "initial" ? "SYSTEM_INIT" : "JOURNEY_COMPUTE"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline border-r border-border pr-4">
            LATENCY: 14MS
          </span>
          <span className="text-amber">
            T+{elapsedTime.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* ─── Center Astronomical Orbital Graphic & Message ─── */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full text-center my-8">
        {/* Animated Astronomical SVG Visualization */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-8 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Outer orbit */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Inner orbit */}
            <circle
              cx="100"
              cy="100"
              r="55"
              fill="none"
              stroke="rgba(212, 168, 83, 0.2)"
              strokeWidth="1.5"
            />
            {/* Core Sun */}
            <circle cx="100" cy="100" r="8" fill="#d4a853" className="animate-pulse" />
            <circle cx="100" cy="100" r="14" fill="rgba(212, 168, 83, 0.15)" />

            {/* Orbiting Planet 1 (Inner Orbit) */}
            <g className="origin-[100px_100px] animate-[spin_6s_linear_infinite]">
              <circle cx="155" cy="100" r="4.5" fill="#4a7ab5" />
              {/* Radial connector line in calculation mode */}
              {mode === "calculation" && (
                <line x1="100" y1="100" x2="155" y2="100" stroke="rgba(74, 122, 181, 0.3)" strokeWidth="1" strokeDasharray="2 2" />
              )}
            </g>

            {/* Orbiting Planet 2 (Outer Orbit) */}
            <g className="origin-[100px_100px] animate-[spin_12s_linear_infinite_reverse]">
              <circle cx="100" cy="185" r="3.5" fill="#c4634a" />
            </g>
          </svg>

          {/* Center Progress HUD */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {Math.round(effectiveProgress).toString().padStart(3, "0")}
              <span className="text-amber text-lg sm:text-xl font-normal">%</span>
            </span>
            <span className="font-mono text-[0.6rem] tracking-widest text-text-tertiary uppercase mt-1">
              {mode === "calculation" ? `${originName} → ${destinationName}` : "COMPUTING"}
            </span>
          </div>
        </div>

        {/* Dynamic Status Title */}
        <div className="h-16 flex flex-col items-center justify-center">
          <div className="font-mono text-[0.65rem] tracking-[0.2em] text-amber uppercase mb-2">
            {stageTag}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={activeStage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-sm sm:text-base font-medium tracking-wide text-text-primary leading-relaxed"
            >
              {activeStage}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Bottom Telemetry Logs & Progress Bar ─── */}
      <div className="w-full max-w-4xl flex flex-col gap-4 font-mono">
        {/* Scrolling Telemetry Log (for Calculation mode) */}
        {mode === "calculation" && (
          <div
            ref={logContainerRef}
            className="w-full h-20 bg-surface/60 border border-border rounded-xs p-3 overflow-y-auto space-y-1 text-[0.65rem] text-text-tertiary select-none"
          >
            {logs.map((log, i) => (
              <div
                key={i}
                className={`flex items-center justify-between ${
                  log.includes("HUMOR") ? "text-amber/90 font-medium" : "text-text-secondary"
                }`}
              >
                <span>{log}</span>
                <span className="w-1 h-1 rounded-full bg-amber/40" />
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar Container */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-[0.65rem] tracking-widest text-text-tertiary uppercase">
            <span>PROCEEDING WITH CALCULATION</span>
            <span>{Math.round(effectiveProgress)} / 100</span>
          </div>
          <div className="w-full h-1.5 bg-surface border border-border rounded-xs overflow-hidden relative">
            <motion.div
              className="h-full bg-amber shadow-[0_0_12px_rgba(212,168,83,0.5)]"
              style={{ width: `${effectiveProgress}%` }}
              transition={{ ease: "easeOut", duration: 0.1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
