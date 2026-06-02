import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { PageBackButton } from "@/components/PageBackButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  BookOpen, TrendingUp, Star, AlertCircle, CheckCircle,
  Clock, Phone, MessageCircle, X, User, ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import "./student-reports.css";
import { studentsApi } from "@/lib/api/students";
import { reviewsApi } from "@/lib/api/reviews";

/* ─── Types ─── */
interface BookingReport {
  id: string;
  portal: "islamic" | "school";
  subject: string;
  teacher_name: string;
  teacher_id?: string;
  teacher_phone?: string;
  start_at: string;
  duration_min: number;
  status: "completed" | "cancelled" | "pending" | "booked";
  attendance_status?: "present" | "absent" | "late" | null;
  attendance_marked_at?: string | null;
  rating?: number;
  teacher_remarks?: string;
}

interface PortalStats {
  portal: "islamic" | "school";
  totalSessions: number;
  completedSessions: number;
  attendanceRate: number;
  avgRating: number;
}

interface Assessment {
  id: string;
  portal: "islamic" | "school";
  subject: string;
  title: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  date: string;
  teacher_name: string;
  teacher_id?: string;
  teacher_phone?: string;
  remarks?: string;
  status: "completed" | "pending" | "failed";
}

interface TeacherContact {
  name: string;
  teacherId?: string;
  phone?: string;
  subject: string;
  portal: "islamic" | "school";
}

type ProgressFilter = "daily" | "weekly" | "monthly";

/* ─── Helpers ─── */
const getGrade = (pct: number) => {
  if (pct >= 90) return { label: "A+", cls: "sr-grade-a" };
  if (pct >= 80) return { label: "A",  cls: "sr-grade-a" };
  if (pct >= 70) return { label: "B",  cls: "sr-grade-b" };
  if (pct >= 60) return { label: "C",  cls: "sr-grade-c" };
  return { label: "F", cls: "sr-grade-f" };
};

const scoreColor = (pct: number) =>
  pct >= 80 ? "text-green-600 dark:text-green-400"
  : pct >= 60 ? "text-yellow-600 dark:text-yellow-400"
  : "text-red-600 dark:text-red-400";

const barColor = (pct: number) =>
  pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500";

const attendanceBadgeClass = (status?: BookingReport["attendance_status"]) => {
  if (status === "present") return "bg-green-500/10 text-green-600 dark:text-green-400";
  if (status === "late") return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  if (status === "absent") return "bg-red-500/10 text-red-600 dark:text-red-400";
  return "bg-muted text-muted-foreground";
};

const attendanceLabel = (status?: BookingReport["attendance_status"]) => {
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

/* ─── Contact Modal ─── */
const ContactModal = ({
  teacher, onClose,
}: {
  teacher: TeacherContact;
  onClose: () => void;
}) => {
  const phone = teacher.phone ?? "923001234567"; // fallback demo number
  const waLink = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Assalamu Alaikum, I am your student. I wanted to discuss my progress in ${teacher.subject}.`
  )}`;

  return (
    <div className="sr-modal-overlay" onClick={onClose}>
      <div className="sr-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                teacher.portal === "islamic"
                  ? "bg-primary-light text-primary-dark"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              )}
            >
              {teacher.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-base">{teacher.name}</div>
              <div className="text-xs text-muted-foreground">{teacher.subject} Teacher</div>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  teacher.portal === "islamic"
                    ? "bg-primary/10 text-primary"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                )}
              >
                {teacher.portal === "islamic" ? "Islamic Portal" : "School Portal"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phone display */}
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 mb-5">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono font-semibold">+{phone.replace(/\D/g, "")}</span>
        </div>

        {/* Actions */}
        <div className={cn("grid gap-3", teacher.teacherId ? "grid-cols-2" : "grid-cols-1") }>
          {teacher.teacherId ? (
            <Link
              to={`/messages/${teacher.teacherId}`}
              className="flex items-center justify-center gap-2 bg-primary text-white font-semibold text-sm py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Message Teacher
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 bg-muted text-muted-foreground font-semibold text-sm py-3 rounded-xl cursor-not-allowed"
            >
              <MessageCircle className="w-4 h-4" />
              Message unavailable
            </button>
          )}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold text-sm py-3 rounded-xl hover:bg-[#22c55e] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Tapping WhatsApp will open a pre-filled message to the teacher
        </p>
      </div>
    </div>
  );
};

/* ─── Progress Filter Pill ─── */
const FilterPills = ({
  value, onChange,
}: {
  value: ProgressFilter;
  onChange: (v: ProgressFilter) => void;
}) => (
  <div className="flex items-center gap-2 flex-wrap">
    {(["daily", "weekly", "monthly"] as ProgressFilter[]).map((f) => (
      <button
        key={f}
        onClick={() => onChange(f)}
        className={cn("sr-filter-pill", value === f ? "sr-filter-pill-active" : "sr-filter-pill-inactive")}
      >
        {f.charAt(0).toUpperCase() + f.slice(1)}
      </button>
    ))}
  </div>
);

/* ─── Progress chart data by filter ─── */
const buildProgressData = (filter: ProgressFilter) => {
  if (filter === "daily") {
    return [
      { label: "Mon", islamic: 70, school: 60 },
      { label: "Tue", islamic: 75, school: 65 },
      { label: "Wed", islamic: 68, school: 72 },
      { label: "Thu", islamic: 80, school: 74 },
      { label: "Fri", islamic: 85, school: 70 },
      { label: "Sat", islamic: 90, school: 80 },
      { label: "Sun", islamic: 88, school: 82 },
    ];
  }
  if (filter === "weekly") {
    return [
      { label: "Wk 1", islamic: 65, school: 55 },
      { label: "Wk 2", islamic: 72, school: 63 },
      { label: "Wk 3", islamic: 78, school: 70 },
      { label: "Wk 4", islamic: 85, school: 78 },
    ];
  }
  return [
    { label: "Jan", islamic: 65, school: 55 },
    { label: "Feb", islamic: 72, school: 62 },
    { label: "Mar", islamic: 78, school: 70 },
    { label: "Apr", islamic: 85, school: 75 },
    { label: "May", islamic: 88, school: 82 },
    { label: "Jun", islamic: 92, school: 88 },
  ];
};

/* ─── Main Component ─── */
const StudentReports = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingReport[]>([]);
  const [portalStats, setPortalStats] = useState<PortalStats[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("monthly");
  const [contactTeacher, setContactTeacher] = useState<TeacherContact | null>(null);
  const [assessmentPortalFilter, setAssessmentPortalFilter] = useState<"all" | "islamic" | "school">("all");
  const [testListExpanded, setTestListExpanded] = useState(false);
  const [testListPage, setTestListPage] = useState(1);
  const TEST_LIST_PAGE_SIZE = 3;

  /* Mock teacher phones for demo */
  const teacherPhones: Record<string, string> = {
    "Ustadh Ahmed":  "923001111111",
    "Sister Fatima": "923002222222",
    "Ustadh Ali":    "923003333333",
    "Mr. Johnson":   "923004444444",
    "Ms. Roberts":   "923005555555",
    "Dr. Smith":     "923006666666",
  };

  useEffect(() => {
    if (!user || role !== "student") {
      navigate("/dashboard/student");
      return;
    }

    const fetchReports = async () => {
      try {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .eq("student_id", user.id)
          .order("start_at", { ascending: false });

        if (bookingsData) {
          const enrichedBookings = bookingsData.map((b, idx) => ({
            ...b,
            portal: idx % 2 === 0 ? "islamic" : "school",
            teacher_name: `Teacher ${idx + 1}`,
            teacher_id: b.teacher_id,
            teacher_phone: "923001234567",
            attendance_status: b.attendance_status ?? null,
            attendance_marked_at: b.attendance_marked_at ?? null,
            rating: Math.floor(Math.random() * 2) + 4,
            teacher_remarks: [
              "Great progress with pronunciation!",
              "Needs more practice on complex topics",
              "Excellent engagement and participation",
              "Keep practicing regularly",
              "Very quick learner!",
            ][Math.floor(Math.random() * 5)],
          })) as BookingReport[];

          setBookings(enrichedBookings);

          const islamic = enrichedBookings.filter((b) => b.portal === "islamic");
          const school  = enrichedBookings.filter((b) => b.portal === "school");

          setPortalStats([
            {
              portal: "islamic",
              totalSessions: islamic.length,
              completedSessions: islamic.filter((b) => b.status === "completed").length,
              attendanceRate: islamic.length > 0
                ? Math.round((islamic.filter((b) => b.status === "completed").length / islamic.length) * 100) : 0,
              avgRating: islamic.length > 0
                ? Math.round((islamic.reduce((s, b) => s + (b.rating || 0), 0) / islamic.length) * 10) / 10 : 0,
            },
            {
              portal: "school",
              totalSessions: school.length,
              completedSessions: school.filter((b) => b.status === "completed").length,
              attendanceRate: school.length > 0
                ? Math.round((school.filter((b) => b.status === "completed").length / school.length) * 100) : 0,
              avgRating: school.length > 0
                ? Math.round((school.reduce((s, b) => s + (b.rating || 0), 0) / school.length) * 10) / 10 : 0,
            },
          ]);

          setAssessments([
            {
              id: "1", portal: "islamic", subject: "Quran",
              title: "Surah Al-Fatiha Recitation",
              totalMarks: 100, marksObtained: 92, percentage: 92,
              date: new Date(Date.now() - 7 * 86400000).toISOString(),
              teacher_name: "Ustadh Ahmed",
              teacher_id: undefined,
              teacher_phone: teacherPhones["Ustadh Ahmed"],
              remarks: "Excellent pronunciation and Tajweed. Keep practicing the longer surahs.",
              status: "completed",
            },
            {
              id: "2", portal: "islamic", subject: "Tajweed",
              title: "Noon Sakinah Rules",
              totalMarks: 50, marksObtained: 45, percentage: 90,
              date: new Date(Date.now() - 14 * 86400000).toISOString(),
              teacher_name: "Sister Fatima",
              teacher_id: undefined,
              teacher_phone: teacherPhones["Sister Fatima"],
              remarks: "Good understanding of the rules. Practice with more words to improve accuracy.",
              status: "completed",
            },
            {
              id: "3", portal: "school", subject: "Mathematics",
              title: "Algebra: Quadratic Equations",
              totalMarks: 100, marksObtained: 78, percentage: 78,
              date: new Date(Date.now() - 10 * 86400000).toISOString(),
              teacher_name: "Mr. Johnson",
              teacher_id: undefined,
              teacher_phone: teacherPhones["Mr. Johnson"],
              remarks: "Good effort. Need to work on complex number solutions. Practice more problems.",
              status: "completed",
            },
            {
              id: "4", portal: "school", subject: "English",
              title: "Literature: Shakespeare Analysis",
              totalMarks: 100, marksObtained: 85, percentage: 85,
              date: new Date(Date.now() - 5 * 86400000).toISOString(),
              teacher_name: "Ms. Roberts",
              teacher_id: undefined,
              teacher_phone: teacherPhones["Ms. Roberts"],
              remarks: "Excellent analysis. Your understanding of themes is impressive. Well written essay.",
              status: "completed",
            },
            {
              id: "5", portal: "islamic", subject: "Islamic Studies",
              title: "Islamic History Quiz",
              totalMarks: 40, marksObtained: 34, percentage: 85,
              date: new Date(Date.now() - 3 * 86400000).toISOString(),
              teacher_name: "Ustadh Ali",
              teacher_id: undefined,
              teacher_phone: teacherPhones["Ustadh Ali"],
              remarks: "Great score! You have a strong grasp of Islamic history. Keep it up!",
              status: "completed",
            },
            {
              id: "6", portal: "school", subject: "Biology",
              title: "Cell Structure Assessment",
              totalMarks: 100, marksObtained: 88, percentage: 88,
              date: new Date(Date.now() - 20 * 86400000).toISOString(),
              teacher_name: "Dr. Smith",
              teacher_id: undefined,
              teacher_phone: teacherPhones["Dr. Smith"],
              remarks: "Very good understanding of cell organelles. A few minor details missed.",
              status: "completed",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user, role, navigate]);

  const progressData = buildProgressData(progressFilter);

  const sessionDistribution = bookings.reduce(
    (acc, b) => {
      acc[b.portal === "islamic" ? 0 : 1].value += 1;
      return acc;
    },
    [{ name: "Islamic", value: 0, fill: "#22c55e" },
     { name: "School",  value: 0, fill: "#3b82f6" }]
  );

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const attendanceMarkedBookings = bookings.filter((b) => b.attendance_status);
  const attendedBookings = bookings.filter((b) => b.attendance_status === "present" || b.attendance_status === "late");
  const attendanceRate = attendanceMarkedBookings.length > 0
    ? Math.round((attendedBookings.length / attendanceMarkedBookings.length) * 100)
    : Math.round((completedBookings.length / Math.max(bookings.length, 1)) * 100);

  /* Unique teachers list for "Contact" section */
  const uniqueTeachers: TeacherContact[] = [
    ...assessments.reduce((map, a) => {
      if (!map.has(a.teacher_name)) {
        map.set(a.teacher_name, {
          name: a.teacher_name,
          teacherId: a.teacher_id,
          phone: a.teacher_phone,
          subject: a.subject,
          portal: a.portal,
        });
      }
      return map;
    }, new Map<string, TeacherContact>()).values(),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-muted-foreground">Loading your reports…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Contact Modal */}
      {contactTeacher && (
        <ContactModal teacher={contactTeacher} onClose={() => setContactTeacher(null)} />
      )}

      {ratingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRatingBookingId(null)} />
          <div className="relative bg-card border border-border rounded-xl p-4 w-full max-w-md">
            <h3 className="font-bold mb-2">Rate your teacher</h3>
            <div className="flex items-center gap-2 mb-3">
              {[5, 4, 3, 2, 1].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRatingValue(v)}
                  className={cn("text-2xl", ratingValue >= v ? "text-yellow-400" : "text-muted-foreground")}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="w-full border border-border rounded-lg p-2 mb-3"
              placeholder="Optional comment"
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setRatingBookingId(null)}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  await reviewsApi.create({ booking_id: ratingBookingId!, rating: ratingValue, comment: ratingComment || undefined });
                  setBookings((cur) => cur.map((b) => b.id === ratingBookingId ? { ...b, rating: ratingValue } : b));
                  setRatingBookingId(null);
                  setRatingComment("");
                } catch (err) {
                  console.error(err);
                }
              }}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Reports</div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1">Learning Progress & Reports</h1>
            <p className="text-sm text-muted-foreground">Track your performance across Islamic and School portals</p>
          </div>
          <PageBackButton />
        </div>

        {/* ── Overall Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Total Sessions",   value: bookings.length,                                      icon: BookOpen,    color: "text-primary"     },
            { label: "Completed",        value: completedBookings.length,                              icon: CheckCircle, color: "text-green-500"   },
            { label: "Attendance Rate",  value: `${attendanceRate}%`, icon: TrendingUp, color: "text-blue-500" },
            { label: "Avg Rating",       value: bookings.length > 0 ? (Math.round((bookings.reduce((s, b) => s + (b.rating || 0), 0) / bookings.length) * 10) / 10) + " ★" : "—", icon: Star, color: "text-yellow-500" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 sm:p-4">
              <stat.icon className={`w-4 sm:w-5 h-4 sm:h-5 mb-1 sm:mb-2 ${stat.color}`} />
              <div className="text-lg sm:text-2xl font-extrabold font-display">{stat.value}</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="remarks">Remarks</TabsTrigger>
            <TabsTrigger value="islamic"  className="hidden sm:flex">Islamic</TabsTrigger>
            <TabsTrigger value="school"   className="hidden sm:flex">School</TabsTrigger>
          </TabsList>

          {/* ──────────────── OVERVIEW ──────────────── */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Progress filter + chart */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h3 className="font-display font-bold text-base sm:text-lg">Progress Trend</h3>
                <FilterPills value={progressFilter} onChange={setProgressFilter} />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="gIslamic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSchool" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Area type="monotone" dataKey="islamic" stroke="#22c55e" fill="url(#gIslamic)" name="Islamic Portal" strokeWidth={2} />
                  <Area type="monotone" dataKey="school"  stroke="#3b82f6" fill="url(#gSchool)"  name="School Portal"  strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Session distribution + status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4 sm:p-6">
                <h3 className="font-display font-bold text-base sm:text-lg mb-4">Session Distribution</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={sessionDistribution} cx="50%" cy="50%" outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`} dataKey="value" labelLine={false}>
                      {sessionDistribution.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-4 sm:p-6">
                <h3 className="font-display font-bold text-base sm:text-lg mb-4">Session Status</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={[
                    { status: "Completed",  count: bookings.filter((b) => b.status === "completed").length  },
                    { status: "Pending",    count: bookings.filter((b) => b.status === "pending").length    },
                    { status: "Booked",     count: bookings.filter((b) => b.status === "booked").length     },
                    { status: "Cancelled",  count: bookings.filter((b) => b.status === "cancelled").length  },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#22c55e" name="Sessions" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          {/* ──────────────── ASSESSMENTS ──────────────── */}
          <TabsContent value="assessments" className="space-y-6 mt-4">

            {/* ── Portal filter pills ── */}
            {(() => {
              const filteredAssessments = assessmentPortalFilter === "all"
                ? assessments
                : assessments.filter((a) => a.portal === assessmentPortalFilter);
              const totalPages = Math.ceil(filteredAssessments.length / TEST_LIST_PAGE_SIZE);
              const pagedTests = filteredAssessments.slice(
                (testListPage - 1) * TEST_LIST_PAGE_SIZE,
                testListPage * TEST_LIST_PAGE_SIZE
              );

              return (
                <>
                  {/* Filter pills row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {(["all", "islamic", "school"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => { setAssessmentPortalFilter(f); setTestListPage(1); }}
                        className={cn(
                          "sr-filter-pill",
                          assessmentPortalFilter === f ? "sr-filter-pill-active" : "sr-filter-pill-inactive"
                        )}
                      >
                        {f === "all" ? "All" : f === "islamic" ? "🕌 Islamic" : "🏫 School"}
                      </button>
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      {filteredAssessments.length} assessment{filteredAssessments.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Assessment summary stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { label: "Assessments",   value: filteredAssessments.length,                                                                                                    icon: BookOpen,    color: "text-primary"    },
                      { label: "Completed",     value: filteredAssessments.filter((a) => a.status === "completed").length,                                                             icon: CheckCircle, color: "text-green-500"  },
                      { label: "Avg Score",     value: `${Math.round(filteredAssessments.reduce((s, a) => s + a.percentage, 0) / Math.max(filteredAssessments.length, 1))}%`,          icon: TrendingUp,  color: "text-blue-500"   },
                      { label: "Highest Score", value: filteredAssessments.length ? `${Math.max(...filteredAssessments.map((a) => a.percentage))}%` : "—",                             icon: Star,        color: "text-yellow-500" },
                    ].map((s) => (
                      <Card key={s.label} className="p-3 sm:p-4">
                        <s.icon className={`w-4 sm:w-5 h-4 sm:h-5 mb-1 sm:mb-2 ${s.color}`} />
                        <div className="text-lg sm:text-2xl font-extrabold font-display">{s.value}</div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground">{s.label}</div>
                      </Card>
                    ))}
                  </div>

                  {/* Marks per assessment bar chart */}
                  <Card className="p-4 sm:p-6">
                    <h3 className="font-display font-bold text-base sm:text-lg mb-4">Marks in Each Assessment</h3>
                    {filteredAssessments.length === 0 ? (
                      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                        No assessments found for this filter.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={filteredAssessments.map((a) => ({
                          name: a.title.length > 20 ? a.title.slice(0, 20) + "…" : a.title,
                          obtained: a.marksObtained,
                          total: a.totalMarks,
                          pct: a.percentage,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v, name) => [v, name === "obtained" ? "Marks Obtained" : "Total Marks"]} />
                          <Legend formatter={(v) => v === "obtained" ? "Marks Obtained" : "Total Marks"} />
                          <Bar dataKey="total"    fill="#e5e7eb" name="total"    radius={[4,4,0,0]} />
                          <Bar
                            dataKey="obtained"
                            name="obtained"
                            radius={[4,4,0,0]}
                            fill={assessmentPortalFilter === "school" ? "#3b82f6" : "#22c55e"}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {/* ── Expandable Test List ── */}
                    <div className="mt-6 border-t border-border pt-4">
                      <button
                        onClick={() => setTestListExpanded((v) => !v)}
                        className="w-full flex items-center justify-between gap-2 group"
                      >
                        <span className="font-semibold text-sm flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          Test List
                          <span className="text-xs font-normal text-muted-foreground">({filteredAssessments.length} tests)</span>
                        </span>
                        <span className={cn(
                          "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                          testListExpanded
                            ? "bg-primary text-white border-primary"
                            : "bg-background text-muted-foreground border-border group-hover:border-primary/50"
                        )}>
                          {testListExpanded ? "Hide" : "Show"} Tests
                          <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", testListExpanded && "rotate-90")} />
                        </span>
                      </button>

                      {testListExpanded && (
                        <div className="mt-4 space-y-3">
                          {filteredAssessments.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">No tests to show.</div>
                          ) : (
                            <>
                              {pagedTests.map((a) => {
                                const grade = getGrade(a.percentage);
                                return (
                                  <div
                                    key={a.id}
                                    className={cn(
                                      "rounded-xl border p-3 sm:p-4 space-y-3",
                                      a.portal === "islamic"
                                        ? "border-primary/20 bg-primary/3"
                                        : "border-blue-500/20 bg-blue-500/3"
                                    )}
                                  >
                                    {/* Row 1: title + grade badge + portal tag */}
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                      <div className="min-w-0">
                                        <div className="font-semibold text-sm leading-snug">{a.title}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{a.subject} · {new Date(a.date).toLocaleDateString()}</div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", grade.cls)}>
                                          Grade {grade.label}
                                        </span>
                                        <span className={cn(
                                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                          a.portal === "islamic"
                                            ? "bg-primary/10 text-primary"
                                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                        )}>
                                          {a.portal === "islamic" ? "Islamic" : "School"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Row 2: marks + score bar */}
                                    <div className="flex items-center gap-4 flex-wrap">
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <span className="text-muted-foreground">Teacher:</span>
                                        <span className="font-semibold">{a.teacher_name}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <span className="text-muted-foreground">Marks:</span>
                                        <span className={cn("font-bold", scoreColor(a.percentage))}>
                                          {a.marksObtained} / {a.totalMarks}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                          <div
                                            className={cn("h-full sr-bar-fill rounded-full", barColor(a.percentage))}
                                            style={{ width: `${a.percentage}%` }}
                                          />
                                        </div>
                                        <span className={cn("text-xs font-bold whitespace-nowrap", scoreColor(a.percentage))}>
                                          {a.percentage}%
                                        </span>
                                      </div>
                                    </div>

                                    {/* Row 3: teacher remarks */}
                                    {a.remarks && (
                                      <div className={a.portal === "islamic" ? "sr-remark-islamic" : "sr-remark-school"}>
                                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teacher's Remarks</span>
                                          <button
                                            onClick={() => setContactTeacher({ name: a.teacher_name, teacherId: a.teacher_id, phone: a.teacher_phone, subject: a.subject, portal: a.portal })}
                                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors whitespace-nowrap"
                                          >
                                            <MessageCircle className="w-3 h-3" /> Contact Teacher
                                          </button>
                                        </div>
                                        <p className="text-sm text-foreground leading-relaxed">{a.remarks}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Page {testListPage} of {totalPages} · {filteredAssessments.length} tests
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setTestListPage((p) => Math.max(1, p - 1))}
                                      disabled={testListPage === 1}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                      ← Prev
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                      <button
                                        key={p}
                                        onClick={() => setTestListPage(p)}
                                        className={cn(
                                          "w-7 h-7 text-xs font-semibold rounded-lg border transition-all",
                                          p === testListPage
                                            ? "bg-primary text-white border-primary"
                                            : "border-border hover:border-primary/50 text-muted-foreground"
                                        )}
                                      >
                                        {p}
                                      </button>
                                    ))}
                                    <button
                                      onClick={() => setTestListPage((p) => Math.min(totalPages, p + 1))}
                                      disabled={testListPage === totalPages}
                                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                      Next →
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Assessments table */}
                  <Card className="p-4 sm:p-6">
                    <h3 className="font-display font-bold text-base sm:text-lg mb-4">All Assessments</h3>
                    <div className="overflow-x-auto -mx-1">
                      <table className="w-full text-sm min-w-[600px]">
                        <thead className="border-b border-border">
                          <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                            <th className="text-left py-2 px-2">Assessment</th>
                            <th className="text-left py-2 px-2">Subject</th>
                            <th className="text-left py-2 px-2">Status</th>
                            <th className="text-left py-2 px-2">Attendance</th>
                            <th className="text-left py-2 px-2">Rating</th>
                            <th className="text-left py-2 px-2">Grade</th>
                            <th className="text-left py-2 px-2">Date</th>
                            <th className="text-left py-2 px-2">Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredAssessments.map((a) => {
                            const grade = getGrade(a.percentage);
                            return (
                              <tr key={a.id} className="hover:bg-muted/50">
                                <td className="py-2.5 px-2 font-medium text-xs sm:text-sm">{a.title}</td>
                                <td className="py-2.5 px-2 text-xs sm:text-sm">{a.subject}</td>
                                <td className="py-2.5 px-2 text-xs sm:text-sm font-semibold whitespace-nowrap">
                                  {a.marksObtained} / {a.totalMarks}
                                </td>
                                <td className="py-2.5 px-2">
                                  <div className="flex items-center gap-2 min-w-[80px]">
                                    <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden flex-shrink-0">
                                      <div className={cn("h-full sr-bar-fill", barColor(a.percentage))} style={{ width: `${a.percentage}%` }} />
                                    </div>
                                    <span className={cn("font-bold text-xs", scoreColor(a.percentage))}>{a.percentage}%</span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-2">
                                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", grade.cls)}>{grade.label}</span>
                                </td>
                                <td className="py-2.5 px-2 text-xs sm:text-sm whitespace-nowrap">
                                  {new Date(a.date).toLocaleDateString()}
                                </td>
                                <td className="py-2.5 px-2">
                                  <button
                                    onClick={() => setContactTeacher({ name: a.teacher_name, teacherId: a.teacher_id, phone: a.teacher_phone, subject: a.subject, portal: a.portal })}
                                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors whitespace-nowrap"
                                  >
                                    <MessageCircle className="w-3 h-3" /> Contact
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Detailed assessment cards */}
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-base sm:text-lg">Assessment Details</h3>
                    {filteredAssessments.map((a) => {
                const grade = getGrade(a.percentage);
                return (
                  <Card key={a.id} className="p-4 sm:p-6">
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-base sm:text-lg leading-snug">{a.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          {a.subject} · {a.portal === "islamic" ? "Islamic Portal" : "School Portal"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className={cn("text-2xl font-extrabold font-display", scoreColor(a.percentage))}>
                          {a.percentage}%
                        </div>
                        <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full", grade.cls)}>
                          Grade {grade.label}
                        </span>
                      </div>
                    </div>

                    {/* Marks breakdown */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Marks Obtained", value: a.marksObtained },
                        { label: "Total Marks",    value: a.totalMarks    },
                        { label: "Date",           value: new Date(a.date).toLocaleDateString() },
                      ].map((item) => (
                        <div key={item.label} className="bg-muted/50 p-3 rounded-xl">
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</div>
                          <div className="text-lg font-extrabold font-display">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                      <div
                        className={cn("h-full sr-bar-fill rounded-full", barColor(a.percentage))}
                        style={{ width: `${a.percentage}%` }}
                      />
                    </div>

                    {/* Teacher remark + contact */}
                    {a.remarks && (
                      <div className={a.portal === "islamic" ? "sr-remark-islamic" : "sr-remark-school"}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="font-semibold text-sm">{a.teacher_name} · Remarks</div>
                          <button
                            onClick={() => setContactTeacher({ name: a.teacher_name, teacherId: a.teacher_id, phone: a.teacher_phone, subject: a.subject, portal: a.portal })}
                            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors whitespace-nowrap"
                          >
                            <MessageCircle className="w-3 h-3" /> Contact Teacher
                          </button>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{a.remarks}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
                </>
              );
            })()}
          </TabsContent>

          {/* ──────────────── REMARKS ──────────────── */}
          <TabsContent value="remarks" className="space-y-6 mt-4">
            {/* Assessment remarks */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-display font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Assessment Feedback
              </h3>
              <div className="space-y-4">
                {assessments.filter((a) => a.remarks).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((a) => (
                  <div key={a.id} className={a.portal === "islamic" ? "sr-remark-islamic" : "sr-remark-school"}>
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div>
                        <div className="font-semibold text-sm">{a.teacher_name}</div>
                        <div className="text-xs text-muted-foreground">{a.subject} · {a.title}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn("text-base font-extrabold", scoreColor(a.percentage))}>{a.percentage}%</span>
                        <span className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString()}</span>
                                    <button
                                    onClick={() => setContactTeacher({ name: a.teacher_name, teacherId: a.teacher_id, phone: a.teacher_phone, subject: a.subject, portal: a.portal })}
                          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" /> Contact
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{a.remarks}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Session feedback */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-display font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" /> Session Feedback
              </h3>
              <div className="space-y-3">
                {completedBookings.filter((b) => b.teacher_remarks).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No session feedback yet.
                  </div>
                ) : (
                  completedBookings.filter((b) => b.teacher_remarks).map((b) => (
                    <div key={b.id} className={b.portal === "islamic" ? "sr-remark-islamic" : "sr-remark-school"}>
                      <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                        <div className="font-semibold text-sm">{b.teacher_name}</div>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", attendanceBadgeClass(b.attendance_status))}>
                              {attendanceLabel(b.attendance_status)}
                            </span>
                          <span className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {b.rating}/5
                          </span>
                          <button
                            onClick={() => setContactTeacher({ name: b.teacher_name, teacherId: b.teacher_id, phone: b.teacher_phone, subject: b.subject, portal: b.portal })}
                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" /> Contact
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {b.subject} · {new Date(b.start_at).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-foreground">{b.teacher_remarks}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Improvement tips */}
            <Card className="p-4 sm:p-6 bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
              <h3 className="font-display font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  "Consistency: Try to maintain a regular session schedule",
                  "Homework: Complete all assignments given by teachers",
                  "Engagement: Ask more questions during sessions",
                  "Notes: Take detailed notes and review between sessions",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-500 font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          {/* ──────────────── ISLAMIC ──────────────── */}
          <TabsContent value="islamic" className="space-y-6 mt-4">
            <PortalReportSection
              stats={portalStats.find((s) => s.portal === "islamic") ?? { portal: "islamic", totalSessions: 0, completedSessions: 0, attendanceRate: 0, avgRating: 0 }}
              bookings={bookings.filter((b) => b.portal === "islamic")}
              portal="islamic"
              onContact={setContactTeacher}
            />
          </TabsContent>

          {/* ──────────────── SCHOOL ──────────────── */}
          <TabsContent value="school" className="space-y-6 mt-4">
            <PortalReportSection
              stats={portalStats.find((s) => s.portal === "school") ?? { portal: "school", totalSessions: 0, completedSessions: 0, attendanceRate: 0, avgRating: 0 }}
              bookings={bookings.filter((b) => b.portal === "school")}
              portal="school"
              onContact={setContactTeacher}
            />
          </TabsContent>
        </Tabs>

        {/* ── Teachers Directory ── */}
        <Card className="p-4 sm:p-6">
          <h3 className="font-display font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Contact Your Teachers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {uniqueTeachers.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold",
                    t.portal === "islamic" ? "bg-primary-light text-primary-dark" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.subject}</div>
                  </div>
                </div>
                <button
                  onClick={() => setContactTeacher(t)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Contact
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Recent Sessions ── */}
        <Card className="p-4 sm:p-6">
          <h3 className="font-display font-bold text-base sm:text-lg mb-4">Recent Sessions</h3>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No sessions yet. Book your first session to get started!
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left py-2 px-2">Subject</th>
                    <th className="text-left py-2 px-2">Teacher</th>
                    <th className="text-left py-2 px-2">Portal</th>
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Attendance</th>
                    <th className="text-left py-2 px-2">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.slice(0, 8).map((b) => (
                    <tr key={b.id} className="hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium text-xs sm:text-sm">{b.subject}</td>
                      <td className="py-2 px-2 text-xs sm:text-sm">{b.teacher_name}</td>
                      <td className="py-2 px-2 text-xs sm:text-sm">
                        <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold",
                          b.portal === "islamic" ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-600 dark:text-blue-400")}>
                          {b.portal}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs sm:text-sm">{new Date(b.start_at).toLocaleDateString()}</td>
                      <td className="py-2 px-2 text-xs sm:text-sm">
                        <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold",
                          b.status === "completed" ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : b.status === "cancelled" ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400")}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs sm:text-sm">
                        <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold", attendanceBadgeClass(b.attendance_status))}>
                          {attendanceLabel(b.attendance_status)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs sm:text-sm">
                        {b.status === "completed" && b.rating
                          ? <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{b.rating}/5</span>
                          : b.status === "completed" ? (
                            <Button size="sm" variant="outline" onClick={() => { setRatingBookingId(b.id); setRatingValue(5); setRatingComment(""); }}>Rate</Button>
                          ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

/* ─── Portal Report Section ─── */
interface PortalReportSectionProps {
  stats: PortalStats;
  bookings: BookingReport[];
  portal: "islamic" | "school";
  onContact: (t: TeacherContact) => void;
}

const PortalReportSection = ({ stats, bookings, portal, onContact }: PortalReportSectionProps) => {
  const color = portal === "islamic" ? "#22c55e" : "#3b82f6";

  const subjectData = bookings.reduce(
    (acc, b) => {
      const ex = acc.find((item) => item.subject === b.subject);
      if (ex) { ex.sessions += 1; if (b.status === "completed") ex.completed += 1; }
      else acc.push({ subject: b.subject, sessions: 1, completed: b.status === "completed" ? 1 : 0 });
      return acc;
    },
    [] as Array<{ subject: string; sessions: number; completed: number }>
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: "Total Sessions",  value: stats.totalSessions       },
          { label: "Completed",       value: stats.completedSessions   },
          { label: "Attendance Rate", value: `${stats.attendanceRate}%` },
          { label: "Avg Rating",      value: `${stats.avgRating} ★`    },
        ].map((item) => (
          <Card key={item.label} className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-extrabold font-display">{item.value}</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground">{item.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        <h3 className="font-display font-bold text-base sm:text-lg mb-4">Subject Performance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={subjectData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="sessions"  fill={color} opacity={0.5} name="Total"     radius={[4,4,0,0]} />
            <Bar dataKey="completed" fill={color}              name="Completed"  radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 sm:p-6">
        <h3 className="font-display font-bold text-base sm:text-lg mb-4">Teachers Worked With</h3>
        <div className="space-y-3">
          {[...new Set(bookings.map((b) => b.teacher_name))].map((teacher, idx) => {
            const tb        = bookings.filter((b) => b.teacher_name === teacher);
            const completed = tb.filter((b) => b.status === "completed").length;
            const avgRating = Math.round((tb.reduce((s, b) => s + (b.rating || 0), 0) / Math.max(completed, 1)) * 10) / 10;
            return (
              <div key={`${teacher}-${idx}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl gap-2">
                <div>
                  <div className="font-semibold text-sm">{teacher}</div>
                  <div className="text-xs text-muted-foreground">{completed} completed · {tb.length} total</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-sm">{avgRating}</span>
                  </span>
                  <button
                    onClick={() => onContact({ name: teacher, phone: tb[0]?.teacher_phone, subject: tb[0]?.subject, portal })}
                    className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-3 h-3" /> Contact
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
};

export default StudentReports;