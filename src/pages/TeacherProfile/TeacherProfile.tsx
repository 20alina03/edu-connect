import { Link, useParams } from "react-router-dom";
import { findTeacher } from "@/data/teachers";
import { PortalNav } from "@/components/PortalNav/PortalNav";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ShieldCheck, Wifi, Home as HomeIcon, Calendar, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import "./teacherprofile.css";

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
    <div className="teacher-profile-page">
      <PortalNav portal={teacher.portal}/>

      {/* HEADER */}
      <header className={cn("teacher-profile-header", isIslamic ? "bg-forest" : "bg-navy") }>
        <div className="teacher-profile-header-inner">
          <div className={cn("teacher-profile-avatar", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary") }>
            {teacher.initials}
          </div>
          <div className="flex-1 text-white">
            <h1 className="font-display font-extrabold text-3xl md:text-4xl mb-1">{teacher.name}</h1>
            <p className="text-white/55 text-sm mb-3">{teacher.tagline}</p>
            <div className="flex flex-wrap gap-2">
              <span className="teacher-profile-chip bg-primary/15 border border-primary/30 text-primary-glow">
                <ShieldCheck className="w-3 h-3"/> Verified
              </span>
              <span className="teacher-profile-chip bg-white/10 text-white">
                <Star className="w-3 h-3 fill-accent text-accent"/> {teacher.rating} ({teacher.reviews} reviews)
              </span>
              <span className="teacher-profile-chip bg-white/10 text-white">
                {teacher.mode === "home_visit" ? <HomeIcon className="w-3 h-3"/> : <Wifi className="w-3 h-3"/>}
                {teacher.mode === "both" ? "Online + Home" : teacher.mode === "online" ? "Online" : "Home Visit"}
              </span>
              {teacher.city && (
                <span className="teacher-profile-chip bg-white/10 text-white">
                  <MapPin className="w-3 h-3"/> {teacher.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="teacher-profile-body">
        <main className="space-y-8">
          <section>
            <h2 className="teacher-profile-section-title">About {teacher.name.split(" ")[1] || teacher.name}</h2>
            <p className="text-muted-foreground leading-relaxed">{teacher.bio}</p>
          </section>

          <section>
            <h2 className="teacher-profile-section-title">Subjects & Specialities</h2>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map(s => (
                <span key={s} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{s}</span>
              ))}
              {teacher.badges.map(b => (
                <span key={b} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-accent-light text-accent-dark">{b}</span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="teacher-profile-section-title">Weekly availability</h2>
            <div className="grid grid-cols-7 gap-1.5">
              {[
                "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
              ].map((d, i) => (
                <div key={d} className="text-center">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{d}</div>
                  <div className={cn("rounded-lg py-3 text-xs font-semibold",
                    i === 0 || i === 6 ? "bg-muted text-muted-foreground" : isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary"
                  )}>
                    {i === 0 || i === 6 ? "—" : "5 slots"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="teacher-profile-section-title">Recent reviews</h2>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="teacher-profile-review">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{r.initials}</div>
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
          <div className="teacher-profile-booking">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-extrabold text-3xl text-foreground">${teacher.rate}</span>
              <span className="text-sm text-muted-foreground">/ hour</span>
            </div>
            <div className="text-xs text-muted-foreground mb-4">First session free · Cancel up to 24h before</div>
            <Link to={`/book/${teacher.id}`} className="block">
              <Button className={cn("w-full rounded-xl font-bold", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90") }>
                <Calendar className="w-4 h-4 mr-2"/> Book a session
              </Button>
            </Link>
            <Link to={`/messages/${teacher.id}`} className="block">
              <Button variant="outline" className="w-full rounded-xl mt-2">
                <MessageCircle className="w-4 h-4 mr-2"/> Message teacher
              </Button>
            </Link>
          </div>
          <div className="teacher-profile-banner">
            <strong>Trusted teacher</strong> — verified ID, certifications & background checked by EduConnect.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TeacherProfile;
