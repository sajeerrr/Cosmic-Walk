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

  return (
    <group ref={groupRef}>
      {/* Planet sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[data.radius, 24, 24]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.emissive || "#000000"}
          emissiveIntensity={0.3}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Highlight ring */}
      {highlighted && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.radius + 0.15, data.radius + 0.2, 32]} />
          <meshBasicMaterial
            color="#d4a853"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Saturn's ring */}
      {data.name === "Saturn" && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[data.radius + 0.2, data.radius + 0.6, 48]} />
          <meshBasicMaterial
            color="#c8b888"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label */}
      {showLabel && (
        <Html
          position={[0, data.radius + 0.4, 0]}
          center
          distanceFactor={15}
          style={{ pointerEvents: "none" }}
        >
          <div
            className="font-mono text-[10px] tracking-[0.12em] uppercase whitespace-nowrap select-none"
            style={{
              color: highlighted ? "#d4a853" : "rgba(232, 230, 225, 0.5)",
              textShadow: "0 0 8px rgba(0,0,0,0.8)",
            }}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
}
