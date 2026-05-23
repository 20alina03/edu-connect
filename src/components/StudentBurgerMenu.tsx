import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./StudentBurgerMenu.css";
import { studentNavSections } from "./studentNavigation";

export const StudentBurgerMenu = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="burger-trigger"
        aria-label="Open menu"
        id="student-burger-menu-trigger"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="burger-sheet p-0 w-[340px] sm:max-w-[360px]">
          <SheetHeader className="burger-header">
            <div className="flex items-center gap-3">
              <div className="burger-logo-ring">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold">Student Menu</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Navigate your learning hub
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <nav className="burger-nav" id="student-burger-nav">
            {studentNavSections.map((section) => (
              <div key={section.title} className="burger-nav-section">
                <div className="burger-nav-section-label">{section.title}</div>
                <div className="burger-nav-section-card">
                  {section.items.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "burger-nav-item",
                          active && "burger-nav-item-active"
                        )}
                        id={`burger-menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className={cn("burger-nav-icon", active && "burger-nav-icon-active")}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="burger-nav-text">
                          <span className="burger-nav-label">{item.label}</span>
                          <span className="burger-nav-desc">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.badge && <span className="burger-nav-badge">{item.badge}</span>}
                          <ChevronRight className={cn("w-4 h-4 text-muted-foreground/60", active && "text-primary")} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="burger-footer">
            <Link to="/school/teachers" onClick={() => setOpen(false)} className="burger-footer-card">
              <Sparkles className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs font-semibold">Discover teachers</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Explore Islamic and school tutoring options.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-3">
                Browse now <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
