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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
      <div className="text-center mb-10 sm:mb-14 lg:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-2 sm:mb-3">Simple, transparent pricing</h1>
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground px-3">No hidden fees. Cancel anytime.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {tiers.map((t) => (
          <div key={t.name} className={`rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 border transition-all ${t.primary ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card hover:shadow-md"}`}>
            <h3 className="font-semibold text-base sm:text-lg lg:text-xl">{t.name}</h3>
            <div className="mt-3 sm:mt-4 mb-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">{t.price}</span>
              {t.suffix && <span className="text-xs sm:text-sm text-muted-foreground">{t.suffix}</span>}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">{t.desc}</p>
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" /> <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className={`block text-center py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all ${
              t.primary ? "bg-primary text-primary-foreground hover:bg-primary-dark" : "border border-border hover:bg-muted"
            }`}>{t.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);
export default Pricing;
