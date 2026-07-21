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
    // Tail — bold, squared-off diagonal flag matching the reference "Q" glyph:
    // thicker and shorter than the previous thin blade, so it reads as a chunky
    // typographic descender rather than a slender spike.
    const tailStrokeWidth = 0.85;
    const tailBladeLength = 1.8;

    const tailShape = new THREE.Shape();
    tailShape.moveTo(-tailStrokeWidth / 2, 0);
    tailShape.lineTo(tailStrokeWidth / 2, 0);
    tailShape.lineTo(tailStrokeWidth / 2, tailBladeLength);
    tailShape.lineTo(-tailStrokeWidth / 2, tailBladeLength);
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
      {/* The blade's long axis starts along local +Y (90°), so it must be rotated by
          -0.88 - PI/2 (not just -0.88) to actually point radially outward along the
          -0.88 rad direction — otherwise the blade ends up angled ~90° off from where
          `position` places it, leaving a visible gap instead of tucking into the ring.
          Position is shifted in along the same radial direction (relative to the
          previous, longer tail) so the shorter/thicker flag keeps the same inner
          overlap behind the ring's lower-right edge while the tip still extends
          clearly past the ring's outer radius. Rotation/position are static
          (relative to the group), so the tail still spins together with the ring
          via the shared groupRef — the overall spin animation is unchanged. */}
      <mesh
        geometry={tailGeometry}
        material={silverPBRMaterial}
        rotation={[0, 0, -0.88 - Math.PI / 2]}
        position={[1.52, -1.8, 0]}
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
      {/* Raised ambient plus an added front-lower fill light so the ring reads as a
          consistent silver metal all the way around as it spins, instead of the
          far side falling into near-black shadow and only catching bright silver
          highlights on the near side (previously it visibly "switched" between
          dark and silver mid-rotation). */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 5, 4]} intensity={1.8} />
      <directionalLight position={[-6, -6, -4]} intensity={0.35} color={0x8ef08a} />
      <directionalLight position={[-4, 6, -3]} intensity={2.0} />
      {/* Front-lower fill light — added alongside the raised ambient above. */}
      <directionalLight position={[4, -5, 5]} intensity={1.0} />
      <QLogo scale={scale} />
    </Canvas>
  );
}
