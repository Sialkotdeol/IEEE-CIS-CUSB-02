"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Points, PointMaterial } from "@react-three/drei";
import { inSphere } from "maath/random";

export default function Scene() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const sphere = useMemo(() => {
    // Determine a much lighter particle count for mobile devices
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 1200 : 3500;
    
    const array = new Float32Array(count * 3);
    inSphere(array, { radius: 10 });
    return array;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x -= delta / 20;
      pointsRef.current.rotation.y -= delta / 30;
      
      // Add slight breathing effect based on mouse
      const targetX = (state.pointer.x * Math.PI) / 10;
      const targetY = (state.pointer.y * Math.PI) / 10;
      
      pointsRef.current.rotation.x += 0.05 * (targetY - pointsRef.current.rotation.x);
      pointsRef.current.rotation.y += 0.05 * (targetX - pointsRef.current.rotation.y);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#818cf8" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#6366f1" />

      <group rotation={[0, 0, Math.PI / 4]}>
        <Points ref={pointsRef} positions={sphere} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            color="#a5b4fc"
            size={0.05}
            sizeAttenuation={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </Points>
      </group>
      
      {/* Fog for cinematic depth */}
      <fog attach="fog" args={["#09090b", 5, 20]} />
    </>
  );
}
