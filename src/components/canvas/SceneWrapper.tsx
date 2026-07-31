"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { Suspense, useEffect, useState } from "react";
import { Preload } from "@react-three/drei";

export default function SceneWrapper() {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // Detect old/low-end CPUs (e.g. older i3/i5 dual cores with 4 threads)
    // and completely disable WebGL to save the laptop from lagging.
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
      setIsLowEnd(true);
    }
  }, []);

  if (isLowEnd) return null; // Fallback to native black CSS background

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]} // Limit device pixel ratio for performance
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <Scene />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
