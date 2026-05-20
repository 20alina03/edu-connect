import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar, CheckCircle, XCircle, Clock, MapPin, Video,
  ExternalLink, Plus, Users, CheckSquare, Square, Link2,
  AlertCircle, Play, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
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
}

type SessionTab = "active" | "upcoming" | "past";

/* Attendance record stored in local state (would be persisted to DB in production) */
interface AttendanceRecord {
  bookingId: string;
  studentPresent: boolean;
  markedAt: string;
}

export const SessionsModule = ({
  user, bookings, studentProfiles, onReload, updateBookingStatus, bookingActionId,
}: SessionsModuleProps) => {
  const [tab, setTab] = useState<SessionTab>("upcoming");
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
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

  const saveMeetingLink = async (bookingId: string) => {
    setSavingLink(true);
    try {
      // In production: await supabase.from("bookings").update({ meeting_link: linkDraft }).eq("id", bookingId);
      setMeetingLinks((prev) => ({ ...prev, [bookingId]: linkDraft }));
      setEditingLinkId(null);
      toast.success("Meeting link saved");
    } catch (e: any) {
      toast.error("Failed to save link");
    } finally {
      setSavingLink(false);
    }
  };

  const toggleAttendance = (bookingId: string, studentId: string) => {
    setAttendance((prev) => {
      const existing = prev[bookingId];
      if (existing) {
        const updated = { ...existing, studentPresent: !existing.studentPresent };
        toast.success(updated.studentPresent ? "Attendance marked ✓" : "Attendance unmarked");
        return { ...prev, [bookingId]: updated };
      }
      toast.success("Attendance marked ✓");
      return {
        ...prev,
        [bookingId]: { bookingId, studentPresent: true, markedAt: new Date().toISOString() },
      };
    });
  };

  const studentName = (id: string) => studentProfiles[id]?.full_name ?? "Student";

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
                meetingLink={meetingLinks[b.id]}
                attendance={attendance[b.id]}
                onToggleAttendance={() => toggleAttendance(b.id, b.student_id)}
                onUpdateStatus={updateBookingStatus}
                bookingActionId={bookingActionId}
                showAttendance
                variant="active"
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
                  </div>
                  <span className={statusBadgeClass[b.status]}>{b.status}</span>
                </div>

                {/* Meeting link section */}
                {meetingLinks[b.id] ? (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-primary/5 border border-primary/20">
                    <Video className="h-4 w-4 text-primary flex-shrink-0" />
                    <a href={meetingLinks[b.id]} target="_blank" rel="noreferrer"
                       className="text-xs font-medium text-primary truncate flex-1 hover:underline">
                      {meetingLinks[b.id]}
                    </a>
                    <button onClick={() => { setEditingLinkId(b.id); setLinkDraft(meetingLinks[b.id]); }}
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
                    <Button size="sm" onClick={() => saveMeetingLink(b.id)} disabled={savingLink || !linkDraft.trim()}>Save</Button>
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

                {/* Accept/Decline */}
                {b.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")} disabled={bookingActionId === b.id}>
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")} disabled={bookingActionId === b.id}>
                      <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
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
                meetingLink={meetingLinks[b.id]}
                attendance={attendance[b.id]}
                onToggleAttendance={() => toggleAttendance(b.id, b.student_id)}
                onUpdateStatus={updateBookingStatus}
                bookingActionId={bookingActionId}
                showAttendance
                variant="past"
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
  booking: b, studentName, meetingLink, attendance, onToggleAttendance,
  onUpdateStatus, bookingActionId, showAttendance, variant,
}: {
  booking: BookingRow;
  studentName: string;
  meetingLink?: string;
  attendance?: AttendanceRecord;
  onToggleAttendance: () => void;
  onUpdateStatus: (id: string, status: BookingRow["status"]) => void;
  bookingActionId: string | null;
  showAttendance?: boolean;
  variant: "active" | "past";
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

      {showAttendance && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background/50">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Student attendance</span>
          </div>
          <button
            onClick={onToggleAttendance}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              attendance?.studentPresent
                ? "bg-green-500/10 text-green-600 border border-green-200"
                : "bg-muted text-muted-foreground border border-border hover:border-green-300"
            )}
          >
            {attendance?.studentPresent ? (
              <><CheckSquare className="h-3.5 w-3.5" /> Present</>
            ) : (
              <><Square className="h-3.5 w-3.5" /> Mark present</>
            )}
          </button>
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