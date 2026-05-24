import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import { reviewsApi } from "@/lib/api/reviews";
import { notificationsApi } from "@/lib/api/notifications";

const Bookings = () => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string | null>>({});
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = async () => {
    if (!user) return;
    try {
      const { bookings } = await bookingsApi.list();
      setBookings(bookings);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  useEffect(() => { load(); }, [user, role]);

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
      .channel(`meeting-links-bookings-${user.id}`)
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

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`bookings-page-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: role === "teacher" ? `teacher_id=eq.${user.id}` : `student_id=eq.${user.id}` },
        () => { void load(); }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [user, role]);

  const updateStatus = async (id: string, status: Booking["status"]) => {
    try {
      await bookingsApi.setStatus(id, status);
      toast.success(`Booking ${status}`);
      load();
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

  const getMeetingLink = (bookingId: string) => meetingLinks[bookingId] ?? null;
  const attendanceLabel = (status: Booking["attendance_status"]) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  const attendanceBadgeClass = (status: Booking["attendance_status"]) => {
    if (status === "present") return "bg-green-500/10 text-green-600";
    if (status === "late") return "bg-amber-500/10 text-amber-600";
    if (status === "absent") return "bg-red-500/10 text-red-600";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-display mb-4 sm:mb-6">My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="text-center py-12 sm:py-16 text-muted-foreground text-sm">No bookings yet.</div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div>
                    <div className="font-semibold text-sm sm:text-base">{b.subject}</div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {format(new Date(b.start_at), "PPp")}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {b.duration_min} min</span>
                      <span className="capitalize">{b.mode.replace("_"," ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-between sm:justify-end">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium whitespace-nowrap ${
                      b.status === "confirmed" ? "bg-primary/10 text-primary" :
                      b.status === "pending" ? "bg-accent/20 text-accent-foreground" :
                      b.status === "completed" ? "bg-muted text-muted-foreground" :
                      "bg-destructive/10 text-destructive"
                    }`}>{b.status}</span>
                    <span className="font-semibold text-sm">${b.price_usd}</span>
                  </div>
                </div>

                {getMeetingLink(b.id) && (
                  <a href={getMeetingLink(b.id) ?? undefined} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                    <Calendar className="w-4 h-4" />
                    Join meet
                  </a>
                )}

                <div className={"mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold " + attendanceBadgeClass(b.attendance_status)}>
                    <span>Attendance:</span>
                  <span>{attendanceLabel(b.attendance_status)}</span>
                </div>

                {role === "teacher" && b.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")} className="flex-1 sm:flex-none">Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "cancelled")}>Decline</Button>
                  </div>
                )}
                {role === "teacher" && b.status === "confirmed" && new Date(b.start_at) < new Date() && (
                  <Button size="sm" className="mt-3" onClick={() => updateStatus(b.id, "completed")}>Mark completed</Button>
                )}

                {role === "student" && b.status === "completed" && (
                  reviewing === b.id ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <button key={i} onClick={() => setRating(i)}>
                            <Star className={`w-5 h-5 ${i <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`}/>
                          </button>
                        ))}
                      </div>
                      <textarea className="w-full p-2 rounded border border-border bg-background text-sm"
                        rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="Your feedback..."/>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => submitReview(b)}>Submit review</Button>
                        <Button size="sm" variant="ghost" onClick={() => setReviewing(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => setReviewing(b.id)}>
                      Leave review
                    </Button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
