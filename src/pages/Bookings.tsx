import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { PageBackButton } from "@/components/PageBackButton";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Star, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import { reviewsApi } from "@/lib/api/reviews";
import { notificationsApi } from "@/lib/api/notifications";

const Bookings = () => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meetingLinks, setMeetingLinks]       = useState<Record<string, string | null>>({});
  // Calendar links: keyed by bookingId, value = the "Add to Google Calendar" URL
  const [calendarLinks, setCalendarLinks]     = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rating, setRating]       = useState(5);
  const [comment, setComment]     = useState("");

  const load = async () => {
    if (!user) return;
    try {
      const { bookings } = await bookingsApi.list();
      setBookings(bookings);
    } catch (e: any) { toast.error(e.message); }
  };

  useEffect(() => { load(); }, [user, role]);

  /* ── Hydrate meeting + calendar links from notifications ── */
  useEffect(() => {
    if (!user) return;
    let active = true;

    const hydrate = async () => {
      const { notifications } = await notificationsApi.list();
      if (!active) return;

      const nextMeeting:  Record<string, string | null> = {};
      const nextCalendar: Record<string, string>        = {};

      for (const n of notifications) {
        const bookingId = typeof n.data?.booking_id === "string" ? n.data.booking_id : null;
        if (!bookingId) continue;

        // Meeting link
        if (n.type === "meeting_link") {
          const link = typeof n.data?.meeting_link === "string" ? n.data.meeting_link.trim() : "";
          if (link) nextMeeting[bookingId] = link;
        }

        // Calendar link — present in booking_confirmed and booking_confirmed_teacher notifications
        if (n.type === "booking_confirmed" || n.type === "booking_confirmed_teacher") {
          // Each party gets their own link stored under "calendar_link"
          const calLink = typeof n.data?.calendar_link === "string" ? n.data.calendar_link : "";
          if (calLink) nextCalendar[bookingId] = calLink;
        }
      }

      setMeetingLinks(nextMeeting);
      setCalendarLinks(nextCalendar);
    };

    void hydrate();

    const channel = supabase
      .channel(`bookings-notifications-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const row = payload.new as { type?: string; data?: Record<string, unknown> };
        const bookingId = typeof row.data?.booking_id === "string" ? row.data.booking_id : null;
        if (!bookingId) return;

        if (row.type === "meeting_link") {
          const link = typeof row.data?.meeting_link === "string" ? row.data.meeting_link.trim() : "";
          setMeetingLinks((prev) => ({ ...prev, [bookingId]: link || null }));
        }

        if (row.type === "booking_confirmed" || row.type === "booking_confirmed_teacher") {
          const calLink = typeof row.data?.calendar_link === "string" ? row.data.calendar_link : "";
          if (calLink) setCalendarLinks((prev) => ({ ...prev, [bookingId]: calLink }));
        }
      })
      .subscribe();

    return () => { active = false; void supabase.removeChannel(channel); };
  }, [user]);

  /* ── Real-time booking updates ── */
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`bookings-page-${user.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "bookings",
        filter: role === "teacher" ? `teacher_id=eq.${user.id}` : `student_id=eq.${user.id}`,
      }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, role]);

  const updateStatus = async (id: string, status: Booking["status"]) => {
    try {
      const result = await bookingsApi.setStatus(id, status);
      toast.success(`Booking ${status}`);

      // When teacher confirms, store calendar links returned from backend
      if (status === "confirmed") {
        if (result.teacherCalendarLink) {
          setCalendarLinks((prev) => ({ ...prev, [id]: result.teacherCalendarLink! }));
        }
        if (result.studentCalendarLink) {
          // Also store student link so it shows if role switches (shouldn't normally)
          setCalendarLinks((prev) => ({ ...prev, [`${id}_student`]: result.studentCalendarLink! }));
        }
        toast.success("Confirmation emails sent to both parties 📩");
      }

      void load();
    } catch (e: any) { toast.error(e.message); }
  };

  const submitReview = async (b: Booking) => {
    try {
      await reviewsApi.create({ booking_id: b.id, rating, comment });
      toast.success("Review submitted!");
      setReviewing(null);
      setComment("");
    } catch (e: any) { toast.error(e.message); }
  };

  const attendanceLabel = (s: Booking["attendance_status"]) =>
    !s ? "Pending" : s.charAt(0).toUpperCase() + s.slice(1);
  const attendanceCls = (s: Booking["attendance_status"]) =>
    s === "present" ? "bg-green-500/10 text-green-600" :
    s === "late"    ? "bg-amber-500/10 text-amber-600" :
    s === "absent"  ? "bg-red-500/10 text-red-600"     : "bg-muted text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex items-start justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-display">My Bookings</h1>
          <PageBackButton />
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No bookings yet.</div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const calLink    = calendarLinks[b.id] ?? null;
              const meetLink   = meetingLinks[b.id]  ?? null;
              const isUpcoming = new Date(b.start_at) > new Date();

              return (
                <div key={b.id} className="bg-card border border-border rounded-xl p-4 space-y-3">

                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm sm:text-base">{b.subject}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(b.start_at), "EEE, MMM d yyyy · h:mm a")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {b.duration_min} min
                        </span>
                        <span className="capitalize">{b.mode.replace("_", " ")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start">
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-semibold whitespace-nowrap ${
                        b.status === "confirmed" ? "bg-primary/10 text-primary" :
                        b.status === "pending"   ? "bg-amber-500/10 text-amber-600" :
                        b.status === "completed" ? "bg-muted text-muted-foreground" :
                        "bg-destructive/10 text-destructive"
                      }`}>{b.status}</span>
                      <span className="font-bold text-sm">${b.price_usd}</span>
                    </div>
                  </div>

                  {/* Attendance badge */}
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${attendanceCls(b.attendance_status)}`}>
                    Attendance: {attendanceLabel(b.attendance_status)}
                  </div>

                  {/* Action row */}
                  <div className="flex flex-wrap gap-2">

                    {/* Meeting link */}
                    {meetLink && (
                      <a href={meetLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition">
                        <Calendar className="w-3.5 h-3.5" /> Join meeting
                      </a>
                    )}

                    {/* Google Calendar button — shown for BOTH teacher and student
                        once booking is confirmed (calendar link comes from notifications) */}
                    {calLink && b.status === "confirmed" && isUpcoming && (
                      <a href={calLink} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#4285F4]/30 bg-[#4285F4]/5 px-3 py-1.5 text-xs font-semibold text-[#4285F4] hover:bg-[#4285F4]/10 transition">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                        </svg>
                        Add to Google Calendar
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}

                    {/* Teacher actions */}
                    {role === "teacher" && b.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "cancelled")}>Decline</Button>
                      </>
                    )}
                    {role === "teacher" && b.status === "confirmed" && !isUpcoming && (
                      <Button size="sm" onClick={() => updateStatus(b.id, "completed")}>Mark completed</Button>
                    )}

                    {/* Student: leave review */}
                    {role === "student" && b.status === "completed" && reviewing !== b.id && (
                      <Button size="sm" variant="outline" onClick={() => setReviewing(b.id)}>Leave review</Button>
                    )}
                  </div>

                  {/* Inline review form */}
                  {reviewing === b.id && (
                    <div className="space-y-2 pt-1 border-t border-border">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((i) => (
                          <button key={i} type="button" onClick={() => setRating(i)}>
                            <Star className={`w-5 h-5 ${i <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                      </div>
                      <textarea className="w-full p-2 rounded border border-border bg-background text-sm resize-none"
                        rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="Your feedback…" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => submitReview(b)}>Submit review</Button>
                        <Button size="sm" variant="ghost" onClick={() => setReviewing(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;