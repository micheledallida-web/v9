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

  // Black dark chrome — a near-black metallic base with a low roughness and a
  // clearcoat layer so highlights stay sharp/high-contrast instead of the
  // broad, milky specular a lighter metal would show. envMapIntensity is kept
  // modest so environment reflections add sharp glints without washing the
  // dark base out toward grey/silver. This single material instance is shared
  // by every mesh in the logo (ring + tail) so tone/gloss can never drift
  // between parts or across the animation.
  const blackChromeMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x050505,
        metalness: 1.0,
        roughness: 0.16,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
        reflectivity: 0.9,
        envMapIntensity: 0.55,
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
    // Tail — a rounded, tube-swept leg with the same cross-sectional thickness
    // as the ring (~0.63, matching the ring's ~0.65 radial width / ~0.62 depth)
    // so it reads as one continuous glossy letterform instead of a flat,
    // separate stroke. The path is authored directly in the ring's local
    // space (ring is centered on the origin) rather than centered/repositioned
    // afterwards, so the start point can be embedded inside the ring band for
    // a seamless join and the curve can genuinely dip behind the ring (-Z) to
    // sweep across and cross through/under it before flicking back out to the
    // tip, matching the reference glyph's leg.
    const tailPath = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(1.68 * Math.cos(-0.75), 1.68 * Math.sin(-0.75), 0), // embedded in ring band
        new THREE.Vector3(2.05, -1.55, 0.05), // emerges past the ring's outer edge
        new THREE.Vector3(1.15, -2.55, -0.22), // sweeps across, dipping behind the ring
        new THREE.Vector3(2.05, -3.35, 0.05), // rounded tip, back in front
      ],
      false,
      "centripetal"
    );

    const tubeRadius = 0.315; // matches the ring's cross-section thickness
    const geometry = new THREE.TubeGeometry(tailPath, 96, tubeRadius, 24, false);
    return geometry;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Continuous linear Y-axis rotation only — no easing, no acceleration.
    groupRef.current.rotation.y += (delta * (Math.PI * 2)) / ROTATION_PERIOD_SECONDS;
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <mesh geometry={ringGeometry} material={blackChromeMaterial} />
      {/* The tail path above is authored directly in the ring's local space
          (ring is centered on the origin), so the tube mesh needs no extra
          position/rotation offset here — it already joins the ring exactly
          where the curve was designed to overlap it. Sharing the same
          material instance keeps tone/gloss identical between the ring and
          the tail. */}
      <mesh geometry={tailGeometry} material={blackChromeMaterial} />
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
      {/* Lighting is kept low-key and neutral (no colored fill) so the dark
          chrome base tone never brightens toward grey/silver. Four symmetric
          neutral-white directional lights (front/back/left/right) keep sharp,
          high-contrast specular highlights moving across the surface as the
          logo spins, without any single side reading flatter/lighter than
          another over a full rotation. */}
      <ambientLight intensity={0.12} />
      <directionalLight position={[5, 4, 5]} intensity={1.6} />
      <directionalLight position={[-5, 4, -5]} intensity={1.6} />
      <directionalLight position={[5, -3, -5]} intensity={0.9} />
      <directionalLight position={[-5, -3, 5]} intensity={0.9} />
      <QLogo scale={scale} />
    </Canvas>
  );
}
