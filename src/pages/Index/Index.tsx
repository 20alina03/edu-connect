import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, GraduationCap, Users, ArrowRight, LayoutDashboard,
  Menu, X, Star, Globe, ShieldCheck, Sparkles, Mail,
  Instagram, Facebook, Heart, Zap, BookMarked,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import "./index.css";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const NAV_ITEMS = [
  { label: "What We Offer", id: "offers" },
  { label: "Who It's For",  id: "audience" },
  { label: "Why IlmRise",   id: "why" },
  { label: "Contact",       id: "contact" },
  { label: "Portals",       id: "portals" },
];

/* ── Particle canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 55;
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random(),
      blue: Math.random() > 0.78,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        p.a += 0.004;
        const alpha = 0.35 + 0.35 * Math.sin(p.a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.blue
          ? `rgba(96,165,250,${alpha})`
          : `rgba(74,222,128,${alpha})`;
        ctx.fill();
        // glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        g.addColorStop(0, p.blue ? `rgba(96,165,250,${alpha * 0.3})` : `rgba(74,222,128,${alpha * 0.3})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fill();
      });

      // draw connecting lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(74,222,128,${(1 - dist/110) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }} />
  );
}

/* ── 3D tilt card hook ── */
function useTilt(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width  - 0.5;
      const y = (e.clientY - top)  / height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-8px) scale(1.02)`;
    };
    const onLeave = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref as React.RefObject<HTMLElement>);
  return <div ref={ref} className={className} style={{ transition: "transform 0.18s ease, box-shadow 0.18s ease" }}>{children}</div>;
}

const Index = () => {
  const { user, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dashHref =
    role === "teacher" ? "/dashboard/teacher"
    : role === "student" ? "/dashboard/student"
    : "/choose-role";

  const closeMenu = () => setIsMenuOpen(false);
  const handleNav = (id: string) => { closeMenu(); scrollTo(id); };

  const PARTICLES = [
    { w:3, h:3, top:"18%", left:"10%",  dur:"3.8s", delay:"0s"   },
    { w:2, h:2, top:"32%", right:"9%",  dur:"4.5s", delay:"1s"   },
    { w:4, h:4, top:"62%", left:"6%",   dur:"5s",   delay:"0.5s" },
    { w:2, h:2, top:"20%", right:"22%", dur:"3.2s", delay:"2s"   },
    { w:3, h:3, top:"75%", right:"14%", dur:"4.8s", delay:"1.5s" },
    { w:2, h:2, top:"48%", left:"18%",  dur:"3.5s", delay:"0.8s" },
  ];

  return (
    <div className="index-page">
      {/* Persistent VR grid + ambient light */}
      <div className="vr-grid" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="ambient-light" aria-hidden="true">
        <div className="al-1" />
        <div className="al-2" />
        <div className="al-3" />
      </div>

      {/* ───────── HEADER ───────── */}
      <header className="index-header" style={{ position:"sticky", zIndex:50 }}>
        <div className="index-brand">
          <img src="/logo.svg" alt="IlmRise logo" className="h-9 w-auto object-contain" />
          ILMRISE
        </div>

        <nav className="index-nav-links" aria-label="Primary navigation">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => handleNav(item.id)} className="index-nav-link">
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Link to={dashHref} className="btn-vr-primary !py-2 !px-4 !text-xs">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors duration-200">Sign In</Link>
              <Link to="/signup" className="btn-vr-primary !py-2 !px-4 !text-xs">Get Started</Link>
            </>
          )}
        </div>

        <button type="button" className="index-menu-button" aria-label="Toggle menu" aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(o => !o)}>
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {isMenuOpen && (
          <div className="index-mobile-menu md:hidden">
            <div className="index-mobile-menu-panel">
              <div className="index-mobile-menu-tagline">
                <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-ring" />
                Two portals · One account
              </div>
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => handleNav(item.id)} className="index-mobile-menu-link w-full text-left">
                  {item.label}
                </button>
              ))}
              <div className="index-mobile-menu-actions">
                {user ? (
                  <Link to={dashHref} className="index-mobile-menu-cta" onClick={closeMenu}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login"   className="index-mobile-menu-link" onClick={closeMenu}>Sign In</Link>
                    <Link to="/signup"  className="index-mobile-menu-cta"  onClick={closeMenu}>Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main style={{ position:"relative", zIndex:2 }}>

        {/* ───────── HERO ───────── */}
        <section className="relative flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 overflow-hidden">
          <ParticleCanvas />

          {/* ambient orbs */}
          <div className="orb orb-green w-[520px] h-[520px] -top-52 -left-52 float-glow" style={{ animationDelay:"0s" }} />
          <div className="orb orb-blue  w-[420px] h-[420px] -top-32 -right-32 float-glow" style={{ animationDelay:"2.5s" }} />
          <div className="orb orb-green w-[300px] h-[300px] bottom-0 right-1/3 float-glow opacity-30" style={{ animationDelay:"1.3s" }} />

          {/* HUD corner brackets */}
          <div className="hud-bracket hud-bracket-tl hidden sm:block" />
          <div className="hud-bracket hud-bracket-tr hidden sm:block" />
          <div className="hud-bracket hud-bracket-bl hidden sm:block" />
          <div className="hud-bracket hud-bracket-br hidden sm:block" />

          {/* floating dots */}
          {PARTICLES.map((p, i) => (
            <div key={i} className="particle hidden sm:block float-glow"
              style={{ width:p.w, height:p.h, top:p.top, left:(p as any).left, right:(p as any).right,
                animationDuration:p.dur, animationDelay:p.delay }} />
          ))}

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="index-badge animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-glow pulse-ring" />
              Bism Allah · In the Name of Allah
            </div>

            <h1 className="index-title max-w-5xl mx-auto animate-fade-up-d1">
              Learn, Grow &amp; Thrive —
              <br className="hidden sm:block" />
              <span className="text-shimmer-green">Faith &amp; Knowledge</span>{" "}
              <span className="text-white">United</span>
            </h1>

            <p className="index-copy mb-10 animate-fade-up-d2">
              IlmRise unites Quranic education, Islamic studies, and school tutoring in one
              verified platform — serving 18M+ Muslim families across USA, Europe &amp; Pakistan.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-up-d3">
              <Link to="/islamiclandingpage" className="btn-vr-primary">
                <BookOpen className="w-4 h-4" /> Islamic Portal
              </Link>
              <Link to="/schooltutoringLandingPage" className="btn-vr-secondary">
                <GraduationCap className="w-4 h-4" /> School Tutoring
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-0 mt-14 animate-fade-up-d4">
              {[
                { num:"18M+",  label:"Families Served"   },
                { num:"3",     label:"Continents"        },
                { num:"100%",  label:"Verified Teachers" },
                { num:"2",     label:"Portals, 1 Login"  },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center">
                  <div className="flex flex-col items-center px-6 sm:px-10">
                    <span className="hero-stat-num">{s.num}</span>
                    <span className="hero-stat-label">{s.label}</span>
                  </div>
                  {i < 3 && <div className="hero-stat-divider hidden sm:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── WHAT WE OFFER ───────── */}
        <div className="ilm-divider" />
        <section id="offers" className="ilm-section">
          <div className="ilm-section-eyebrow"><Sparkles className="w-3 h-3" /> What IlmRise Offers</div>
          <h2 className="ilm-section-title text-center">
            Everything your family needs.<br />
            <span className="text-shimmer-green">One blessed platform.</span>
          </h2>
          <p className="ilm-section-sub text-center mx-auto">
            The world's first SaaS marketplace merging Quranic education, Islamic studies, and
            general academic tutoring — powered by AI-based teacher matching.
          </p>

          <div className="offers-grid">
            {[
              { icon:"🕌", color:"bg-primary/15",    title:"Quran & Islamic Education",  desc:"Certified Ijazah scholars for Quran recitation, Tajweed, Hifz, Arabic, and full Deen curriculum." },
              { icon:"📚", color:"bg-secondary/15",  title:"School Tutoring",             desc:"GCSE, A-Level, and primary tutors. Online sessions or DBS-checked home tuition across the UK." },
              { icon:"📋", color:"bg-accent/15",     title:"Assessments",         desc:"Assessments based on learning goals, schedule, language, and teaching style — no guesswork." },
              { icon:"🌍", color:"bg-primary/10",    title:"Global Verified Teachers",    desc:"Background-checked educators across USA, Europe & Pakistan, each manually reviewed." },
              { icon:"👩🏻‍🎓", color:"bg-secondary/10", title:"Student Dashboard",           desc:"One account for every student. Track progress across Islamic and academic subjects together." },
              { icon:"🏠", color:"bg-accent/10",     title:"Home Tuition Booking",        desc:"Book in-person, DBS-checked home tutors or join live online classes — your choice." },
            ].map((c, i) => (
              <TiltCard key={i} className="offer-card">
                <div className={`offer-icon ${c.color} text-xl`}>{c.icon}</div>
                <h3 className="font-display font-bold text-base text-white">{c.title}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed">{c.desc}</p>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ───────── WHO IT'S FOR ───────── */}
        <div className="ilm-divider" />
        <section id="audience" className="ilm-section">
          <div className="ilm-section-eyebrow"><Users className="w-3 h-3" /> Who It's For</div>
          <h2 className="ilm-section-title text-center">
            Built for Muslim families.<br />
            <span className="text-shimmer-green">Open to everyone seeking knowledge.</span>
          </h2>
          <p className="ilm-section-sub text-center mx-auto">
            In Islam, seeking knowledge is an obligation. IlmRise exists to lower every barrier between
            your family and quality, certified education — wherever you are.
          </p>

          <div className="audience-grid">
            {[
              { emoji:"🕌", bg:"bg-primary/[0.07] border-primary/20",      titleStyle:{ color:"#86efac" },           title:"Muslim Families",     desc:"18M+ families in USA, Europe & Pakistan seeking Quran, Tajweed, Arabic, and Deen in one trusted place." },
              { emoji:"🎓", bg:"bg-secondary/[0.07] border-secondary/20",  titleStyle:{ color:"#93c5fd" },           title:"School Students",     desc:"GCSE & A-Level learners needing expert tutors for every subject, online or at home." },
              { emoji:"✍️", bg:"bg-yellow-500/[0.07] border-yellow-500/20",titleStyle:{ color:"#fde68a" },           title:"Teachers & Scholars", desc:"Certified Ijazah scholars and professional tutors looking for a verified marketplace to reach students worldwide." },
            ].map((a, i) => (
              <TiltCard key={i} className={`audience-card ${a.bg}`}>
                <div className="audience-emoji-wrap" style={{ background:"rgba(255,255,255,0.05)" }}>{a.emoji}</div>
                <h3 className="font-display font-bold text-lg" style={a.titleStyle}>{a.title}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed">{a.desc}</p>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ───────── WHY ILMRISE ───────── */}
        <div className="ilm-divider" />
        <section id="why" className="ilm-section">
          <div className="ilm-section-eyebrow"><Star className="w-3 h-3" /> Why IlmRise</div>
          <h2 className="ilm-section-title text-center">
            No competitor offers this.<br />
            <span className="text-shimmer-green">Here's why it matters.</span>
          </h2>
          <p className="ilm-section-sub text-center mx-auto">
            The first platform to combine Islamic education, school tutoring, and home tuition
            under one verified, AI-powered roof — rooted in Islamic values of trust and excellence.
          </p>

          <div className="why-list">
            {[
              { icon:<BookMarked className="w-4 h-4"/>, title:"Faith & Academics Together",      desc:"No more switching between separate apps. Manage Quran lessons and Math tutoring from a single family account — maintaining Islamic identity alongside academic excellence." },
              { icon:<ShieldCheck className="w-4 h-4"/>,title:"Every Teacher is Verified",       desc:"Scholars hold authentic Ijazah certifications. Academic tutors are background-checked and reviewed. You never have to worry about credentials." },
              { icon:<Zap className="w-4 h-4"/>,        title:"AI Matching That Actually Works", desc:"Our matching engine considers learning goals, language, schedule, teaching style, and budget — connecting families with the right teacher in minutes." },
              { icon:<Globe className="w-4 h-4"/>,      title:"Serving the Global Ummah",        desc:"From Pakistan to London to New York — IlmRise bridges geography so every Muslim family can access world-class education." },
              { icon:<Heart className="w-4 h-4"/>,      title:"Built on Islamic Values",         desc:"Transparency, trust (Amanah), and genuine care for students and teachers. We are accountable to our community, not just our metrics." },
            ].map((w, i) => (
              <div key={i} className="why-item">
                <div className="why-num">{w.icon}</div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{w.title}</h3>
                  <p className="text-white/50 text-[13px] leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── PORTALS ───────── */}
        <div className="ilm-divider" />
        <section id="portals" className="ilm-section">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="ilm-section-eyebrow"><BookOpen className="w-3 h-3" /> Our Portals</div>
            <h2 className="ilm-section-title">
              Choose your <span className="text-shimmer-green">learning portal</span>
            </h2>
            <p className="ilm-section-sub mx-auto">
              Two specialised portals, one account. Pick your path — or manage both together.
            </p>
          </div>

          <div className="index-portal-grid">
            {/* Islamic Portal */}
            <Link to="/islamiclandingpage" className="index-portal-card portal-islamic group">
              {/* Conic corner glow */}
              <div style={{ position:"absolute", top:0, right:0, width:120, height:120, pointerEvents:"none",
                background:"conic-gradient(from 190deg at 100% 0%, rgba(74,222,128,0.35) 0deg, transparent 50deg)" }} />
              {/* Animated inner scan line */}
              <div style={{ position:"absolute", left:0, right:0, height:1, top:"-2px",
                background:"linear-gradient(90deg,transparent,rgba(74,222,128,0.6),transparent)",
                animation:"scanLine 4s linear infinite", pointerEvents:"none" }} />
              <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full pointer-events-none float-glow"
                style={{ background:"radial-gradient(circle,rgba(74,222,128,0.18),transparent 70%)", animationDelay:"0s" }} />
              <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full pointer-events-none float-glow"
                style={{ background:"radial-gradient(circle,rgba(74,222,128,0.08),transparent 70%)", animationDelay:"2s" }} />

              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="index-portal-icon" style={{ background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.28)", boxShadow:"0 0 24px rgba(74,222,128,0.2), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                    <BookOpen className="w-6 h-6" style={{ color:"#4ade80", filter:"drop-shadow(0 0 6px rgba(74,222,128,0.8))" }} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.22)", color:"#86efac" }}>
                    Islamic
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl mb-3 text-shimmer-green"
                  style={{ filter:"drop-shadow(0 0 12px rgba(74,222,128,0.3))" }}>
                  Islamic Learning
                </h3>
                <p className="text-sm leading-relaxed mb-6 flex-1 text-white/55">
                  Quran, Tajweed, Hifz, Arabic &amp; Islamic studies with certified Ijazah scholars.
                </p>

                <div className="flex flex-wrap gap-2 mb-7">
                  {["Quran","Arabic","Deen","Hifz","Tajweed"].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                      style={{ background:"rgba(74,222,128,0.07)", border:"1px solid rgba(74,222,128,0.17)", color:"#86efac" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold" style={{ color:"#4ade80" }}>
                  Enter portal
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                </div>
              </div>
            </Link>

            {/* School Portal */}
            <Link to="/schooltutoringLandingPage" className="index-portal-card portal-school group">
              <div style={{ position:"absolute", top:0, right:0, width:120, height:120, pointerEvents:"none",
                background:"conic-gradient(from 190deg at 100% 0%, rgba(96,165,250,0.35) 0deg, transparent 50deg)" }} />
              <div style={{ position:"absolute", left:0, right:0, height:1, top:"-2px",
                background:"linear-gradient(90deg,transparent,rgba(96,165,250,0.6),transparent)",
                animation:"scanLine 4s 2s linear infinite", pointerEvents:"none" }} />
              <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full pointer-events-none float-glow"
                style={{ background:"radial-gradient(circle,rgba(96,165,250,0.18),transparent 70%)", animationDelay:"1.2s" }} />
              <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full pointer-events-none float-glow"
                style={{ background:"radial-gradient(circle,rgba(96,165,250,0.08),transparent 70%)", animationDelay:"3s" }} />

              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="index-portal-icon" style={{ background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.28)", boxShadow:"0 0 24px rgba(96,165,250,0.2), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                    <GraduationCap className="w-6 h-6" style={{ color:"#60a5fa", filter:"drop-shadow(0 0 6px rgba(96,165,250,0.8))" }} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{ background:"rgba(96,165,250,0.1)", border:"1px solid rgba(96,165,250,0.22)", color:"#93c5fd" }}>
                    Academic
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl sm:text-3xl mb-3 text-shimmer-blue"
                  style={{ filter:"drop-shadow(0 0 12px rgba(96,165,250,0.3))" }}>
                  School Tutoring
                </h3>
                <p className="text-sm leading-relaxed mb-6 flex-1 text-white/55">
                  GCSE, A-Level, primary tutors. Online or DBS-checked home tuition across the UK.
                </p>

                <div className="flex flex-wrap gap-2 mb-7">
                  {["GCSE","A-Level","Primary","Maths","Science"].map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                      style={{ background:"rgba(96,165,250,0.07)", border:"1px solid rgba(96,165,250,0.17)", color:"#93c5fd" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold" style={{ color:"#60a5fa" }}>
                  Enter portal
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                </div>
              </div>
            </Link>
          </div>

          <Link to="/choose-role" className="index-family-link" aria-label="Manage both portals">
            <Users className="w-4 h-4 flex-shrink-0" style={{ color:"rgba(74,222,128,0.6)" }} />
            <span>Manage both portals</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-40" />
          </Link>
        </section>

        {/* ───────── CONTACT ───────── */}
        <div className="ilm-divider" />
        <section id="contact" className="ilm-section">
          <div className="ilm-section-eyebrow"><Mail className="w-3 h-3" /> Contact Us</div>
          <h2 className="ilm-section-title text-center">We'd love to hear from you.</h2>
          <div className="contact-card">
            <div>
              <p className="text-white/85 font-semibold text-base mb-1">Get in touch</p>
              <p className="text-white/45 text-sm leading-relaxed max-w-md">
                Have a question about our Islamic courses, tutoring services, or becoming a teacher on IlmRise?
                Drop us an email and we'll respond with care, in sha Allah.
              </p>
              <div className="flex gap-3 mt-5">
                <a href="https://www.instagram.com/ilmrise_grow_global/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com/ilmrise" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
            <a href="mailto:ilmrise.contact@gmail.com" className="contact-link flex-shrink-0">
              <Mail className="w-4 h-4" /> ilmrise.contact@gmail.com
            </a>
          </div>
        </section>
      </main>

      {/* ───────── FOOTER ───────── */}
      <footer className="index-footer-full">
        <div className="footer-grid">
          <div className="col-span-2 sm:col-span-1">
            <div className="font-display font-extrabold text-base text-white mb-2 flex items-center gap-2">
              <img src="/logo.svg" alt="" className="h-7 w-auto" /> ILMRISE
            </div>
            <p className="text-[12px] text-white/35 leading-relaxed mb-4">Faith &amp; knowledge. One platform for the global Ummah.</p>
            <div className="footer-social">
              <a href="https://www.instagram.com/ilmrise_grow_global/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram"><Instagram className="w-3.5 h-3.5" /></a>
              <a href="https://facebook.com/ilmrise" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Facebook"><Facebook className="w-3.5 h-3.5" /></a>
            </div>
          </div>
          <div>
            <p className="footer-col-title">Portals</p>
            <Link to="/islamiclandingpage" className="footer-link">Islamic Learning</Link>
            <Link to="/schooltutoringLandingPage" className="footer-link">School Tutoring</Link>
            <Link to="/choose-role" className="footer-link">Family Dashboard</Link>
          </div>
          <div>
            <p className="footer-col-title">Platform</p>
            <button onClick={() => scrollTo("offers")}   className="footer-link block text-left w-full">What We Offer</button>
            <button onClick={() => scrollTo("audience")} className="footer-link block text-left w-full">Who It's For</button>
            <button onClick={() => scrollTo("why")}      className="footer-link block text-left w-full">Why IlmRise</button>
            <Link to="/how-it-works" className="footer-link">How It Works</Link>
            <Link to="/pricing"      className="footer-link">Pricing</Link>
          </div>
          <div>
            <p className="footer-col-title">Account</p>
            <Link to="/login"  className="footer-link">Sign In</Link>
            <Link to="/signup" className="footer-link">Get Started</Link>
            <a href="mailto:ilmrise.contact@gmail.com" className="footer-link">Contact Us</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>One account · Two portals · Full control · بِسْمِ اللَّهِ</p>
          <p className="mt-1" style={{ color:"rgba(255,255,255,0.13)" }}>© {new Date().getFullYear()} IlmRise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;