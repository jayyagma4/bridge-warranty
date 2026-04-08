import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import JoinDealership from "./pages/JoinDealership";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminDealerships from "./pages/admin/AdminDealerships";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContracts from "./pages/admin/AdminContracts";
import FindProducts from "./pages/dealership/FindProducts";
import ProductCoverage from "./pages/dealership/ProductCoverage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardRedirect = () => {
  const { roles, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  const role = roles[0]?.role;
  switch (role) {
    case "super_admin": return <Navigate to="/admin" replace />;
    case "dealership_admin":
    case "dealership_employee": return <Navigate to="/dealership" replace />;
    case "provider": return <Navigate to="/provider" replace />;
    default: return <Navigate to="/" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/join-dealership" element={<JoinDealership />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

            {/* Super Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminOverview /></ProtectedRoute>} />
            <Route path="/admin/dealerships" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminDealerships /></ProtectedRoute>} />
            <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminProviders /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/contracts" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminContracts /></ProtectedRoute>} />

            {/* Dealership */}
            <Route path="/dealership/find-products" element={<FindProducts />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
