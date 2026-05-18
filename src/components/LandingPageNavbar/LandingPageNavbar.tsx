import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import "./landing-navbar.css";

interface LandingPageNavbarProps {
  baseRoute: string;
  portalName: string;
  accentColor?: string;
}

export const LandingPageNavbar = ({ baseRoute, portalName, accentColor = "text-primary" }: LandingPageNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: baseRoute },
    { label: "About Us", href: `${baseRoute}/about` },
    { label: "Contact Us", href: `${baseRoute}/contact` },
    { label: "Terms & Privacy", href: `${baseRoute}/terms` },
  ];

  return (
    <nav className="landing-navbar">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0">
          <img src="/logo.svg" alt="Ilmrise logo" className="h-6 sm:h-8 w-auto" />
          <span className="font-display font-bold text-sm sm:text-base hidden sm:inline">Ilmrise</span>
          <span className="font-display font-bold text-sm sm:hidden">IR</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-xs sm:text-sm hover:text-primary transition font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition group"
          >
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-primary/10 transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-14 sm:top-16 left-0 right-0 bg-white border-b border-border shadow-lg z-40 md:hidden">
              <div className="flex flex-col divide-y">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="px-4 py-3 text-sm hover:bg-primary/5 transition font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/login"
                  className="px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
