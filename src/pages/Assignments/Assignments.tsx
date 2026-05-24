import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  BookOpen,
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
import { studentsApi, type StudentAssignmentItem, type StudentResourceItem } from "@/lib/api/students";
import { cn } from "@/lib/utils";

type AssignmentStatus = "upcoming" | "submitted" | "graded";
type Priority = "high" | "medium" | "low";
type Portal = "islamic" | "school";
const assignmentsPriority = (assignment: StudentAssignmentItem): Priority => {
  if (assignment.status !== "upcoming") return "low";
  const hoursLeft = differenceInHours(new Date(assignment.dueAt), new Date());
  if (hoursLeft <= 12) return "high";
  if (hoursLeft <= 48) return "medium";
  return "low";
};

const getBanner = (assignment: StudentAssignmentItem) => {
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
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [lessonNotes, setLessonNotes] = useState<StudentResourceItem[]>([]);
  const [templateLessons, setTemplateLessons] = useState<StudentResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    studentsApi.getAssignments()
      .then(({ assignments: nextAssignments, resources }) => {
        if (!active) return;
        setAssignments(nextAssignments ?? []);
        setLessonNotes(resources.lesson_notes ?? []);
        setTemplateLessons(resources.template_lessons ?? []);
      })
      .catch(() => {
        if (!active) return;
        setAssignments([]);
        setLessonNotes([]);
        setTemplateLessons([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

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
  }, [assignments]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-10 space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm animate-pulse space-y-4">
            <div className="h-3 w-28 rounded-full bg-muted" />
            <div className="h-8 w-3/4 rounded-2xl bg-muted" />
            <div className="h-4 w-1/2 rounded-full bg-muted" />
          </section>
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2 animate-pulse">
                <div className="h-5 w-5 rounded-full bg-muted" />
                <div className="h-8 w-16 rounded bg-muted" />
                <div className="h-3 w-10 rounded bg-muted" />
              </div>
            ))}
          </section>
        </div>
      </div>
    );
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
          <TabsList className="grid w-full grid-cols-4 rounded-2xl p-1 bg-muted/50">
            <TabsTrigger value="upcoming" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Upcoming assignments
            </TabsTrigger>
            <TabsTrigger value="marks" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Marks
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
              History
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Resources
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
                            <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", priorityClass[assignmentsPriority(assignment)])}>
                              {assignmentsPriority(assignment)} priority
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
                            <Button size="sm" className="flex-1 rounded-full" asChild>
                              <a href="#resources">Review</a>
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 rounded-full" asChild>
                              <Link to={`/messages/${assignment.teacherId}`}>Message</Link>
                            </Button>
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
                      <div className="font-semibold text-red-700 dark:text-red-400">{urgentAssignments.length > 0 ? `${urgentAssignments.length} urgent deadline${urgentAssignments.length === 1 ? "" : "s"}` : "No urgent deadlines"}</div>
                      <div className="text-xs text-muted-foreground mt-1">Tackle the closest due work first.</div>
                    </div>
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <div className="font-semibold text-amber-700 dark:text-amber-400">{upcomingAssignments.length > urgentAssignments.length ? `${upcomingAssignments.length - urgentAssignments.length} assignment${upcomingAssignments.length - urgentAssignments.length === 1 ? "" : "s"} due later` : "No later deadlines"}</div>
                      <div className="text-xs text-muted-foreground mt-1">Keep momentum by working through the remaining queue.</div>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
                      <div className="font-semibold text-primary">{templateLessons.length + lessonNotes.length} resources unlocked</div>
                      <div className="text-xs text-muted-foreground mt-1">Template videos are open to all; notes unlock after bookings.</div>
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

          <TabsContent value="resources" className="space-y-4 mt-4" id="resources">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5 text-primary" /> Available to all students
                  </div>
                  <h3 className="font-display font-bold text-lg mt-3">Template videos</h3>
                  <p className="text-sm text-muted-foreground mt-1">These shared lessons are visible to every student in the portal.</p>
                </div>
                <div className="space-y-3">
                  {templateLessons.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">No template lessons have been published yet.</div>
                  ) : templateLessons.map((resource) => (
                    <div key={resource.id} className="rounded-2xl border border-border bg-background/60 p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{resource.teacher}</div>
                          <h4 className="font-semibold mt-1">{resource.title}</h4>
                        </div>
                        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", portalBadgeClass[resource.portal])}>{portalLabel[resource.portal]}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{resource.description || "Open the shared video or lesson link to review the material."}</p>
                      <a href={resource.driveUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-primary hover:underline">
                        Open lesson <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Unlocked after booking
                  </div>
                  <h3 className="font-display font-bold text-lg mt-3">Teacher notes</h3>
                  <p className="text-sm text-muted-foreground mt-1">Notes from teachers you have booked are available here.</p>
                </div>
                <div className="space-y-3">
                  {lessonNotes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">Book a session with a teacher to unlock their notes and handouts.</div>
                  ) : lessonNotes.map((resource) => (
                    <div key={resource.id} className="rounded-2xl border border-border bg-background/60 p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{resource.teacher}</div>
                          <h4 className="font-semibold mt-1">{resource.title}</h4>
                        </div>
                        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border", portalBadgeClass[resource.portal])}>{portalLabel[resource.portal]}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{resource.description || "Teacher notes and follow-up materials appear here after a booking."}</p>
                      <a href={resource.driveUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-primary hover:underline">
                        Open notes <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AssignmentsPage;
