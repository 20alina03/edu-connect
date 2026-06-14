import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowRight, Check, Clock3, CalendarClock,
  ShieldAlert, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/lib/api/profile";
import { bookingsApi } from "@/lib/api/bookings";
import { teachersApi, type TeacherProfile } from "@/lib/api/teachers";
import { PortalNav } from "@/components/PortalNav/PortalNav";
import { PageBackButton } from "@/components/PageBackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ALLOWED_SESSION_DURATIONS,
  buildSlotStates,
  dateKey,
  priceForDuration,
  type AllowedSessionDuration,
  type SlotState,
} from "@/lib/booking-utils";
import "./book.css";

const ISLAMIC_SUBJECTS = ["Quran", "Tajweed", "Hifz", "Noorani Qaida", "Arabic", "Islamic Studies"];
const SLOTS_PAGE = 6;

const inferPortal = (subjects: string[]) =>
  subjects.some((s) => ISLAMIC_SUBJECTS.includes(s)) ? "islamic" : "school";

const Book = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [step, setStep]         = useState(1);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [time, setTime]         = useState<string | null>(null);
  const [duration, setDuration] = useState<AllowedSessionDuration>(60);
  const [subject, setSubject]   = useState("");
  const [topic, setTopic]       = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [nowTick, setNowTick]   = useState(() => Date.now());
  const [slotsShown, setSlotsShown] = useState(SLOTS_PAGE);
  const [calendarLink, setCalendarLink] = useState<string | null>(null);
  const [bookingDone, setBookingDone]   = useState(false);

  const stripRef = useRef<HTMLDivElement>(null);

  /* ── Load teacher ── */
  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    Promise.all([
      teachersApi.get(id),
      profileApi.get().catch(() => ({ profile: null })),
    ]).then(([tr, pr]) => {
      if (!active) return;
      setTeacher(tr.teacher);
      setFullName(pr.profile?.full_name ?? "");
      setEmail(user?.email ?? "");
      setSubject(tr.teacher.subjects?.[0] ?? "");
      setTopic(tr.teacher.subjects?.[0] ? `Focus on ${tr.teacher.subjects[0]}` : "");
      setStep(1); setSelectedDateKey(null); setTime(null);
    }).catch(() => { if (active) setTeacher(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, user?.email]);

  /* ── Tick every minute to expire past slots ── */
  useEffect(() => {
    const t = window.setInterval(() => setNowTick(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const portal    = useMemo(() => inferPortal(teacher?.subjects ?? []), [teacher]);
  const isIslamic = portal === "islamic";
  const accent    = isIslamic ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary";

  /* ── 60-day window ── */
  const days = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i); return d;
    }), []);

  const availability = teacher?.availability  ?? [];
  const bookedSlots  = teacher?.booked_slots  ?? [];

  const slotsByDate = useMemo(() => {
    const now = new Date(nowTick);
    return days.reduce<Record<string, SlotState[]>>((acc, day) => {
      acc[dateKey(day)] = buildSlotStates({ date: day, duration, availability, bookedSlots, now });
      return acc;
    }, {});
  }, [availability, bookedSlots, days, duration, nowTick]);

  const visibleDays = useMemo(
    () => days.filter((d) => (slotsByDate[dateKey(d)] ?? []).length > 0),
    [days, slotsByDate],
  );

  /* ── Auto-select first day ── */
  useEffect(() => {
    if (!visibleDays.length) { setSelectedDateKey(null); setTime(null); return; }
    if (!selectedDateKey || !visibleDays.some((d) => dateKey(d) === selectedDateKey))
      setSelectedDateKey(dateKey(visibleDays[0]));
  }, [selectedDateKey, visibleDays]);

  /* ── Autoscroll strip ── */
  useEffect(() => {
    if (!selectedDateKey || !stripRef.current) return;
    const el = stripRef.current.querySelector(`[data-dk="${selectedDateKey}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedDateKey]);

  /* ── Reset pagination on date/duration change ── */
  useEffect(() => { setSlotsShown(SLOTS_PAGE); }, [selectedDateKey, duration]);

  const selectedDate = selectedDateKey
    ? days.find((d) => dateKey(d) === selectedDateKey) ?? null
    : null;

  const allSlots: SlotState[] = selectedDateKey ? (slotsByDate[selectedDateKey] ?? []) : [];

  /* ── Sort: available first (earliest), booked last ── */
  const sortedSlots = useMemo(() => [
    ...allSlots.filter((s) => s.status === "available").sort((a, b) => a.start.getTime() - b.start.getTime()),
    ...allSlots.filter((s) => s.status === "booked"   ).sort((a, b) => a.start.getTime() - b.start.getTime()),
  ], [allSlots]);

  const visibleSlots = sortedSlots.slice(0, slotsShown);
  const hasMore = slotsShown < sortedSlots.length;
  const hasLess = slotsShown > SLOTS_PAGE;

  /* ── Clear selected time if it vanishes ── */
  useEffect(() => {
    if (time && !allSlots.some((s) => s.time === time && s.status === "available")) setTime(null);
  }, [allSlots, time]);

  const total = priceForDuration(Number(teacher?.hourly_rate_usd ?? 0), duration);

  const selectedTimeDate = selectedDate && time
    ? (() => { const c = new Date(selectedDate); const [h, m] = time.split(":").map(Number); c.setHours(h, m, 0, 0); return c; })()
    : null;

  /* ── Submit ── */
  const submit = async () => {
    if (!user) return navigate(`/login?redirect=/book/${id}`);
    if (!selectedDateKey || !time || !selectedDate) { toast.error("Pick a date and time first."); return; }
    if (!subject.trim()) { toast.error("Select a subject."); return; }
    if (!topic.trim())   { toast.error("Add a lesson topic."); return; }

    const start = new Date(selectedDate);
    const [h, m] = time.split(":").map(Number);
    start.setHours(h, m, 0, 0);

    let result;
    try {
      result = await bookingsApi.create({
        teacher_id: teacher!.user_id,
        subject: subject.trim(),
        start_at: start.toISOString(),
        duration_min: duration,
        mode: teacher!.mode === "both" ? "online" : teacher!.mode,
        notes: topic.trim(),
        price_usd: total,
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to book session");
      return;
    }

    setCalendarLink(result?.studentCalendarLink ?? null);
    setBookingDone(true);
  };

  /* ══════════════════════════════════════════════════════
     BOOKING SUCCESS SCREEN
  ══════════════════════════════════════════════════════ */
  if (bookingDone) {
    return (
      <div className="book-page">
        <PortalNav portal={portal} />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
          <div className={cn("w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-3xl", isIslamic ? "bg-primary" : "bg-secondary")}>✓</div>
          <h1 className="font-display font-extrabold text-2xl">Booking sent!</h1>
          <p className="text-muted-foreground text-sm">
            Your request has been sent to the teacher. You'll be notified once they confirm.
          </p>
          {calendarLink && (
            <a href={calendarLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4285F4] px-5 py-3 font-semibold text-sm text-white hover:bg-[#3367d6] transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
              Add to Google Calendar
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => navigate("/bookings")}>View my bookings</Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>Back to teacher</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading)  return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground animate-pulse">Loading…</div></div>;
  if (!teacher) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="text-xl font-bold">Teacher not found</div>
        <Link to="/school/teachers" className="text-primary font-semibold inline-flex items-center gap-1">Browse teachers <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </div>
  );

  const teacherName = teacher.profile?.full_name ?? "Teacher";

  /* ══════════════════════════════════════════════════════
     MAIN BOOKING LAYOUT
  ══════════════════════════════════════════════════════ */
  return (
    <div className="book-page">
      <PortalNav portal={portal} />

      <div className="book-body">

        {/* ── LEFT: main content ── */}
        <main className="min-w-0">
          <div className="mb-4"><PageBackButton /></div>

          {/* Step indicator */}
          <div className="book-steps">
            {["Schedule", "Details", "Confirm"].map((label, i) => {
              const n = i + 1; const done = step > n; const active = step === n;
              return (
                <div key={label} className="book-step">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn("book-step-node", done ? accent : active ? (isIslamic ? "bg-forest text-white" : "bg-navy text-white") : "bg-muted text-muted-foreground")}>
                      {done ? <Check className="w-4 h-4" /> : n}
                    </div>
                    <span className="book-step-label">{label}</span>
                  </div>
                  {i < 2 && <div className={cn("h-0.5 flex-1 -mt-5", done ? (isIslamic ? "bg-primary" : "bg-secondary") : "bg-border")} />}
                </div>
              );
            })}
          </div>

          {/* ══ STEP 1: Schedule ══ */}
          {step === 1 && (
            <div className="book-card">

              {/* Duration */}
              <div>
                <h2 className="font-display font-bold text-base mb-1">Session duration</h2>
                <p className="text-xs text-muted-foreground mb-3">Price scales linearly with your chosen duration.</p>
                <div className="book-duration-grid">
                  {ALLOWED_SESSION_DURATIONS.map((d) => (
                    <button key={d} onClick={() => { setDuration(d); setTime(null); }}
                      className={cn("py-3 rounded-xl border text-center transition",
                        duration === d ? accent : "border-border hover:border-foreground/20 bg-card")}>
                      <div className="text-sm font-bold">{d} min</div>
                      <div className="text-[11px] opacity-60 mt-0.5">${priceForDuration(Number(teacher.hourly_rate_usd), d)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date strip */}
              <div>
                <h2 className="font-display font-bold text-base mb-1">Pick a date</h2>
                <p className="text-xs text-muted-foreground mb-2">Scroll to see all available dates (next 60 days).</p>
                {visibleDays.length === 0
                  ? <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No available dates in the next 60 days.</div>
                  : (
                    <div ref={stripRef} className="book-date-strip">
                      {visibleDays.map((day) => {
                        const key   = dateKey(day);
                        const slots = slotsByDate[key] ?? [];
                        const sel   = selectedDateKey === key;
                        const avail = slots.filter((s) => s.status === "available").length;
                        const bkd   = slots.filter((s) => s.status === "booked").length;
                        return (
                          <button key={key} data-dk={key} type="button"
                            onClick={() => { setSelectedDateKey(key); setTime(null); }}
                            className={cn("book-date-btn", sel ? accent : "")}>
                            <div className="text-[10px] font-bold uppercase opacity-60 mb-0.5">{format(day, "EEE")}</div>
                            <div className="font-display font-extrabold text-lg leading-none">{format(day, "d")}</div>
                            <div className="text-[10px] opacity-50 mb-2">{format(day, "MMM yy")}</div>
                            {avail > 0 && <div className={cn("rounded-full text-[9px] font-bold px-1.5 py-0.5 mb-0.5", sel ? "bg-white/20" : "bg-primary/10 text-primary")}>{avail} open</div>}
                            {bkd  > 0 && <div className="rounded-full text-[9px] font-bold px-1.5 py-0.5 bg-red-500/10 text-red-500">{bkd} booked</div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>

              {/* Time slots */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="font-display font-bold text-base">Pick a time</h2>
                  {selectedDate && sortedSlots.length > 0 && (
                    <span className="text-xs text-muted-foreground">{sortedSlots.filter((s) => s.status === "available").length} available</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">Earliest available first. Booked slots shown at bottom.</p>

                {!selectedDate ? (
                  <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Select a date above.</div>
                ) : sortedSlots.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No future slots on this date.</div>
                ) : (
                  <>
                    <div className="book-slot-list">
                      {visibleSlots.map((slot) => {
                        const isSelected = time === slot.time && slot.status === "available";
                        const isBooked   = slot.status === "booked";
                        return (
                          <button
                            key={slot.start.toISOString()}
                            type="button"
                            disabled={isBooked}
                            onClick={() => !isBooked && setTime(slot.time)}
                            className={cn(
                              "book-slot-btn",
                              isBooked   ? "opacity-50 bg-muted/30 border-border" :
                              isSelected ? accent : "border-border hover:border-foreground/25 hover:bg-muted/30",
                            )}
                          >
                            {/* Start time */}
                            <span className="font-bold text-sm">{slot.time}</span>

                            {/* End time */}
                            <span className="text-xs text-muted-foreground font-normal">
                              ends {format(slot.end, "HH:mm")}
                            </span>

                            {/* Status badge or checkmark */}
                            {isBooked ? (
                              <span className="text-[10px] font-bold uppercase tracking-wide rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 whitespace-nowrap">
                                Booked
                              </span>
                            ) : isSelected ? (
                              <Check className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <span />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center gap-4 mt-3">
                      {hasMore && (
                        <button onClick={() => setSlotsShown((n) => n + SLOTS_PAGE)}
                          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                          <ChevronDown className="w-3.5 h-3.5" />
                          See more ({sortedSlots.length - slotsShown} more)
                        </button>
                      )}
                      {hasLess && (
                        <button onClick={() => setSlotsShown(SLOTS_PAGE)}
                          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:underline ml-auto">
                          <ChevronUp className="w-3.5 h-3.5" />
                          See less
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <Button disabled={!selectedDateKey || !time} onClick={() => setStep(2)}
                className={cn("w-full rounded-xl font-bold", isIslamic ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90")}>
                Continue
              </Button>
            </div>
          )}

          {/* ══ STEP 2: Details ══ */}
          {step === 2 && (
            <div className="book-card">
              <h2 className="font-display font-bold text-lg mb-1">Your details</h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Full name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Aisha Khan" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Subject</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {teacher.subjects.map((item) => (
                      <button key={item} type="button" onClick={() => setSubject(item)}
                        className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          subject === item ? accent : "border-border hover:border-primary/40")}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Topic / lesson focus</Label>
                  <textarea className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm min-h-20 bg-card resize-none"
                    placeholder="e.g. Noon Sakinah rules, Chapter 5 revision…"
                    value={topic} onChange={(e) => setTopic(e.target.value)} />
                  <p className="mt-1 text-[11px] text-muted-foreground">Sent to the teacher with the booking request.</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(1)}>Back</Button>
                <Button className={cn("flex-1 rounded-xl font-bold", isIslamic ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90")}
                  onClick={() => {
                    if (!subject.trim()) return toast.error("Select a subject.");
                    if (!topic.trim())   return toast.error("Add a topic.");
                    setStep(3);
                  }}>Continue</Button>
              </div>
            </div>
          )}

          {/* ══ STEP 3: Confirm ══ */}
          {step === 3 && (
            <div className="book-card">
              <h2 className="font-display font-bold text-lg mb-1">Confirm booking</h2>
              <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
                {[
                  ["Teacher",  teacherName],
                  ["Subject",  subject],
                  ["Topic",    topic],
                  ["Date",     selectedDate ? format(selectedDate, "EEE, MMMM d, yyyy") : "—"],
                  ["Time",     time ?? "—"],
                  ["Duration", `${duration} min`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground flex-shrink-0">{label}</span>
                    <span className="font-semibold text-right truncate">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2 font-bold text-base">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-accent/5 border border-accent/20 text-xs px-3 py-2.5 text-accent-foreground">
                {selectedTimeDate
                  ? <span className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" /> Availability checked for {format(selectedTimeDate, "PPP p")}</span>
                  : <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Booking will be validated against teacher availability.</span>}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(2)}>Back</Button>
                <Button className={cn("flex-1 rounded-xl font-bold", isIslamic ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90")}
                  onClick={submit}>Confirm booking</Button>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT: sidebar ── */}
        <aside className="space-y-3 lg:sticky lg:top-4">

          {/* Teacher card */}
          <div className="book-sidebar-card">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-display font-extrabold text-sm flex-shrink-0",
                isIslamic ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary")}>
                {teacherName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-sm truncate">{teacherName}</div>
                <div className="text-[11px] text-muted-foreground truncate">{teacher.subjects.slice(0, 2).join(" · ")}</div>
              </div>
            </div>
            <div className="space-y-1.5 text-sm border-t border-border pt-3">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Hourly rate</span><span>${teacher.hourly_rate_usd}/hr</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Mode</span><span className="capitalize">{teacher.mode.replace("_", " ")}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration</span><span>{duration} min</span></div>
              <div className="flex justify-between font-bold border-t border-border pt-2">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Availability overview */}
          <div className="book-sidebar-card">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-sm">Availability</span>
            </div>
            <div className="space-y-1 text-xs max-h-64 overflow-y-auto pr-0.5">
              {availability.length === 0
                ? <p className="text-muted-foreground">No availability published yet.</p>
                : (
                  <>
                    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day, idx) => {
                      const rows = [...new Map(
                        availability.filter((s) => !s.available_date && s.day_of_week === idx)
                          .map((r) => [`${r.start_time}-${r.end_time}`, r])
                      ).values()];
                      return (
                        <div key={day} className="flex justify-between gap-2 py-1 border-b border-border/40 last:border-0">
                          <span className="font-semibold text-foreground w-8 flex-shrink-0">{day}</span>
                          <span className="text-muted-foreground text-right leading-relaxed">
                            {rows.length ? rows.map((r) => `${r.start_time}–${r.end_time}`).join(", ") : "—"}
                          </span>
                        </div>
                      );
                    })}
                    {availability.some((s) => s.available_date) && (
                      <div className="pt-2 mt-1 border-t border-border space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Specific dates</p>
                        {availability.filter((s) => s.available_date)
                          .sort((a, b) => (a.available_date ?? "").localeCompare(b.available_date ?? ""))
                          .map((s) => (
                            <div key={`${s.available_date}-${s.start_time}`} className="flex justify-between gap-2 py-1">
                              <span className="font-semibold text-foreground">{format(new Date(`${s.available_date}T00:00:00`), "MMM d")}</span>
                              <span className="text-muted-foreground">{s.start_time}–{s.end_time}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Book;