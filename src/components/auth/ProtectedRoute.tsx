import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-in");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user && allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = roles.some((r) => allowedRoles.includes(r.role));
      if (!hasAllowedRole && roles.length > 0) {
        // Redirect to the correct dashboard based on actual role
        const primaryRole = roles[0]?.role;
        switch (primaryRole) {
          case "super_admin":
            navigate("/admin");
            break;
          case "dealership_admin":
          case "dealership_employee":
            navigate("/dealership");
            break;
          case "provider":
            navigate("/provider");
            break;
          default:
            navigate("/dashboard");
        }
      }
    }
  }, [loading, user, roles, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
