import { Link } from "react-router-dom";
import { Star, MapPin, Wifi, Home } from "lucide-react";
import { Teacher } from "@/data/teachers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./teachercard.css";

export const TeacherCard = ({ teacher }: { teacher: Teacher }) => {
  const isIslamic = teacher.portal === "islamic";
  return (
    <div className={cn("teacher-card", isIslamic ? "teacher-card-islamic" : "teacher-card-school") }>
      <div className={cn("teacher-card-avatar", isIslamic ? "teacher-card-avatar-islamic" : "teacher-card-avatar-school") }>{teacher.initials}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/teachers/${teacher.id}`} className="teacher-card-title">
            {teacher.name}
          </Link>
          {teacher.featured && (
            <span className="teacher-card-featured">Featured</span>
          )}
        </div>
        <p className="teacher-card-tagline">{teacher.tagline}</p>
        <div className="teacher-card-pills">
          {teacher.subjects.slice(0,3).map(s => (
            <span key={s} className={cn("teacher-card-pill", isIslamic ? "bg-primary-light text-primary-dark" : "bg-secondary-bg text-secondary") }>{s}</span>
          ))}
          {teacher.city && (
            <span className="teacher-card-meta">
              <MapPin className="w-2.5 h-2.5" />{teacher.city}
            </span>
          )}
          <span className="teacher-card-meta">
            {teacher.mode === "home_visit" ? <Home className="w-2.5 h-2.5"/> : <Wifi className="w-2.5 h-2.5"/>}
            {teacher.mode === "both" ? "Online + Home" : teacher.mode === "online" ? "Online" : "Home Visit"}
          </span>
        </div>
      </div>

      <div className="teacher-card-side">
        <div>
          <div className="teacher-card-price">${teacher.rate}<span className="text-[10px] text-muted-foreground font-normal">/hr</span></div>
          <div className="teacher-card-rating">
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
