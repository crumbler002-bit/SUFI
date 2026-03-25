"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useSufiStore } from "@/lib/state/sufiStore";

function EnergyField() {
  const meshRef = useRef<THREE.Points>(null);
  const systemStatus = useSufiStore((s) => s.systemStatus);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const speed = systemStatus === "searching" ? 0.15 : systemStatus === "updating" ? 0.1 : 0.05;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * speed;
    meshRef.current.rotation.x = Math.sin(t * 0.03) * 0.2;
  });

  const opacity = systemStatus === "searching" ? 0.5 : systemStatus === "error" ? 0.15 : 0.3;

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial color="#a3a6ff" size={0.05} transparent opacity={opacity} />
    </points>
  );
}

export default function IntelligenceField() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <EnergyField />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
    </div>
  );
}
