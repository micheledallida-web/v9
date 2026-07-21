"use client";

import dynamic from "next/dynamic";

// @react-three/fiber's Canvas relies on browser-only APIs (WebGL context,
// requestAnimationFrame, etc.) and cannot be rendered during SSR/prerendering,
// so the actual scene is loaded client-side only.
const Q3DCanvasScene = dynamic(() => import("./Q3DCanvasScene"), { ssr: false });

export default function Q3DCanvas({ scale = 1, className = "" }: { scale?: number; className?: string }) {
  return <Q3DCanvasScene scale={scale} className={className} />;
}
