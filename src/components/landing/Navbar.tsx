import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <span className="text-primary-foreground font-display font-bold text-sm">BW</span>
          </div>
          <span
            className={`font-display font-bold text-lg transition-colors ${
              scrolled ? "text-foreground" : "text-white"
            }`}
          >
            Bridge Warranty
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              scrolled
                ? "text-muted-foreground hover:text-foreground"
                : "text-white/70 hover:text-white"
            }`}
          >
            Home
          </Link>
          {user ? (
            <Button onClick={() => navigate("/dashboard")} size="sm">
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/sign-in")}
                className={
                  scrolled ? "" : "text-white/80 hover:text-white hover:bg-white/10"
                }
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/register")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md shadow-accent/20"
              >
                Register Your Dealership
              </Button>
            </>
          )}
        </div>

        <button
          className={`md:hidden ${scrolled ? "text-foreground" : "text-white"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-3">
          <Link
            to="/"
            className="block text-sm font-medium text-muted-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          {user ? (
            <Button
              className="w-full"
              size="sm"
              onClick={() => {
                navigate("/dashboard");
                setMobileOpen(false);
              }}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-full"
                size="sm"
                onClick={() => {
                  navigate("/sign-in");
                  setMobileOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                size="sm"
                onClick={() => {
                  navigate("/register");
                  setMobileOpen(false);
                }}
              >
                Register Your Dealership
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
