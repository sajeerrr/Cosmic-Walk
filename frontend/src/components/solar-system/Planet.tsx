import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetData } from "../../data/planets";

interface PlanetProps {
  data: PlanetData;
  showLabel?: boolean;
  highlighted?: boolean;
}

export default function Planet({
  data,
  showLabel = true,
  highlighted = false,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * data.orbitSpeed + data.orbitOffset;
      groupRef.current.position.x = Math.cos(t) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(t) * data.orbitRadius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const isEarth = data.name === "Earth";
  const isMars = data.name === "Mars";

  return (
    <group ref={groupRef}>
      {/* Planet sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[data.radius, 24, 24]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.emissive || "#000000"}
          emissiveIntensity={highlighted ? 0.5 : 0.2}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Target highlight pulse ring */}
      {highlighted && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.radius + 0.15, data.radius + 0.22, 32]} />
          <meshBasicMaterial
            color={isEarth ? "#4a7ab5" : isMars ? "#c4634a" : "#d4a853"}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Saturn's ring */}
      {data.name === "Saturn" && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[data.radius + 0.2, data.radius + 0.65, 48]} />
          <meshBasicMaterial
            color="#c8b888"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Tactical HUD Label */}
      {showLabel && (
        <Html
          position={[0, data.radius + 0.45, 0]}
          center
          distanceFactor={16}
          style={{ pointerEvents: "none" }}
        >
          {highlighted ? (
            <div className="flex flex-col items-center select-none pointer-events-none">
              <div
                className={`
                  px-2 py-0.5 rounded-xs font-mono text-[9px] tracking-widest uppercase font-semibold
                  border backdrop-blur-md shadow-lg flex items-center gap-1.5 whitespace-nowrap
                  ${
                    isEarth
                      ? "bg-[#4a7ab5]/20 text-[#a3c4f3] border-[#4a7ab5]/50 shadow-[#4a7ab5]/10"
                      : isMars
                      ? "bg-[#c4634a]/20 text-[#f8a995] border-[#c4634a]/50 shadow-[#c4634a]/10"
                      : "bg-amber/20 text-amber border-amber/50"
                  }
                `}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{isEarth ? "[ ORIGIN ]" : isMars ? "[ TARGET ]" : "[ WAYPOINT ]"}</span>
                <span>{data.name}</span>
              </div>
              <div className="w-px h-2 bg-current opacity-40 mt-0.5" />
            </div>
          ) : (
            <div className="font-mono text-[9px] tracking-[0.15em] uppercase whitespace-nowrap select-none text-text-tertiary/70 hover:text-text-secondary transition-colors">
              {data.name}
            </div>
          )}
        </Html>
      )}
    </group>
  );
}

