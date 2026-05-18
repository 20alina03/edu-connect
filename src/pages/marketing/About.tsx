import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";

const About = () => (
  <div className="min-h-screen bg-background">
    <AppHeader />
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold font-display mb-6">About Ilmrise</h1>
      <p className="text-lg text-muted-foreground mb-4">
        Ilmrise bridges learners with the right teacher — whether you're memorising the Quran with an Ijazah-certified Ustadh
        or preparing for GCSE Maths with a DBS-checked tutor.
      </p>
      <p className="text-muted-foreground mb-4">
        We launched in 2024 with one mission: make great teaching accessible, transparent, and safe.
        Every teacher is verified. Every booking is protected. Every lesson moves a student forward.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        {[
          { n: "12,000+", l: "Active learners" },
          { n: "850+", l: "Verified teachers" },
          { n: "4.9★", l: "Average rating" },
        ].map((s) => (
          <div key={s.l} className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary">{s.n}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link to="/signup" className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90">
          Join Ilmrise
        </Link>
      </div>
    </div>
  </div>
);
export default About;
