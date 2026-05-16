import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Bell, MessageSquare, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import "./mobilenav.css";

interface MobileNavProps {
  links: Array<[label: string, href: string]>;
  portal: "islamic" | "school";
  onPortalSwitch?: (portal: "islamic" | "school") => void;
}

export const MobileNav = ({ links, portal, onPortalSwitch }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const isIslamic = portal === "islamic";
  const dashHref = role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";

  const handleNavClick = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="mobile-nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && <div className="mobile-nav-backdrop" onClick={() => setIsOpen(false)} />}

      <div className={cn("mobile-nav-menu", isIslamic ? "bg-forest" : "bg-navy", isOpen && "active")}>
        <div className="mobile-nav-content">
          {/* Logo */}
          <div className="mobile-nav-header">
            <Link
              to={isIslamic ? "/islamic" : "/school"}
              className="flex items-center gap-2 text-white font-bold"
              onClick={() => setIsOpen(false)}
            >
              <img src="/logo.svg" alt="EduConnect" className="h-8 w-auto" />
              Edu<span className={isIslamic ? "text-primary" : "text-blue-400"}>Connect</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="mobile-nav-links">
            {links.map(([label, href]) => (
              <button
                key={label}
                onClick={() => handleNavClick(href)}
                className="mobile-nav-link"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Portal Switcher */}
          <div className="mobile-nav-switcher">
            <button
              onClick={() => {
                onPortalSwitch?.("islamic");
                setIsOpen(false);
              }}
              className={cn(
                "mobile-nav-switcher-btn",
                isIslamic && "active"
              )}
            >
              Islamic
            </button>
            <button
              onClick={() => {
                onPortalSwitch?.("school");
                setIsOpen(false);
              }}
              className={cn(
                "mobile-nav-switcher-btn",
                !isIslamic && "active"
              )}
            >
              School
            </button>
          </div>

          {/* User Menu */}
          {user && (
            <div className="mobile-nav-user">
              <button
                onClick={() => handleNavClick("/notifications")}
                className="mobile-nav-user-btn"
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => handleNavClick("/messages")}
                className="mobile-nav-user-btn"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </button>
              <button
                onClick={() => handleNavClick(dashHref)}
                className="mobile-nav-user-btn"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleNavClick("/profile")}
                className="mobile-nav-user-btn"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <div className="mobile-nav-divider" />
              <div className="mobile-nav-user-info">
                <div className="text-xs font-medium truncate">{user.email}</div>
                <div className="text-xs text-white/70 capitalize">{role}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="mobile-nav-user-btn text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign out</span>
              </button>
            </div>
          )}

          {/* Auth Links */}
          {!user && (
            <div className="mobile-nav-auth">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-white border-white hover:bg-white/10"
                onClick={() => handleNavClick("/login")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className={cn(
                  "w-full",
                  isIslamic
                    ? "bg-primary hover:bg-primary-dark"
                    : "bg-secondary hover:bg-secondary/90"
                )}
                onClick={() => handleNavClick("/signup")}
              >
                Join Free
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
