"use client";

import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

const ROTATION_PERIOD_SECONDS = 16; // one full revolution every 16s, constant/linear

class EnvironmentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("Q3DCanvas: failed to load studio environment, rendering without it.", error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function QLogo({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const silverPBRMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xe0e0e0,
        metalness: 1.0,
        roughness: 0.28,
        clearcoat: 0.2,
        clearcoatRoughness: 0.05,
        reflectivity: 0.85,
        envMapIntensity: 1.2,
        flatShading: false,
      }),
    []
  );

  const ringGeometry = useMemo(() => {
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 2.0, 0, Math.PI * 2, false);

    const innerHole = new THREE.Path();
    innerHole.absarc(0, 0, 1.35, 0, Math.PI * 2, true);
    ringShape.holes.push(innerHole);

    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 32,
      curveSegments: 128, // fixes the faceted/low-poly look — was defaulting to 12
      steps: 2,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };

    const geometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
    geometry.center();
    return geometry;
  }, []);

  const tailGeometry = useMemo(() => {
    // Tail — flat beveled blade, same stroke width as the ring (2.0 - 1.35 = 0.65),
    // resized and repositioned so it clearly extends from the ring's lower-right
    // inner edge out past the ring's outer boundary (previously it was mostly
    // hidden inside the ring's own footprint).
    const strokeWidth = 0.68;
    const tailLength = 2.2;

    const tailShape = new THREE.Shape();
    tailShape.moveTo(-strokeWidth / 2, 0);
    tailShape.lineTo(strokeWidth / 2, 0);
    tailShape.lineTo(strokeWidth / 2, tailLength);
    tailShape.lineTo(-strokeWidth / 2, tailLength);
    tailShape.closePath();

    const tailExtrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 32,
      curveSegments: 128,
      steps: 2,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };

    const geometry = new THREE.ExtrudeGeometry(tailShape, tailExtrudeSettings);
    geometry.center();
    return geometry;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Continuous linear Y-axis rotation only — no easing, no acceleration.
    groupRef.current.rotation.y += (delta * (Math.PI * 2)) / ROTATION_PERIOD_SECONDS;
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <mesh geometry={ringGeometry} material={silverPBRMaterial} />
      {/* Angled and positioned so the inner end tucks behind the ring's lower-right
          inner edge, and the outer tip extends clearly past the ring's outer radius —
          matching the reference photo's proportions. */}
      <mesh
        geometry={tailGeometry}
        material={silverPBRMaterial}
        rotation={[0, 0, -0.88]}
        position={[1.65, -1.95, 0]}
      />
    </group>
  );
}

export default function Q3DCanvasScene({ scale = 1, className = "" }: { scale?: number; className?: string }) {
  return (
    <Canvas
      className={className}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      dpr={[1, 2]}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 7] }}
    >
      {/* Environment loads an HDRI asynchronously; if the fetch fails (e.g. a
          network hiccup or blocked CDN) it throws rather than just suspending,
          which would otherwise crash the whole canvas. Suspense + an error
          boundary let the logo still render (without env reflections) instead
          of taking down the page. */}
      <Suspense fallback={null}>
        <EnvironmentErrorBoundary>
          <Environment preset="studio" />
        </EnvironmentErrorBoundary>
      </Suspense>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 5, 4]} intensity={1.8} />
      <directionalLight position={[-6, -6, -4]} intensity={0.35} color={0x8ef08a} />
      <directionalLight position={[-4, 6, -3]} intensity={2.0} />
      <QLogo scale={scale} />
    </Canvas>
  );
}
