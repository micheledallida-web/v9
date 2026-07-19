"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import LoginModal from "./LoginModal";
import {
  Zap,
  Layout,
  Server,
  Database,
  ShieldCheck,
  Cpu,
  Check,
  ChevronDown,
  X,
  Github,
  Twitter,
  Slack,
} from "lucide-react";

function useReveal() {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, active] as const;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, active] = useReveal();
  return <div ref={ref} className={`reveal-element ${active ? "active" : ""} ${className}`}>{children}</div>;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas = canvasEl;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;
    let animationId = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Particle {
      x = 0;
      y = 0;
      size = 0;
      speedY = 0;
      speedX = 0;
      opacity = 0;
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedY = -(Math.random() * 0.2 + 0.05);
        this.speedX = Math.random() * 0.2 - 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y < 0) this.reset();
      }
      draw() {
        ctx.fillStyle = `rgba(142, 240, 138, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 40 }, () => new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="particle-canvas" className="fixed inset-0 pointer-events-none z-[2] opacity-40" />;
}

function createQGeometry() {
  const group = new THREE.Group();

  const silverPBRMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xcccccc,
    metalness: 0.98,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 1.0,
    flatShading: false,
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

  const tailGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 32);
  const tailMesh = new THREE.Mesh(tailGeo, silverPBRMaterial);
  tailMesh.rotation.z = -Math.PI / 4;
  tailMesh.position.set(1.4, -1.4, 0.25);
  group.add(tailMesh);

  return group;
}

function Q3DCanvas({ scale = 1, className = "" }: { scale?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const camera = new THREE.PerspectiveCamera(45, canvasEl.clientWidth / canvasEl.clientHeight, 0.1, 100);
    camera.position.z = 7;

    const qGroup = createQGeometry();
    qGroup.scale.set(scale, scale, scale);
    scene.add(qGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    const accentGreenRimLight = new THREE.DirectionalLight(0x8ef08a, 1.5);
    accentGreenRimLight.position.set(-6, -6, -4);
    scene.add(accentGreenRimLight);

    const crispBackLight = new THREE.DirectionalLight(0xffffff, 2.0);
    crispBackLight.position.set(-4, 6, -3);
    scene.add(crispBackLight);

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

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    };
    document.addEventListener("mousemove", onMove);

    const targets = document.querySelectorAll('button, a, input, select, textarea, .cursor-pointer');
    const onEnter = () => {
      cursor.style.width = "35px";
      cursor.style.height = "35px";
      cursor.style.borderColor = "#8EF08A";
      cursor.style.backgroundColor = "rgba(142, 240, 138, 0.1)";
    };
    const onLeave = () => {
      cursor.style.width = "20px";
      cursor.style.height = "20px";
      cursor.style.borderColor = "rgba(255, 255, 255, 0.3)";
      cursor.style.backgroundColor = "transparent";
    };

    targets.forEach((t) => {
      t.addEventListener("mouseenter", onEnter);
      t.addEventListener("mouseleave", onLeave);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      targets.forEach((t) => {
        t.removeEventListener("mouseenter", onEnter);
        t.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return <div ref={cursorRef} id="custom-cursor" />;
}

const FEATURES = [
  { icon: Zap, title: "AI Full Stack Generation", desc: "Generate user-interfaces, structural databases, route endpoints, third-party authentication protocols, and edge APIs dynamically from one single baseline prompt.", tag: "Autonomous Architecture" },
  { icon: Layout, title: "Frontend Engine", desc: "Beautiful layouts compiled using Next.js 15, Tailwind, and React 19. Perfectly customized components natively designed to match standard screen resolutions dynamically.", tag: "Next.js 15 & React 19" },
  { icon: Server, title: "Sovereign Backend", desc: "Engineered Node.js, Express, and Serverless API structures. Type-safe routing controls, absolute payload validations, dynamic load balancing, and secure headers.", tag: "Type-safe endpoints" },
  { icon: Database, title: "Database Integration", desc: "Structured SQL/NoSQL schema schemas automatically constructed. Deep-link models to Supabase, Postgres, Firebase, or complex remote Vector Databases.", tag: "PostgreSQL & Supabase" },
  { icon: ShieldCheck, title: "Enterprise Authentication", desc: "Out-of-the-box user management. Integrate secure multi-factor MFA, JSON Web Tokens (JWT), biometric passkeys, NextAuth setups, or OAuth profiles seamlessly.", tag: "Zero-trust security" },
  { icon: Cpu, title: "AI Agents & Workflows", desc: "Embed complex autonomous systems into your software application. Orchestrate background processors, webhooks, Vector memory searches, and Stripe-enabled actions.", tag: "Autonomous workflows" },
];

const TECH_TAGS = ["React", "Next.js", "Flutter", "React Native", "Supabase", "Firebase", "Stripe", "PostgreSQL", "Vector Databases", "File Storage", "Cloud Functions", "GitHub Integration", "One Click Deploy"];

function AuthButton({ provider, className, children }: { provider: string; className: string; children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Authorization request with ${provider} completed. (placeholder — wire up Supabase OAuth here)`);
    }, 1800);
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? <><span className="btn-spinner mr-2" /> Authorization Pending...</> : children}
    </button>
  );
}

function AuthModal({ id, title, description, type, placeholder, isOpen, onClose }: { id: string; title: string; description: string; type: string; placeholder: string; isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Authorization code dispatched. (placeholder — wire up Supabase magic link / OTP here)");
      onClose();
    }, 2000);
  }

  if (!isOpen) return null;

  return (
    <div id={id} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-premium p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-brandTextSec hover:text-white" aria-label="Close modal">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-brandTextSec text-sm mb-6">{description}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type={type} required placeholder={placeholder} className="w-full bg-brandSurfaceAccent border border-brandBorder rounded-pill py-3 px-5 text-sm text-white placeholder-brandTextSec focus:outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen/30 transition-all duration-300" />
          <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-brandGreen text-black font-bold rounded-pill text-sm transition-all duration-300 hover:scale-[1.01] hover:bg-white">
            {loading ? "Sending..." : type === "email" ? "Send Magic Link" : "Send Code"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="bg-brandBg text-white antialiased font-sans overflow-x-hidden selection:bg-brandGreen selection:text-black min-h-screen relative">
      <CustomCursor />
      <div className="noise-bg" />
      <div className="radial-vignette" />
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <ParticleCanvas />

      <header className="fixed top-0 left-0 w-full z-50 border-b border-brandBorder bg-brandBg/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brandGreen/40 rounded-full px-2" aria-label="QuickStart.Ai Homepage">
            <div className="w-10 h-10 relative overflow-hidden flex items-center justify-center"><Q3DCanvas scale={0.85} className="w-10 h-10 absolute pointer-events-none" /></div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-brandGreen transition-colors duration-300">QuickStart<span className="text-brandGreen">.Ai</span></span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brandTextSec">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors duration-200">Workflow</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a>
          </nav>
          <button onClick={() => setAuthModalOpen(true)} className="inline-flex items-center justify-center bg-white text-black px-6 py-2.5 rounded-pill text-sm font-semibold hover:bg-brandGreen transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brandGreen/40 shadow-sm">Get Started</button>
        </div>
      </header>

      <main className="relative z-10 pt-20">
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden py-20">
          <div className="w-full max-w-[340px] h-[340px] md:max-w-[420px] md:h-[420px] flex items-center justify-center relative reveal-element active z-10">
            <Q3DCanvas scale={1.05} className="w-full h-full cursor-grab active:cursor-grabbing" />
          </div>
          <div className="max-w-4xl text-center mx-auto mt-6 z-20 reveal-element active">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.05] text-white">Build Full-Stack<br /><span className="text-brandGreen">Web & Mobile Apps in Minutes</span></h1>
            <p className="mt-6 text-lg md:text-xl text-brandTextSec max-w-2xl mx-auto leading-relaxed">Instantly generate native mobile applications, progressive web apps, production APIs, schema-perfect databases, authentication architectures, AI agents, secure cloud storage, and fully automated deployment configurations using simple natural language.</p>
          </div>
          <div id="signup" className="w-full max-w-md mx-auto mt-12 z-20 reveal-element active space-y-6">
            <AuthButton provider="Google" className="w-full inline-flex items-center justify-center gap-3 bg-white text-black py-4 px-6 rounded-pill text-base font-semibold transition-all duration-300 hover:bg-brandGreen hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-brandGreen/40 shadow-lg group">
              <span>Continue with Google</span>
            </AuthButton>
            <div className="grid grid-cols-3 gap-3">
              <AuthButton provider="GitHub" className="inline-flex items-center justify-center gap-2 py-3.5 px-3 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-medium transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-white/20"><Github className="w-4 h-4 text-brandGreen shrink-0" /><span>GitHub</span></AuthButton>
              <AuthButton provider="Apple" className="inline-flex items-center justify-center gap-2 py-3.5 px-3 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-medium transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-white/20"><span>Apple</span></AuthButton>
              <AuthButton provider="Facebook" className="inline-flex items-center justify-center gap-2 py-3.5 px-3 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-medium transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-white/20"><span>Facebook</span></AuthButton>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setEmailModalOpen(true)} className="inline-flex items-center justify-center py-4 px-5 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-semibold transition-all duration-300 hover:scale-[1.01] hover:border-brandGreen/40 focus:outline-none focus:ring-1 focus:ring-brandGreen/40">Continue with Email</button>
              <button onClick={() => setPhoneModalOpen(true)} className="inline-flex items-center justify-center py-4 px-5 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-semibold transition-all duration-300 hover:scale-[1.01] hover:border-brandGreen/40 focus:outline-none focus:ring-1 focus:ring-brandGreen/40">Continue with Phone</button>
            </div>
          </div>
        </section>
      </main>

      <LoginModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onContinueWithEmail={() => { setAuthModalOpen(false); setEmailModalOpen(true); }} />
      <AuthModal id="email-modal" title="Continue with Email" description="Enter your email address to receive an instant access magic key." type="email" placeholder="name@company.com" isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
      <AuthModal id="phone-modal" title="Continue with Phone" description="Enter your phone number to authorize with secure SMS OTP verification." type="tel" placeholder="+1 (555) 000-0000" isOpen={phoneModalOpen} onClose={() => setPhoneModalOpen(false)} />

      <style>{`
        .noise-bg { position: fixed; top: -50%; left: -50%; right: -50%; bottom: -50%; width: 200%; height: 200%; opacity: 0.8; pointer-events: none; z-index: 999; animation: noise-anim 0.2s infinite; }
        @keyframes noise-anim { 0% { transform: translate(0,0) } 10% { transform: translate(-1%,-1%) } 20% { transform: translate(-2%,1%) } 30% { transform: translate(1%,-2%) } 40% { transform: translate(-1%,3%) } 50% { transform: translate(-1%,1%) } 60% { transform: translate(3%,-1%) } 70% { transform: translate(2%,1%) } 80% { transform: translate(-2%,-1%) } 90% { transform: translate(1%,3%) } 100% { transform: translate(1%,-2%) } }
        .radial-vignette { position: fixed; inset: 0; background: radial-gradient(circle at center, transparent 30%, rgba(9, 9, 9, 0.9) 100%); pointer-events: none; z-index: 10; }
        .ambient-glow-1 { position: absolute; top: 15%; left: 20%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(142, 240, 138, 0.03) 0%, transparent 70%); pointer-events: none; filter: blur(80px); z-index: 1; animation: slow-drift-1 25s infinite alternate ease-in-out; }
        .ambient-glow-2 { position: absolute; bottom: 20%; right: 15%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 75%); pointer-events: none; filter: blur(100px); z-index: 1; animation: slow-drift-2 30s infinite alternate ease-in-out; }
        @keyframes slow-drift-1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, -40px) scale(1.1); } }
        @keyframes slow-drift-2 { 0% { transform: translate(0, 0) scale(1.1); } 100% { transform: translate(-60px, 50px) scale(0.9); } }
        .reveal-element { opacity: 0; transform: translateY(30px) scale(0.97); filter: blur(8px); transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-element.active { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        .glass-card { background: rgba(16, 16, 16, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.06); }
        #custom-cursor { width: 20px; height: 20px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50%; position: fixed; transform: translate(-50%, -50%); pointer-events: none; z-index: 10000; transition: width 0.3s, height 0.3s, background-color 0.3s, border-color 0.3s; display: none; }
        @media (hover: hover) { #custom-cursor { display: block; } }
      `}</style>
    </div>
  );
}
