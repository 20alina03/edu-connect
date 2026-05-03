import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Users, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-forest-deep flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="font-display font-extrabold text-xl text-white tracking-tight">
          Edu<span className="text-primary">Connect</span>{" "}
          <span className="text-accent">Global</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot"/> Two portals · One account
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"/> Welcome to EduConnect
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-[1.05] tracking-tight mb-4">
            Choose your <span className="text-accent">learning portal</span>
          </h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Certified teachers worldwide. Two specialised portals. One unified account for the whole family.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 w-full max-w-3xl">
          <Link to="/islamic" className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 p-8 hover:border-primary transition-all hover:-translate-y-1 hover:shadow-elegant">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-primary/20 blur-2xl group-hover:bg-primary/30 transition" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-5">
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

          <Link to="/school" className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/25 p-8 hover:border-secondary transition-all hover:-translate-y-1 hover:shadow-elegant">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-secondary/20 blur-2xl group-hover:bg-secondary/30 transition" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mb-5">
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

        <Link to="/family" className="mt-6 w-full max-w-3xl flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/[.04] border border-white/10 text-white/60 text-xs font-medium hover:bg-white/10 hover:text-white transition">
          <Users className="w-4 h-4"/> Family account — manage both portals for all your children
          <ArrowRight className="w-3.5 h-3.5"/>
        </Link>
      </main>

      <footer className="text-center text-[10px] text-white/25 py-6 tracking-wide">
        One account · Two portals · Full control
      </footer>
    </div>
  );
};

export default Index;
