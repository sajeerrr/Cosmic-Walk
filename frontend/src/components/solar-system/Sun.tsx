import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulsing
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      const glowScale = 1.6 + Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
      glowRef.current.scale.setScalar(glowScale);
    }
  });

  return (
    <group>
      {/* Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#ffd080"
          emissive="#ff9020"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Glow layer */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light from Sun */}
      <pointLight color="#ffeedd" intensity={3} distance={60} decay={0.8} />
      <pointLight color="#ff9944" intensity={1} distance={30} decay={1.2} />
    </group>
  );
}
