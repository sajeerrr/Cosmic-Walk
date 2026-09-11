import { Link } from "react-router";
import { motion } from "motion/react";
import Badge from "../components/Badge";

export default function PlanJourney() {
  return (
    <div className="min-h-screen bg-void pt-28 px-6">
      <div className="max-w-[800px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="warning" className="mb-6">
            Under Construction
          </Badge>

          <h1 className="font-mono text-3xl font-semibold tracking-tight text-text-primary mb-4">
            Journey Planner
          </h1>

          <p className="text-text-secondary text-sm max-w-md mx-auto mb-8 leading-relaxed">
            The interplanetary route calculation engine is being calibrated.
            Please check back shortly. Your patience is appreciated —
            you&apos;ll need a lot of it for the actual walk anyway.
          </p>

          <Link
            to="/"
            className="font-mono text-xs tracking-wider uppercase text-amber hover:text-amber-dim transition-colors no-underline"
          >
            ← Return to Mission Control
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
