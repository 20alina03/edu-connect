import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar, CheckCircle, XCircle, Clock, Video,
  ExternalLink, Users, CheckSquare, Square, Link2,
  Play, History, CircleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { notificationsApi } from "@/lib/api/notifications";
import { toast } from "sonner";
import { BookingRow, StudentProfile, initials, statusBadgeClass } from "../TeacherDashboard";

interface SessionsModuleProps {
  user: any;
  bookings: BookingRow[];
  studentProfiles: Record<string, StudentProfile>;
  studentSummaries: any[];
  onReload: () => void;
  updateBookingStatus: (id: string, status: BookingRow["status"]) => void;
  bookingActionId: string | null;
  calendarLinks?: Record<string, string>;
}

type SessionTab = "active" | "upcoming" | "past";

/* Attendance record stored in local state (would be persisted to DB in production) */
interface AttendanceRecord {
  bookingId: string;
  status: "present" | "absent" | "late" | null;
  markedAt: string;
}

export const SessionsModule = ({
  user, bookings, studentProfiles, onReload, updateBookingStatus, bookingActionId, calendarLinks = {},
}: SessionsModuleProps) => {
  const [tab, setTab] = useState<SessionTab>("upcoming");
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string | null>>({});
  const [savingLink, setSavingLink] = useState(false);

  const now = new Date();

  /* Derived */
  const activeSessions   = bookings.filter((b) => {
    const start = new Date(b.start_at);
    const end   = new Date(start.getTime() + b.duration_min * 60_000);
    return b.status === "confirmed" && start <= now && end >= now;
  });
  const upcomingSessions = bookings.filter((b) => {
    return new Date(b.start_at) > now && b.status !== "cancelled";
  }).sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  const pastSessions     = bookings.filter((b) => {
    return new Date(b.start_at) < now;
  }).sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

  const tabs: { id: SessionTab; label: string; count: number; icon: React.ElementType }[] = [
    { id: "active",   label: "Active",   count: activeSessions.length,   icon: Play    },
    { id: "upcoming", label: "Upcoming", count: upcomingSessions.length, icon: Calendar },
    { id: "past",     label: "Past",     count: pastSessions.length,     icon: History  },
  ];

  const saveMeetingLink = async (booking: BookingRow) => {
    setSavingLink(true);
    try {
      const link = linkDraft.trim();
      const payload = {
        booking_id: booking.id,
        meeting_link: link || null,
        subject: booking.subject,
      };

      const { error } = await supabase.from("notifications").insert([
        {
          user_id: user.id,
          type: "meeting_link",
          title: `Meeting link updated for ${booking.subject}`,
          body: link ? link : "Meeting link cleared",
          data: payload,
        },
        {
          user_id: booking.student_id,
          type: "meeting_link",
          title: `Meeting link updated for ${booking.subject}`,
          body: link ? link : "Meeting link cleared",
          data: payload,
        },
      ]);

      if (error) throw error;

      setMeetingLinks((prev) => ({ ...prev, [booking.id]: link || null }));
      onReload();
      setEditingLinkId(null);
      toast.success("Meeting link saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save link");
    } finally {
      setSavingLink(false);
    }
  };

  const markAttendance = async (bookingId: string, status: "present" | "absent" | "late") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ attendance_status: status, attendance_marked_at: new Date().toISOString() } as any)
        .eq("id", bookingId);
      if (error) throw error;
      setAttendance((prev) => ({
        ...prev,
        [bookingId]: { bookingId, status, markedAt: new Date().toISOString() },
      }));
      toast.success(`Marked ${status}`);
      onReload();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update attendance");
    }
  };

  const isSessionStarted = (booking: BookingRow) => new Date(booking.start_at) <= new Date();

  const getAttendanceStatus = (booking: BookingRow) => attendance[booking.id]?.status ?? booking.attendance_status ?? null;
  const getMeetingLink = (booking: BookingRow) => meetingLinks[booking.id] ?? booking.meeting_link ?? null;

  const studentName = (id: string) => studentProfiles[id]?.full_name ?? "Student";

  useEffect(() => {
    if (!user) return;

    let active = true;

    const hydrateLinks = async () => {
      const { notifications } = await notificationsApi.list();
      if (!active) return;

      const next: Record<string, string | null> = {};
      notifications
        .filter((n) => n.type === "meeting_link")
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .forEach((n) => {
          const bookingId = typeof n.data.booking_id === "string" ? n.data.booking_id : null;
          if (!bookingId) return;
          const link = typeof n.data.meeting_link === "string" ? n.data.meeting_link.trim() : "";
          if (link) next[bookingId] = link;
          else delete next[bookingId];
        });

      setMeetingLinks(next);
    };

    void hydrateLinks();

    const channel = supabase
      .channel(`meeting-links-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = payload.new as { type?: string; data?: Record<string, unknown> };
          if (row.type !== "meeting_link") return;
          const bookingId = typeof row.data?.booking_id === "string" ? row.data.booking_id : null;
          const link = typeof row.data?.meeting_link === "string" ? row.data.meeting_link.trim() : "";
          if (!bookingId) return;
          setMeetingLinks((prev) => ({ ...prev, [bookingId]: link || null }));
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold font-display">Sessions</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your active, upcoming, and past sessions.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-full sm:w-auto sm:inline-flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
              tab === t.id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              tab === t.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ACTIVE */}
      {tab === "active" && (
        <div className="space-y-4">
          {activeSessions.length === 0 ? (
            <div className="td-empty">
              <Play className="h-8 w-8 opacity-30" />
              <span>No active sessions right now.</span>
            </div>
          ) : (
            activeSessions.map((b) => (
              <SessionCard
                key={b.id}
                booking={b}
                studentName={studentName(b.student_id)}
                meetingLink={getMeetingLink(b) ?? undefined}
                attendance={attendance[b.id] ?? (b.attendance_status ? { bookingId: b.id, status: b.attendance_status, markedAt: b.attendance_marked_at ?? new Date().toISOString() } : undefined)}
                onMarkAttendance={markAttendance}
                onUpdateStatus={updateBookingStatus}
                bookingActionId={bookingActionId}
                showAttendance
                variant="active"
                started={isSessionStarted(b)}
              />
            ))
          )}
        </div>
      )}

      {/* UPCOMING */}
      {tab === "upcoming" && (
        <div className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <div className="td-empty">
              <Calendar className="h-8 w-8 opacity-30" />
              <span>No upcoming sessions scheduled.</span>
            </div>
          ) : (
            upcomingSessions.map((b) => (
              <div key={b.id} className="td-booking-item space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="td-booking-subject">{b.subject}</div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(b.start_at), "PPp")}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {b.duration_min} min</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {studentName(b.student_id)}</span>
                    </div>
                    {b.notes && (
                      <div className="mt-2 text-xs text-muted-foreground rounded-lg bg-muted/40 border border-border/60 px-3 py-2">
                        <span className="font-semibold text-foreground">Topic:</span> {b.notes}
                      </div>
                    )}
                  </div>
                  <span className={statusBadgeClass[b.status]}>{b.status}</span>
                </div>

                {/* Meeting link section */}
                {getMeetingLink(b) ? (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-primary/5 border border-primary/20">
                    <Video className="h-4 w-4 text-primary flex-shrink-0" />
                    <a href={getMeetingLink(b) ?? undefined} target="_blank" rel="noreferrer"
                       className="text-xs font-medium text-primary truncate flex-1 hover:underline">
                      {getMeetingLink(b)}
                    </a>
                    <button onClick={() => { setEditingLinkId(b.id); setLinkDraft(getMeetingLink(b) ?? ""); }}
                      className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
                  </div>
                ) : editingLinkId === b.id ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste Google Meet or Zoom link…"
                      value={linkDraft}
                      onChange={(e) => setLinkDraft(e.target.value)}
                      className="text-xs"
                    />
                    <Button size="sm" onClick={() => saveMeetingLink(b)} disabled={savingLink || !linkDraft.trim()}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingLinkId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingLinkId(b.id); setLinkDraft(""); }}>
                      <Link2 className="mr-1.5 h-3.5 w-3.5" /> Add meeting link
                    </Button>
                    <a href="https://meet.google.com/new" target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> New Google Meet
                      </Button>
                    </a>
                    <a href="https://zoom.us/start/videomeeting" target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <Video className="mr-1.5 h-3.5 w-3.5" /> New Zoom
                      </Button>
                    </a>
                  </div>
                )}

                {getMeetingLink(b) && (
                  <div className="rounded-xl border border-border bg-background/60 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CircleAlert className="h-4 w-4 text-primary" /> Mark attendance
                    </div>
                    {!isSessionStarted(b) && (
                      <div className="text-xs text-muted-foreground">
                        Attendance opens when the session starts.
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(["present", "absent", "late"] as const).map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={getAttendanceStatus(b) === status ? "default" : "outline"}
                          onClick={() => markAttendance(b.id, status)}
                          disabled={savingLink || !isSessionStarted(b)}
                          className="capitalize"
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                    {getAttendanceStatus(b) && (
                      <div className="text-xs text-muted-foreground">
                        Attendance saved as <span className="font-semibold text-foreground capitalize">{getAttendanceStatus(b)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Accept/Decline */}
                {b.status === "pending" && (
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")} disabled={bookingActionId === b.id}>
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")} disabled={bookingActionId === b.id}>
                      <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
                )}
                {b.status === "confirmed" && calendarLinks[b.id] && (
                  <a href={calendarLinks[b.id]} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#4285F4]/30 bg-[#4285F4]/5 px-3 py-1.5 text-xs font-semibold text-[#4285F4] hover:bg-[#4285F4]/10 transition">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
                    Add to Google Calendar
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* PAST */}
      {tab === "past" && (
        <div className="space-y-4">
          {pastSessions.length === 0 ? (
            <div className="td-empty">
              <History className="h-8 w-8 opacity-30" />
              <span>No past sessions yet.</span>
            </div>
          ) : (
            pastSessions.map((b) => (
              <SessionCard
                key={b.id}
                booking={b}
                studentName={studentName(b.student_id)}
                meetingLink={getMeetingLink(b) ?? undefined}
                calendarLink={calendarLinks[b.id]}
                attendance={attendance[b.id] ?? (b.attendance_status ? { bookingId: b.id, status: b.attendance_status, markedAt: b.attendance_marked_at ?? new Date().toISOString() } : undefined)}
                onMarkAttendance={markAttendance}
                onUpdateStatus={updateBookingStatus}
                bookingActionId={bookingActionId}
                showAttendance
                variant="past"
                started={true}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ── Session Card ── */
const SessionCard = ({
  booking: b, studentName, meetingLink, calendarLink, attendance, onMarkAttendance,
  onUpdateStatus, bookingActionId, showAttendance, variant, started,
}: {
  booking: BookingRow;
  studentName: string;
  meetingLink?: string;
  calendarLink?: string;
  attendance?: AttendanceRecord;
  onMarkAttendance: (bookingId: string, status: "present" | "absent" | "late") => void;
  onUpdateStatus: (id: string, status: BookingRow["status"]) => void;
  bookingActionId: string | null;
  showAttendance?: boolean;
  variant: "active" | "past";
  started?: boolean;
}) => {
  return (
    <div className={cn("td-booking-item space-y-3", variant === "active" && "border-primary/30 bg-primary/5")}>
      {variant === "active" && (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-green-600">Live now</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="td-booking-subject">{b.subject}</div>
          <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(b.start_at), "PPp")}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {b.duration_min} min</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {studentName}</span>
          </div>
          {b.notes && (
            <div className="mt-2 text-xs text-muted-foreground rounded-lg bg-muted/40 border border-border/60 px-3 py-2">
              <span className="font-semibold text-foreground">Topic:</span> {b.notes}
            </div>
          )}
        </div>
        <span className={statusBadgeClass[b.status]}>{b.status}</span>
      </div>

      {meetingLink && (
        <a href={meetingLink} target="_blank" rel="noreferrer"
           className="flex items-center gap-2 p-2 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors">
          <Video className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-xs font-medium text-primary truncate">{meetingLink}</span>
          <ExternalLink className="h-3 w-3 text-primary ml-auto flex-shrink-0" />
        </a>
      )}

      {calendarLink && b.status === "confirmed" && (
        <a href={calendarLink} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#4285F4]/30 bg-[#4285F4]/5 px-3 py-1.5 text-xs font-semibold text-[#4285F4] hover:bg-[#4285F4]/10 transition">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-02-2zm0 16H5V9h14v11z"/></svg>
          Add to Google Calendar
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      )}

      {showAttendance && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background/50">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Student attendance</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {(["present", "absent", "late"] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={attendance?.status === status ? "default" : "outline"}
                onClick={() => onMarkAttendance(b.id, status)}
                disabled={!started}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {b.status === "confirmed" && variant === "active" && (
          <Button size="sm" onClick={() => onUpdateStatus(b.id, "completed")} disabled={bookingActionId === b.id}>
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Mark completed
          </Button>
        )}
        {b.status === "confirmed" && variant === "past" && (
          <Button size="sm" onClick={() => onUpdateStatus(b.id, "completed")} disabled={bookingActionId === b.id}>
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Mark completed
          </Button>
        )}
      </div>
    </div>
  );
};