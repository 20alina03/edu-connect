import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { format, formatDistanceToNow, addHours, differenceInHours } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  LayoutGrid,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type AssignmentStatus = "upcoming" | "submitted" | "graded";
type Priority = "high" | "medium" | "low";
type Portal = "islamic" | "school";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  portal: Portal;
  teacher: string;
  dueAt: string;
  assignedAt: string;
  submittedAt?: string;
  score?: number;
  maxScore: number;
  status: AssignmentStatus;
  priority: Priority;
  note: string;
}

const assignments: Assignment[] = [
  {
    id: "a1",
    title: "Surah Al-Mulk Recitation Practice",
    subject: "Quran",
    portal: "islamic",
    teacher: "Ustadh Ahmed",
    dueAt: addHours(new Date(), 8).toISOString(),
    assignedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    maxScore: 100,
    status: "upcoming",
    priority: "high",
    note: "Record a clean recitation and submit before your next lesson.",
  },
  {
    id: "a2",
    title: "Quadratic Equations Worksheet",
    subject: "Mathematics",
    portal: "school",
    teacher: "Mr. Johnson",
    dueAt: addHours(new Date(), 30).toISOString(),
    assignedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    maxScore: 50,
    status: "upcoming",
    priority: "medium",
    note: "Complete all practice questions and review the worked examples.",
  },
  {
    id: "a3",
    title: "Tajweed Rule Summary",
    subject: "Tajweed",
    portal: "islamic",
    teacher: "Sister Fatima",
    dueAt: addHours(new Date(), 52).toISOString(),
    assignedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    maxScore: 20,
    status: "upcoming",
    priority: "low",
    note: "Summarize the Noon Sakinah rules with a few examples.",
  },
  {
    id: "a4",
    title: "Essay Draft Review",
    subject: "English",
    portal: "school",
    teacher: "Ms. Roberts",
    dueAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    assignedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    score: 85,
    maxScore: 100,
    status: "graded",
    priority: "medium",
    note: "Great structure and analysis. Add a stronger closing paragraph next time.",
  },
  {
    id: "a5",
    title: "Islamic Studies Reflection",
    subject: "Islamic Studies",
    portal: "islamic",
    teacher: "Ustadh Ali",
    dueAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    assignedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    score: 92,
    maxScore: 100,
    status: "graded",
    priority: "low",
    note: "Very strong response with thoughtful detail and excellent presentation.",
  },
  {
    id: "a6",
    title: "Cell Structure Lab Notes",
    subject: "Biology",
    portal: "school",
    teacher: "Dr. Smith",
    dueAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    assignedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    score: 78,
    maxScore: 100,
    status: "submitted",
    priority: "medium",
    note: "Submitted on time. Teacher feedback is pending.",
  },
];

const getBanner = (assignment: Assignment) => {
  const hoursLeft = differenceInHours(new Date(assignment.dueAt), new Date());

  if (assignment.status !== "upcoming") return null;
  if (hoursLeft <= 12) {
    return {
      tone: "danger",
      label: "Deadline close",
      copy: "Submit within the next few hours to avoid a missed task.",
      icon: ShieldAlert,
    };
  }
  if (hoursLeft <= 48) {
    return {
      tone: "warning",
      label: "Due soon",
      copy: "This assignment is closing soon. Start it today.",
      icon: AlertTriangle,
    };
  }
  return {
    tone: "info",
    label: "Upcoming",
    copy: "Plenty of time left, but you can get ahead now.",
    icon: CalendarClock,
  };
};

const portalLabel: Record<Portal, string> = {
  islamic: "Islamic",
  school: "School",
};

const portalBadgeClass: Record<Portal, string> = {
  islamic: "bg-primary/10 text-primary border-primary/20",
  school: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
};

const priorityClass: Record<Priority, string> = {
  high: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  medium: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
};

const AssignmentsPage = () => {
  const { role } = useAuth();

  const metrics = useMemo(() => {
    const upcoming = assignments.filter((a) => a.status === "upcoming");
    const graded = assignments.filter((a) => a.status === "graded");
    const submitted = assignments.filter((a) => a.status === "submitted");
    const avgMark = graded.length > 0 ? Math.round(graded.reduce((sum, a) => sum + (a.score ?? 0), 0) / graded.length) : 0;
    return {
      upcoming: upcoming.length,
      submitted: submitted.length,
      graded: graded.length,
      avgMark,
    };
  }, []);

  const upcomingAssignments = assignments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  const historyAssignments = assignments
    .filter((a) => a.status !== "upcoming")
    .sort((a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime());

  const marksAssignments = assignments
    .filter((a) => a.status === "graded" || a.status === "submitted")
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const urgentAssignments = upcomingAssignments.filter((a) => differenceInHours(new Date(a.dueAt), new Date()) <= 48);

  if (role && role !== "student") {
    return <Navigate to="/dashboard/teacher" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-10 space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.10),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_28%),linear-gradient(135deg,rgba(14,165,233,0.04),transparent_60%)]" />
          <div className="relative p-5 sm:p-7 lg:p-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <LayoutGrid className="w-3.5 h-3.5 text-primary" /> Assignments hub
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
                  Assignments, marks and history in one place.
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl">
                  Track what is due next, review graded work, and keep an eye on deadlines that are closing fast.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild className="rounded-full">
                <Link to="/school/teachers">Browse teachers</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/reports">Open reports</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Upcoming", value: metrics.upcoming, icon: Clock3, color: "text-primary" },
            { label: "Submitted", value: metrics.submitted, icon: FileText, color: "text-amber-600" },
            { label: "Graded", value: metrics.graded, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Avg mark", value: `${metrics.avgMark}%`, icon: TrendingUp, color: "text-blue-600" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <item.icon className={cn("w-5 h-5 mb-2", item.color)} />
              <div className="text-2xl sm:text-3xl font-extrabold font-display">{item.value}</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </section>

        {urgentAssignments.length > 0 && (
          <div className="grid gap-3">
            {urgentAssignments.slice(0, 2).map((assignment) => {
              const banner = getBanner(assignment);
              if (!banner) return null;
              const BannerIcon = banner.icon;

              return (
                <div
                  key={assignment.id}
                  className={cn(
                    "rounded-2xl border p-4 sm:p-5 shadow-sm",
                    banner.tone === "danger"
                      ? "border-red-500/30 bg-red-500/5"
                      : banner.tone === "warning"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-primary/20 bg-primary/5"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0",
                        banner.tone === "danger" ? "bg-red-500 text-white" : banner.tone === "warning" ? "bg-amber-500 text-white" : "bg-primary text-primary-foreground"
                      )}>
                        <BannerIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base">{banner.label}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground mt-1">{banner.copy}</div>
                        <div className="text-[11px] text-muted-foreground mt-2">
                          {assignment.title} · due {formatDistanceToNow(new Date(assignment.dueAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild className="rounded-full sm:self-center">
                      <Link to="#upcoming">View task</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Tabs defaultValue="upcoming" className="space-y-5">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl p-1 bg-muted/50">
            <TabsTrigger value="upcoming" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Upcoming assignments
            </TabsTrigger>
            <TabsTrigger value="marks" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Marks
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4" id="upcoming">
            <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-4">
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => {
                  const banner = getBanner(assignment);
                  const hoursLeft = differenceInHours(new Date(assignment.dueAt), new Date());
                  const progress = Math.max(6, Math.min(92, 100 - hoursLeft * 2));

                  return (
                    <div key={assignment.id} className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", portalBadgeClass[assignment.portal])}>
                              {portalLabel[assignment.portal]}
                            </span>
                            <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", priorityClass[assignment.priority])}>
                              {assignment.priority} priority
                            </span>
                            {banner && (
                              <span className={cn(
                                "text-[10px] font-bold px-2.5 py-1 rounded-full border",
                                banner.tone === "danger"
                                  ? "bg-red-500/10 text-red-600 border-red-500/20"
                                  : banner.tone === "warning"
                                    ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                    : "bg-primary/10 text-primary border-primary/20"
                              )}>
                                {banner.label}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold font-display">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{assignment.subject} · {assignment.teacher}</p>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed">{assignment.note}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Due {format(new Date(assignment.dueAt), "PPP p")}</span>
                            <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Assigned {formatDistanceToNow(new Date(assignment.assignedAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <div className="sm:w-56 space-y-3 rounded-2xl bg-muted/40 p-4 border border-border/70">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Deadline progress</span>
                            <span className={cn("font-semibold", hoursLeft <= 12 ? "text-red-600" : hoursLeft <= 48 ? "text-amber-600" : "text-primary")}>{hoursLeft}h left</span>
                          </div>
                          <div className="h-2 rounded-full bg-background overflow-hidden border border-border">
                            <div className={cn("h-full rounded-full", hoursLeft <= 12 ? "bg-red-500" : hoursLeft <= 48 ? "bg-amber-500" : "bg-primary")} style={{ width: `${progress}%` }} />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Max score: {assignment.maxScore} marks
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 rounded-full">Submit</Button>
                            <Button size="sm" variant="outline" className="flex-1 rounded-full">Open</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-bold text-base">What to do next</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-3">
                      <div className="font-semibold text-red-700 dark:text-red-400">1 urgent deadline</div>
                      <div className="text-xs text-muted-foreground mt-1">Finish the Quran recitation practice first.</div>
                    </div>
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <div className="font-semibold text-amber-700 dark:text-amber-400">1 assignment due tomorrow</div>
                      <div className="text-xs text-muted-foreground mt-1">Keep momentum by clearing the maths worksheet today.</div>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
                      <div className="font-semibold text-primary">2 tasks already planned</div>
                      <div className="text-xs text-muted-foreground mt-1">A few short sessions will keep you ahead.</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-bold text-base">Assignment workflow</h3>
                  </div>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">1</span><span>Check the banner color first. Red means act now.</span></li>
                    <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">2</span><span>Open the assignment, review the notes, and gather your materials.</span></li>
                    <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">3</span><span>Submit before the deadline, then review the marks in the Marks tab.</span></li>
                  </ol>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marks" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {marksAssignments.map((assignment) => {
                const percent = Math.round(((assignment.score ?? 0) / assignment.maxScore) * 100);
                return (
                  <div key={assignment.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{assignment.teacher}</div>
                        <h3 className="font-display font-bold mt-1 line-clamp-2">{assignment.title}</h3>
                      </div>
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", portalBadgeClass[assignment.portal])}>{portalLabel[assignment.portal]}</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-3xl font-extrabold font-display">{assignment.score ?? 0}</div>
                        <div className="text-xs text-muted-foreground">out of {assignment.maxScore}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{percent}%</div>
                        <div className="text-xs text-muted-foreground">{assignment.status === "graded" ? "Graded" : "Pending review"}</div>
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", percent >= 85 ? "bg-emerald-500" : percent >= 70 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${percent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-3">{assignment.note}</p>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base">Assignments history</h3>
                  <p className="text-xs text-muted-foreground">Completed, submitted and graded work.</p>
                </div>
                <Link to="/reports" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Open reports <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {historyAssignments.map((assignment) => {
                  const score = assignment.score ?? 0;
                  const percent = Math.round((score / assignment.maxScore) * 100);
                  return (
                    <div key={assignment.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", portalBadgeClass[assignment.portal])}>{portalLabel[assignment.portal]}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border capitalize">{assignment.status}</span>
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base">{assignment.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{assignment.subject} · {assignment.teacher}</p>
                        <p className="text-xs text-muted-foreground mt-2">Submitted {assignment.submittedAt ? formatDistanceToNow(new Date(assignment.submittedAt), { addSuffix: true }) : "recently"}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto md:min-w-[260px]">
                        <div className="rounded-2xl bg-muted/40 border border-border p-3 text-center">
                          <div className="text-sm font-extrabold font-display">{score}</div>
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Score</div>
                        </div>
                        <div className="rounded-2xl bg-muted/40 border border-border p-3 text-center">
                          <div className="text-sm font-extrabold font-display">{assignment.maxScore}</div>
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Max</div>
                        </div>
                        <div className="rounded-2xl bg-muted/40 border border-border p-3 text-center">
                          <div className="text-sm font-extrabold font-display">{percent}%</div>
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Marks</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AssignmentsPage;
