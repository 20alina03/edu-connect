import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Calendar, Home as HomeIcon, MapPin, MessageCircle, Phone, ShieldCheck, Star, Wifi, BookOpen, Lock, Send } from "lucide-react";
import { PortalNav } from "@/components/PortalNav/PortalNav";
import { PageBackButton } from "@/components/PageBackButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { teachersApi, type TeacherProfile } from "@/lib/api/teachers";
import { bookingsApi, type Booking } from "@/lib/api/bookings";
import { reviewsApi, type Review } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";
import "./teacherprofile.css";

const ISLAMIC_SUBJECTS = ["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"];

const inferPortal = (subjects: string[]) => (
  subjects.some((subject) => ISLAMIC_SUBJECTS.includes(subject)) ? "islamic" : "school"
);

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TeacherProfilePage = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibleBookings, setEligibleBookings] = useState<Booking[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoading(true);

    Promise.all([
      teachersApi.get(id),
      reviewsApi.byTeacher(id),
      user ? bookingsApi.list().catch(() => ({ bookings: [] as Booking[] })) : Promise.resolve({ bookings: [] as Booking[] }),
    ])
      .then(([teacherResult, reviewResult, bookingsResult]) => {
        if (!active) return;
        setTeacher(teacherResult.teacher);
        setReviews(reviewResult.reviews ?? []);
        setEligibleBookings(
          (bookingsResult.bookings ?? []).filter((booking) => booking.teacher_id === id && booking.student_id === user?.id && booking.status === "completed")
        );
      })
      .catch(() => {
        if (active) setTeacher(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  const portal = useMemo(() => inferPortal(teacher?.subjects ?? []), [teacher]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Loading teacher profile…</div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl mb-2">Teacher not found</h2>
          <Link to="/school/teachers" className="text-primary underline">Back to teachers</Link>
        </div>
      </div>
    );
  }

  const teacherName = teacher.profile?.full_name ?? "Teacher";
  const isIslamic = portal === "islamic";
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) : Number(teacher.rating ?? 0);
  const noteAccess = Boolean(teacher.note_access);
  const canReview = role === "student" && eligibleBookings.length > 0;
  const teacherPhone = teacher.profile?.phone?.trim() ?? "";
  const whatsappLink = teacherPhone
    ? `https://wa.me/${teacherPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Assalamu Alaikum, I would like to contact you about ${teacherName}.`)}`
    : "";

  const submitReview = async () => {
    if (!eligibleBookings[0]) return;
    setSubmittingReview(true);
    try {
      await reviewsApi.create({ booking_id: eligibleBookings[0].id, rating: reviewRating, comment: reviewComment.trim() || undefined });
      const refreshed = await reviewsApi.byTeacher(id!);
      setReviews(refreshed.reviews ?? []);
      setReviewComment("");
      setReviewRating(5);
    } catch (e: any) {
      setReviewComment("");
      setReviewRating(5);
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="teacher-profile-page">
      <PortalNav portal={portal} />

      <header className={cn("teacher-profile-header", isIslamic ? "bg-forest" : "bg-navy")}>
        <div className="teacher-profile-header-inner">
          <div className={cn("teacher-profile-avatar", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary") }>
            {teacherName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 text-white">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">{teacherName}</h1>
            <p className="text-white/55 text-xs sm:text-sm mb-2 sm:mb-3">{teacher.subjects.join(", ")}</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className="teacher-profile-chip bg-primary/15 border border-primary/30 text-primary-glow text-[10px] sm:text-[11px]">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
              <span className="teacher-profile-chip bg-white/10 text-white text-[10px] sm:text-[11px]">
                <Star className="w-3 h-3 fill-accent text-accent" /> {averageRating ? averageRating.toFixed(2) : "—"} ({reviews.length} reviews)
              </span>
              <span className="teacher-profile-chip bg-white/10 text-white text-[10px] sm:text-[11px]">
                {teacher.mode === "home_visit" ? <HomeIcon className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                {teacher.mode === "both" ? "Online + Home" : teacher.mode === "online" ? "Online" : "Home Visit"}
              </span>
              {teacher.city && (
                <span className="teacher-profile-chip bg-white/10 text-white text-[10px] sm:text-[11px]">
                  <MapPin className="w-3 h-3" /> {teacher.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="teacher-profile-body">
        <main className="space-y-6 sm:space-y-8 lg:space-y-10">
          <section>
            <div className="mb-3 sm:mb-4">
              <PageBackButton />
            </div>
            <h2 className="teacher-profile-section-title">About Teacher</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{teacher.bio || "This teacher has not added a bio yet."}</p>
          </section>

          <section>
            <h2 className="teacher-profile-section-title">Contact</h2>
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone number</div>
                  <div className="mt-1 font-semibold">
                    {teacherPhone ? `+${teacherPhone.replace(/\D/g, "")}` : "Not shared yet"}
                  </div>
                </div>
                {teacherPhone && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#22c55e] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="w-4 h-4" />
                {teacherPhone ? "WhatsApp opens in your browser or app" : "Add a phone number to enable WhatsApp contact"}
              </div>
            </div>
          </section>

          <section>
            <h2 className="teacher-profile-section-title">Subjects & Specialities</h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {teacher.subjects.map((subject) => (
                <span key={subject} className={cn("px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{subject}</span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="teacher-profile-section-title">Availability</h2>
            <div className="grid gap-2 sm:gap-3">
              {teacher.availability?.some((slot) => slot.available_date) && (
                <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Date-specific slots</div>
                  <div className="grid gap-2">
                    {teacher.availability
                      .filter((slot) => slot.available_date)
                      .map((slot) => (
                        <div key={`${slot.available_date}-${slot.start_time}-${slot.end_time}`} className="rounded-xl border border-border bg-background/60 p-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">{format(new Date(`${slot.available_date}T00:00:00`), "EEE, MMM d")}</div>
                            <div className="text-xs text-muted-foreground">Specific booking slot</div>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">{slot.start_time} - {slot.end_time}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {dayLabels.map((day, index) => {
                const rows = teacher.availability?.filter((slot) => !slot.available_date && slot.day_of_week === index) ?? [];

                return (
                  <div key={day} className="rounded-2xl border border-border bg-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{day[0]}</div>
                      <div>
                        <div className="text-sm font-semibold">{day}</div>
                        <div className="text-xs text-muted-foreground">{rows.length > 0 ? `${rows.length} slot${rows.length > 1 ? "s" : ""}` : "Unavailable"}</div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground sm:text-right">
                      {rows.length > 0 ? rows.map((slot) => `${slot.start_time} - ${slot.end_time}`).join(", ") : "No teaching hours published"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="teacher-profile-section-title">Demo lessons</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(teacher.template_lessons ?? []).length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground sm:col-span-2">
                  This teacher has not published demo lessons yet.
                </div>
              ) : (teacher.template_lessons ?? []).map((lesson) => (
                <a key={lesson.id} href={lesson.driveUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Public demo</div>
                      <h3 className="font-semibold mt-1">{lesson.title}</h3>
                    </div>
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{lesson.description || "Open the lesson to preview the teacher's style and content."}</p>
                </a>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="teacher-profile-section-title mb-0">Teacher notes</h2>
                <p className="text-xs text-muted-foreground">Visible to students who have booked at least one session.</p>
              </div>
              {!noteAccess && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Locked</span>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {noteAccess ? ((teacher.lesson_notes ?? []).length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground sm:col-span-2">
                  This teacher hasn't shared any notes yet.
                </div>
              ) : (teacher.lesson_notes ?? []).map((lesson) => (
                <a key={lesson.id} href={lesson.driveUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Booked student resource</div>
                      <h3 className="font-semibold mt-1">{lesson.title}</h3>
                    </div>
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{lesson.description || "Open the note to review the teacher's follow-up material."}</p>
                </a>
              ))) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground sm:col-span-2">
                  Book one session with this teacher to unlock their notes here.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="teacher-profile-section-title mb-0">Reviews</h2>
                <p className="text-xs text-muted-foreground">Ratings from students who booked and completed lessons.</p>
              </div>
            </div>
            {canReview && (
              <div className="rounded-2xl border border-border bg-card p-4 mb-4 space-y-3">
                <div className="text-sm font-semibold">Leave a rating</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" onClick={() => setReviewRating(value)}>
                      <Star className={cn("w-5 h-5", value <= reviewRating ? "fill-accent text-accent" : "text-muted-foreground")} />
                    </button>
                  ))}
                </div>
                <Textarea rows={3} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share what this teacher does well..." />
                <Button onClick={submitReview} disabled={submittingReview} className="rounded-full">
                  {submittingReview ? "Saving…" : <><Send className="w-4 h-4 mr-2" />Submit rating</>}
                </Button>
              </div>
            )}
            <h2 className="teacher-profile-section-title">Recent reviews</h2>
            <div className="space-y-2 sm:space-y-3">
              {reviews.map((review, index) => (
                <div key={index} className="teacher-profile-review">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className={cn("w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{review.initials}</div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold truncate">{review.name}</div>
                      <div className="text-accent text-[10px] sm:text-xs">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="lg:sticky lg:top-4 h-fit space-y-3 sm:space-y-4">
          <div className="teacher-profile-booking">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-foreground">${teacher.hourly_rate_usd}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">/ hour</span>
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mb-4">Availability and bookings are synced with the backend.</div>
            <Link to={`/book/${teacher.user_id}`} className="block">
              <Button className={cn("w-full rounded-lg sm:rounded-xl font-bold text-sm sm:text-base", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90") }>
                <Calendar className="w-4 h-4 mr-2" /> Book a session
              </Button>
            </Link>
            <Link to={`/messages/${teacher.user_id}`} className="block">
              <Button variant="outline" className="w-full rounded-lg sm:rounded-xl mt-2 text-sm sm:text-base">
                <MessageCircle className="w-4 h-4 mr-2" /> Message teacher
              </Button>
            </Link>
          </div>
          <div className="teacher-profile-banner">
            <strong>Trusted teacher</strong> - verified profile and live backend availability.
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
