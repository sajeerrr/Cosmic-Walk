import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Sun from "./Sun";
import Planet from "./Planet";
import OrbitRing from "./OrbitRing";
import Starfield from "./Starfield";
import { PLANETS } from "../../data/planets";

interface SolarSystemProps {
  className?: string;
  highlightedPlanets?: string[];
}

export default function SolarSystem({
  className = "",
  highlightedPlanets = [],
}: SolarSystemProps) {
  return (
    <div className={`canvas-container ${className}`}>
      <Canvas
        camera={{
          position: [18, 14, 18],
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
          {/* Ambient light for minimum visibility */}
          <ambientLight intensity={0.08} color="#334466" />

          {/* Sun */}
          <Sun />

          {/* Planets with orbits */}
          {PLANETS.map((planet) => (
            <group key={planet.name}>
              <OrbitRing
                radius={planet.orbitRadius}
                opacity={highlightedPlanets.includes(planet.name) ? 0.15 : 0.05}
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
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            minDistance={8}
            maxDistance={50}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={0.2}
            autoRotate
            autoRotateSpeed={0.15}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
