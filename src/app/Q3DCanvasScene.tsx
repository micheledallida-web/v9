"use client";

import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const ROTATION_PERIOD_SECONDS = 16; // one full revolution every 16s, constant/linear

// Obsidian black — deep, near-mirror body color shared by the ring and the tail.
const OBSIDIAN_BLACK = "#030303";

// The tail protrudes from the bottom-right of the ring at a fixed diagonal.
// Both the tail's position and its rotation are derived from this single angle
// (measured from +X, clockwise = negative) so the blade always points radially
// outward along the same line it's anchored on — see the mesh below for why the
// rotation needs an extra -PI/2 offset.
const TAIL_ANGLE = -Math.PI / 4; // 45° down-and-to-the-right
const TAIL_ANCHOR_RADIUS = 2.35;

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

  // Shared by the ring AND the tail so both read as one continuous piece of
  // ultra-glossy obsidian metal — deep black body with crisp mirror-bright
  // specular highlights rather than a flat matte or silver look.
  const obsidianMirrorMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: OBSIDIAN_BLACK,
        metalness: 0.95,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        reflectivity: 1.0,
        envMapIntensity: 1.4,
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
      <mesh geometry={ringGeometry} material={obsidianMirrorMaterial} />
      {/* Sharp, straight diagonal block tail, protruding from the bottom-right
          of the ring at TAIL_ANGLE (45°) — replaces the old curved/wavy tail.
          The blade's long axis starts along local +Y (90°), so it must be
          rotated by TAIL_ANGLE - PI/2 (not just TAIL_ANGLE) to actually point
          radially outward along the TAIL_ANGLE direction — otherwise the blade
          ends up angled ~90° off from where `position` places it, leaving a
          visible gap instead of tucking into the ring. Position sits along the
          same radial direction so the flag keeps its inner overlap behind the
          ring's lower-right edge while the tip still extends clearly past the
          ring's outer radius. It shares `obsidianMirrorMaterial` (and the same
          bevel/clearcoat extrude settings as the ring) so it reads as one
          continuous piece of metal. Rotation/position are static (relative to
          the group), so the tail still spins together with the ring via the
          shared groupRef — the overall spin animation is unchanged. */}
      <mesh
        geometry={tailGeometry}
        material={obsidianMirrorMaterial}
        rotation={[0, 0, TAIL_ANGLE - Math.PI / 2]}
        position={[
          TAIL_ANCHOR_RADIUS * Math.cos(TAIL_ANGLE),
          TAIL_ANCHOR_RADIUS * Math.sin(TAIL_ANGLE),
          0,
        ]}
      />
    </group>
  );
}

export default function Q3DCanvasScene({
  scale = 1,
  className = "",
  withBackdrop = false,
}: {
  scale?: number;
  className?: string;
  /** Pitch-black background + faint ambient particles, for standalone/hero display
   *  (kept off by default so the small inline logo instances — nav, footer, login
   *  modal — stay transparent and blend into the page behind them). */
  withBackdrop?: boolean;
}) {
  return (
    <Canvas
      className={className}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      dpr={[1, 2]}
      // Slight three-quarter angle: raised and shifted to the right of center so
      // the ring's right outer edge and top-inner rim catch visible depth/shading
      // instead of the flat, dead-on silhouette a straight-on [0,0,z] camera gives.
      camera={{ fov: 45, near: 0.1, far: 100, position: [2.4, 1.7, 6.1] }}
    >
      {withBackdrop && (
        <>
          <color attach="background" args={["#000000"]} />
          {/* Faint ambient particles drifting in the dark background. */}
          <Sparkles count={80} scale={9} size={1.4} speed={0.25} opacity={0.35} color="#ffffff" />
        </>
      )}
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
          consistent obsidian metal all the way around as it spins, instead of the
          far side falling into total black and only catching highlights on the
          near side (previously it visibly "switched" between dark and lit
          mid-rotation). */}
      <ambientLight intensity={0.45} />
      {/* Crisp, bright white specular key light from the upper right — this is what
          produces the sharp mirror-bright highlight along the ring's right outer
          rim edge. */}
      <directionalLight position={[5, 5, 4]} intensity={2.6} color="#ffffff" />
      {/* Soft directional rim light (brand-green tinted) grazing the far edge. */}
      <directionalLight position={[-6, -6, -4]} intensity={0.35} color={0x8ef08a} />
      <directionalLight position={[-4, 6, -3]} intensity={1.6} color="#ffffff" />
      {/* Front-lower fill light — added alongside the raised ambient above. */}
      <directionalLight position={[4, -5, 5]} intensity={0.8} color="#ffffff" />
      <QLogo scale={scale} />
    </Canvas>
  );
}
