import { AppHeader } from "@/components/AppHeader";
import { Search, CalendarCheck, Video, Star } from "lucide-react";

const steps = [
  { Icon: Search, title: "Browse teachers", body: "Filter by subject, gender, mode, and price. View bios, ratings, and reviews." },
  { Icon: CalendarCheck, title: "Book a session", body: "Pick a slot from the teacher's live calendar — pending until confirmed." },
  { Icon: Video, title: "Take the lesson", body: "Online via video, or at-home if your teacher offers home visits." },
  { Icon: Star, title: "Review & rebook", body: "Leave a rating after every session and rebook your favourite teachers." },
];

const HowItWorks = () => (
  <div className="min-h-screen bg-background">
    <AppHeader />
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold font-display mb-2">How it works</h1>
      <p className="text-muted-foreground mb-12">From "I need a tutor" to your first lesson — in minutes.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <s.Icon className="w-6 h-6" />
            </div>
            <div className="text-xs text-primary font-semibold mb-1">Step {i + 1}</div>
            <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
export default HowItWorks;
