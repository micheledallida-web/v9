'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { PlanetConfig, StationModule } from '../lib/supabase-types';

interface CosmoCanvasProps {
  planets: PlanetConfig[];
  starType: 'yellow_dwarf' | 'blue_giant' | 'red_dwarf' | 'neutron';
  starColor: string;
  starSize: number;
  viewMode: 'orbit' | 'station-builder';
  stationModules: StationModule[];
  selectedPlanetId: string | null;
  onSelectPlanet: (id: string | null) => void;
  timeMultiplier: number;
  gravityScale: number;
}

export default function CosmoCanvas({
  planets,
  starType,
  starColor,
  starSize,
  viewMode,
  stationModules,
  selectedPlanetId,
  onSelectPlanet,
  timeMultiplier,
  gravityScale
}: CosmoCanvasProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const threeStateRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    planetMeshes: Map<string, THREE.Group>;
    starMesh: THREE.Mesh | null;
    starLight: THREE.PointLight | null;
    stationGroup: THREE.Group | null;
    orbitLineGroup: THREE.Group | null;
    mouseRotation: { x: number; y: number };
    targetRotation: { x: number; y: number };
    cameraZoom: number;
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };
  }>({
    scene: null,
    camera: null,
    renderer: null,
    planetMeshes: new Map(),
    starMesh: null,
    starLight: null,
    stationGroup: null,
    orbitLineGroup: null,
    mouseRotation: { x: 0.5, y: 0.5 },
    targetRotation: { x: 0.5, y: 0.5 },
    cameraZoom: 70,
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 }
  });

  // Initial ThreeJS system construction
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const width = canvasContainerRef.current.clientWidth || 800;
    const height = canvasContainerRef.current.clientHeight || 500;

    // Scene & renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020208');
    scene.fog = new THREE.FogExp2('#020208', 0.003);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear previous canvases
    canvasContainerRef.current.innerHTML = '';
    canvasContainerRef.current.appendChild(renderer.domElement);

    // Lights configuration
    const ambientLight = new THREE.AmbientLight('#12122b', 1.5);
    scene.add(ambientLight);

    const starLight = new THREE.PointLight(new THREE.Color(starColor), 12, 180, 0.5);
    scene.add(starLight);
    
    // Soft glowing helper lights for futuristic ambiance
    const cyberBlueLight = new THREE.DirectionalLight('#00f0ff', 0.8);
    cyberBlueLight.position.set(20, 20, 20);
    scene.add(cyberBlueLight);

    const cyberPurpleLight = new THREE.DirectionalLight('#bd00ff', 0.4);
    cyberPurpleLight.position.set(-20, -20, -20);
    scene.add(cyberPurpleLight);

    // Stars particles backdrop
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 400;
      starPositions[i+1] = (Math.random() - 0.5) * 400;
      starPositions[i+2] = (Math.random() - 0.5) * 400;
      
      // futuristic cyan/violet/white stars color range
      const r = Math.random();
      if (r > 0.7) {
        starColors[i] = 0.0; starColors[i+1] = 0.94; starColors[i+2] = 1.0; // Cyan
      } else if (r > 0.5) {
        starColors[i] = 0.74; starColors[i+1] = 0.0; starColors[i+2] = 1.0; // Violet
      } else {
        starColors[i] = 1.0; starColors[i+1] = 1.0; starColors[i+2] = 1.0; // Pure white
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.85 });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Central Star (Sun)
    const starGeometry = new THREE.SphereGeometry(starSize, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(starColor),
      wireframe: starType === 'neutron',
    });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starMesh);

    // Planet and Space Station groups
    const orbitLineGroup = new THREE.Group();
    scene.add(orbitLineGroup);

    const stationGroup = new THREE.Group();
    scene.add(stationGroup);

    // Store state in ref
    threeStateRef.current.scene = scene;
    threeStateRef.current.camera = camera;
    threeStateRef.current.renderer = renderer;
    threeStateRef.current.starMesh = starMesh;
    threeStateRef.current.starLight = starLight;
    threeStateRef.current.orbitLineGroup = orbitLineGroup;
    threeStateRef.current.stationGroup = stationGroup;

    // Track drag events for view rotation
    const handleMouseDown = (e: MouseEvent) => {
      threeStateRef.current.isDragging = true;
      threeStateRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!threeStateRef.current.isDragging) return;
      const deltaX = e.clientX - threeStateRef.current.previousMousePosition.x;
      const deltaY = e.clientY - threeStateRef.current.previousMousePosition.y;

      threeStateRef.current.targetRotation.x += deltaX * 0.005;
      threeStateRef.current.targetRotation.y += deltaY * 0.005;

      // Limit pitch
      threeStateRef.current.targetRotation.y = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, threeStateRef.current.targetRotation.y));

      threeStateRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      threeStateRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const minZoom = viewMode === 'station-builder' ? 5 : 12;
      const maxZoom = viewMode === 'station-builder' ? 40 : 150;
      threeStateRef.current.cameraZoom += e.deltaY * 0.03;
      threeStateRef.current.cameraZoom = Math.max(minZoom, Math.min(maxZoom, threeStateRef.current.cameraZoom));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    dom.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('mouseleave', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Resize handler
    const handleResize = () => {
      if (!canvasContainerRef.current || !threeStateRef.current.camera || !threeStateRef.current.renderer) return;
      const w = canvasContainerRef.current.clientWidth;
      const h = canvasContainerRef.current.clientHeight;
      threeStateRef.current.camera.aspect = w / h;
      threeStateRef.current.camera.updateProjectionMatrix();
      threeStateRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('mouseleave', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
    };
  }, [viewMode]);

  // Monitor Star updates dynamically
  useEffect(() => {
    const { starMesh, starLight } = threeStateRef.current;
    if (starMesh) {
      starMesh.scale.setScalar(starSize / 4);
      (starMesh.material as THREE.MeshBasicMaterial).color.set(starColor);
      if (starType === 'neutron') {
        (starMesh.material as THREE.MeshBasicMaterial).wireframe = true;
      } else {
        (starMesh.material as THREE.MeshBasicMaterial).wireframe = false;
      }
    }
    if (starLight) {
      starLight.color.set(starColor);
    }
  }, [starType, starColor, starSize]);

  // Monitor planets rebuild/update triggers
  useEffect(() => {
    const scene = threeStateRef.current.scene;
    const orbitLineGroup = threeStateRef.current.orbitLineGroup;
    if (!scene || !orbitLineGroup) return;

    // Clean old planet meshes
    threeStateRef.current.planetMeshes.forEach(mesh => scene.remove(mesh));
    threeStateRef.current.planetMeshes.clear();

    // Clean orbit paths
    while (orbitLineGroup.children.length > 0) {
      orbitLineGroup.remove(orbitLineGroup.children[0]);
    }

    // Assemble planet objects
    planets.forEach(p => {
      const planetGroup = new THREE.Group();
      planetGroup.name = p.id;

      // Beautiful dynamic procedural textures generator
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, 64);
        if (p.type === 'lava') {
          grad.addColorStop(0, '#500000');
          grad.addColorStop(0.3, p.color);
          grad.addColorStop(0.7, '#ff8400');
          grad.addColorStop(1, '#110000');
        } else if (p.type === 'earth') {
          grad.addColorStop(0, '#001a4d');
          grad.addColorStop(0.4, p.color);
          grad.addColorStop(0.6, '#00ff84');
          grad.addColorStop(1, '#0c2300');
        } else if (p.type === 'gas_giant') {
          grad.addColorStop(0, p.color);
          grad.addColorStop(0.2, '#ffffff');
          grad.addColorStop(0.5, p.color);
          grad.addColorStop(0.8, '#221144');
          grad.addColorStop(1, p.color);
        } else {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, p.color);
          grad.addColorStop(1, '#0e3a47');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 64);

        // Draw random cloud streaks or surface lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(0, Math.random() * 64, 128, Math.random() * 8 + 2);
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      const geom = new THREE.SphereGeometry(p.size, 32, 32);
      
      // Glowing cybernetic futuristic space materials
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.1,
        emissive: new THREE.Color(p.color).multiplyScalar(0.15),
      });

  ... (truncated for brevity)
