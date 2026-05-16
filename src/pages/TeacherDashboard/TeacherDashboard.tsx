import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, format, startOfDay } from "date-fns";
import {
  AlertCircle, BookOpen, Calendar, CheckCircle, ChevronLeft,
  ChevronRight, Clock, Filter, MapPin, MessageSquare, Plus,
  Save, School2, TrendingUp, User, Users, XCircle,
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

/* ─── Absence reason inference ─── */
type AbsenceReason = "student_absent" | "teacher_unavailable" | "other";

const inferReason = (b: BookingRow): AbsenceReason => {
  // Real implementation would use a DB field; here we demo with deterministic logic
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
interface BookingRow {
  id: string;
  student_id: string;
  subject: string;
  start_at: string;
  duration_min: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  mode: TeachingMode;
  price_usd: number;
}

interface AvailabilityRow {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface StudentSummary {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  sessions: number;
  lastSubject: string;
  lastBookingAt: string;
}

const newSlot = (): AvailabilityRow => ({ day_of_week: 1, start_time: "16:00", end_time: "18:00" });

/* ─── Small helpers ─── */
const initials = (name: string | null) =>
  (name ?? "S").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const statusDotClass: Record<BookingRow["status"], string> = {
  completed: "td-history-dot td-history-dot-attended",
  pending:   "td-history-dot td-history-dot-cancelled",
  confirmed: "td-history-dot td-history-dot-attended",
  cancelled: "td-history-dot td-history-dot-cancelled",
};
const statusBadgeClass: Record<BookingRow["status"], string> = {
  pending:   "td-badge td-badge-pending",
  confirmed: "td-badge td-badge-confirmed",
  completed: "td-badge td-badge-completed",
  cancelled: "td-badge td-badge-cancelled",
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  /* ── State ── */
  const [loading,            setLoading]            = useState(true);
  const [savingProfile,      setSavingProfile]      = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [bookingActionId,    setBookingActionId]    = useState<string | null>(null);
  const [bookings,           setBookings]           = useState<BookingRow[]>([]);
  const [availability,       setAvailability]       = useState<AvailabilityRow[]>([newSlot()]);
  const [studentProfiles,    setStudentProfiles]    = useState<Record<string, { full_name: string | null; avatar_url: string | null }>>({});

  /* ── Booking list UI state ── */
  const [bookingFilter,  setBookingFilter]  = useState<BookingFilter>("all");
  const [bookingPage,    setBookingPage]    = useState(1);
  const [historyPage,    setHistoryPage]    = useState(1);

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
  const toggleSubject   = (subject: string) =>
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

  /* ── Availability handlers ── */
  const updateAvailability = (idx: number, field: keyof AvailabilityRow, val: string | number) =>
    setAvailability((c) => { const n = [...c]; n[idx] = { ...n[idx], [field]: val } as AvailabilityRow; return n; });

  const addAvailability    = () => setAvailability((c) => [...c, newSlot()]);
  const removeAvailability = (idx: number) =>
    setAvailability((c) => { const n = c.filter((_, i) => i !== idx); return n.length > 0 ? n : [newSlot()]; });

  /* ── Save handlers ── */
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

  const saveAvailability = async () => {
    if (!user) return;
    setSavingAvailability(true);
    try {
      const slots = availability
        .filter((s) => Number.isFinite(Number(s.day_of_week)) && s.start_time && s.end_time)
        .map((s) => ({ teacher_id: user.id, day_of_week: Number(s.day_of_week), start_time: s.start_time, end_time: s.end_time }));
      const { error: de } = await supabase.from("availability").delete().eq("teacher_id", user.id);
      if (de) throw de;
      if (slots.length > 0) { const { error: ie } = await supabase.from("availability").insert(slots); if (ie) throw ie; }
      toast.success("Availability updated");
      void loadDashboard();
    } catch (e: any) { toast.error(e?.message ?? "Failed to save availability"); }
    finally         { setSavingAvailability(false); }
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
  const upcomingBookings = bookings.filter((b) => new Date(b.start_at) >= new Date() && b.status !== "cancelled").slice(0, 6);
  const pendingBookings  = bookings.filter((b) => b.status === "pending");
  const completedBookings= bookings.filter((b) => b.status === "completed");
  const cancelledBookings= bookings.filter((b) => b.status === "cancelled");
  const totalEarnings    = completedBookings.reduce((s, b) => s + Number(b.price_usd), 0);
  const totalStudents    = Object.keys(studentProfiles).length;

  const profileCompletion = Math.round(
    [profileForm.fullName, profileForm.email, profileForm.phone, profileForm.bio,
     profileForm.subjects.length > 0, profileForm.education.some((e) => e.trim().length > 0),
     availability.length > 0].filter(Boolean).length / 7 * 100
  );

  const nextAvailabilityLabel = useMemo(() => {
    if (availability.length === 0) return "Add your weekly availability";
    const next = [...availability].sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))[0];
    const today = startOfDay(new Date());
    const offset = (next.day_of_week - today.getDay() + 7) % 7;
    const nextDate = addDays(today, offset);
    return `${format(nextDate, "EEE, MMM d")} · ${next.start_time} - ${next.end_time}`;
  }, [availability]);

  const studentSummaries = useMemo<StudentSummary[]>(() => {
    return Object.entries(studentProfiles).map(([id, profile]) => {
      const sb = bookings.filter((b) => b.student_id === id);
      const lb = [...sb].sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())[0];
      return { id, full_name: profile.full_name, avatar_url: profile.avatar_url,
               sessions: sb.length, lastSubject: lb?.subject ?? "Session", lastBookingAt: lb?.start_at ?? new Date().toISOString() };
    }).sort((a, b) => b.sessions - a.sessions);
  }, [bookings, studentProfiles]);

  /* ── Session history derived ── */
  const pastBookings    = bookings.filter((b) => new Date(b.start_at) < new Date());
  const attendedCount   = pastBookings.filter((b) => b.status === "completed").length;
  const unattendedCount = pastBookings.filter((b) => b.status === "cancelled").length;
  const attendedPct     = pastBookings.length > 0 ? Math.round((attendedCount / pastBookings.length) * 100) : 0;

  /* ── Filtered bookings (All Bookings section) ── */
  const filteredBookings = bookings.filter((b) => bookingFilter === "all" || b.status === bookingFilter);
  const bookingTotalPages = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE);
  const pagedBookings     = filteredBookings.slice((bookingPage - 1) * BOOKINGS_PER_PAGE, bookingPage * BOOKINGS_PER_PAGE);

  /* ── History pagination ── */
  const histTotalPages = Math.ceil(pastBookings.length / HISTORY_PER_PAGE);
  const pagedHistory   = pastBookings.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Loading teacher dashboard…</div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ════════════ HERO ════════════ */}
        <section className="td-hero">
          <div className="td-hero-blob-tr" />
          <div className="td-hero-blob-bl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="td-hero-portal-tag">Teacher portal</div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight">
                Welcome back{profileForm.fullName ? `, ${profileForm.fullName.split(" ")[0]}` : ""}
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                Manage your teaching subjects, availability, session history, and student conversations — all in one place.
              </p>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <span className="td-stat-pill"><Users className="w-3.5 h-3.5" /> {totalStudents} students</span>
                <span className="td-stat-pill"><Calendar className="w-3.5 h-3.5" /> {upcomingBookings.length} upcoming</span>
                <span className="td-stat-pill"><School2 className="w-3.5 h-3.5" /> {profileForm.subjects.length} subjects</span>
              </div>
            </div>

            <div className="td-completion-card">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold">Profile completion</span>
                <span className="text-muted-foreground">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">Complete remaining fields to appear in more searches.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => document.getElementById("td-profile")?.scrollIntoView({ behavior: "smooth" })}>
                  Edit profile
                </Button>
                <Button size="sm" variant="outline" onClick={() => document.getElementById("td-availability")?.scrollIntoView({ behavior: "smooth" })}>
                  Update schedule
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ KPI CARDS ════════════ */}
        <section className="td-kpi-grid">
          {[
            { label: "Upcoming sessions", value: upcomingBookings.length,        icon: Calendar,     iconBg: "bg-primary/10",     iconColor: "text-primary"    },
            { label: "Pending requests",  value: pendingBookings.length,          icon: MessageSquare,iconBg: "bg-amber-500/10",   iconColor: "text-amber-600"  },
            { label: "Students",          value: totalStudents,                   icon: Users,        iconBg: "bg-blue-500/10",    iconColor: "text-blue-600"   },
            { label: "Total earnings",    value: `$${totalEarnings.toFixed(2)}`,  icon: TrendingUp,   iconBg: "bg-green-500/10",   iconColor: "text-green-600"  },
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

        {/* ════════════ MAIN GRID ════════════ */}
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* ── ALL BOOKINGS ── */}
            <section className="td-card">
              <div className="td-card-header">
                <div>
                  <h2 className="td-card-title flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> All Bookings
                  </h2>
                  <p className="td-card-sub">Every booking across all statuses with filtering.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/bookings")}>
                  Open bookings
                </Button>
              </div>

              {/* Filter pills */}
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
                        ({bookings.filter((b) => b.status === f).length})
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
                          <th>Subject</th>
                          <th>Student</th>
                          <th>Date</th>
                          <th>Duration</th>
                          <th>Mode</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedBookings.map((b) => {
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

                  {/* Pagination */}
                  {bookingTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        Page {bookingPage} of {bookingTotalPages} · {filteredBookings.length} bookings
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setBookingPage((p) => Math.max(1, p - 1))}
                          disabled={bookingPage === 1}
                          className="td-page-btn td-page-btn-inactive disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        {Array.from({ length: bookingTotalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setBookingPage(p)}
                            className={cn("td-page-btn", p === bookingPage ? "td-page-btn-active" : "td-page-btn-inactive")}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setBookingPage((p) => Math.min(bookingTotalPages, p + 1))}
                          disabled={bookingPage === bookingTotalPages}
                          className="td-page-btn td-page-btn-inactive disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ── SESSION HISTORY ── */}
            <section className="td-card">
              <div className="td-card-header">
                <div>
                  <h2 className="td-card-title flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Session History
                  </h2>
                  <p className="td-card-sub">Past sessions — attended, missed, and cancelled.</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total past",   value: pastBookings.length,   color: "bg-muted-foreground/40", textColor: "" },
                  { label: "Attended",     value: attendedCount,         color: "bg-green-500",           textColor: "text-green-600 dark:text-green-400" },
                  { label: "Unattended",   value: unattendedCount,       color: "bg-red-400",             textColor: "text-red-600 dark:text-red-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-background/60 p-3 text-center">
                    <div className={cn("text-2xl font-extrabold font-display", s.textColor)}>{s.value}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Attendance bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Attendance rate</span>
                  <span className="font-semibold text-foreground">{attendedPct}%</span>
                </div>
                <div className="td-hist-stat-bar">
                  <div className="td-hist-stat-bar-fill bg-green-500" style={{ width: `${attendedPct}%` }} />
                  <div className="td-hist-stat-bar-fill bg-red-400 flex-1" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500" />Attended</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-400" />Missed / Cancelled</span>
                </div>
              </div>

              {/* Reason breakdown */}
              {unattendedCount > 0 && (
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Absence breakdown</p>
                  {(["student_absent", "teacher_unavailable", "other"] as AbsenceReason[]).map((reason) => {
                    const cnt = cancelledBookings.filter((b) => inferReason(b) === reason).length;
                    if (cnt === 0) return null;
                    return (
                      <div key={reason} className="flex items-center justify-between text-xs">
                        <span className={reasonChipClass[reason]}>{reasonLabel[reason]}</span>
                        <span className="font-semibold">{cnt} session{cnt !== 1 ? "s" : ""}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* History list */}
              {pastBookings.length === 0 ? (
                <div className="td-empty">
                  <Clock className="h-8 w-8 opacity-30" />
                  <span>No past sessions yet.</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {pagedHistory.map((b) => {
                      const isAttended  = b.status === "completed";
                      const isCancelled = b.status === "cancelled";
                      const reason      = isCancelled ? inferReason(b) : null;
                      const studentName = studentProfiles[b.student_id]?.full_name ?? "Student";
                      return (
                        <div key={b.id} className="td-history-row">
                          <span className={isAttended ? "td-history-dot td-history-dot-attended" : "td-history-dot td-history-dot-missed"} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{b.subject}</span>
                              <span className={statusBadgeClass[b.status]}>{b.status}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                              <span>{studentName}</span>
                              <span>{format(new Date(b.start_at), "dd MMM yyyy · p")}</span>
                              <span>{b.duration_min} min · {b.mode.replace("_", " ")}</span>
                            </div>
                            {reason && (
                              <div className="mt-1.5">
                                <span className={reasonChipClass[reason]}>
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  {reasonLabel[reason]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-muted-foreground flex-shrink-0">
                            ${Number(b.price_usd).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* History pagination */}
                  {histTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        Page {historyPage} of {histTotalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          disabled={historyPage === 1}
                          className="td-page-btn td-page-btn-inactive disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        {Array.from({ length: histTotalPages }, (_, i) => i + 1).map((p) => (
                          <button key={p} onClick={() => setHistoryPage(p)}
                            className={cn("td-page-btn", p === historyPage ? "td-page-btn-active" : "td-page-btn-inactive")}>
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setHistoryPage((p) => Math.min(histTotalPages, p + 1))}
                          disabled={historyPage === histTotalPages}
                          className="td-page-btn td-page-btn-inactive disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ── TEACHING PROFILE ── */}
            <section id="td-profile" className="td-form-section">
              <div className="td-card-header">
                <div>
                  <h2 className="td-card-title flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Teaching Profile
                  </h2>
                  <p className="td-card-sub">Details students see before booking you.</p>
                </div>
                <Button onClick={saveProfile} disabled={savingProfile} className="shrink-0">
                  <Save className="mr-2 h-4 w-4" /> {savingProfile ? "Saving…" : "Save profile"}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Full name",    key: "fullName",    type: "text"   },
                  { label: "Email",        key: "email",       type: "email"  },
                  { label: "Phone number", key: "phone",       type: "tel"    },
                  { label: "Hourly rate",  key: "rate",        type: "number" },
                  { label: "Experience (years)", key: "experienceYears", type: "number" },
                  { label: "Quran qualification", key: "quranLevel", type: "text", placeholder: "Ijazah Hafs, Hifz, etc." },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      type={type}
                      value={(profileForm as any)[key]}
                      placeholder={placeholder}
                      onChange={(e) => setProfileForm((c) => ({ ...c, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <Label>Teaching mode</Label>
                  <Select value={profileForm.mode} onValueChange={(v) => setProfileForm((c) => ({ ...c, mode: v as TeachingMode }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="home_visit">Home visit</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={profileForm.gender} onValueChange={(v) => setProfileForm((c) => ({ ...c, gender: v as Gender }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Country / City</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input value={profileForm.country} placeholder="Country" onChange={(e) => setProfileForm((c) => ({ ...c, country: e.target.value }))} />
                    <Input value={profileForm.city}    placeholder="City"    onChange={(e) => setProfileForm((c) => ({ ...c, city:    e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Bio</Label>
                  <Textarea rows={4} value={profileForm.bio} placeholder="Introduce yourself, teaching style, and what makes your lessons effective." onChange={(e) => setProfileForm((c) => ({ ...c, bio: e.target.value }))} />
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <School2 className="h-4 w-4 text-primary" /> Subjects
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[{ title: "Islamic subjects", items: ISLAMIC_SUBJECTS }, { title: "School subjects", items: SCHOOL_SUBJECTS }].map((g) => (
                    <div key={g.title} className="rounded-2xl border border-border p-4 space-y-3">
                      <h3 className="font-semibold text-sm">{g.title}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {g.items.map((s) => (
                          <label key={s} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer transition",
                            profileForm.subjects.includes(s) ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                            <Checkbox checked={profileForm.subjects.includes(s)} onCheckedChange={() => toggleSubject(s)} />
                            <span>{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <User className="h-4 w-4 text-primary" /> Education
                  </div>
                  <Button variant="outline" size="sm" onClick={addEducation}>
                    <Plus className="mr-2 h-4 w-4" /> Add qualification
                  </Button>
                </div>
                <div className="space-y-2">
                  {profileForm.education.map((entry, idx) => (
                    <div key={`${idx}-${entry}`} className="flex flex-col gap-2 rounded-2xl border border-border p-3 sm:flex-row sm:items-center">
                      <Input value={entry} onChange={(e) => updateEducation(idx, e.target.value)} placeholder="E.g. BSc Mathematics, Al-Azhar certification, PGCE" />
                      <Button type="button" variant="ghost" className="sm:w-auto" onClick={() => removeEducation(idx)}>Remove</Button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── AVAILABILITY ── */}
            <section id="td-availability" className="td-form-section">
              <div className="td-card-header">
                <div>
                  <h2 className="td-card-title flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Weekly Availability
                  </h2>
                  <p className="td-card-sub">Set the days and time windows students can book.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addAvailability}><Plus className="mr-2 h-4 w-4" /> Add slot</Button>
                  <Button onClick={saveAvailability} disabled={savingAvailability}>
                    <Save className="mr-2 h-4 w-4" /> {savingAvailability ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                {availability.map((slot, idx) => (
                  <div key={`${slot.day_of_week}-${slot.start_time}-${idx}`} className="td-avail-slot">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Day</Label>
                      <Select value={String(slot.day_of_week)} onValueChange={(v) => updateAvailability(idx, "day_of_week", Number(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{DAYS.map((d, di) => <SelectItem key={d} value={String(di)}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Start time</Label>
                      <Input type="time" value={slot.start_time} onChange={(e) => updateAvailability(idx, "start_time", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">End time</Label>
                      <Input type="time" value={slot.end_time} onChange={(e) => updateAvailability(idx, "end_time", e.target.value)} />
                    </div>
                    <Button type="button" variant="ghost" onClick={() => removeAvailability(idx)} className="text-xs">Remove</Button>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                Next slot: <span className="font-medium text-foreground">{nextAvailabilityLabel}</span>
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6">

            {/* ── UPCOMING SESSIONS ── */}
            <section className="td-card">
              <div className="td-card-header">
                <div>
                  <h2 className="td-card-title flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Upcoming Sessions
                  </h2>
                  <p className="td-card-sub">Accept, decline, or complete bookings.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/bookings")}>View all</Button>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="td-empty">
                  <Calendar className="h-8 w-8 opacity-30" />
                  <span>No upcoming sessions yet.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((b) => (
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
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.mode.replace("_", " ")}</span>
                        <span className="font-semibold text-foreground">${Number(b.price_usd).toFixed(2)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                        {b.status === "confirmed" && new Date(b.start_at) < new Date() && (
                          <Button size="sm" onClick={() => updateBookingStatus(b.id, "completed")} disabled={bookingActionId === b.id}>
                            Mark completed
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── YOUR STUDENTS ── */}
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
                <div className="td-empty">
                  <Users className="h-8 w-8 opacity-30" />
                  <span>No students yet. They appear after the first booking.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {studentSummaries.map((s) => (
                    <div key={s.id} className="td-student-card">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="td-student-avatar bg-primary/10 text-primary">
                          {initials(s.full_name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{s.full_name || "Student"}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {s.sessions} sessions · {s.lastSubject}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{format(new Date(s.lastBookingAt), "PP")}</div>
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
      </div>
    </div>
  );
};

export default TeacherDashboard;