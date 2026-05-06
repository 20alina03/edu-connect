import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { findTeacher } from "@/data/teachers";
import { PortalNav } from "@/components/PortalNav/PortalNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import "./book.css";

const SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const DURATIONS = [30, 45, 60, 90];

const Book = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const teacher = id ? findTeacher(id) : undefined;
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);

  if (!teacher) return <div className="p-12">Teacher not found.</div>;
  const isIslamic = teacher.portal === "islamic";
  const total = (teacher.rate * duration) / 60;

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const submit = () => {
    toast.success("Booking confirmed!", { description: `Session with ${teacher.name} is booked.` });
    setTimeout(() => navigate("/dashboard/student"), 1200);
  };

  return (
    <div className="book-page">
      <PortalNav portal={teacher.portal}/>

      <div className="book-body">
        <main>
          {/* STEPS */}
          <div className="book-steps">
            {["Schedule", "Details", "Confirm"].map((label, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={label} className="book-step">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn("book-step-node",
                      done ? (isIslamic ? "bg-primary text-white" : "bg-secondary text-white") :
                      active ? (isIslamic ? "bg-forest text-white" : "bg-navy text-white") :
                      "bg-muted text-muted-foreground") }>
                      {done ? <Check className="w-4 h-4"/> : num}
                    </div>
                    <span className="book-step-label">{label}</span>
                  </div>
                  {i < 2 && <div className={cn("h-0.5 flex-1 -mt-5", done ? (isIslamic ? "bg-primary" : "bg-secondary") : "bg-border")}/>}
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <div className="book-card space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl mb-1">Pick a date</h2>
                <p className="text-sm text-muted-foreground mb-4">Next 14 days</p>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((d, i) => {
                    const sel = date === i;
                    const weekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <button key={i} disabled={weekend} onClick={() => setDate(i)}
                        className={cn("p-2 rounded-lg text-center transition border",
                          weekend ? "bg-muted text-muted-foreground cursor-not-allowed border-transparent" :
                          sel ? (isIslamic ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary") :
                          "bg-card border-border hover:border-foreground/30") }>
                        <div className="text-[9px] font-bold uppercase opacity-70">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                        <div className="font-display font-bold text-lg">{d.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="font-display font-bold text-xl mb-1">Pick a time</h2>
                <p className="text-sm text-muted-foreground mb-4">UTC · auto-converts to your timezone</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {SLOTS.map(s => (
                    <button key={s} onClick={() => setTime(s)}
                      className={cn("py-2.5 rounded-lg text-sm font-semibold border transition",
                        time === s ? (isIslamic ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary") :
                        "border-border hover:border-foreground/30")}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-display font-bold text-xl mb-1">Duration</h2>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={cn("py-2.5 rounded-lg text-sm font-semibold border transition",
                        duration === d ? (isIslamic ? "bg-primary text-white border-primary" : "bg-secondary text-white border-secondary") :
                        "border-border hover:border-foreground/30")}>{d} min</button>
                  ))}
                </div>
              </div>

              <Button disabled={date === null || !time}
                onClick={() => setStep(2)}
                className={cn("w-full rounded-xl font-bold", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90") }>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="book-card space-y-4">
              <h2 className="font-display font-bold text-xl mb-2">Your details</h2>
              <div>
                <Label className="text-xs">Full name</Label>
                <Input placeholder="Aisha Khan" className="mt-1"/>
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" placeholder="you@email.com" className="mt-1"/>
              </div>
              <div>
                <Label className="text-xs">Notes for the teacher (optional)</Label>
                <textarea className="w-full mt-1 border border-border rounded-lg px-3 py-2 text-sm min-h-24 bg-card" placeholder="Tell the teacher what you'd like to focus on..."/>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(1)}>Back</Button>
                <Button className={cn("flex-1 rounded-xl font-bold", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90") }
                  onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="book-card space-y-4">
              <h2 className="font-display font-bold text-xl mb-2">Confirm booking</h2>
              <div className="rounded-xl bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Teacher</span><span className="font-semibold">{teacher.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-semibold">{date !== null ? days[date].toDateString() : "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-semibold">{time}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{duration} minutes</span></div>
              </div>
              <div className="bg-accent-light text-accent-dark text-xs p-3 rounded-xl">
                💳 Payment integration is disabled in this demo — booking will be saved without charge.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(2)}>Back</Button>
                <Button className={cn("flex-1 rounded-xl font-bold", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90") }
                  onClick={submit}>Confirm booking</Button>
              </div>
            </div>
          )}
        </main>

        <aside className="lg:sticky lg:top-4 h-fit space-y-3">
          <div className="book-sidebar-card">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-display font-extrabold", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary")}>{teacher.initials}</div>
              <div>
                <div className="font-display font-bold text-sm">{teacher.name}</div>
                <div className="text-[11px] text-muted-foreground">{teacher.tagline.split("·")[0]}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span>${teacher.rate}/hr</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{duration} min</span></div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Book;
