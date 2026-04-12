import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const BrochureHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/brochure", label: "All Plans" },
    { to: "/brochure/compare", label: "Compare" },
    { to: "/brochure/tire-rim", label: "Tire & Rim" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0f1b3d]/95 backdrop-blur-md shadow-lg" : "bg-[#0f1b3d]"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-[#0f1b3d] font-display font-bold text-sm">BW</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base text-white leading-tight">Bridge Warranty</span>
            <span className="text-[10px] text-white/50 leading-tight">Coverage Brochure</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/sign-in"
            className="text-sm text-white/60 hover:text-white transition-colors font-medium"
          >
            Dealer Login
          </Link>
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0f1b3d] border-t border-white/10 px-4 pb-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2 rounded-md text-sm ${
                location.pathname === link.to
                  ? "bg-white/15 text-white"
                  : "text-white/60"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default BrochureHeader;
