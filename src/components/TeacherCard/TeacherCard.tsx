import { Link } from "react-router-dom";
import { Star, MapPin, Wifi, Home, Clock } from "lucide-react";
import { Teacher } from "@/data/teachers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./teachercard.css";

export const TeacherCard = ({ teacher }: { teacher: Teacher }) => {
  const isIslamic = teacher.portal === "islamic";

  const pillCls = isIslamic ? "tc-pill-islamic" : "tc-pill-school";
  const btnCls  = isIslamic ? "tc-btn-islamic"  : "tc-btn-school";

  const modeLabel =
    teacher.mode === "both"       ? "Online + Home" :
    teacher.mode === "online"     ? "Online"        : "Home Visit";

  const ModeIcon = teacher.mode === "home_visit" ? Home : Wifi;

  return (
    <div
      className={cn(
        // base card
        "bg-card border border-border rounded-2xl p-4 sm:p-5",
        "flex flex-col gap-3 w-full",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        isIslamic ? "tc-card-islamic" : "tc-card-school"
      )}
    >
      {/* ══ TOP ROW: avatar │ name+tagline │ price ══ */}
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div
          className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0",
            "flex items-center justify-center",
            "font-extrabold text-base sm:text-lg select-none",
            isIslamic ? "tc-avatar-islamic" : "tc-avatar-school"
          )}
        >
          {teacher.initials}
        </div>

        {/* Name + tagline — takes all remaining space */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              to={`/teachers/${teacher.id}`}
              className="font-bold text-foreground text-base sm:text-lg leading-tight hover:underline"
            >
              {teacher.name}
            </Link>
            {teacher.featured && (
              <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent-light text-accent-dark whitespace-nowrap">
                ⭐ Featured
              </span>
            )}
          </div>
          {teacher.tagline && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
              {teacher.tagline}
            </p>
          )}
        </div>

        {/* Price + rating — pinned top-right, never shrinks */}
        <div className="flex-shrink-0 text-right pt-0.5">
          <div className="font-extrabold text-xl sm:text-2xl text-foreground leading-none">
            ${teacher.rate}
            <span className="text-[10px] font-normal text-muted-foreground ml-0.5">/hr</span>
          </div>
          <div className="flex items-center justify-end gap-1 mt-1 text-[11px]">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="font-semibold text-foreground">{teacher.rating}</span>
            <span className="text-muted-foreground">({teacher.reviews})</span>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM ROW: pills │ Book Now ══ */}
      <div className="flex items-end justify-between gap-3">

        {/* Pills — wrap freely */}
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {teacher.experience && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {teacher.experience} yrs
            </span>
          )}

          {teacher.subjects.slice(0, 3).map((s) => (
            <span
              key={s}
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                pillCls
              )}
            >
              {s}
            </span>
          ))}

          {teacher.subjects.length > 3 && (
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", pillCls)}>
              +{teacher.subjects.length - 3}
            </span>
          )}

          {teacher.city && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />
              {teacher.city}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            <ModeIcon className="w-2.5 h-2.5" />
            {modeLabel}
          </span>
        </div>

        {/* Book Now — anchored bottom-right */}
        <Link to={`/book/${teacher.id}`} className="flex-shrink-0">
          <Button
            size="sm"
            className={cn(
              "rounded-full text-xs font-semibold px-4 py-1.5 text-white whitespace-nowrap",
              btnCls
            )}
          >
            Book Now
          </Button>
        </Link>
      </div>
    </div>
  );
};