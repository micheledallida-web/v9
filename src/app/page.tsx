"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
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

  return [ref, active];
}

function Reveal({ children, className = "" }) {
  const [ref, active] = useReveal();
  return (
    <div ref={ref} className={`reveal-element ${active ? "active" : ""} ${className}`}>
      {children}
    </div>
  );
}

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Particle {
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

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      className="fixed inset-0 pointer-events-none z-[2] opacity-40"
    />
  );
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

function Q3DCanvas({ scale = 1, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const camera = new THREE.PerspectiveCamera(
      45,
      canvasEl.clientWidth / canvasEl.clientHeight,
      0.1,
      100
    );
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
    let animationId;

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaMove = { 
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };
      qGroup.rotation.y += deltaMove.x * 0.01;
      qGroup.rotation.x += deltaMove.y * 0.01;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };
    const onTouchStart = (e) => {
      isDragging = true;
      if (e.touches[0]) previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e) => {
      if (!isDragging || !e.touches[0]) return;
      const deltaMove = { 
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };
      qGroup.rotation.y += deltaMove.x * 0.01;
      qGroup.rotation.x += deltaMove.y * 0.01;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => { isDragging = false; };
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

const FEATURES = [
  {
    icon: Zap,
    title: "AI Full Stack Generation",
    desc: "Generate user-interfaces, structural databases, route endpoints, third-party authentication protocols, and edge APIs dynamically from one single baseline prompt.",
    tag: "Autonomous Architecture",
  },
  {
    icon: Layout,
    title: "Frontend Engine",
    desc: "Beautiful layouts compiled using Next.js 15, Tailwind, and React 19. Perfectly customized components natively designed to match standard screen resolutions dynamically.",
    tag: "Next.js 15 & React 19",
  },
  {
    icon: Server,
    title: "Sovereign Backend",
    desc: "Engineered Node.js, Express, and Serverless API structures. Type-safe routing controls, absolute payload validations, dynamic load balancing, and secure headers.",
    tag: "Type-safe endpoints",
  },
  {
    icon: Database,
    title: "Database Integration",
    desc: "Structured SQL/NoSQL schema schemas automatically constructed. Deep-link models to Supabase, Postgres, Firebase, or complex remote Vector Databases.",
    tag: "PostgreSQL & Supabase",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Authentication",
    desc: "Out-of-the-box user management. Integrate secure multi-factor MFA, JSON Web Tokens (JWT), biometric passkeys, NextAuth setups, or OAuth profiles seamlessly.",
    tag: "Zero-trust security",
  },
  {
    icon: Cpu,
    title: "AI Agents & Workflows",
    desc: "Embed complex autonomous systems into your software application. Orchestrate background processors, webhooks, Vector memory searches, and Stripe-enabled actions.",
    tag: "Autonomous workflows",
  },
];

const TECH_TAGS = [
  "React", "Next.js", "Flutter", "React Native", "Supabase", "Firebase",
  "Stripe", "PostgreSQL", "Vector Databases", "File Storage", "Cloud Functions",
  "GitHub Integration", "One Click Deploy",
];

const WORKFLOW_STEPS = [
  { n: 1, title: "Describe Your Idea", desc: "Input your raw project thoughts. State your goals, user flows, and tech stacks using everyday english." },
  { n: 2, title: "Architecture Plan", desc: "AI analyzes requirement parameters to model structural tables, security measures, and navigation states." },
  { n: 3, title: "Synchronous Build", desc: "Our core models write high-fidelity frontend layouts, connect microservices, and provision backend resources." },
  { n: 4, title: "Instantly Deploy", desc: "Compiled builds are provisioned instantly onto secure Vercel/AWS edge containers with active tracking." },
];

const TESTIMONIALS = [
  { initial: "A", quote: "QuickStart.Ai helped me build a fully functional, Stripe-connected dashboard app in literally 15 minutes. The code generated is production grade.", name: "Alex Rivera", role: "CTO, Vertex Analytics" },
  { initial: "M", quote: "The rotating 3D interface feels premium. I easily connected our supabase Postgres instances directly with the built-in database model agent.", name: "Marcus Chen", role: "Senior Architect, Vercel Core" },
  { initial: "E", quote: "I literally don't write boilerplate auth scripts or API routes from scratch anymore. Using natural language saves hours of system design time.", name: "Elena Rostova", role: "Lead Engineer, Retool Inc" },
  { initial: "S", quote: "Absolutely incredible UI outputs. Responsive scaling models automatically worked perfectly across both my iPad and desktop setups.", name: "Sarah Jenkins", role: "Fullstack Engineer, Supabase" },
];

const FAQS = [
  {
    q: "What frameworks does QuickStart.Ai output?",
    a: "QuickStart.Ai natively compiles complete applications using Next.js 15, React 19, TypeScript, and Tailwind CSS. Mobile setups are exported using standard Flutter or React Native structures, connecting to backends like Supabase, Firebase, or clean PostgreSQL databases.",
  },
  {
    q: "Can I export and self-host the code?",
    a: "Absolutely. Your built code is 100% proprietary to you. You can push direct repositories to your private GitHub or export the standard build files with zero vendor locks.",
  },
  {
    q: "How are databases and authentication managed?",
    a: "AI models spin up secure, isolated schema tables linked natively to PostgreSQL, Supabase or Firebase instances. Security controls, multi-factor login policies, passkeys, and dynamic roles are integrated perfectly with secure sessions from day one.",
  },
  {
    q: "Does QuickStart.Ai integrate with external web APIs?",
    a: "Yes. You can instruct the builder to map specific API integrations. This includes CRM synchronizations, Stripe payment gateways, external database instances, vector tools, or automated custom webhooks.",
  },
];

function AuthButton({ provider, className, children }) { 
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
      {loading ? ( 
        <>
          <span className="btn-spinner mr-2" /> Authorization Pending...
        </>
      ) : children}
    </button>
  );
}

function PricingButton({ tier, className, children }) { 
  const [loading, setLoading] = useState(false);
  function handleClick() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Selected the ${tier} plan. (placeholder — wire up checkout/signup flow here)`);
    }, 1600);
  }
  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? (
        <>
          <span className="btn-spinner mr-2" /> Allocating node server...
        </>
      ) : children}
    </button>
  );
}

function AuthModal({ id, title, description, type, placeholder, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  function handleSubmit(e) {
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
          <div>
            <input type={type} required placeholder={placeholder} className="w-full bg-brandSurfaceAccent border border-brandBorder rounded-pill py-3 px-5 text-sm text-white placeholder-brandTextSec focus:outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen/30 transition-all duration-300" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-brandGreen text-black font-bold rounded-pill text-sm transition-all duration-300 hover:scale-[1.01] hover:bg-white">
            {loading ? "Sending..." : (type === "email" ? "Send Magic Link" : "Send Code")}
          </button>
        </form>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-premium p-6 cursor-pointer" onClick={() => setOpen((v) => !v)}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-white text-base md:text-lg">{q}</h4>
        <ChevronDown className="w-5 h-5 text-brandTextSec transition-transform duration-300" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[300px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"}`}>
        <p className="pt-1 text-brandTextSec text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

function CustomCursor() {
  const cursorRef = useRef(null);
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const onMove = (e) => {
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

export default function LandingPage() {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

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
            <div className="w-10 h-10 relative overflow-hidden flex items-center justify-center">
              <Q3DCanvas scale={0.85} className="w-10 h-10 absolute pointer-events-none" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-brandGreen transition-colors duration-300">
              QuickStart<span className="text-brandGreen">.Ai</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brandTextSec">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors duration-200">Workflow</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a>
          </nav>
          <div>
            <a href="#signup" className="inline-flex items-center justify-center bg-white text-black px-6 py-2.5 rounded-pill text-sm font-semibold hover:bg-brandGreen transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brandGreen/40 shadow-sm">
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-20">
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden py-20">
          <div className="w-full max-w-[340px] h-[340px] md:max-w-[420px] md:h-[420px] flex items-center justify-center relative reveal-element active z-10">
            <Q3DCanvas scale={1.05} className="w-full h-full cursor-grab active:cursor-grabbing" />
          </div>
          <div className="max-w-4xl text-center mx-auto mt-6 z-20 reveal-element active">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.05] text-white">
              Build Full-Stack<br /><span className="text-brandGreen">Web & Mobile Apps in Minutes</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-brandTextSec max-w-2xl mx-auto leading-relaxed">
              Instantly generate native mobile applications, progressive web apps, production APIs, schema-perfect databases, authentication architectures, AI agents, secure cloud storage, and fully automated deployment configurations using simple natural language.
            </p>
          </div>
          <div id="signup" className="w-full max-w-md mx-auto mt-12 z-20 reveal-element active space-y-6">
            <AuthButton provider="Google" className="w-full inline-flex items-center justify-center gap-3 bg-white text-black py-4 px-6 rounded-pill text-base font-semibold transition-all duration-300 hover:bg-brandGreen hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-brandGreen/40 shadow-lg group">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </AuthButton>
            <div className="grid grid-cols-3 gap-3">
              <AuthButton provider="GitHub" className="inline-flex items-center justify-center gap-2 py-3.5 px-3 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-medium transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-white/20">
                <Github className="w-4 h-4 text-brandGreen shrink-0" />
                <span>GitHub</span>
              </AuthButton>
              <AuthButton provider="Apple" className="inline-flex items-center justify-center gap-2 py-3.5 px-3 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-medium transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-white/20">
                <svg className="w-4 h-4 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94 1.07.08 2.15-.52 2.81-1.33z" />
                </svg>
                <span>Apple</span>
              </AuthButton>
              <AuthButton provider="Facebook" className="inline-flex items-center justify-center gap-2 py-3.5 px-3 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-medium transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-white/20">
                <svg className="w-4 h-4 text-[#1877F2] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
                <span>Facebook</span>
              </AuthButton>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs font-bold tracking-widest text-brandTextSec">
              <div className="h-[1px] bg-brandBorder flex-1" />
              <span>OR</span>
              <div className="h-[1px] bg-brandBorder flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setEmailModalOpen(true)} className="inline-flex items-center justify-center py-4 px-5 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-semibold transition-all duration-300 hover:scale-[1.01] hover:border-brandGreen/40 focus:outline-none focus:ring-1 focus:ring-brandGreen/40">
                Continue with Email
              </button>
              <button onClick={() => setPhoneModalOpen(true)} className="inline-flex items-center justify-center py-4 px-5 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder rounded-pill text-sm font-semibold transition-all duration-300 hover:scale-[1.01] hover:border-brandGreen/40 focus:outline-none focus:ring-1 focus:ring-brandGreen/40">
                Continue with Phone
              </button>
            </div>
          </div>
        </section>

        <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative z-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brandGreen">Full Stack Architecture</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-3 text-white">Engineered for absolute scale.</h2>
            <p className="mt-4 text-brandTextSec leading-relaxed">
              QuickStart.Ai models code across your entire ecosystem simultaneously. No disconnected outputs. Pure production excellence.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Reveal key={f.title} className="glass-card rounded-premium p-8 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="w-12 h-12 rounded-full bg-brandSurfaceAccent flex items-center justify-center text-brandGreen border border-brandBorder">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold mt-6 text-white">{f.title}</h3>
                  <p className="mt-3 text-brandTextSec text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-semibold tracking-wider text-brandGreen uppercase">
                  <span>{f.tag}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-20 border-t border-b border-brandBorder py-12">
            <p className="text-center text-xs uppercase tracking-[0.2em] font-bold text-brandTextSec mb-10">
              Export native platforms & framework models
            </p>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {TECH_TAGS.map((tag) => (
                <span key={tag} className="px-5 py-2.5 rounded-pill bg-brandSurface border border-brandBorder text-sm font-medium hover:border-brandGreen transition-colors duration-200">
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="workflow" className="py-32 bg-brandSurface/40 border-t border-b border-brandBorder relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brandGreen">Engineering Path</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-3 text-white">From Idea to Deployment</h2>
              <p className="mt-4 text-brandTextSec leading-relaxed">
                An uncompromised sequence designed to build high-performance products in record-breaking times.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-[50px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-brandBorder via-brandGreen/40 to-brandBorder z-0">
                <div className="workflow-glow-dot" />
              </div>
              {WORKFLOW_STEPS.map((s) => (
                <Reveal key={s.n} className="glass-card rounded-premium p-8 relative z-10 text-center md:text-left">
                  <div className="w-12 h-12 rounded-full bg-brandSurfaceAccent flex items-center justify-center text-white mx-auto md:mx-0 border border-brandBorder font-bold text-lg">
                    {s.n}
                  </div>
                  <h3 className="text-lg font-bold mt-6 text-white">{s.title}</h3>
                  <p className="mt-2 text-brandTextSec text-sm leading-relaxed">{s.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-32 bg-brandSurface/40 border-t border-b border-brandBorder relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brandGreen">Flexible Scale Models</span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-3 text-white">Transparent Pricing</h2>
              <p className="mt-4 text-brandTextSec leading-relaxed">
                Scale production servers and system builds cleanly without hidden infrastructure premiums.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Reveal className="glass-card rounded-premium p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brandTextSec">Hobbyist</span>
                  <h3 className="text-2xl font-bold mt-2 text-white">Free</h3>
                  <p className="mt-3 text-brandTextSec text-sm leading-relaxed">Excellent tier to experiment with natural language architectures.</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">$0</span>
                    <span className="text-brandTextSec text-sm">/ month</span>
                  </div>
                  <ul className="mt-8 space-y-4 text-sm text-brandTextSec">
                    {["0 Sandbox Applications", "Next.js 15 & React 19 Frontend", "Basic SQLite Database Schema", "Public URL Hosting"].map((li) => (
                      <li key={li} className="flex items-center gap-3"><Check className="w-4 h-4 text-brandGreen" /> {li}</li>
                    ))}
                  </ul>
                </div>
                <PricingButton tier="Free" className="mt-8 w-full py-3 px-4 rounded-pill border border-brandBorder hover:border-brandGreen bg-brandSurface text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02]">
                  Get Started
                </PricingButton>
              </Reveal>
              <Reveal className="glass-card rounded-premium p-8 flex flex-col justify-between border-brandGreen/40 pro-glow-border scale-[1.03] relative">
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-brandGreen text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brandGreen">Professional</span>
                  <h3 className="text-2xl font-bold mt-2 text-white">Pro</h3>
                  <p className="mt-3 text-brandTextSec text-sm leading-relaxed">Best for builders, production systems, and fast scaling tools.</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">$16</span>
                    <span className="text-brandTextSec text-sm">/ month</span>
                  </div>
                  <ul className="mt-8 space-y-4 text-sm text-white">
                    {["Unlimited Full-Stack Apps", "Export React Native / Flutter Code", "Supabase / Postgres Integration", "Advanced Security + MFA Options", "Private Github Repo Push"].map((li) => (
                      <li key={li} className="flex items-center gap-3"><Check className="w-4 h-4 text-brandGreen" /> {li}</li>
                    ))}
                  </ul>
                </div>
                <PricingButton tier="Pro" className="mt-8 w-full py-3.5 px-4 rounded-pill bg-brandGreen text-black text-sm font-bold transition-all duration-300 hover:scale-[1.02] hover:bg-white shadow-md">
                  Get Professional Scale
                </PricingButton>
              </Reveal>
              <Reveal className="glass-card rounded-premium p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brandTextSec">Consolidated</span>
                  <h3 className="text-2xl font-bold mt-2 text-white">Enterprise</h3>
                  <p className="mt-3 text-brandTextSec text-sm leading-relaxed">Engineered for corporations demanding strict isolated setups.</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">$150</span>
                    <span className="text-brandTextSec text-sm">/ month</span>
                  </div>
                  <ul className="mt-8 space-y-4 text-sm text-brandTextSec">
                    {["Private Self-Hosted Instance", "Dedicated Custom GPU Models", "Underwriting Service SLA", "24/7 Phone Support Engineers"].map((li) => (
                      <li key={li} className="flex items-center gap-3"><Check className="w-4 h-4 text-brandGreen" /> {li}</li>
                    ))}
                  </ul>
                </div>
                <PricingButton tier="Enterprise" className="mt-8 w-full py-3 px-4 rounded-pill border border-brandBorder hover:border-brandGreen bg-brandSurface text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02]">
                  Contact Sales
                </PricingButton>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="py-32 overflow-hidden relative z-20 border-b border-brandBorder">
          <Reveal className="text-center max-w-2xl mx-auto mb-16 px-6">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brandGreen">Developer feedback</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-3 text-white">Vouched by lead engineers</h2>
          </Reveal>
          <div className="relative w-full overflow-hidden flex flex-col gap-6">
            <div className="marquee-inner">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div key={i} className="glass-card rounded-premium p-6 w-[350px] mx-3 flex flex-col justify-between">
                  <p className="text-sm text-brandTextSec leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="w-10 h-10 rounded-full bg-brandSurfaceAccent border border-brandBorder flex items-center justify-center font-bold text-brandGreen">
                      {t.initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                      <p className="text-xs text-brandTextSec">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-32 px-6 max-w-4xl mx-auto relative z-20">
          <Reveal className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brandGreen">Any Queries?</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-3 text-white">Frequently Asked Questions</h2>
          </Reveal>
          <Reveal className="space-y-4">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </Reveal>
        </section>

        <section className="py-32 px-6 max-w-5xl mx-auto relative z-20 text-center">
          <Reveal className="glass-card rounded-premium p-12 md:p-20 relative overflow-hidden">
            <div className="absolute -inset-10 bg-gradient-to-r from-brandGreen/5 to-transparent blur-3xl rounded-premium pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-brandGreen">Instant Access</span>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-2xl mx-auto">Ready to Build?</h2>
              <p className="text-brandTextSec max-w-lg mx-auto leading-relaxed">
                Start crafting web applications and mobile projects immediately with our intelligent natural language core.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
                <AuthButton provider="Google" className="w-full inline-flex items-center justify-center gap-2 bg-white text-black py-4 px-6 rounded-pill text-sm font-bold hover:bg-brandGreen transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brandGreen/40 shadow-md">
                  Continue with Google
                </AuthButton>
                <button onClick={() => setEmailModalOpen(true)} className="w-full inline-flex items-center justify-center gap-2 bg-brandSurface hover:bg-brandSurfaceAccent border border-brandBorder py-4 px-6 rounded-pill text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-1 focus:ring-white/20">
                  Continue with Email
                </button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <AuthModal id="email-modal" title="Continue with Email" description="Enter your email address to receive an instant access magic key." type="email" placeholder="name@company.com" isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
      <AuthModal id="phone-modal" title="Continue with Phone" description="Enter your phone number to authorize with secure SMS OTP verification." type="tel" placeholder="+1 (555) 000-0000" isOpen={phoneModalOpen} onClose={() => setPhoneModalOpen(false)} />

      <footer className="border-t border-brandBorder bg-[#050505] relative z-20 py-16 px-6 text-sm text-brandTextSec">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2 space-y-4">
            <a href="#" className="flex items-center gap-2 font-bold text-white text-lg">
              <span>QuickStart<span className="text-brandGreen">.Ai</span></span>
            </a>
            <p className="text-xs leading-relaxed max-w-xs">
              Autonomous web & mobile system builder. Generates modern frontends, enterprise backends, structures database engines, and deploys securely to edge clouds.
            </p>
            <p className="text-[11px] text-zinc-600">&copy; 2025 QuickStart.Ai Inc. All rights reserved.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Keys</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status Core</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">DPA Clause</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4">Social</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5" /> Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> GitHub</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1.5"><Slack className="w-3.5 h-3.5" /> Slack</a></li>
            </ul>
          </div>
        </div>
      </footer>

      <style>{`
        .noise-bg {
          position: fixed; top: -50%; left: -50%; right: -50%; bottom: -50%;
          width: 200%; height: 200%;
          background: transparent url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.015"/%3E%3C/svg%3E') repeat;
          opacity: 0.8; pointer-events: none; z-index: 999;
          animation: noise-anim 0.2s infinite;
        }
        @keyframes noise-anim {
          0% { transform: translate(0,0) } 10% { transform: translate(-1%,-1%) }
          20% { transform: translate(-2%,1%) } 30% { transform: translate(1%,-2%) }
          40% { transform: translate(-1%,3%) } 50% { transform: translate(-1%,1%) }
          60% { transform: translate(3%,-1%) } 70% { transform: translate(2%,1%) }
          80% { transform: translate(-2%,-1%) } 90% { transform: translate(1%,3%) }
          100% { transform: translate(1%,-2%) }
        }
        .radial-vignette {
          position: fixed; inset: 0;
          background: radial-gradient(circle at center, transparent 30%, rgba(9, 9, 9, 0.9) 100%);
          pointer-events: none; z-index: 10;
        }
        .ambient-glow-1 {
          position: absolute; top: 15%; left: 20%; width: 45vw; height: 45vw;
          background: radial-gradient(circle, rgba(142, 240, 138, 0.03) 0%, transparent 70%);
          pointer-events: none; filter: blur(80px); z-index: 1;
          animation: slow-drift-1 25s infinite alternate ease-in-out;
        }
        .ambient-glow-2 {
          position: absolute; bottom: 20%; right: 15%; width: 50vw; height: 50vw;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 75%);
          pointer-events: none; filter: blur(100px); z-index: 1;
          animation: slow-drift-2 30s infinite alternate ease-in-out;
        }
        @keyframes slow-drift-1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, -40px) scale(1.1); } }
        @keyframes slow-drift-2 { 0% { transform: translate(0, 0) scale(1.1); } 100% { transform: translate(-60px, 50px) scale(0.9); } }
        .reveal-element {
          opacity: 0; transform: translateY(30px) scale(0.97); filter: blur(8px);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-element.active { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        .glass-card {
          background: rgba(16, 16, 16, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover { border-color: rgba(142, 240, 138, 0.25); transform: translateY(-6px); box-shadow: 0 12px 40px -10px rgba(142, 240, 138, 0.08); }
        #custom-cursor {
          width: 20px; height: 20px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50%;
          position: fixed; transform: translate(-50%, -50%); pointer-events: none; z-index: 10000;
          transition: width 0.3s, height 0.3s, background-color 0.3s, border-color 0.3s; display: none;
        }
        @media (hover: hover) { #custom-cursor { display: block; } }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .marquee-inner { display: flex; width: max-content; animation: marquee 40s linear infinite; }
        .marquee-inner:hover { animation-play-state: paused; }
        .pro-glow-border { position: relative; }
        .pro-glow-border::before {
          content: ''; position: absolute; inset: -1px; border-radius: 25px;
          background: linear-gradient(90deg, transparent, rgba(142, 240, 138, 0.5), transparent);
          z-index: -1; animation: border-glow 3s linear infinite;
        }
        @keyframes border-glow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #090909; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(142, 240, 138, 0.3); }
        .btn-spinner {
          border: 2px solid rgba(255,255,255,0.2); border-top: 2px solid white; border-radius: 50%;
          width: 16px; height: 16px; animation: spin 0.8s linear infinite; display: inline-block;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .workflow-glow-dot {
          position: absolute; inset: 0; background: #8EF08A; height: 1px; width: 80px; border-radius: 9999px;
          animation: scroll-line-glow 6s linear infinite;
        }
        @keyframes scroll-line-glow {
          0% { left: 0%; opacity: 0; } 5% { opacity: 1; } 95% { opacity: 1; } 100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
