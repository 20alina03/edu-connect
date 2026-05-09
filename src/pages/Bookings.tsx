import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import { reviewsApi } from "@/lib/api/reviews";

const Bookings = () => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold font-display mb-6">My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No bookings yet.</div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{b.subject}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {format(new Date(b.start_at), "PP p")}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {b.duration_min} min</span>
                      <span className="capitalize">{b.mode.replace("_"," ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                      b.status === "confirmed" ? "bg-primary/10 text-primary" :
                      b.status === "pending" ? "bg-accent/20 text-accent-foreground" :
                      b.status === "completed" ? "bg-muted text-muted-foreground" :
                      "bg-destructive/10 text-destructive"
                    }`}>{b.status}</span>
                    <span className="font-semibold">${b.price_usd}</span>
                  </div>
                </div>

                {role === "teacher" && b.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}>Accept</Button>
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
