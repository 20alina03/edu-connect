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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-2 sm:mb-3">How it works</h1>
      <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-10 sm:mb-12 lg:mb-14 leading-relaxed">From "I need a tutor" to your first lesson — in minutes.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {steps.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 hover:shadow-md transition-all">
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 sm:mb-4">
              <s.Icon className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div className="text-[10px] sm:text-xs text-primary font-semibold mb-1.5 sm:mb-2">Step {i + 1}</div>
            <h3 className="font-semibold text-base sm:text-lg lg:text-xl mb-1.5 sm:mb-2">{s.title}</h3>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
export default HowItWorks;
