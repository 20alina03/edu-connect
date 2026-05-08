import { Check } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Link } from "react-router-dom";

const tiers = [
  { name: "Pay per lesson", price: "Free", desc: "No subscription. Pay your teacher's hourly rate per session.",
    features: ["Browse all teachers", "Book single sessions", "Cancel up to 12h before"], cta: "Get started", primary: false },
  { name: "Family plan", price: "$9", suffix: "/mo", desc: "Best for parents booking for multiple children.",
    features: ["Up to 4 child profiles", "Shared calendar", "Priority support", "Discounted bulk packs"], cta: "Start family plan", primary: true },
  { name: "Teacher Pro", price: "$15", suffix: "/mo", desc: "For teachers who want featured placement.",
    features: ["Featured listing", "Calendar sync", "Bulk message students", "Lower platform fee"], cta: "Become a teacher", primary: false },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <AppHeader />
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-display mb-3">Simple, transparent pricing</h1>
        <p className="text-muted-foreground">No hidden fees. Cancel anytime.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <div key={t.name} className={`rounded-2xl p-6 border ${t.primary ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
            <h3 className="font-semibold text-lg">{t.name}</h3>
            <div className="mt-4 mb-2">
              <span className="text-4xl font-bold">{t.price}</span>
              {t.suffix && <span className="text-muted-foreground">{t.suffix}</span>}
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t.desc}</p>
            <ul className="space-y-2 mb-6">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/signup" className={`block text-center py-2.5 rounded-full font-medium ${
              t.primary ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
            }`}>{t.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);
export default Pricing;
