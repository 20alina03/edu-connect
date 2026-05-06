import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Portal } from "@/data/teachers";
import { cn } from "@/lib/utils";
import "./portalnav.css";

interface Props { portal: Portal }

export const PortalNav = ({ portal }: Props) => {
  const isIslamic = portal === "islamic";
  const loc = useLocation();
  const links = isIslamic
    ? [["Quran", "/islamic/teachers?s=Quran"], ["Tajweed", "/islamic/teachers?s=Tajweed"], ["Arabic", "/islamic/teachers?s=Arabic"], ["Islamic Studies", "/islamic/teachers?s=Islamic+Studies"]]
    : [["Maths", "/school/teachers?s=Maths"], ["Sciences", "/school/teachers?s=Physics"], ["English", "/school/teachers?s=English"], ["Home Tuition", "/school/teachers?mode=home_visit"]];

  return (
    <nav className={cn("portal-nav", isIslamic ? "bg-forest" : "bg-navy") }>
      <Link to={isIslamic ? "/islamic" : "/school"} className="portal-nav-brand">
        <img src="/logo.svg" alt="EduConnect" className="h-10 w-auto object-contain" />
        Edu<span className={isIslamic ? "text-primary" : "text-blue-400"}>Connect</span>
        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full",
          isIslamic ? "bg-primary/15 text-primary-glow" : "bg-blue-500/15 text-blue-300") }>
          {isIslamic ? "Quran" : "School"}
        </span>
      </Link>

      <ul className="portal-nav-links">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="portal-nav-link hover:text-white">{label}</Link>
          </li>
        ))}
      </ul>

      <div className="portal-nav-actions">
        <div className="portal-nav-switcher">
          <Link to="/islamic" className={cn("portal-nav-switcher-link", isIslamic ? "bg-primary text-white" : "hover:text-white")}>Islamic</Link>
          <Link to="/school" className={cn("portal-nav-switcher-link", !isIslamic ? "bg-secondary text-white" : "hover:text-white")}>School</Link>
        </div>
        <Link to="/dashboard/student"><Button variant="ghost" size="sm" className="rounded-full text-white hover:text-white hover:bg-white/10">Sign In</Button></Link>
        <Link to="/dashboard/teacher">
          <Button size="sm" className={cn("rounded-full", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90") }>
            Join Free
          </Button>
        </Link>
      </div>
    </nav>
  );
};
