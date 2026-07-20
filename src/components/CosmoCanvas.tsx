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
    cameraZoom: 60,
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

      const sphere = new THREE.Mesh(geom, mat);
      planetGroup.add(sphere);

      // Custom Saturn-like Rings
      if (p.hasRings) {
        const ringGeom = new THREE.RingGeometry(p.size * 1.4, p.size * 2.3, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: p.ringsColor ? new THREE.Color(p.ringsColor) : new THREE.Color(p.color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2.2;
        planetGroup.add(ringMesh);
      }

      // Render Orbit Trails/Lines
      const orbitGeom = new THREE.BufferGeometry();
      const orbitPointsCount = 120;
      const orbitPositions = new Float32Array((orbitPointsCount + 1) * 3);
      for (let i = 0; i <= orbitPointsCount; i++) {
        const theta = (i / orbitPointsCount) * Math.PI * 2;
        orbitPositions[i * 3] = Math.cos(theta) * p.distance;
        orbitPositions[i * 3 + 1] = 0;
        orbitPositions[i * 3 + 2] = Math.sin(theta) * p.distance;
      }
      orbitGeom.setAttribute('position', new THREE.BufferAttribute(orbitPositions, 3));
      
      const orbitMat = new THREE.LineBasicMaterial({
        color: p.id === selectedPlanetId ? '#00f0ff' : '#12122b',
        transparent: true,
        opacity: p.id === selectedPlanetId ? 0.9 : 0.4
      });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      orbitLineGroup.add(orbitLine);

      // Moons generator
      for (let m = 0; m < p.moonsCount; m++) {
        const moonGeom = new THREE.SphereGeometry(p.size * 0.22, 12, 12);
        const moonMat = new THREE.MeshStandardMaterial({ color: '#555566', roughness: 0.9 });
        const moonMesh = new THREE.Mesh(moonGeom, moonMat);
        
        const moonDist = p.size * (1.6 + m * 0.7);
        moonMesh.position.set(moonDist, 0, 0);
        planetGroup.add(moonMesh);
      }

      scene.add(planetGroup);
      threeStateRef.current.planetMeshes.set(p.id, planetGroup);
    });
  }, [planets, selectedPlanetId]);

  // Monitor Space Station modular elements rebuilding
  useEffect(() => {
    const { scene, stationGroup } = threeStateRef.current;
    if (!scene || !stationGroup) return;

    // Only render station in station builder mode or at center if standard view
    while (stationGroup.children.length > 0) {
      stationGroup.remove(stationGroup.children[0]);
    }

    if (viewMode === 'station-builder') {
      stationModules.forEach(mod => {
        const modulePivot = new THREE.Group();
        modulePivot.position.set(mod.x, mod.y, mod.z);
        modulePivot.rotation.y = (mod.rotation * Math.PI) / 180;

        if (mod.type === 'core') {
          // Cylindrical command structure with glowing strip rings
          const coreGeom = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 16);
          const coreMat = new THREE.MeshStandardMaterial({ color: '#555577', roughness: 0.2, metalness: 0.8 });
          const coreMesh = new THREE.Mesh(coreGeom, coreMat);
          coreMesh.rotation.z = Math.PI / 2;
          modulePivot.add(coreMesh);

          // Glowing neon terminal indicator ring
          const neonGeom = new THREE.TorusGeometry(0.85, 0.06, 8, 24);
          const neonMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
          const neonMesh = new THREE.Mesh(neonGeom, neonMat);
          neonMesh.rotation.y = Math.PI / 2;
          modulePivot.add(neonMesh);
        } 
        else if (mod.type === 'solar') {
          // Central connector arm
          const armGeom = new THREE.CylinderGeometry(0.2, 0.2, 3, 8);
          const matMetal = new THREE.MeshStandardMaterial({ color: '#333344', metalness: 0.9 });
          const arm = new THREE.Mesh(armGeom, matMetal);
          modulePivot.add(arm);

          // Wide glowing blue solar panels
          const panelGeom = new THREE.BoxGeometry(0.08, 2.6, 1.2);
          const panelMat = new THREE.MeshStandardMaterial({ 
            color: '#001b3a', 
            emissive: '#002244', 
            roughness: 0.1 
          });
          
          const leftPanel = new THREE.Mesh(panelGeom, panelMat);
          leftPanel.position.set(0, 1.3, 0);
          modulePivot.add(leftPanel);

          const rightPanel = leftPanel.clone();
          rightPanel.position.set(0, -1.3, 0);
          modulePivot.add(rightPanel);
        }
        else if (mod.type === 'habitat') {
          // Dome structure for space station colonist habitation
          const habGeom = new THREE.SphereGeometry(1.1, 16, 16);
          const habMat = new THREE.MeshStandardMaterial({ color: '#aabccc', roughness: 0.4 });
          const habMesh = new THREE.Mesh(habGeom, habMat);
          modulePivot.add(habMesh);

          const windowGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2);
          const windowMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
          const windowMesh = new THREE.Mesh(windowGeom, windowMat);
          windowMesh.position.set(0, 0, 1.1);
          modulePivot.add(windowMesh);
        }
        else if (mod.type === 'docking') {
          // Hexagonal docking tunnel
          const dockGeom = new THREE.CylinderGeometry(1.0, 1.0, 1.6, 6);
          const dockMat = new THREE.MeshStandardMaterial({ color: '#666688', metalness: 0.5 });
          const dockMesh = new THREE.Mesh(dockGeom, dockMat);
          dockMesh.rotation.z = Math.PI / 2;
          modulePivot.add(dockMesh);

          // Active docking shield green light rings
          const greenRing = new THREE.TorusGeometry(1.02, 0.05, 6, 16);
          const greenMat = new THREE.MeshBasicMaterial({ color: '#39ff14' });
          const ringMesh = new THREE.Mesh(greenRing, greenMat);
          ringMesh.rotation.y = Math.PI / 2;
          modulePivot.add(ringMesh);
        }
        else if (mod.type === 'thruster') {
          // Rocket nozzle thrusters structure
          const coneGeom = new THREE.ConeGeometry(0.6, 1.2, 12);
          const coneMat = new THREE.MeshStandardMaterial({ color: '#222222', metalness: 0.9 });
          const coneMesh = new THREE.Mesh(coneGeom, coneMat);
          coneMesh.rotation.z = -Math.PI / 2;
          modulePivot.add(coneMesh);

          // Vibrant plasma blast cone
          const fireGeom = new THREE.ConeGeometry(0.4, 1.5, 12);
          const fireMat = new THREE.MeshBasicMaterial({ color: '#ff3c00', transparent: true, opacity: 0.9 });
          const fireMesh = new THREE.Mesh(fireGeom, fireMat);
          fireMesh.rotation.z = -Math.PI / 2;
          fireMesh.position.set(-1.1, 0, 0);
          modulePivot.add(fireMesh);
        }

        stationGroup.add(modulePivot);
      });
    }
  }, [stationModules, viewMode]);

  // Primary Animation Tick loop
  useEffect(() => {
    let animFrameId: number;
    let localAngleMap = new Map<string, number>();
    
    // Pre-populate starting random angles for the simulated celestial dynamics
    planets.forEach(p => {
      localAngleMap.set(p.id, Math.random() * Math.PI * 2);
    });

    const tick = () => {
      const { 
        renderer, 
        scene, 
        camera, 
        planetMeshes, 
        mouseRotation, 
        targetRotation, 
        cameraZoom, 
        starMesh 
      } = threeStateRef.current;

      if (!renderer || !scene || !camera) return;

      // Inertial smoothing for smooth mouse drag orbit views
      mouseRotation.x += (targetRotation.x - mouseRotation.x) * 0.1;
      mouseRotation.y += (targetRotation.y - mouseRotation.y) * 0.1;

      // Set camera coordinates based on virtual spherical angle coordinates centered at Sun (0,0,0)
      camera.position.x = Math.sin(mouseRotation.x) * Math.cos(mouseRotation.y) * cameraZoom;
      camera.position.y = Math.sin(mouseRotation.y) * cameraZoom;
      camera.position.z = Math.cos(mouseRotation.x) * Math.cos(mouseRotation.y) * cameraZoom;
      camera.lookAt(0, 0, 0);

      // Star dynamic slow breathing glow effect
      if (starMesh) {
        starMesh.rotation.y += 0.003;
        const scaleFactor = 1 + Math.sin(Date.now() * 0.002) * 0.04;
        starMesh.scale.setScalar((starSize / 4) * scaleFactor);
      }

      // Orbit simulation for planets when view mode is 'orbit'
      if (viewMode === 'orbit') {
        planets.forEach(p => {
          const mesh = planetMeshes.get(p.id);
          if (mesh) {
            // Physics: orbital frequency scaling based on Kepler's 3rd approximation + time speed factor
            let currentAngle = localAngleMap.get(p.id) || 0;
            // Speed decreases naturally as distance increases
            const calculatedStep = p.speed * timeMultiplier * gravityScale * (10 / Math.pow(p.distance, 1.2));
            currentAngle += calculatedStep;
            localAngleMap.set(p.id, currentAngle);

            mesh.position.x = Math.cos(currentAngle) * p.distance;
            mesh.position.z = Math.sin(currentAngle) * p.distance;

            // Spin self planet body rotation
            mesh.rotation.y += p.rotationSpeed * timeMultiplier;

            // Spin moons around the parent planet body
            mesh.children.forEach(child => {
              if (child !== mesh.children[0] && child !== mesh.children[1]) {
                child.rotation.y += 0.02;
              }
            });
          }
        });
      } else {
        // Builder mode - slowly turn assembly group to appreciate beautiful design
        const stationGroup = threeStateRef.current.stationGroup;
        if (stationGroup) {
          stationGroup.rotation.y += 0.002;
        }
      }

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [planets, viewMode, timeMultiplier, gravityScale, starSize]);

  return (
    <div className="relative w-full h-full border border-space-accent/20 rounded-lg overflow-hidden bg-space-900 shadow-inner">
      {/* Grid crosshair backdrop decoration */}
      <div className="absolute inset-0 border border-dashed border-space-accent/5 pointer-events-none grid grid-cols-6 grid-rows-6">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="border-[0.2px] border-space-accent/5"></div>
        ))}
      </div>

      {/* Live Viewport */}
      <div ref={canvasContainerRef} className="w-full h-full" />

      {/* Corner Tech Decorator elements */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 font-mono text-[9px] text-space-accent/80 bg-space-900/80 px-2 py-1 rounded border border-space-accent/20">
        <div className="w-1.5 h-1.5 rounded-full bg-space-accent animate-ping" />
        RENDER ENGINE: 3D WEBGL-LIVE
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-gray-500 bg-space-900/80 px-2 py-0.5 rounded">
        DRAG MOUSE TO ORBIT • SCROLL TO ZOOM
      </div>
    </div>
  );
}
