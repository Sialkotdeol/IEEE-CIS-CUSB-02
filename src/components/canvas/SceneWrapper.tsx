"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { Suspense, useState } from "react";
import { Preload } from "@react-three/drei";

export default function SceneWrapper() {
  const [isLowEnd] = useState(() => {
    if (typeof window === "undefined" || !navigator) return false;
    return Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  });

  if (isLowEnd) return null; // Fallback to native black CSS background

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]} // Limit device pixel ratio for performance
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Suspense fallback={null}>
        <Scene />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
