import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, MessageSquare, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const AppHeader = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const dashHref = role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold font-display">
          Edu<span className="text-primary">Connect</span>
        </Link>

        {role !== "teacher" && (
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/islamic" className="hover:text-primary transition">Islamic</Link>
            <Link to="/school" className="hover:text-primary transition">School</Link>
            <Link to="/how-it-works" className="hover:text-primary transition">How it works</Link>
            <Link to="/pricing" className="hover:text-primary transition">Pricing</Link>
          </nav>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            {role === "student" && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/reports")} className="text-xs sm:text-sm">
                Reports
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate("/notifications")}>
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
              <MessageSquare className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center">
                  {(user.email?.[0] || "U").toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 text-xs">
                  <div className="font-medium truncate">{user.email}</div>
                  <div className="text-muted-foreground capitalize">{role}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(dashHref)}>
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserIcon className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/bookings")}>My bookings</DropdownMenuItem>
                {role === "teacher" && (
                  <DropdownMenuItem onClick={() => navigate("/teacher/onboarding")}>
                    Edit teaching profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
            <Button onClick={() => navigate("/signup")} className="bg-primary hover:bg-primary/90">Sign up</Button>
          </div>
        )}
      </div>
    </header>
  );
};
