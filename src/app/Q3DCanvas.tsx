"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function createQGeometry() {
  const group = new THREE.Group();

  const silverPBRMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd7dbe2,
    emissive: 0x081109,
    emissiveIntensity: 0.22,
    metalness: 0.9,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    reflectivity: 1.0,
    sheen: 1,
    sheenColor: new THREE.Color(0xf7fafc),
    sheenRoughness: 0.22,
    specularIntensity: 1,
    envMapIntensity: 1.35,
    iridescence: 0.16,
    iridescenceIOR: 1.3,
    flatShading: false,
  });

  const glowMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb6f6b3,
    emissive: 0x75e07f,
    emissiveIntensity: 0.28,
    transparent: true,
    opacity: 0.24,
    roughness: 0.2,
    metalness: 0.15,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, 2.0, 0, Math.PI * 2, false);

  const innerHole = new THREE.Path();
  innerHole.absarc(0, 0, 1.35, 0, Math.PI * 2, true);
  ringShape.holes.push(innerHole);

  const extrudeSettings = {
    depth: 0.5,
    bevelEnabled: true,
    bevelSegments: 24,
    steps: 2,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  };

  const ringGeometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
  ringGeometry.center();
  const ringMesh = new THREE.Mesh(ringGeometry, silverPBRMaterial);
  group.add(ringMesh);
  const ringGlowMesh = new THREE.Mesh(ringGeometry.clone(), glowMaterial);
  ringGlowMesh.scale.setScalar(1.03);
  group.add(ringGlowMesh);

  const tailGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 32);
  const tailMesh = new THREE.Mesh(tailGeo, silverPBRMaterial);
  tailMesh.rotation.z = -Math.PI / 4;
  tailMesh.position.set(1.4, -1.4, 0.25);
  group.add(tailMesh);
  const tailGlowMesh = new THREE.Mesh(tailGeo.clone(), glowMaterial);
  tailGlowMesh.rotation.copy(tailMesh.rotation);
  tailGlowMesh.position.copy(tailMesh.position);
  tailGlowMesh.scale.setScalar(1.05);
  group.add(tailGlowMesh);

  return group;
}

export default function Q3DCanvas({ scale = 1, className = "" }: { scale?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const camera = new THREE.PerspectiveCamera(45, canvasEl.clientWidth / canvasEl.clientHeight, 0.1, 100);
    camera.position.z = 7;

    const qGroup = createQGeometry();
    qGroup.scale.set(scale, scale, scale);
    scene.add(qGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const fillLight = new THREE.HemisphereLight(0xfafcff, 0x041407, 1.35);
    scene.add(fillLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.25);
    keyLight.position.set(4.8, 5.5, 5.5);
    scene.add(keyLight);

    const accentGreenRimLight = new THREE.DirectionalLight(0x8ef08a, 1.85);
    accentGreenRimLight.position.set(-6, -5, -3);
    scene.add(accentGreenRimLight);

    const crispBackLight = new THREE.DirectionalLight(0xffffff, 2.15);
    crispBackLight.position.set(-4.2, 6.5, -2.5);
    scene.add(crispBackLight);

    const topSparkLight = new THREE.PointLight(0xffffff, 8, 24);
    topSparkLight.position.set(0, 3.6, 6);
    scene.add(topSparkLight);

    const clock = new THREE.Clock();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let animationId = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y,
      };
      qGroup.rotation.y += deltaMove.x * 0.01;
      qGroup.rotation.x += deltaMove.y * 0.01;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      if (e.touches[0]) previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y,
      };
      qGroup.rotation.y += deltaMove.x * 0.01;
      qGroup.rotation.x += deltaMove.y * 0.01;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    const onResize = () => {
      camera.aspect = canvasEl.clientWidth / canvasEl.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);
    };

    canvasEl.addEventListener("mousedown", onMouseDown);
    canvasEl.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvasEl.addEventListener("touchstart", onTouchStart);
    canvasEl.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);

    function renderLoop() {
      const elapsedTime = clock.getElapsedTime();
      if (!isDragging) {
        qGroup.rotation.y = elapsedTime * ((Math.PI * 2) / 11);
        qGroup.rotation.x = 0.15 + Math.sin(elapsedTime * 0.8) * 0.08;
        qGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      }
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(renderLoop);
    }
    renderLoop();

    return () => {
      cancelAnimationFrame(animationId);
      canvasEl.removeEventListener("mousedown", onMouseDown);
      canvasEl.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvasEl.removeEventListener("touchstart", onTouchStart);
      canvasEl.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [scale]);

  return <canvas ref={canvasRef} className={className} />;
}
