import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import LoadingScreen from "../components/LoadingScreen";

export default function PlanJourney() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [targetRoute, setTargetRoute] = useState({ origin: "Earth", destination: "Mars" });
  const [calculationResult, setCalculationResult] = useState<string | null>(null);

  const startSimulation = (origin: string, destination: string) => {
    setTargetRoute({ origin, destination });
    setCalculationResult(null);
    setIsCalculating(true);
  };

  return (
    <div className="min-h-screen bg-void pt-28 px-6 pb-16 bg-radial-gradient">
      {isCalculating && (
        <LoadingScreen
          mode="calculation"
          originName={targetRoute.origin}
          destinationName={targetRoute.destination}
          onComplete={() => {
            setIsCalculating(false);
            setCalculationResult(`Calculation complete for ${targetRoute.origin} → ${targetRoute.destination}. Estimated walking time: 5,136 years.`);
          }}
        />
      )}

      <div className="max-w-[800px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="accent" className="mb-6">
            [ SIMULATION ENVIRONMENT ]
          </Badge>

          <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-4">
            Interplanetary Journey Planner
          </h1>

          <p className="text-text-secondary text-sm max-w-lg mx-auto mb-8 leading-relaxed">
            The calculation engine performs real-time orbital trajectory integration for human locomotion at 5.0 km/h baseline velocity.
          </p>

          {/* Interactive Calculation Trigger Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button
              size="lg"
              onClick={() => startSimulation("Earth", "Mars")}
            >
              Simulate Earth → Mars Computation
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => startSimulation("Earth", "Pluto")}
            >
              Simulate Earth → Pluto Computation
            </Button>
          </div>

          {/* Result Output Box */}
          {calculationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 border border-amber/40 bg-amber/[0.05] rounded-xs mb-8 text-left font-mono text-xs text-text-primary"
            >
              <div className="text-amber font-semibold mb-2">
                [ CALCULATION ENGINE RESPONSE ]
              </div>
              <p className="leading-relaxed">{calculationResult}</p>
              <p className="text-text-tertiary text-[0.65rem] mt-3 uppercase tracking-wider">
                Note: Oxygen and footwear not provided.
              </p>
            </motion.div>
          )}

          <div className="pt-6 border-t border-border">
            <Link
              to="/"
              className="font-mono text-xs tracking-wider uppercase text-text-tertiary hover:text-amber transition-colors no-underline inline-flex items-center gap-2"
            >
              ← Return to Mission Control
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

