import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, BookOpen, GraduationCap, DollarSign, Star, ChevronRight, Users, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { teachers as mockTeachers } from "@/data/teachers";

interface Booking {
  id: string; subject: string; start_at: string; duration_min: number;
  status: string; price_usd: number; teacher_id: string; student_id: string;
}

const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const isTeacher = role === "teacher";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profileName, setProfileName] = useState("");
  const [stats, setStats] = useState({ upcoming: 0, total: 0, completed: 0, earnings: 0 });

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            {isTeacher ? "Teacher" : "Student"} Dashboard
          </div>
          <h1 className="text-3xl font-bold font-display">
            Welcome back{profileName ? `, ${profileName.split(" ")[0]}` : ""} 👋
          </h1>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {(isTeacher
            ? [
                { label: "Upcoming", value: String(stats.upcoming), icon: Calendar, color: "text-primary" },
                { label: "Pending requests", value: String(bookings.filter(b => b.status === "pending").length), icon: Users, color: "text-accent" },
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
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
              <div className="text-2xl font-extrabold font-display">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TEACHER QUICK ACTIONS */}
        {isTeacher && (
          <div className="bg-primary/5 border border-primary/30 rounded-xl p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-semibold">Keep your profile sharp</div>
              <div className="text-sm text-muted-foreground">Edit subjects, rate, availability and bio.</div>
            </div>
            <Button onClick={() => navigate("/teacher/onboarding")}>Edit teaching profile</Button>
          </div>
        )}

        {/* UPCOMING */}
        <div className="bg-card border border-border rounded-2xl mb-8">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold">Upcoming sessions</h2>
            <Link to="/bookings" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingList.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {isTeacher ? "No bookings yet — students will appear here." : (
                <>
                  No upcoming sessions.{" "}
                  <Link to="/school/teachers" className="text-primary font-medium">Browse teachers →</Link>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {upcomingList.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {b.subject[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{b.subject}</div>
                    <div className="text-xs text-muted-foreground">{b.duration_min} min · {b.status}</div>
                  </div>
                  <div className="text-xs text-right">
                    <div className="font-semibold">{format(new Date(b.start_at), "PP")}</div>
                    <div className="text-muted-foreground">{format(new Date(b.start_at), "p")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECOMMENDED — students only */}
        {!isTeacher && (
          <div>
            <h2 className="font-display font-bold mb-4">Recommended teachers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTeachers.slice(0, 3).map((t) => (
                <Link key={t.id} to={`/teachers/${t.id}`}
                  className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
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
    </div>
  );
};

export default Dashboard;
