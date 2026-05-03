import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Portal } from "@/data/teachers";
import { cn } from "@/lib/utils";

interface Props { portal: Portal }

export const PortalNav = ({ portal }: Props) => {
  const isIslamic = portal === "islamic";
  const loc = useLocation();
  const links = isIslamic
    ? [["Quran", "/islamic/teachers?s=Quran"], ["Tajweed", "/islamic/teachers?s=Tajweed"], ["Arabic", "/islamic/teachers?s=Arabic"], ["Islamic Studies", "/islamic/teachers?s=Islamic+Studies"]]
    : [["Maths", "/school/teachers?s=Maths"], ["Sciences", "/school/teachers?s=Physics"], ["English", "/school/teachers?s=English"], ["Home Tuition", "/school/teachers?mode=home_visit"]];

  return (
    <nav className={cn("h-14 px-6 flex items-center justify-between gap-3", isIslamic ? "bg-forest" : "bg-navy")}>
      <Link to={isIslamic ? "/islamic" : "/school"} className="font-display font-extrabold text-base text-white tracking-tight flex items-center gap-2">
        Edu<span className={isIslamic ? "text-primary" : "text-blue-400"}>Connect</span>
        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full",
          isIslamic ? "bg-primary/15 text-primary-glow" : "bg-blue-500/15 text-blue-300")}>
          {isIslamic ? "Quran" : "School"}
        </span>
      </Link>

      <ul className="hidden md:flex gap-5 list-none">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="text-xs font-medium text-white/50 hover:text-white transition">{label}</Link>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 items-center">
        <div className="hidden sm:flex border border-white/15 rounded-full overflow-hidden text-[10px] font-bold">
          <Link to="/islamic" className={cn("px-3 py-1.5", isIslamic ? "bg-primary text-white" : "text-white/50 hover:text-white")}>Islamic</Link>
          <Link to="/school" className={cn("px-3 py-1.5", !isIslamic ? "bg-secondary text-white" : "text-white/50 hover:text-white")}>School</Link>
        </div>
        <Link to="/dashboard/student"><Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10 rounded-full">Sign In</Button></Link>
        <Link to="/dashboard/teacher">
          <Button size="sm" className={cn("rounded-full", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90")}>
            Join Free
          </Button>
        </Link>
      </div>
    </nav>
  );
};
