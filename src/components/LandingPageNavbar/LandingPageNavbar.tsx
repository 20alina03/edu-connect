import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import "./landing-navbar.css";

interface LandingPageNavbarProps {
  baseRoute: string;
  portalName: string;
  accentColor?: string;
}

export const LandingPageNavbar = ({ baseRoute, portalName, accentColor = "text-primary" }: LandingPageNavbarProps) => {
  return (
    <nav className="landing-navbar border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src="/logo.svg" alt="EduConnect" className="h-8 w-auto" />
          <span className="font-display font-bold">EduConnect</span>
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <Link to={baseRoute} className="text-sm hover:text-primary transition font-medium">
              Home
            </Link>
            <Link to={`${baseRoute}/about`} className="text-sm hover:text-primary transition">
              About Us
            </Link>
            <Link to={`${baseRoute}/contact`} className="text-sm hover:text-primary transition">
              Contact Us
            </Link>
            <Link to={`${baseRoute}/terms`} className="text-sm hover:text-primary transition">
              Terms & Privacy Policy
            </Link>
          </div>

          <Link
            to="/login"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition group`}
          >
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
