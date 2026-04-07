import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout, { adminNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, Users, FileText, DollarSign, TrendingUp } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    dealerships: 0,
    providers: 0,
    contracts: 0,
    pendingDealerships: 0,
    pendingProviders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [dealerships, providers, contracts, pendingD, pendingP] = await Promise.all([
        supabase.from("dealerships").select("id", { count: "exact", head: true }),
        supabase.from("providers").select("id", { count: "exact", head: true }),
        supabase.from("contracts").select("id", { count: "exact", head: true }),
        supabase.from("dealerships").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("providers").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        dealerships: dealerships.count || 0,
        providers: providers.count || 0,
        contracts: contracts.count || 0,
        pendingDealerships: pendingD.count || 0,
        pendingProviders: pendingP.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Dealerships", value: stats.dealerships, icon: Building2, color: "text-primary" },
    { title: "Total Providers", value: stats.providers, icon: Shield, color: "text-chart-3" },
    { title: "Total Contracts", value: stats.contracts, icon: FileText, color: "text-chart-4" },
    { title: "Pending Dealerships", value: stats.pendingDealerships, icon: TrendingUp, color: "text-accent-foreground" },
    { title: "Pending Providers", value: stats.pendingProviders, icon: Shield, color: "text-destructive" },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Admin Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "—" : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminOverview;
