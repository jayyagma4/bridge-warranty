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
import DealershipOverview from "./pages/dealership/DealershipOverview";
import DealershipContracts from "./pages/dealership/DealershipContracts";
import DealershipRemittances from "./pages/dealership/DealershipRemittances";
import DealershipReporting from "./pages/dealership/DealershipReporting";
import Configuration from "./pages/dealership/settings/Configuration";
import TeamManagement from "./pages/dealership/settings/TeamManagement";
import DealerProfile from "./pages/dealership/settings/Profile";
import BrochureHome from "./pages/brochure/BrochureHome";
import PlanDetail from "./pages/brochure/PlanDetail";
import ComparePlans from "./pages/brochure/ComparePlans";
import TireRimPage from "./pages/brochure/TireRimPage";
import PurchaseWizard from "./pages/purchase/PurchaseWizard";
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
            <Route path="/dealership" element={<ProtectedRoute allowedRoles={["dealership_admin", "dealership_employee"]}><DealershipOverview /></ProtectedRoute>} />
            <Route path="/dealership/find-products" element={<ProtectedRoute allowedRoles={["dealership_admin", "dealership_employee"]}><FindProducts /></ProtectedRoute>} />
            <Route path="/dealership/product-coverage/:id" element={<ProtectedRoute allowedRoles={["dealership_admin", "dealership_employee"]}><ProductCoverage /></ProtectedRoute>} />
            <Route path="/dealership/contracts" element={<ProtectedRoute allowedRoles={["dealership_admin", "dealership_employee"]}><DealershipContracts /></ProtectedRoute>} />
            <Route path="/dealership/remittances" element={<ProtectedRoute allowedRoles={["dealership_admin", "dealership_employee"]}><DealershipRemittances /></ProtectedRoute>} />
            <Route path="/dealership/reporting" element={<ProtectedRoute allowedRoles={["dealership_admin", "dealership_employee"]}><DealershipReporting /></ProtectedRoute>} />
            <Route path="/dealership/settings/configuration" element={<ProtectedRoute allowedRoles={["dealership_admin", "dealership_employee"]}><Configuration /></ProtectedRoute>} />
            <Route path="/dealership/settings/team" element={<ProtectedRoute allowedRoles={["dealership_admin", "dealership_employee"]}><TeamManagement /></ProtectedRoute>} />
            <Route path="/dealership/settings/profile" element={<ProtectedRoute allowedRoles={["dealership_admin", "dealership_employee"]}><DealerProfile /></ProtectedRoute>} />

            {/* Brochure */}
            <Route path="/brochure" element={<BrochureHome />} />
            <Route path="/brochure/compare" element={<ComparePlans />} />
            <Route path="/brochure/tire-rim" element={<TireRimPage />} />
            <Route path="/brochure/:planSlug" element={<PlanDetail />} />
            <Route path="/purchase" element={<PurchaseWizard />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
