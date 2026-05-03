import { Link, useParams } from "react-router-dom";
import { findTeacher } from "@/data/teachers";
import { PortalNav } from "@/components/PortalNav";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ShieldCheck, Wifi, Home as HomeIcon, Calendar, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TeacherProfile = () => {
  const { id } = useParams();
  const teacher = id ? findTeacher(id) : undefined;

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl mb-2">Teacher not found</h2>
          <Link to="/" className="text-primary underline">Back home</Link>
        </div>
      </div>
    );
  }

  const isIslamic = teacher.portal === "islamic";
  const reviews = [
    { name: "Aisha M.", initials: "AM", rating: 5, text: "Patient and methodical. My daughter's Tajweed has improved enormously in 2 months." },
    { name: "Yusuf B.", initials: "YB", rating: 5, text: "Best teacher I've worked with. Clear structure, real progress every week." },
    { name: "Sarah K.", initials: "SK", rating: 4, text: "Knowledgeable and kind. Recommend to anyone serious about learning." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PortalNav portal={teacher.portal}/>

      {/* HEADER */}
      <header className={cn("py-10", isIslamic ? "bg-forest" : "bg-navy")}>
        <div className="container flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className={cn("w-24 h-24 rounded-full flex items-center justify-center font-display font-extrabold text-3xl flex-shrink-0",
            isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>
            {teacher.initials}
          </div>
          <div className="flex-1 text-white">
            <h1 className="font-display font-extrabold text-3xl md:text-4xl mb-1">{teacher.name}</h1>
            <p className="text-white/55 text-sm mb-3">{teacher.tagline}</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-primary/15 border border-primary/30 rounded-full px-3 py-1 text-[11px] text-primary-glow font-semibold">
                <ShieldCheck className="w-3 h-3"/> Verified
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                <Star className="w-3 h-3 fill-accent text-accent"/> {teacher.rating} ({teacher.reviews} reviews)
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                {teacher.mode === "home_visit" ? <HomeIcon className="w-3 h-3"/> : <Wifi className="w-3 h-3"/>}
                {teacher.mode === "both" ? "Online + Home" : teacher.mode === "online" ? "Online" : "Home Visit"}
              </span>
              {teacher.city && (
                <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-[11px] text-white font-semibold">
                  <MapPin className="w-3 h-3"/> {teacher.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="container py-10 grid lg:grid-cols-[1fr_320px] gap-8">
        <main className="space-y-8">
          <section>
            <h2 className="font-display font-bold text-xl mb-3">About {teacher.name.split(" ")[1] || teacher.name}</h2>
            <p className="text-muted-foreground leading-relaxed">{teacher.bio}</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl mb-3">Subjects & Specialities</h2>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map(s => (
                <span key={s} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold",
                  isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{s}</span>
              ))}
              {teacher.badges.map(b => (
                <span key={b} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-accent-light text-accent-dark">{b}</span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl mb-3">Weekly availability</h2>
            <div className="grid grid-cols-7 gap-1.5">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
                <div key={d} className="text-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{d}</div>
                  <div className={cn("rounded-lg py-3 text-xs font-semibold",
                    i === 0 || i === 6 ? "bg-muted text-muted-foreground" :
                    isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary"
                  )}>
                    {i === 0 || i === 6 ? "—" : "5 slots"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl mb-3">Recent reviews</h2>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs",
                      isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{r.initials}</div>
                    <div>
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-accent text-xs">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* BOOKING CARD */}
        <aside className="lg:sticky lg:top-4 h-fit space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-extrabold text-3xl text-foreground">${teacher.rate}</span>
              <span className="text-sm text-muted-foreground">/ hour</span>
            </div>
            <div className="text-xs text-muted-foreground mb-4">First session free · Cancel up to 24h before</div>
            <Link to={`/book/${teacher.id}`} className="block">
              <Button className={cn("w-full rounded-xl font-bold", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90")}>
                <Calendar className="w-4 h-4 mr-2"/> Book a session
              </Button>
            </Link>
            <Button variant="outline" className="w-full rounded-xl mt-2">
              <MessageCircle className="w-4 h-4 mr-2"/> Message teacher
            </Button>
          </div>
          <div className="bg-accent-light border border-accent/30 rounded-2xl p-4 text-xs text-accent-dark">
            <strong>Trusted teacher</strong> — verified ID, certifications & background checked by EduConnect.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TeacherProfile;
