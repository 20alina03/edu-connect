import { Link } from "react-router-dom";
import { Search, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalNav } from "@/components/PortalNav/PortalNav";
import { teachers, Portal } from "@/data/teachers";
import { cn } from "@/lib/utils";
import "./portalhome.css";

interface Props {
  portal: Portal;
}

const ISLAMIC = {
  tag: "Islamic Portal — USA & Europe",
  title: "Learn Quran &",
  titleAccent: "Islamic Studies",
  subtitle: "Online",
  copy: "Certified Quran teachers — Tajweed, Hifz, Arabic, Islamic studies. Male & female teachers. Ijazah holders.",
  primaryCta: "Find Quran Teacher",
  searchHint: "Search e.g. \"Tajweed for kids\"...",
  chips: ["Quran Beginner", "Tajweed", "Hifz", "Arabic", "Female Teacher"],
  stats: [["800+","Quran Teachers"],["12K+","Students"],["4.9★","Avg Rating"]],
  goldStrip: "First Quran session FREE — certified verified teachers only",
  sectionTag: "Islamic subjects",
  sectionTitle: "Everything Islamic, One Platform",
  subjects: [
    { icon: "📖", title: "Quran Reading", desc: "Noorani Qaida to fluent recitation", badge: "Beginner" },
    { icon: "🎵", title: "Tajweed Rules", desc: "Makharij, sifaat — all levels", badge: "Popular" },
    { icon: "📚", title: "Hifz Program", desc: "Memorization + revision tracking", badge: "Premium" },
    { icon: "🌍", title: "Arabic Language", desc: "Classical & modern Arabic", badge: "All levels" },
  ],
};

const SCHOOL = {
  tag: "School Portal — UK & USA",
  title: "Excel in School",
  titleAccent: "with Expert Tutors",
  subtitle: "Online or Home",
  copy: "Verified GCSE, A-Level, primary tutors. Online or home visits. Background-checked, degree-verified teachers.",
  primaryCta: "Find a Tutor",
  searchHint: "Search e.g. \"GCSE Maths London\"...",
  chips: ["GCSE Maths", "A-Level", "English", "Science", "Home Visit"],
  stats: [["1,600+","School Tutors"],["8K+","Students"],["4.8★","Avg Rating"]],
  goldStrip: "First school session FREE — verified degree-checked tutors only",
  sectionTag: "School subjects",
  sectionTitle: "Every Subject, Every Level",
  subjects: [
    { icon: "📐", title: "Maths", desc: "Primary, GCSE, A-Level, Further Maths", badge: "Most booked" },
    { icon: "🔬", title: "Sciences", desc: "Biology, Chemistry, Physics", badge: "Popular" },
    { icon: "📝", title: "English", desc: "Language, Literature, IELTS, essays", badge: "All levels" },
    { icon: "🏠", title: "Home Tuition", desc: "Verified tutor visits your home — GPS matched", badge: "In-person" },
  ],
};

const PortalHome = ({ portal }: Props) => {
  const isIslamic = portal === "islamic";
  const c = isIslamic ? ISLAMIC : SCHOOL;
  const previewTeachers = teachers.filter(t => t.portal === portal).slice(0, 3);

  return (
    <div className="portal-home-page">
      <PortalNav portal={portal} />

      {/* HERO */}
      <section className={cn("portal-home-hero", isIslamic ? "bg-forest" : "bg-navy") }>
        <div className={cn("portal-home-glow", isIslamic ? "bg-primary/10" : "bg-secondary/15") } />
        <div className="portal-home-container">
          <div className="animate-fade-in">
            <div className={cn("portal-home-tag", isIslamic ? "bg-primary/10 border-primary/30 text-primary-glow" : "bg-secondary/10 border-secondary/30 text-blue-300") }>
              <span className={cn("w-1.5 h-1.5 rounded-full pulse-dot", isIslamic ? "bg-primary" : "bg-blue-400")}/>
              {c.tag}
            </div>
            <h1 className="portal-home-title">
              {c.title}<br/>
              <span className="text-accent">{c.titleAccent}</span><br/>
              {c.subtitle}
            </h1>
            <p className="portal-home-copy">{c.copy}</p>
            <div className="flex flex-wrap gap-3">
              <Link to={isIslamic ? "/islamic/teachers" : "/school/teachers"}>
                <Button size="lg" className={cn("rounded-full font-bold", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90") }>
                  {c.primaryCta} <ArrowRight className="w-4 h-4 ml-1"/>
                </Button>
              </Link>
              <Link to="/dashboard/teacher">
                <Button size="lg" variant="outline" className="rounded-full bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white">
                  Become a Teacher
                </Button>
              </Link>
            </div>
            <div className="flex gap-8 mt-8 pt-6 border-t border-white/10">
              {c.stats.map(([n,l]) => (
                <div key={l}>
                  <div className="font-display font-extrabold text-2xl text-white">{n}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SEARCH WIDGET */}
          <div className="portal-home-search">
            <h3 className="font-display font-bold text-white mb-3 text-sm">{isIslamic ? "Find a Quran Teacher" : "Find a School Tutor"}</h3>
            <div className="bg-white/[.06] border border-white/10 rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-white/30"/>
              <span className="text-xs text-white/30">{c.searchHint}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {c.chips.map((chip,i) => (
                <span key={chip} className={cn("portal-home-chip",
                  i===0
                    ? (isIslamic ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary")
                    : "bg-white/[.06] border-white/10 text-white/55 hover:text-white"
                )}>{chip}</span>
              ))}
            </div>
            <div className="space-y-1.5">
              {previewTeachers.map(t => (
                <Link to={`/teachers/${t.id}`} key={t.id} className="portal-home-preview-item">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold",
                    isIslamic ? "bg-primary/25 text-primary-glow" : "bg-secondary/25 text-blue-300")}>{t.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{t.name}</div>
                    <div className="text-[10px] text-white/40 truncate">{t.tagline}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-xs font-bold", isIslamic ? "text-primary-glow" : "text-blue-300")}>${t.rate}/hr</div>
                    <div className="text-[10px] text-accent flex items-center gap-0.5 justify-end"><Star className="w-2.5 h-2.5 fill-accent"/>{t.rating}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GOLD STRIP */}
      <div className="portal-home-strip">
        <span className="text-xs font-bold text-forest">{c.goldStrip}</span>
        <Link to={isIslamic ? "/islamic/teachers" : "/school/teachers"}>
          <Button size="sm" className="rounded-full bg-forest text-white hover:bg-forest-deep">Book Free Trial</Button>
        </Link>
      </div>

      {/* SUBJECTS */}
      <section className="portal-home-subjects">
        <div className="container">
          <div className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", isIslamic ? "text-primary-dark" : "text-secondary")}>{c.sectionTag}</div>
          <h2 className="font-display font-extrabold text-3xl text-foreground mb-2">{c.sectionTitle}</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-xl">Hand-picked subject experts. Book a single session or a full programme.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {c.subjects.map(s => (
              <div key={s.title} className="portal-home-subject-card">
                <div className={cn("portal-home-subject-fill", isIslamic ? "bg-primary" : "bg-secondary") } />
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-display font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
                <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary") }>
                  {s.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TEACHERS */}
      <section className="portal-home-featured">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", isIslamic ? "text-primary-dark" : "text-secondary")}>Top rated</div>
            <h2 className="font-display font-extrabold text-3xl text-foreground">Featured teachers</h2>
          </div>
          <Link to={isIslamic ? "/islamic/teachers" : "/school/teachers"} className={cn("portal-home-featured-link", isIslamic ? "text-primary-dark" : "text-secondary")}>Browse all <ArrowRight className="w-4 h-4"/></Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {previewTeachers.map(t => (
            <Link key={t.id} to={`/teachers/${t.id}`} className="block">
              <div className={cn("bg-card border border-border rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-card", isIslamic ? "hover:border-primary/40" : "hover:border-secondary/40") }>
                <div className="flex gap-4">
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-display font-extrabold", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{t.initials}</div>
                  <div className="flex-1">
                    <div className="font-display font-bold">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.tagline}</div>
                    <div className="flex items-center gap-2 mt-2 text-[11px]">
                      <span className="text-accent flex items-center gap-0.5"><Star className="w-3 h-3 fill-accent"/>{t.rating}</span>
                      <span className="text-muted-foreground">({t.reviews} reviews)</span>
                      <span className={cn("font-bold ml-auto", isIslamic ? "text-primary-dark" : "text-secondary")}>${t.rate}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="portal-home-footer">
        <div className="container text-center text-xs">
          © {new Date().getFullYear()} EduConnect Global · One account · Two portals
        </div>
      </footer>
    </div>
  );
};

export default PortalHome;
