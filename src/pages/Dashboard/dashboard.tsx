import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  DollarSign,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  School2,
  Settings,
  Star,
  User,
  Bell,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { teachers as mockTeachers } from "@/data/teachers";
import { cn } from "@/lib/utils";
import { studentNavSections } from "@/components/studentNavigation";

interface Booking {
  id: string; subject: string; start_at: string; duration_min: number;
  status: string; price_usd: number; teacher_id: string; student_id: string;
}

const Dashboard = () => {
  const { user, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isTeacher = role === "teacher";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profileName, setProfileName] = useState("");
  const [stats, setStats] = useState({ upcoming: 0, total: 0, completed: 0, earnings: 0 });

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!user) return;
    const col = isTeacher ? "teacher_id" : "student_id";
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfileName(data?.full_name ?? ""));

    supabase.from("bookings").select("*").eq(col, user.id)
      .order("start_at", { ascending: true })
      .then(({ data }) => {
        const all = data ?? [];
        setBookings(all);
        const now = new Date();
        const upcoming = all.filter((b) => new Date(b.start_at) >= now && b.status !== "cancelled").length;
        const completed = all.filter((b) => b.status === "completed").length;
        const earnings = isTeacher ? all.filter((b) => b.status === "completed").reduce((s, b) => s + Number(b.price_usd), 0) : 0;
        setStats({ upcoming, total: all.length, completed, earnings });
      });
  }, [user, isTeacher]);

  const upcomingList = bookings.filter((b) => new Date(b.start_at) >= new Date() && b.status !== "cancelled").slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
          <aside className="hidden lg:flex lg:flex-col gap-4 sticky top-24 h-fit">
            <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
                  {(profileName?.[0] || user?.email?.[0] || "S").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{isTeacher ? "Teacher" : "Student"} Portal</div>
                  <h2 className="font-display text-lg font-bold truncate">
                    {profileName ? profileName.split(" ")[0] : "Welcome back"}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="relative grid grid-cols-3 gap-2 mt-4">
                <div className="rounded-2xl bg-background/80 border border-border p-3 text-center">
                  <div className="text-lg font-extrabold font-display">{stats.upcoming}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Upcoming</div>
                </div>
                <div className="rounded-2xl bg-background/80 border border-border p-3 text-center">
                  <div className="text-lg font-extrabold font-display">{stats.completed}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Done</div>
                </div>
                <div className="rounded-2xl bg-background/80 border border-border p-3 text-center">
                  <div className="text-lg font-extrabold font-display">{stats.total}</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/90 p-3 shadow-sm">
              <div className="px-3 py-2 mb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">Quick Links</div>
              <div className="space-y-2">
                {studentNavSections.map((section) => (
                  <div key={section.title} className="space-y-1.5">
                    <div className="px-3 pt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 font-bold">{section.title}</div>
                    {section.items.map((item) => {
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={cn(
                            "flex items-start gap-3 rounded-2xl border px-3 py-3 transition-all duration-200",
                            active
                              ? "border-primary/30 bg-primary/5 shadow-sm"
                              : "border-transparent hover:border-border hover:bg-muted/60"
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl",
                            active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold truncate">{item.label}</span>
                              {item.badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{item.badge}</span>}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{item.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/school/teachers"
              className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 to-transparent p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-primary font-bold">Discover</div>
                  <div className="font-display font-bold mt-1">Find your next teacher</div>
                  <p className="text-xs text-muted-foreground mt-1">Browse school and Islamic tutoring options from one place.</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </aside>

          <main className="space-y-6">
            <section className="rounded-3xl border border-border bg-card/80 shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_35%)]" />
              <div className="relative p-5 sm:p-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <LayoutDashboard className="w-3.5 h-3.5 text-primary" /> Learning dashboard
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
                      Welcome back{profileName ? `, ${profileName.split(" ")[0]}` : ""}.
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl">
                      Keep track of your sessions, messages and progress from one focused workspace.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => navigate("/bookings")} className="rounded-full">
                    View bookings
                  </Button>
                  <Button onClick={() => navigate("/school/teachers")} className="rounded-full">
                    Find a teacher
                  </Button>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {(isTeacher
                ? [
                    { label: "Upcoming", value: String(stats.upcoming), icon: Calendar, color: "text-primary" },
                    { label: "Pending requests", value: String(bookings.filter((b) => b.status === "pending").length), icon: Users, color: "text-accent" },
                    { label: "Completed", value: String(stats.completed), icon: BookOpen, color: "text-secondary" },
                    { label: "Earned (USD)", value: `$${stats.earnings}`, icon: DollarSign, color: "text-primary" },
                  ]
                : [
                    { label: "Upcoming", value: String(stats.upcoming), icon: Calendar, color: "text-primary" },
                    { label: "Total bookings", value: String(stats.total), icon: BookOpen, color: "text-secondary" },
                    { label: "Completed", value: String(stats.completed), icon: GraduationCap, color: "text-accent" },
                    { label: "Average rating", value: "—", icon: Star, color: "text-accent" },
                  ]
              ).map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <s.icon className={cn("w-5 h-5 mb-2", s.color)} />
                  <div className="text-2xl sm:text-3xl font-extrabold font-display">{s.value}</div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </section>

            {isTeacher && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <div className="font-semibold text-sm sm:text-base">Keep your profile sharp</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Edit subjects, rate, availability and bio.</div>
                </div>
                <Button size="sm" onClick={() => navigate("/teacher/onboarding")} className="w-full sm:w-auto rounded-full">
                  Edit teaching profile
                </Button>
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-base sm:text-lg">Upcoming sessions</h2>
                    <p className="text-xs text-muted-foreground">Your next learning appointments at a glance.</p>
                  </div>
                  <Link to="/bookings" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                {upcomingList.length === 0 ? (
                  <div className="p-8 sm:p-10 text-center text-sm text-muted-foreground">
                    {isTeacher ? (
                      "No bookings yet — students will appear here."
                    ) : (
                      <>
                        No upcoming sessions. {" "}
                        <Link to="/school/teachers" className="text-primary font-medium">Browse teachers →</Link>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {upcomingList.map((b) => (
                      <div key={b.id} className="flex items-start sm:items-center gap-3 p-4 sm:p-5">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                          {b.subject[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base">{b.subject}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">{b.duration_min} min · {b.status}</div>
                        </div>
                        <div className="text-xs sm:text-sm text-right flex-shrink-0">
                          <div className="font-semibold">{format(new Date(b.start_at), "PPp")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isTeacher && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-base sm:text-lg">Recommended teachers</h2>
                    <Link to="/school/teachers" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                      Explore <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {mockTeachers.slice(0, 3).map((t) => (
                      <Link key={t.id} to={`/teachers/${t.id}`}
                        className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs sm:text-sm flex-shrink-0">
                            {t.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm truncate">{t.name}</div>
                            <div className="text-xs text-accent flex items-center gap-1">
                              <Star className="w-3 h-3 fill-accent" /> {t.rating}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.bio}</div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold">${t.rate}/hr</span>
                          <span className="text-xs text-primary font-semibold">View →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
