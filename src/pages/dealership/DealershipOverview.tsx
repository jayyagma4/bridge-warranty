import { useEffect, useState } from "react";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDealership } from "@/hooks/useDealership";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  FileText, Package, Users, DollarSign, TrendingUp, Plus, Search, BarChart3,
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

const demoChartData = [
  { month: "Jan '25", contracts: 8 },
  { month: "Feb '25", contracts: 12 },
  { month: "Mar '25", contracts: 15 },
  { month: "Apr '25", contracts: 10 },
  { month: "May '25", contracts: 18 },
  { month: "Jun '25", contracts: 22 },
];

const demoTopProducts = [
  { name: "Gold VSC — Vehicle Service Contract", count: 22 },
  { name: "Silver VSC — Vehicle Service Contract", count: 18 },
  { name: "Tire & Rim Protection — Standard", count: 14 },
  { name: "Platinum VSC — Vehicle Service Contract", count: 9 },
  { name: "Bronze VSC — Vehicle Service Contract", count: 6 },
];

const demoStats = {
  total: 85, active: 42, draft: 12, submitted: 8,
  revenue: 127500, pendingRemittances: 5, avgPerContract: 1500,
};

const DealershipOverview = () => {
  const { dealershipId, loading: dLoading } = useDealership();
  const { user } = useAuth();
  const [stats, setStats] = useState(demoStats);
  const [chartData, setChartData] = useState(demoChartData);
  const [topProducts, setTopProducts] = useState(demoTopProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dealershipId) return;

    // If no real user, use demo data
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, status, contract_price, dealer_cost, created_at, product_id")
        .eq("dealership_id", dealershipId);

      if (contracts && contracts.length > 0) {
        const total = contracts.length;
        const active = contracts.filter((c) => c.status === "active").length;
        const draft = contracts.filter((c) => c.status === "draft").length;
        const submitted = contracts.filter((c) => c.status === "submitted").length;
        const revenue = contracts.reduce((s, c) => s + (Number(c.contract_price) || 0), 0);
        const avgPerContract = total > 0 ? revenue / total : 0;

        setStats({ total, active, draft, submitted, revenue, pendingRemittances: 0, avgPerContract });

        const months: Record<string, number> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
          months[key] = 0;
        }
        contracts.forEach((c) => {
          const d = new Date(c.created_at);
          const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
          if (key in months) months[key]++;
        });
        setChartData(Object.entries(months).map(([month, contracts]) => ({ month, contracts })));

        const prodCount: Record<string, number> = {};
        contracts.forEach((c) => { prodCount[c.product_id] = (prodCount[c.product_id] || 0) + 1; });
        const { data: products } = await supabase.from("products").select("id, name").in("id", Object.keys(prodCount));
        const tp = (products || []).map((p) => ({ name: p.name, count: prodCount[p.id] || 0 })).sort((a, b) => b.count - a.count).slice(0, 5);
        if (tp.length > 0) setTopProducts(tp);
      }

      const { data: rems } = await supabase.from("remittances").select("id, status, contract_id").eq("status", "pending");
      setStats((prev) => ({ ...prev, pendingRemittances: rems?.length || prev.pendingRemittances }));
      setLoading(false);
    };
    fetchData();
  }, [dealershipId, user]);

  if (dLoading || loading) {
    return (
      <DashboardLayout navItems={dealershipNavItems} title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: "Total Contracts", value: stats.total, icon: FileText, color: "text-primary" },
    { label: "Active", value: stats.active, icon: TrendingUp, color: "text-green-500" },
    { label: "Draft", value: stats.draft, icon: FileText, color: "text-muted-foreground" },
    { label: "Submitted", value: stats.submitted, icon: DollarSign, color: "text-amber-500" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Pending Remittances", value: stats.pendingRemittances, icon: DollarSign, color: "text-orange-500" },
    { label: "Avg / Contract", value: `$${stats.avgPerContract.toFixed(0)}`, icon: BarChart3, color: "text-primary" },
  ];

  const quickActions = [
    { label: "New Contract", href: "/purchase", icon: Plus },
    { label: "Find Products", href: "/dealership/find-products", icon: Search },
    { label: "View Contracts", href: "/dealership/contracts", icon: FileText },
    { label: "Team", href: "/dealership/settings/team", icon: Users },
    { label: "Remittances", href: "/dealership/remittances", icon: DollarSign },
  ];

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Sales Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ contracts: { label: "Contracts", color: "hsl(var(--primary))" } }} className="h-[250px]">
                <BarChart data={chartData}>
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="contracts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((a) => (
                <Button key={a.label} variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to={a.href}>
                    <a.icon className="w-4 h-4" />
                    {a.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {topProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{i + 1}</Badge>
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    <Badge>{p.count} contracts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DealershipOverview;
