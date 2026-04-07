import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-in");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const primaryRole = roles[0]?.role || "unknown";

  const getRoleDashboardTitle = () => {
    switch (primaryRole) {
      case "super_admin": return "Super Admin Dashboard";
      case "dealership_admin": return "Dealership Admin Dashboard";
      case "dealership_employee": return "Employee Dashboard";
      case "provider": return "Provider Dashboard";
      default: return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">BW</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">Bridge Warranty</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              {primaryRole.replace(/_/g, " ")}
            </span>
            <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">{getRoleDashboardTitle()}</h1>
        <p className="text-muted-foreground mb-8">Welcome back! Your dashboard is being set up.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-sm text-muted-foreground mb-1">Role</div>
            <div className="text-2xl font-display font-bold text-foreground capitalize">{primaryRole.replace(/_/g, " ")}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-sm text-muted-foreground mb-1">Email</div>
            <div className="text-lg font-medium text-foreground">{user?.email}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-sm text-muted-foreground mb-1">Status</div>
            <div className="text-lg font-medium text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-chart-3 rounded-full" /> Active
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
