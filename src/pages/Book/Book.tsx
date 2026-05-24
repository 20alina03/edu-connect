import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addMinutes, format } from "date-fns";
import { ArrowRight, Check, Clock3, CalendarClock, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/lib/api/profile";
import { bookingsApi } from "@/lib/api/bookings";
import { teachersApi, type TeacherAvailabilityItem, type TeacherProfile } from "@/lib/api/teachers";
import { PortalNav } from "@/components/PortalNav/PortalNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import "./book.css";

const ISLAMIC_SUBJECTS = ["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"];
const DURATIONS = [30, 45, 60, 90];
const STEP_MINUTES = 15;

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
};

const inferPortal = (subjects: string[]) => (
  subjects.some((subject) => ISLAMIC_SUBJECTS.includes(subject)) ? "islamic" : "school"
);

const buildAvailabilitySlots = (
  date: Date,
  duration: number,
  availability: TeacherAvailabilityItem[],
  bookedSlots: NonNullable<TeacherProfile["booked_slots"]>,
) => {
  const dateKey = format(date, "yyyy-MM-dd");
  const dateSlots = availability.filter((slot) => slot.available_date === dateKey);
  const daySlots = dateSlots.length > 0 ? dateSlots : availability.filter((slot) => slot.available_date == null && slot.day_of_week === date.getDay());

  return daySlots.flatMap((slot) => {
    const slotStart = timeToMinutes(slot.start_time);
    const slotEnd = timeToMinutes(slot.end_time);
    const nextSlots: Array<{ time: string; start: Date; end: Date }> = [];

    for (let minute = slotStart; minute + duration <= slotEnd; minute += STEP_MINUTES) {
      const start = new Date(date);
      start.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
      const end = addMinutes(start, duration);

      const isBusy = bookedSlots.some((booking) => {
        const bookingStart = new Date(booking.start_at);
        const bookingEnd = addMinutes(bookingStart, booking.duration_min);
        return start < bookingEnd && bookingStart < end;
      });

      if (!isBusy) {
        nextSlots.push({ time: minutesToTime(minute), start, end });
      }
    }

    return nextSlots;
  });
};

const Book = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [dateIndex, setDateIndex] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoading(true);

    Promise.all([
      teachersApi.get(id),
      profileApi.get().catch(() => ({ profile: null })),
    ])
      .then(([teacherResult, profileResult]) => {
        if (!active) return;
        setTeacher(teacherResult.teacher);
        setFullName(profileResult.profile?.full_name ?? "");
        setEmail(user?.email ?? "");
        setSubject(teacherResult.teacher.subjects?.[0] ?? "");
        setTopic(teacherResult.teacher.subjects?.[0] ? `Focus on ${teacherResult.teacher.subjects[0]}` : "");
        setStep(1);
        setDateIndex(null);
        setTime(null);
      })
      .catch(() => {
        if (active) setTeacher(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id, user?.email]);

  const portal = useMemo(() => inferPortal(teacher?.subjects ?? []), [teacher]);

  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return date;
    });
  }, []);

  const availability = teacher?.availability ?? [];
  const bookedSlots = teacher?.booked_slots ?? [];
  const selectedDate = dateIndex !== null ? days[dateIndex] : null;
  const availableSlots = selectedDate
    ? buildAvailabilitySlots(selectedDate, duration, availability, bookedSlots)
    : [];

  useEffect(() => {
    if (dateIndex === null || !selectedDate) return;
    if (time && !availableSlots.some((slot) => slot.time === time)) {
      setTime(null);
    }
  }, [availableSlots, dateIndex, selectedDate, time]);

  useEffect(() => {
    if (dateIndex === null) return;
    if (availableSlots.length === 0) {
      setTime(null);
    }
  }, [availableSlots.length, dateIndex]);

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
        <div className="text-center space-y-3">
          <div className="text-xl font-bold font-display">Teacher not found</div>
          <Link to="/school/teachers" className="text-primary font-semibold inline-flex items-center gap-1">
            Browse teachers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const teacherName = teacher.profile?.full_name ?? "Teacher";
  const isIslamic = portal === "islamic";
  const total = (Number(teacher.hourly_rate_usd) * duration) / 60;
  const selectedTimeDate = selectedDate && time
    ? (() => {
        const candidate = new Date(selectedDate);
        const [hours, minutes] = time.split(":").map(Number);
        candidate.setHours(hours, minutes, 0, 0);
        return candidate;
      })()
    : null;

  const submit = async () => {
    if (!user) return navigate(`/login?redirect=/book/${id}`);
    if (dateIndex === null || !time) {
      toast.error("Pick a date and time first.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Select a subject.");
      return;
    }
    if (!topic.trim()) {
      toast.error("Add a lesson topic so the teacher knows what to prepare.");
      return;
    }

    const bookingStart = new Date(days[dateIndex]);
    const [hours, minutes] = time.split(":").map(Number);
    bookingStart.setHours(hours, minutes, 0, 0);

    try {
      await bookingsApi.create({
        teacher_id: teacher.user_id,
        subject: subject.trim(),
        start_at: bookingStart.toISOString(),
        duration_min: duration,
        mode: teacher.mode === "both" ? "online" : teacher.mode,
        notes: topic.trim(),
        price_usd: total,
      });
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to book session");
      return;
    }

    toast.success("Booking sent! Waiting for teacher confirmation.");
    setTimeout(() => navigate("/bookings"), 1000);
  };

  return (
    <div className="book-page">
      <PortalNav portal={portal} />

      <div className="book-body">
        <main>
          <div className="book-steps">
            {["Schedule", "Details", "Confirm"].map((label, index) => {
              const num = index + 1;
              const done = step > num;
              const active = step === num;

              return (
                <div key={label} className="book-step">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn(
                      "book-step-node",
                      done ? (isIslamic ? "bg-primary text-white" : "bg-secondary text-white") :
                      active ? (isIslamic ? "bg-forest text-white" : "bg-navy text-white") :
                      "bg-muted text-muted-foreground",
                    )}>
                      {done ? <Check className="w-4 h-4" /> : num}
                    </div>
                    <span className="book-step-label">{label}</span>
                  </div>
                  {index < 2 && <div className={cn("h-0.5 flex-1 -mt-5", done ? (isIslamic ? "bg-primary" : "bg-secondary") : "bg-border")} />}
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <div className="book-card space-y-4 sm:space-y-6">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl mb-1">Pick a date</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Only days with open slots are enabled.</p>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {days.map((day, index) => {
                    const hasSlots = buildAvailabilitySlots(day, duration, availability, bookedSlots).length > 0;
                    const selected = dateIndex === index;
                    const weekend = day.getDay() === 0 || day.getDay() === 6;

                    return (
                      <button
                        key={day.toISOString()}
                        disabled={weekend || !hasSlots}
                        onClick={() => { setDateIndex(index); setTime(null); }}
                        className={cn(
                          "p-1.5 sm:p-2 rounded-lg text-center transition border text-xs sm:text-sm",
                          weekend || !hasSlots
                            ? "bg-muted text-muted-foreground cursor-not-allowed border-transparent opacity-60"
                            : selected
                              ? (isIslamic ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary")
                              : "bg-card border-border hover:border-foreground/30",
                        )}
                      >
                        <div className="text-[8px] sm:text-[9px] font-bold uppercase opacity-70">
                          {day.toLocaleDateString(undefined, { weekday: "short" })}
                        </div>
                        <div className="font-display font-bold text-base sm:text-lg">{day.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl mb-1">Pick a time</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Slots are filtered against teacher availability and existing bookings.</p>
                {selectedDate === null ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                    Select a date to see available times.
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                    No open times left for this day.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 sm:gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={`${slot.time}-${selectedDate.toISOString()}`}
                        onClick={() => setTime(slot.time)}
                        className={cn(
                          "py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition",
                          time === slot.time
                            ? (isIslamic ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary")
                            : "border-border hover:border-foreground/30",
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl mb-1">Duration</h2>
                <div className="grid grid-cols-4 gap-1 sm:gap-2 mt-3">
                  {DURATIONS.map((slotDuration) => (
                    <button
                      key={slotDuration}
                      onClick={() => setDuration(slotDuration)}
                      className={cn(
                        "py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition",
                        duration === slotDuration
                          ? (isIslamic ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary")
                          : "border-border hover:border-foreground/30",
                      )}
                    >
                      {slotDuration} min
                    </button>
                  ))}
                </div>
              </div>

              <Button
                disabled={dateIndex === null || !time}
                onClick={() => setStep(2)}
                className={cn("w-full rounded-xl font-bold text-sm", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90")}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="book-card space-y-3 sm:space-y-4">
              <h2 className="font-display font-bold text-lg sm:text-xl mb-2">Your details</h2>
              <div>
                <Label className="text-xs">Full name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Aisha Khan" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Subject</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {teacher.subjects.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSubject(item)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        subject === item
                          ? (isIslamic ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary")
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Topic / lesson focus</Label>
                <textarea
                  className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm min-h-24 bg-card"
                  placeholder="e.g. Tajweed rules for Noon Sakinah, or a specific chapter/topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  This is sent to the teacher together with the booking time.
                </p>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Button variant="outline" className="w-full sm:flex-1 rounded-xl text-sm" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className={cn("w-full sm:flex-1 rounded-xl font-bold text-sm", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90")}
                  onClick={() => {
                    if (!subject.trim()) return toast.error("Select a subject.");
                    if (!topic.trim()) return toast.error("Add a topic or focus area.");
                    setStep(3);
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="book-card space-y-3 sm:space-y-4">
              <h2 className="font-display font-bold text-lg sm:text-xl mb-2">Confirm booking</h2>
              <div className="rounded-lg sm:rounded-xl bg-muted p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Teacher</span><span className="font-semibold truncate ml-2">{teacherName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Subject</span><span className="font-semibold truncate ml-2">{subject}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Topic</span><span className="font-semibold truncate ml-2">{topic}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-semibold">{selectedDate ? format(selectedDate, "EEE, MMM d") : "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-semibold">{time}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{duration} min</span></div>
              </div>
              <div className="bg-accent-light text-accent-dark text-xs p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                {selectedTimeDate ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="w-3.5 h-3.5" />
                    Teacher availability checked for {format(selectedTimeDate, "PPP p")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Booking will be validated against teacher availability and existing sessions.
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Button variant="outline" className="w-full sm:flex-1 rounded-xl text-sm" onClick={() => setStep(2)}>Back</Button>
                <Button className={cn("w-full sm:flex-1 rounded-xl font-bold text-sm", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90")} onClick={submit}>
                  Confirm booking
                </Button>
              </div>
            </div>
          )}
        </main>

        <aside className="lg:sticky lg:top-4 h-fit space-y-3">
          <div className="book-sidebar-card">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-display font-extrabold", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{teacher.profile?.full_name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "T"}</div>
              <div>
                <div className="font-display font-bold text-sm">{teacherName}</div>
                <div className="text-[11px] text-muted-foreground">{teacher.subjects.slice(0, 2).join(" · ")}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span>${teacher.hourly_rate_usd}/hr</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="capitalize">{teacher.mode.replace("_", " ")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{duration} min</span></div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="book-sidebar-card">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Availability overview</span>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              {availability.length === 0 ? (
                <p>No availability has been published yet.</p>
              ) : (
                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
                  const rows = availability.filter((slot) => !slot.available_date && slot.day_of_week === index);
                  return (
                    <div key={day} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/60 px-3 py-2">
                      <span className="font-semibold text-foreground">{day}</span>
                      <span className="text-right">
                        {rows.length > 0 ? rows.map((slot) => `${slot.start_time} - ${slot.end_time}`).join(", ") : "Unavailable"}
                      </span>
                    </div>
                  );
                })
              )}
              {availability.some((slot) => slot.available_date) && (
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Date-specific slots</div>
                  {availability
                    .filter((slot) => slot.available_date)
                    .map((slot) => (
                      <div key={`${slot.available_date}-${slot.start_time}-${slot.end_time}`} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/60 px-3 py-2">
                        <span className="font-semibold text-foreground">{format(new Date(`${slot.available_date}T00:00:00`), "EEE, MMM d")}</span>
                        <span className="text-right">{slot.start_time} - {slot.end_time}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Book;
