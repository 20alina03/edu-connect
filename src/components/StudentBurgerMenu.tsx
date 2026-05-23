import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Clock,
  CalendarDays,
  Search,
  BookOpen,
  ClipboardList,
  BarChart3,
  GraduationCap,
  ChevronRight,
  Sparkles,
  BookMarked,
  School,
} from "lucide-react";
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

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  description?: string;
  children?: { label: string; href: string; icon: React.ElementType; description?: string }[];
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "upcoming-sessions",
    label: "Upcoming Sessions",
    icon: CalendarDays,
    href: "/bookings",
    description: "View your scheduled sessions",
  },
  {
    id: "session-history",
    label: "Session History",
    icon: Clock,
    href: "/bookings",
    description: "Past completed sessions",
  },
  {
    id: "browse-teachers",
    label: "Browse Teachers",
    icon: Search,
    description: "Find the right teacher",
    children: [
      {
        label: "Islamic Teachers",
        href: "/islamic",
        icon: BookMarked,
        description: "Quran, Tajweed & Islamic Studies",
      },
      {
        label: "School Teachers",
        href: "/school",
        icon: School,
        description: "Math, Science, English & more",
      },
    ],
  },
  {
    id: "pending-assignments",
    label: "Pending Assignments",
    icon: ClipboardList,
    href: "/bookings",
    description: "Assignments awaiting completion",
    badge: "New",
  },
  {
    id: "assignment-history",
    label: "Assignment History",
    icon: BookOpen,
    href: "/bookings",
    description: "Completed assignments archive",
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
    description: "Progress trends & session analytics",
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: GraduationCap,
    href: "/reports",
    description: "Test scores, grades & feedback",
  },
];

export const StudentBurgerMenu = () => {
  const [open, setOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  const toggleExpand = (id: string) => {
    setExpandedItem((prev) => (prev === id ? null : id));
  };

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
        <SheetContent side="left" className="burger-sheet p-0 w-[320px] sm:max-w-[340px]">
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
            <div className="burger-nav-section-label">Navigation</div>
            {menuItems.map((item) => {
              const isActive = item.href && location.pathname === item.href;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItem === item.id;

              return (
                <div key={item.id} className="burger-nav-item-wrapper">
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleExpand(item.id);
                      } else if (item.href) {
                        handleNavigate(item.href);
                      }
                    }}
                    className={cn(
                      "burger-nav-item",
                      isActive && "burger-nav-item-active",
                      isExpanded && "burger-nav-item-expanded"
                    )}
                    id={`burger-menu-${item.id}`}
                  >
                    <div className={cn("burger-nav-icon", isActive && "burger-nav-icon-active")}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="burger-nav-text">
                      <span className="burger-nav-label">{item.label}</span>
                      {item.description && (
                        <span className="burger-nav-desc">{item.description}</span>
                      )}
                    </div>
                    {item.badge && (
                      <span className="burger-nav-badge">{item.badge}</span>
                    )}
                    {hasChildren && (
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  {hasChildren && isExpanded && (
                    <div className="burger-submenu">
                      {item.children!.map((child) => (
                        <button
                          key={child.href}
                          onClick={() => handleNavigate(child.href)}
                          className="burger-submenu-item"
                          id={`burger-menu-${item.id}-${child.label.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <div className="burger-submenu-icon">
                            <child.icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="burger-nav-text">
                            <span className="burger-nav-label text-[13px]">{child.label}</span>
                            {child.description && (
                              <span className="burger-nav-desc">{child.description}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom decoration */}
          <div className="burger-footer">
            <div className="burger-footer-card">
              <GraduationCap className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs font-semibold">Keep Learning!</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Track progress and stay ahead.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
