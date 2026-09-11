import { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Sun from "./Sun";
import Planet from "./Planet";
import OrbitRing from "./OrbitRing";
import Starfield from "./Starfield";
import { PLANETS } from "../../data/planets";

import TrajectoryLine from "./TrajectoryLine";

interface SolarSystemProps {
  className?: string;
  highlightedPlanets?: string[];
  focusedPlanetName?: string;
  onSelectPlanet?: (name: string) => void;
  originName?: string;
  destinationName?: string;
  showTrajectory?: boolean;
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

function CameraFocusController({ focusedPlanetName }: { focusedPlanetName?: string }) {
  const { camera } = useThree();
  const prevFocused = useRef<string | undefined>(undefined);
  const targetVec = useRef<THREE.Vector3 | null>(null);

  useFrame((state) => {
    if (!focusedPlanetName) return;
    const planetData = PLANETS.find((p) => p.name === focusedPlanetName);
    if (!planetData) return;

    const t = state.clock.elapsedTime * planetData.orbitSpeed + planetData.orbitOffset;
    const px = Math.cos(t) * planetData.orbitRadius;
    const pz = Math.sin(t) * planetData.orbitRadius;
    const planetPos = new THREE.Vector3(px, 0, pz);

    if (prevFocused.current !== focusedPlanetName) {
      prevFocused.current = focusedPlanetName;
      targetVec.current = new THREE.Vector3(px + 4, 3, pz + 4);
    }

    if (targetVec.current) {
      camera.position.lerp(targetVec.current, 0.05);
      camera.lookAt(planetPos);
    }
  });

  return null;
}

export default function SolarSystem({
  className = "",
  highlightedPlanets = [],
  focusedPlanetName,
  onSelectPlanet,
  originName,
  destinationName,
  showTrajectory = false,
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

          {introFinished && focusedPlanetName && (
            <CameraFocusController focusedPlanetName={focusedPlanetName} />
          )}

          {/* Ambient light for minimum visibility */}
          <ambientLight intensity={0.12} color="#334466" />

          {/* Sun */}
          <Sun />

          {/* Planets with orbits */}
          {PLANETS.map((planet) => {
            const isHighlighted = highlightedPlanets.includes(planet.name) || planet.name === focusedPlanetName;
            let roleTag: string | undefined = undefined;
            if (planet.name === originName) roleTag = "[ ORIGIN ]";
            else if (planet.name === destinationName) roleTag = "[ DESTINATION ]";

            return (
              <group key={planet.name}>
                <OrbitRing
                  radius={planet.orbitRadius}
                  opacity={isHighlighted ? 0.25 : 0.07}
                />
                <Planet
                  data={planet}
                  highlighted={isHighlighted}
                  roleTag={roleTag}
                  onSelect={onSelectPlanet}
                />
              </group>
            );
          })}

          {/* Trajectory Vector Line */}
          {showTrajectory && originName && destinationName && (
            <TrajectoryLine originName={originName} destinationName={destinationName} />
          )}

          {/* Starfield */}
          <Starfield />

          {/* Controls */}
          <OrbitControls
            enabled={introFinished && !focusedPlanetName}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            minDistance={8}
            maxDistance={50}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={0.15}
            autoRotate={introFinished && !focusedPlanetName}
            autoRotateSpeed={0.18}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}


