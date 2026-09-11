import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PLANETS } from "../../data/planets";

interface TrajectoryLineProps {
  originName: string;
  destinationName: string;
  animateCamera?: boolean;
}

export default function TrajectoryLine({
  originName,
  destinationName,
  animateCamera = true,
}: TrajectoryLineProps) {
  const { camera } = useThree();
  const travelerRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Line>(null);
  const cameraProgressRef = useRef(0);

  const originData = PLANETS.find((p) => p.name === originName) || PLANETS[2];
  const destData = PLANETS.find((p) => p.name === destinationName) || PLANETS[3];

  useFrame((state) => {
    const clock = state.clock.elapsedTime;

    // Calculate current positions of origin and destination planets
    const tOrig = clock * originData.orbitSpeed + originData.orbitOffset;
    const origX = Math.cos(tOrig) * originData.orbitRadius;
    const origZ = Math.sin(tOrig) * originData.orbitRadius;
    const origPos = new THREE.Vector3(origX, 0, origZ);

    const tDest = clock * destData.orbitSpeed + destData.orbitOffset;
    const destX = Math.cos(tDest) * destData.orbitRadius;
    const destZ = Math.sin(tDest) * destData.orbitRadius;
    const destPos = new THREE.Vector3(destX, 0, destZ);

    // Create 3D arc points with elevated midpoint
    const midPoint = new THREE.Vector3()
      .addVectors(origPos, destPos)
      .multiplyScalar(0.5);
    midPoint.y += 2.5; // elevated arc trajectory

    const curve = new THREE.QuadraticBezierCurve3(origPos, midPoint, destPos);
    const points = curve.getPoints(64);

    if (lineRef.current) {
      lineRef.current.geometry.setFromPoints(points);
    }

    // Traveler marker animation along the trajectory curve
    if (travelerRef.current) {
      const travelerProgress = (clock * 0.25) % 1; // 4 second loop
      const currentPos = curve.getPointAt(travelerProgress);
      travelerRef.current.position.copy(currentPos);
    }

    // Camera trajectory sweep animation on load
    if (animateCamera && cameraProgressRef.current < 1) {
      cameraProgressRef.current = Math.min(1, cameraProgressRef.current + 0.015);
      const ease = cameraProgressRef.current * cameraProgressRef.current * (3 - 2 * cameraProgressRef.current);
      const camTargetPos = curve.getPointAt(ease * 0.7);
      
      const camEyePos = new THREE.Vector3(
        camTargetPos.x + 6,
        camTargetPos.y + 6,
        camTargetPos.z + 6
      );
      camera.position.lerp(camEyePos, 0.08);
      camera.lookAt(camTargetPos);
    }
  });

  const initialGeometry = useMemo(() => new THREE.BufferGeometry(), []);

  return (
    <group>
      {/* Trajectory Arc Line */}
      <lineLoop ref={lineRef as any} geometry={initialGeometry}>
        <lineDashedMaterial
          color="#d4a853"
          dashSize={0.4}
          gapSize={0.2}
          transparent
          opacity={0.7}
        />
      </lineLoop>

      {/* Animated Traveler Marker */}
      <mesh ref={travelerRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
