import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Users, ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import "./index.css";

const Index = () => {
  const { user, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dashHref = role === "teacher" ? "/dashboard/teacher" : role === "student" ? "/dashboard/student" : "/choose-role";
  return (
    <div className="index-page">
      <header className="index-header">
        <div className="index-brand">
          <img src="/logo.svg" alt="Ilmrise logo" className="h-10 w-auto object-contain" />
          ILMRISE
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="index-tagline">
            <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot"/> Two portals · One account
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to={dashHref} className="px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition inline-flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition">
                Sign In
              </Link>
              <Link to="/signup" className="px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition">
                Get Started
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="index-menu-button md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {isMenuOpen && (
          <div className="index-mobile-menu md:hidden">
            <div className="index-mobile-menu-panel">
              <div className="index-mobile-menu-tagline">
                <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" /> Two portals · One account
              </div>
              <Link to="/islamiclandingpage" className="index-mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                Islamic Learning
              </Link>
              <Link to="/schooltutoringLandingPage" className="index-mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                School Tutoring
              </Link>
              <Link to="/how-it-works" className="index-mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                How it works
              </Link>
              <Link to="/pricing" className="index-mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </Link>
              {user ? (
                <Link to={dashHref} className="index-mobile-menu-cta" onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              ) : (
                <div className="index-mobile-menu-actions">
                  <Link to="/login" className="index-mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/signup" className="index-mobile-menu-cta" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="index-hero">
        <div className="text-center mb-12 animate-fade-in">
          <div className="index-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"/> Welcome to Ilmrise
          </div>
          <h1 className="index-title">
            Choose your <span className="text-accent">learning portal</span>
          </h1>
          <p className="index-copy">
            Certified teachers worldwide. Two specialised portals. One unified account for the whole family.
          </p>
        </div>

        <div className="index-portal-grid">
          <Link to="/islamiclandingpage" className="index-portal-card bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 hover:border-primary">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary/20 blur-2xl group-hover:bg-primary/30 transition" />
            <div className="relative">
              <div className="index-portal-icon bg-primary/20">
                <BookOpen className="w-7 h-7 text-primary-glow"/>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-primary-glow mb-2">Islamic Learning</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Quran, Tajweed, Hifz, Arabic & Islamic studies with certified Ijazah scholars.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary-glow">
                <span className="px-2.5 py-1 rounded-full bg-primary/20">Quran · Arabic · Deen</span>
              </div>
              <div className="flex items-center gap-1 text-primary-glow text-sm font-semibold mt-6 group-hover:gap-3 transition-all">
                Enter portal <ArrowRight className="w-4 h-4"/>
              </div>
            </div>
          </Link>

          <Link to="/schooltutoringLandingPage" className="index-portal-card bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/25 hover:border-secondary">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-secondary/20 blur-2xl group-hover:bg-secondary/30 transition" />
            <div className="relative">
              <div className="index-portal-icon bg-secondary/20">
                <GraduationCap className="w-7 h-7 text-blue-300"/>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-blue-300 mb-2">School Tutoring</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                GCSE, A-Level, primary tutors. Online or DBS-checked home tuition across the UK.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                <span className="px-2.5 py-1 rounded-full bg-secondary/20">All school subjects</span>
              </div>
              <div className="flex items-center gap-1 text-blue-300 text-sm font-semibold mt-6 group-hover:gap-3 transition-all">
                Enter portal <ArrowRight className="w-4 h-4"/>
              </div>
            </div>
          </Link>
        </div>

        <Link to="/family" className="index-family-link hover:bg-white/10 hover:text-white">
          <Users className="w-4 h-4"/> Family account — manage both portals for all your children
          <ArrowRight className="w-3.5 h-3.5"/>
        </Link>
      </main>

      <footer className="index-footer">
        One account · Two portals · Full control
      </footer>
    </div>
  );
};

export default Index;
