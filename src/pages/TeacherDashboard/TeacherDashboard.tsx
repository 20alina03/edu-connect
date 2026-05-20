import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, format, startOfDay } from "date-fns";
import {
  AlertCircle, BookOpen, Calendar, CheckCircle, ChevronLeft,
  ChevronRight, Clock, Filter, MapPin, MessageSquare, Plus,
  Save, School2, TrendingUp, User, Users, XCircle, Menu, X,
  LayoutDashboard, FileText, Video, GraduationCap, LogOut,
  Bell, Settings, ChevronDown, Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Module imports
import { SessionsModule } from "./modules/SessionsModule";
import { AssessmentsModule } from "./modules/AssessmentsModule";
import { LessonsModule } from "./modules/LessonsModule";
import { AvailabilityModule } from "./modules/AvailabilityModule";

import "./TeacherDashboard.css";

/* ─── Constants ─── */
const ISLAMIC_SUBJECTS = ["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"];
const SCHOOL_SUBJECTS  = ["Maths", "English", "Biology", "Chemistry", "Physics", "IELTS"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BOOKINGS_PER_PAGE = 8;
const HISTORY_PER_PAGE  = 6;

type TeachingMode = "online" | "home_visit" | "both";
type Gender       = "male" | "female";
type BookingFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";
type AbsenceReason = "student_absent" | "teacher_unavailable" | "other";

type ActiveModule = "dashboard" | "sessions" | "assessments" | "lessons" | "availability";

const inferReason = (b: BookingRow): AbsenceReason => {
  if (b.id.charCodeAt(b.id.length - 1) % 3 === 0) return "teacher_unavailable";
  if (b.id.charCodeAt(b.id.length - 1) % 3 === 1) return "student_absent";
  return "other";
};

const reasonLabel: Record<AbsenceReason, string> = {
  student_absent:     "Student absent",
  teacher_unavailable:"Teacher unavailable",
  other:              "Other",
};
const reasonChipClass: Record<AbsenceReason, string> = {
  student_absent:     "td-reason-chip td-reason-chip-student",
  teacher_unavailable:"td-reason-chip td-reason-chip-teacher",
  other:              "td-reason-chip td-reason-chip-other",
};

/* ─── Types ─── */
export interface BookingRow {
  id: string;
  student_id: string;
  subject: string;
  start_at: string;
  duration_min: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  mode: TeachingMode;
  price_usd: number;
}

export interface AvailabilityRow {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface StudentSummary {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  sessions: number;
  lastSubject: string;
  lastBookingAt: string;
}

export interface StudentProfile {
  full_name: string | null;
  avatar_url: string | null;
}

const newSlot = (): AvailabilityRow => ({ day_of_week: 1, start_time: "16:00", end_time: "18:00" });

export const initials = (name: string | null) =>
  (name ?? "S").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export const statusDotClass: Record<BookingRow["status"], string> = {
  completed: "td-history-dot td-history-dot-attended",
  pending:   "td-history-dot td-history-dot-cancelled",
  confirmed: "td-history-dot td-history-dot-attended",
  cancelled: "td-history-dot td-history-dot-cancelled",
};
export const statusBadgeClass: Record<BookingRow["status"], string> = {
  pending:   "td-badge td-badge-pending",
  confirmed: "td-badge td-badge-confirmed",
  completed: "td-badge td-badge-completed",
  cancelled: "td-badge td-badge-cancelled",
};

/* ── Sidebar nav items ── */
const NAV_ITEMS: { id: ActiveModule; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "dashboard",    label: "Dashboard",    icon: LayoutDashboard, desc: "Overview & stats" },
  { id: "sessions",     label: "Sessions",     icon: Video,           desc: "Active, upcoming & past" },
  { id: "assessments",  label: "Assessments",  icon: FileText,        desc: "Upload & grade" },
  { id: "lessons",      label: "Lessons",      icon: BookOpen,        desc: "Notes & drive links" },
  { id: "availability", label: "Availability", icon: Calendar,        desc: "Weekly schedule" },
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  /* ── Sidebar state ── */
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard");

  /* ── Data state ── */
  const [loading,            setLoading]            = useState(true);
  const [savingProfile,      setSavingProfile]      = useState(false);
  const [bookingActionId,    setBookingActionId]    = useState<string | null>(null);
  const [bookings,           setBookings]           = useState<BookingRow[]>([]);
  const [availability,       setAvailability]       = useState<AvailabilityRow[]>([newSlot()]);
  const [studentProfiles,    setStudentProfiles]    = useState<Record<string, StudentProfile>>({});

  const [bookingFilter,  setBookingFilter]  = useState<BookingFilter>("all");
  const [bookingPage,    setBookingPage]    = useState(1);

  const [profileForm, setProfileForm] = useState({
    fullName: "", email: "", phone: "", bio: "",
    subjects: [] as string[], education: [""],
    rate: 20, mode: "online" as TeachingMode,
    gender: "male" as Gender, country: "", city: "",
    quranLevel: "", experienceYears: 1,
  });

  /* ── Data loading ── */
  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profileResult, teacherResult, bookingResult, availabilityResult] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
        supabase.from("teacher_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("bookings").select("*").eq("teacher_id", user.id).order("start_at", { ascending: false }),
        supabase.from("availability").select("*").eq("teacher_id", user.id).order("day_of_week", { ascending: true }).order("start_time", { ascending: true }),
      ]);

      const bookingsData = (bookingResult.data ?? []) as BookingRow[];
      setBookings(bookingsData);

      const nextAvailability = (availabilityResult.data ?? []) as AvailabilityRow[];
      setAvailability(nextAvailability.length > 0 ? nextAvailability : [newSlot()]);

      setProfileForm({
        fullName:        profileResult.data?.full_name ?? "",
        email:           user.email ?? "",
        phone:           profileResult.data?.phone ?? "",
        bio:             teacherResult.data?.bio ?? "",
        subjects:        teacherResult.data?.subjects ?? [],
        education:       (teacherResult.data?.education?.length ? teacherResult.data.education : [""]) ?? [""],
        rate:            Number(teacherResult.data?.hourly_rate_usd ?? 20),
        mode:            (teacherResult.data?.mode as TeachingMode) ?? "online",
        gender:          (teacherResult.data?.gender as Gender) ?? "male",
        country:         teacherResult.data?.country ?? "",
        city:            teacherResult.data?.city ?? "",
        quranLevel:      teacherResult.data?.quran_level ?? "",
        experienceYears: Number(teacherResult.data?.experience_years ?? 1),
      });

      const studentIds = [...new Set(bookingsData.map((b) => b.student_id))];
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles").select("id, full_name, avatar_url").in("id", studentIds);
        setStudentProfiles(
          Object.fromEntries((profiles ?? []).map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]))
        );
      } else {
        setStudentProfiles({});
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to load teacher dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDashboard(); }, [user]);

  /* ── Profile handlers ── */
  const toggleSubject = (subject: string) =>
    setProfileForm((c) => ({
      ...c,
      subjects: c.subjects.includes(subject)
        ? c.subjects.filter((s) => s !== subject)
        : [...c.subjects, subject],
    }));

  const updateEducation = (idx: number, val: string) =>
    setProfileForm((c) => { const e = [...c.education]; e[idx] = val; return { ...c, education: e }; });

  const addEducation    = () =>
    setProfileForm((c) => ({ ...c, education: [...c.education, ""] }));

  const removeEducation = (idx: number) =>
    setProfileForm((c) => {
      const e = c.education.filter((_, i) => i !== idx);
      return { ...c, education: e.length > 0 ? e : [""] };
    });

  /* ── Save profile ── */
  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const nextEmail = profileForm.email.trim();
      if (nextEmail && nextEmail !== user.email) {
        const { error } = await supabase.auth.updateUser({ email: nextEmail });
        if (error) throw error;
        toast.info("Email change requested. Confirm from the verification email.");
      }
      const { error: pe } = await supabase.from("profiles")
        .update({ full_name: profileForm.fullName, phone: profileForm.phone }).eq("id", user.id);
      if (pe) throw pe;
      const { error: te } = await supabase.from("teacher_profiles").upsert(
        { user_id: user.id, subjects: profileForm.subjects, education: profileForm.education.map((e) => e.trim()).filter(Boolean),
          hourly_rate_usd: profileForm.rate, mode: profileForm.mode, bio: profileForm.bio,
          quran_level: profileForm.quranLevel, gender: profileForm.gender, country: profileForm.country,
          city: profileForm.city, experience_years: profileForm.experienceYears },
        { onConflict: "user_id" }
      );
      if (te) throw te;
      toast.success("Profile saved");
      void loadDashboard();
    } catch (e: any) { toast.error(e?.message ?? "Failed to save profile"); }
    finally         { setSavingProfile(false); }
  };

  const updateBookingStatus = async (id: string, status: BookingRow["status"]) => {
    setBookingActionId(id);
    try {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success(`Booking marked ${status}`);
      void loadDashboard();
    } catch (e: any) { toast.error(e?.message ?? "Failed to update booking"); }
    finally         { setBookingActionId(null); }
  };

  /* ── Derived data ── */
  const upcomingBookings  = bookings.filter((b) => new Date(b.start_at) >= new Date() && b.status !== "cancelled").slice(0, 6);
  const pendingBookings   = bookings.filter((b) => b.status === "pending");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalEarnings     = completedBookings.reduce((s, b) => s + Number(b.price_usd), 0);
  const totalStudents     = Object.keys(studentProfiles).length;

  const profileCompletion = Math.round(
    [profileForm.fullName, profileForm.email, profileForm.phone, profileForm.bio,
     profileForm.subjects.length > 0, profileForm.education.some((e) => e.trim().length > 0),
     availability.length > 0].filter(Boolean).length / 7 * 100
  );

  const studentSummaries = useMemo<StudentSummary[]>(() => {
    return Object.entries(studentProfiles).map(([id, profile]) => {
      const sb = bookings.filter((b) => b.student_id === id);
      const lb = [...sb].sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())[0];
      return { id, full_name: profile.full_name, avatar_url: profile.avatar_url,
               sessions: sb.length, lastSubject: lb?.subject ?? "Session", lastBookingAt: lb?.start_at ?? new Date().toISOString() };
    }).sort((a, b) => b.sessions - a.sessions);
  }, [bookings, studentProfiles]);

  const filteredBookings    = bookings.filter((b) => bookingFilter === "all" || b.status === bookingFilter);
  const bookingTotalPages   = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE);
  const pagedBookings       = filteredBookings.slice((bookingPage - 1) * BOOKINGS_PER_PAGE, bookingPage * BOOKINGS_PER_PAGE);

  /* ── Nav click handler ── */
  const handleNavClick = (id: ActiveModule) => {
    setActiveModule(id);
    setSidebarOpen(false);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="td-loading-spinner" />
      </div>
    );
  }

  /* ── Shared props for modules ── */
  const sharedProps = {
    user,
    bookings,
    studentProfiles,
    studentSummaries,
    onReload: loadDashboard,
  };

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className="td-shell">
      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="td-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn("td-sidebar", sidebarOpen && "td-sidebar-open")}>
        <div className="td-sidebar-header">
          <div className="td-sidebar-logo">
            <School2 className="h-5 w-5 text-primary" />
            <span>TeachPortal</span>
          </div>
          <button className="td-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Teacher mini-profile in sidebar */}
        <div className="td-sidebar-profile">
          <div className="td-sidebar-avatar">
            {initials(profileForm.fullName)}
          </div>
          <div className="td-sidebar-profile-info">
            <div className="font-semibold text-sm truncate">{profileForm.fullName || "Teacher"}</div>
            <div className="text-xs text-muted-foreground truncate">{profileForm.email}</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="td-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn("td-sidebar-nav-item", activeModule === item.id && "td-sidebar-nav-item-active")}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-[11px] text-muted-foreground truncate">{item.desc}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="td-sidebar-footer">
          <button className="td-sidebar-nav-item" onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Settings</span>
          </button>
          <button className="td-sidebar-nav-item text-red-500 hover:text-red-600" onClick={() => supabase.auth.signOut()}>
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="td-main">
        {/* ── Top bar ── */}
        <header className="td-topbar">
          <button className="td-burger" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="td-topbar-title">
            {NAV_ITEMS.find((n) => n.id === activeModule)?.label ?? "Dashboard"}
          </div>
          <div className="td-topbar-actions">
            <button className="td-topbar-icon-btn" onClick={() => navigate("/messages")}>
              <MessageSquare className="h-4 w-4" />
            </button>
            <button className="td-topbar-icon-btn relative">
              <Bell className="h-4 w-4" />
              {pendingBookings.length > 0 && (
                <span className="td-notif-dot">{pendingBookings.length}</span>
              )}
            </button>
          </div>
        </header>

        {/* ── Module Content ── */}
        <div className="td-content">
          {activeModule === "dashboard" && (
            <DashboardHome
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              profileCompletion={profileCompletion}
              upcomingBookings={upcomingBookings}
              pendingBookings={pendingBookings}
              completedBookings={completedBookings}
              totalEarnings={totalEarnings}
              totalStudents={totalStudents}
              studentSummaries={studentSummaries}
              studentProfiles={studentProfiles}
              filteredBookings={filteredBookings}
              pagedBookings={pagedBookings}
              bookingFilter={bookingFilter}
              bookingPage={bookingPage}
              bookingTotalPages={bookingTotalPages}
              bookingActionId={bookingActionId}
              bookings={bookings}
              savingProfile={savingProfile}
              toggleSubject={toggleSubject}
              updateEducation={updateEducation}
              addEducation={addEducation}
              removeEducation={removeEducation}
              saveProfile={saveProfile}
              updateBookingStatus={updateBookingStatus}
              setBookingFilter={setBookingFilter}
              setBookingPage={setBookingPage}
              navigate={navigate}
            />
          )}

          {activeModule === "sessions" && (
            <SessionsModule {...sharedProps} updateBookingStatus={updateBookingStatus} bookingActionId={bookingActionId} />
          )}

          {activeModule === "assessments" && (
            <AssessmentsModule {...sharedProps} />
          )}

          {activeModule === "lessons" && (
            <LessonsModule {...sharedProps} />
          )}

          {activeModule === "availability" && (
            <AvailabilityModule
              user={user}
              availability={availability}
              setAvailability={setAvailability}
              onReload={loadDashboard}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   DASHBOARD HOME MODULE (inline — teacher info + KPIs + bookings)
══════════════════════════════════════════════════════════════ */
const DashboardHome = ({
  profileForm, setProfileForm, profileCompletion,
  upcomingBookings, pendingBookings, completedBookings, totalEarnings, totalStudents,
  studentSummaries, studentProfiles, filteredBookings, pagedBookings,
  bookingFilter, bookingPage, bookingTotalPages, bookingActionId, bookings,
  savingProfile, toggleSubject, updateEducation, addEducation, removeEducation,
  saveProfile, updateBookingStatus, setBookingFilter, setBookingPage, navigate,
}: any) => {
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const pastBookings    = bookings.filter((b: BookingRow) => new Date(b.start_at) < new Date());
  const attendedCount   = pastBookings.filter((b: BookingRow) => b.status === "completed").length;
  const attendedPct     = pastBookings.length > 0 ? Math.round((attendedCount / pastBookings.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── HERO ── */}
      <section className="td-hero">
        <div className="td-hero-blob-tr" />
        <div className="td-hero-blob-bl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="td-hero-avatar">
              {initials(profileForm.fullName)}
            </div>
            <div className="space-y-2">
              <div className="td-hero-portal-tag">
                <School2 className="h-3.5 w-3.5" /> Teacher Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                {profileForm.fullName || "Welcome, Teacher"}
              </h1>
              <p className="text-sm text-muted-foreground max-w-md">
                {profileForm.bio || "Add a bio to your profile so students know who you are."}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profileForm.subjects.slice(0, 5).map((s: string) => (
                  <span key={s} className="td-stat-pill">{s}</span>
                ))}
                {profileForm.experienceYears > 0 && (
                  <span className="td-stat-pill">
                    <Star className="h-3 w-3" /> {profileForm.experienceYears} yrs exp
                  </span>
                )}
                {profileForm.city && (
                  <span className="td-stat-pill">
                    <MapPin className="h-3 w-3" /> {profileForm.city}{profileForm.country ? `, ${profileForm.country}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile completion card */}
          <div className="td-completion-card">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold">Profile completion</span>
              <span className="text-muted-foreground">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">Complete your profile to appear in more searches.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setShowProfileEdit(true)}>
                Edit profile
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI CARDS ── */}
      <section className="td-kpi-grid">
        {[
          { label: "Upcoming sessions", value: upcomingBookings.length,        icon: Calendar,     iconBg: "bg-primary/10",   iconColor: "text-primary"   },
          { label: "Pending requests",  value: pendingBookings.length,          icon: MessageSquare,iconBg: "bg-amber-500/10", iconColor: "text-amber-600" },
          { label: "Students",          value: totalStudents,                   icon: Users,        iconBg: "bg-blue-500/10",  iconColor: "text-blue-600"  },
          { label: "Total earnings",    value: `$${totalEarnings.toFixed(2)}`,  icon: TrendingUp,   iconBg: "bg-green-500/10", iconColor: "text-green-600" },
        ].map((item) => (
          <div key={item.label} className="td-kpi-card">
            <div className="flex items-center justify-between">
              <span className="td-kpi-label">{item.label}</span>
              <div className={cn("td-kpi-icon", item.iconBg)}>
                <item.icon className={cn("h-4 w-4", item.iconColor)} />
              </div>
            </div>
            <div className="td-kpi-value">{item.value}</div>
          </div>
        ))}
      </section>

      {/* ── MAIN GRID ── */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* ALL BOOKINGS */}
          <section className="td-card">
            <div className="td-card-header">
              <div>
                <h2 className="td-card-title flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> All Bookings
                </h2>
                <p className="td-card-sub">Every booking across all statuses.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              {(["all", "pending", "confirmed", "completed", "cancelled"] as BookingFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => { setBookingFilter(f); setBookingPage(1); }}
                  className={cn("td-filter-pill", bookingFilter === f ? "td-filter-pill-active" : "td-filter-pill-inactive")}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== "all" && (
                    <span className="ml-1 opacity-70">
                      ({bookings.filter((b: BookingRow) => b.status === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            {filteredBookings.length === 0 ? (
              <div className="td-empty">
                <BookOpen className="h-8 w-8 opacity-30" />
                <span>No bookings for this filter.</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-1 rounded-xl border border-border">
                  <table className="td-table min-w-[560px]">
                    <thead>
                      <tr>
                        <th>Subject</th><th>Student</th><th>Date</th><th>Duration</th>
                        <th>Mode</th><th>Price</th><th>Status</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedBookings.map((b: BookingRow) => {
                        const studentName = studentProfiles[b.student_id]?.full_name ?? "Student";
                        return (
                          <tr key={b.id}>
                            <td className="font-semibold">{b.subject}</td>
                            <td>{studentName}</td>
                            <td className="whitespace-nowrap">{format(new Date(b.start_at), "dd MMM yy")}</td>
                            <td>{b.duration_min} min</td>
                            <td className="capitalize">{b.mode.replace("_", " ")}</td>
                            <td className="font-semibold">${Number(b.price_usd).toFixed(2)}</td>
                            <td><span className={statusBadgeClass[b.status]}>{b.status}</span></td>
                            <td>
                              <div className="flex gap-1">
                                {b.status === "pending" && (
                                  <>
                                    <Button size="sm" className="h-6 px-2 text-xs" onClick={() => updateBookingStatus(b.id, "confirmed")} disabled={bookingActionId === b.id}>Accept</Button>
                                    <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => updateBookingStatus(b.id, "cancelled")} disabled={bookingActionId === b.id}>Decline</Button>
                                  </>
                                )}
                                {b.status === "confirmed" && new Date(b.start_at) < new Date() && (
                                  <Button size="sm" className="h-6 px-2 text-xs" onClick={() => updateBookingStatus(b.id, "completed")} disabled={bookingActionId === b.id}>Complete</Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {bookingTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Page {bookingPage} of {bookingTotalPages} · {filteredBookings.length} bookings
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setBookingPage((p: number) => Math.max(1, p - 1))} disabled={bookingPage === 1}
                        className="td-page-btn td-page-btn-inactive disabled:opacity-40 flex items-center justify-center">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      {Array.from({ length: bookingTotalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setBookingPage(p)}
                          className={cn("td-page-btn", bookingPage === p ? "td-page-btn-active" : "td-page-btn-inactive")}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setBookingPage((p: number) => Math.min(bookingTotalPages, p + 1))} disabled={bookingPage === bookingTotalPages}
                        className="td-page-btn td-page-btn-inactive disabled:opacity-40 flex items-center justify-center">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* UPCOMING SESSIONS */}
          <section className="td-card">
            <div className="td-card-header">
              <div>
                <h2 className="td-card-title flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Upcoming Sessions
                </h2>
                <p className="td-card-sub">Accept, decline, or complete bookings.</p>
              </div>
            </div>
            {upcomingBookings.length === 0 ? (
              <div className="td-empty"><Calendar className="h-8 w-8 opacity-30" /><span>No upcoming sessions yet.</span></div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((b: BookingRow) => (
                  <div key={b.id} className="td-booking-item">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="td-booking-subject">{b.subject}</div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(b.start_at), "PPp")}</span>
                          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {b.duration_min} min</span>
                        </div>
                      </div>
                      <span className={statusBadgeClass[b.status]}>{b.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {b.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")} disabled={bookingActionId === b.id}>
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")} disabled={bookingActionId === b.id}>
                            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* YOUR STUDENTS */}
          <section className="td-card">
            <div className="td-card-header">
              <div>
                <h2 className="td-card-title flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Your Students
                </h2>
                <p className="td-card-sub">Students you have sessions with.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/messages")}>Inbox</Button>
            </div>
            {studentSummaries.length === 0 ? (
              <div className="td-empty"><Users className="h-8 w-8 opacity-30" /><span>No students yet.</span></div>
            ) : (
              <div className="space-y-2">
                {studentSummaries.map((s: StudentSummary) => (
                  <div key={s.id} className="td-student-card">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="td-student-avatar bg-primary/10 text-primary">{initials(s.full_name)}</div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{s.full_name || "Student"}</div>
                        <div className="text-xs text-muted-foreground">{s.sessions} sessions · {s.lastSubject}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/messages/${s.id}`)}>
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Message
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── PROFILE EDIT MODAL ── */}
      {showProfileEdit && (
        <ProfileEditModal
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          toggleSubject={toggleSubject}
          updateEducation={updateEducation}
          addEducation={addEducation}
          removeEducation={removeEducation}
          savingProfile={savingProfile}
          saveProfile={async () => { await saveProfile(); setShowProfileEdit(false); }}
          onClose={() => setShowProfileEdit(false)}
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PROFILE EDIT MODAL
══════════════════════════════════════════════════════════════ */
const ProfileEditModal = ({
  profileForm, setProfileForm, toggleSubject, updateEducation,
  addEducation, removeEducation, savingProfile, saveProfile, onClose,
}: any) => {
  const ISLAMIC_SUBJECTS = ["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"];
  const SCHOOL_SUBJECTS  = ["Maths", "English", "Biology", "Chemistry", "Physics", "IELTS"];
  return (
    <div className="td-modal-overlay" onClick={onClose}>
      <div className="td-modal" onClick={(e) => e.stopPropagation()}>
        <div className="td-modal-header">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="td-modal-body space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={profileForm.fullName} onChange={(e: any) => setProfileForm((c: any) => ({ ...c, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profileForm.email} onChange={(e: any) => setProfileForm((c: any) => ({ ...c, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={profileForm.phone} onChange={(e: any) => setProfileForm((c: any) => ({ ...c, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Hourly Rate (USD)</Label>
              <Input type="number" value={profileForm.rate} onChange={(e: any) => setProfileForm((c: any) => ({ ...c, rate: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={profileForm.country} onChange={(e: any) => setProfileForm((c: any) => ({ ...c, country: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={profileForm.city} onChange={(e: any) => setProfileForm((c: any) => ({ ...c, city: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Experience (years)</Label>
              <Input type="number" value={profileForm.experienceYears} onChange={(e: any) => setProfileForm((c: any) => ({ ...c, experienceYears: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Teaching Mode</Label>
              <Select value={profileForm.mode} onValueChange={(v: any) => setProfileForm((c: any) => ({ ...c, mode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="home_visit">Home Visit</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea rows={3} value={profileForm.bio} onChange={(e: any) => setProfileForm((c: any) => ({ ...c, bio: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">Islamic</p>
              <div className="flex flex-wrap gap-2">
                {ISLAMIC_SUBJECTS.map((s) => (
                  <label key={s} className="td-subject-chip">
                    <Checkbox checked={profileForm.subjects.includes(s)} onCheckedChange={() => toggleSubject(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-semibold">Academic</p>
              <div className="flex flex-wrap gap-2">
                {SCHOOL_SUBJECTS.map((s) => (
                  <label key={s} className="td-subject-chip">
                    <Checkbox checked={profileForm.subjects.includes(s)} onCheckedChange={() => toggleSubject(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Education</Label>
            {profileForm.education.map((edu: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <Input value={edu} onChange={(e: any) => updateEducation(idx, e.target.value)} placeholder="e.g. B.Sc Mathematics, University of Lahore" />
                <Button type="button" variant="ghost" onClick={() => removeEducation(idx)}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addEducation}>+ Add</Button>
          </div>
        </div>
        <div className="td-modal-footer">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={saveProfile} disabled={savingProfile}>
            <Save className="mr-2 h-4 w-4" /> {savingProfile ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;