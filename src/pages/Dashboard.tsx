import { Link, useParams } from "react-router-dom";
import { Calendar, MessageSquare, BookOpen, Settings, Bell, GraduationCap, Users, DollarSign, Star, ChevronRight } from "lucide-react";
import { teachers } from "@/data/teachers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "student" | "teacher" | "parent";

const ROLE_CONFIG: Record<Role, {
  title: string;
  bg: string;
  accent: string;
  menu: { icon: any; label: string; active?: boolean }[];
}> = {
  student: {
    title: "Student",
    bg: "bg-forest-deep",
    accent: "text-primary-glow",
    menu: [
      { icon: Calendar, label: "My Sessions", active: true },
      { icon: BookOpen, label: "Browse Teachers" },
      { icon: MessageSquare, label: "Messages" },
      { icon: Star, label: "Reviews" },
      { icon: Settings, label: "Settings" },
    ],
  },
  teacher: {
    title: "Teacher",
    bg: "bg-navy-deep",
    accent: "text-blue-300",
    menu: [
      { icon: Calendar, label: "Schedule", active: true },
      { icon: Users, label: "Students" },
      { icon: DollarSign, label: "Earnings" },
      { icon: MessageSquare, label: "Messages" },
      { icon: Settings, label: "Profile" },
    ],
  },
  parent: {
    title: "Parent",
    bg: "bg-[#1a1a2e]",
    accent: "text-accent",
    menu: [
      { icon: Users, label: "My Children", active: true },
      { icon: Calendar, label: "All Sessions" },
      { icon: DollarSign, label: "Billing" },
      { icon: MessageSquare, label: "Messages" },
      { icon: Settings, label: "Family settings" },
    ],
  },
};

const Dashboard = () => {
  const { role = "student" } = useParams<{ role: Role }>();
  const cfg = ROLE_CONFIG[role as Role] || ROLE_CONFIG.student;

  const upcomingSessions = teachers.slice(0, 3).map((t, i) => ({
    teacher: t,
    when: ["Today, 3:00 PM", "Tomorrow, 10:00 AM", "Fri, 4:30 PM"][i],
    duration: [60, 45, 60][i],
  }));

  return (
    <div className="min-h-screen bg-background flex">
      {/* SIDEBAR */}
      <aside className={cn("w-60 hidden lg:block py-6", cfg.bg)}>
        <div className="px-5 pb-6">
          <div className="font-display font-extrabold text-white text-lg leading-tight">
            Edu<span className="text-primary">Connect</span>
            <div className={cn("text-[10px] uppercase tracking-wider mt-1 font-medium", cfg.accent)}>{cfg.title} Portal</div>
          </div>
        </div>
        <nav className="space-y-1">
          {cfg.menu.map(({ icon: Icon, label, active }) => (
            <a key={label} href="#" className={cn(
              "flex items-center gap-3 px-5 py-2.5 text-sm font-medium border-l-[3px] transition",
              active
                ? "text-white bg-white/[.06] border-l-current " + cfg.accent
                : "text-white/40 border-l-transparent hover:text-white hover:bg-white/[.04]"
            )}>
              <Icon className="w-4 h-4"/> {label}
            </a>
          ))}
        </nav>
        <div className="px-5 mt-8 pt-6 border-t border-white/10">
          <Link to="/" className="text-[11px] text-white/40 hover:text-white">← Back to portals</Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{cfg.title} dashboard</div>
            <h1 className="font-display font-bold text-xl">Welcome back 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">
              <Bell className="w-4 h-4"/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive"/>
            </button>
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">YO</div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Upcoming sessions", value: "5", icon: Calendar, color: "text-primary" },
              { label: "Hours learned", value: "47", icon: BookOpen, color: "text-secondary" },
              { label: "Active teachers", value: "3", icon: GraduationCap, color: "text-accent" },
              { label: "Avg rating given", value: "4.9", icon: Star, color: "text-accent-dark" },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
                <s.icon className={cn("w-5 h-5 mb-2", s.color)}/>
                <div className="font-display font-extrabold text-2xl">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* UPCOMING */}
          <div className="bg-card border border-border rounded-2xl">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-bold">Upcoming sessions</h2>
              <Link to="/" className="text-xs text-primary-dark font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                View all <ChevronRight className="w-3 h-3"/>
              </Link>
            </div>
            <div className="divide-y divide-border">
              {upcomingSessions.map(s => (
                <div key={s.teacher.id} className="p-4 flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-display font-extrabold flex-shrink-0",
                    s.teacher.portal === "islamic" ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>
                    {s.teacher.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{s.teacher.name}</div>
                    <div className="text-xs text-muted-foreground">{s.teacher.subjects[0]} · {s.duration} minutes</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold">{s.when}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">UTC</div>
                  </div>
                  <Button size="sm" className={cn("rounded-full",
                    s.teacher.portal === "islamic" ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90")}>
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* RECOMMENDED */}
          <div>
            <h2 className="font-display font-bold mb-4">Recommended for you</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {teachers.slice(0, 3).map(t => (
                <Link key={t.id} to={`/teachers/${t.id}`}
                  className="bg-card border border-border rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-card transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-display font-extrabold",
                      t.portal === "islamic" ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{t.initials}</div>
                    <div>
                      <div className="font-display font-bold text-sm">{t.name}</div>
                      <div className="text-[11px] text-accent flex items-center gap-1"><Star className="w-3 h-3 fill-accent"/> {t.rating}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.bio}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">${t.rate}/hr</span>
                    <span className="text-xs text-primary-dark font-semibold">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
