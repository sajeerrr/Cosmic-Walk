import { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Sun from "./Sun";
import Planet from "./Planet";
import OrbitRing from "./OrbitRing";
import Starfield from "./Starfield";
import { PLANETS } from "../../data/planets";

interface SolarSystemProps {
  className?: string;
  highlightedPlanets?: string[];
}

function CameraIntro({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree();
  const startTime = useRef<number | null>(null);
  const DURATION = 2.4; // seconds for smooth intro

  const startPos = useMemo(() => new THREE.Vector3(7, 4, 9), []);
  const endPos = useMemo(() => new THREE.Vector3(18, 14, 18), []);

  useFrame((state) => {
    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime;
    }
    const elapsed = state.clock.elapsedTime - startTime.current;
    const progress = Math.min(1, elapsed / DURATION);

    // Smoothstep easing: t^2 * (3 - 2t)
    const ease = progress * progress * (3 - 2 * progress);

    camera.position.lerpVectors(startPos, endPos, ease);
    camera.lookAt(0, 0, 0);

    if (progress >= 1) {
      onComplete();
    }
  });

  return null;
}

export default function SolarSystem({
  className = "",
  highlightedPlanets = [],
}: SolarSystemProps) {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <div className={`canvas-container relative ${className}`}>
      {/* HUD Telemetry Top Bar */}
      <div className="absolute top-4 left-6 right-6 z-20 pointer-events-none flex items-center justify-between font-mono text-[0.65rem] tracking-widest text-text-tertiary">
        <div className="flex items-center gap-2 bg-void/80 backdrop-blur-md px-3 py-1 border border-border rounded-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
          <span className="text-text-secondary">ORBITAL MAP // HELIOCENTRIC</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 bg-void/80 backdrop-blur-md px-3 py-1 border border-border rounded-xs">
          <span>SCALE: 1:1.496×10⁸ KM</span>
          <span className="text-border-strong">|</span>
          <span>VELOCITY BASELINE: 5 KM/H</span>
        </div>
      </div>

      <Canvas
        camera={{
          position: [7, 4, 9],
          fov: 45,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {!introFinished && (
            <CameraIntro onComplete={() => setIntroFinished(true)} />
          )}

          {/* Ambient light for minimum visibility */}
          <ambientLight intensity={0.12} color="#334466" />

          {/* Sun */}
          <Sun />

          {/* Planets with orbits */}
          {PLANETS.map((planet) => (
            <group key={planet.name}>
              <OrbitRing
                radius={planet.orbitRadius}
                opacity={highlightedPlanets.includes(planet.name) ? 0.25 : 0.07}
              />
              <Planet
                data={planet}
                highlighted={highlightedPlanets.includes(planet.name)}
              />
            </group>
          ))}

          {/* Starfield */}
          <Starfield />

          {/* Controls */}
          <OrbitControls
            enabled={introFinished}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            minDistance={8}
            maxDistance={50}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={0.15}
            autoRotate={introFinished}
            autoRotateSpeed={0.18}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

