import { Link } from "react-router-dom";
import { Star, MapPin, Wifi, Home } from "lucide-react";
import { Teacher } from "@/data/teachers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const TeacherCard = ({ teacher }: { teacher: Teacher }) => {
  const isIslamic = teacher.portal === "islamic";
  return (
    <div className={cn(
      "group bg-card border border-border rounded-2xl p-5 flex gap-4 transition-all hover:-translate-y-0.5 hover:shadow-card",
      isIslamic ? "hover:border-primary/40" : "hover:border-secondary/40"
    )}>
      <div className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center font-display font-extrabold text-base flex-shrink-0",
        isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary"
      )}>{teacher.initials}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/teachers/${teacher.id}`} className="font-display font-bold text-foreground hover:underline">
            {teacher.name}
          </Link>
          {teacher.featured && (
            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-accent-light text-accent-dark">Featured</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">{teacher.tagline}</p>
        <div className="flex flex-wrap gap-1.5">
          {teacher.subjects.slice(0,3).map(s => (
            <span key={s} className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary"
            )}>{s}</span>
          ))}
          {teacher.city && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />{teacher.city}
            </span>
          )}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1">
            {teacher.mode === "home_visit" ? <Home className="w-2.5 h-2.5"/> : <Wifi className="w-2.5 h-2.5"/>}
            {teacher.mode === "both" ? "Online + Home" : teacher.mode === "online" ? "Online" : "Home Visit"}
          </span>
        </div>
      </div>

      <div className="text-right flex flex-col items-end justify-between flex-shrink-0">
        <div>
          <div className="font-display font-extrabold text-lg text-foreground">${teacher.rate}<span className="text-[10px] text-muted-foreground font-normal">/hr</span></div>
          <div className="flex items-center gap-1 justify-end text-accent text-[11px]">
            <Star className="w-3 h-3 fill-accent"/> <span className="font-semibold">{teacher.rating}</span>
            <span className="text-muted-foreground">({teacher.reviews})</span>
          </div>
        </div>
        <Link to={`/book/${teacher.id}`}>
          <Button size="sm" className={cn("rounded-full mt-2", isIslamic ? "bg-primary hover:bg-primary-dark" : "bg-secondary hover:bg-secondary/90")}>Book Now</Button>
        </Link>
      </div>
    </div>
  );
};
