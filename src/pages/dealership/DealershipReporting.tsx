import { useEffect, useState } from "react";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useDealership } from "@/hooks/useDealership";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(45, 93%, 58%)",
  "hsl(142, 76%, 36%)",
  "hsl(346, 87%, 53%)",
  "hsl(199, 89%, 48%)",
];

const demoMonthlyData = [
  { month: "Jan '25", revenue: 12500, count: 8 },
  { month: "Feb '25", revenue: 18000, count: 12 },
  { month: "Mar '25", revenue: 22500, count: 15 },
  { month: "Apr '25", revenue: 15000, count: 10 },
  { month: "May '25", revenue: 27000, count: 18 },
  { month: "Jun '25", revenue: 33000, count: 22 },
];

const demoProductData = [
  { name: "Gold VSC", value: 22 },
  { name: "Silver VSC", value: 18 },
  { name: "Tire & Rim Standard", value: 14 },
  { name: "Platinum VSC", value: 9 },
  { name: "Bronze VSC", value: 6 },
];

const DealershipReporting = () => {
  const { dealershipId, loading: dLoading } = useDealership();
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState(demoMonthlyData);
  const [productData, setProductData] = useState(demoProductData);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(128000);
  const [totalContracts, setTotalContracts] = useState(85);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dealershipId) return;

    if (!user) {
      setStatusData([
        { name: "Active", value: 42 },
        { name: "Draft", value: 12 },
        { name: "Submitted", value: 8 },
        { name: "Expired", value: 15 },
        { name: "Cancelled", value: 8 },
      ]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, status, contract_price, created_at, product_id")
        .eq("dealership_id", dealershipId);

      if (contracts && contracts.length > 0) {
        setTotalContracts(contracts.length);
        const rev = contracts.reduce((s, c) => s + (Number(c.contract_price) || 0), 0);
        setTotalRevenue(rev);

        const months: Record<string, { revenue: number; count: number }> = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
          months[key] = { revenue: 0, count: 0 };
        }
        contracts.forEach((c) => {
          const d = new Date(c.created_at);
          const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
          if (key in months) { months[key].revenue += Number(c.contract_price) || 0; months[key].count++; }
        });
        setMonthlyData(Object.entries(months).map(([month, d]) => ({ month, ...d })));

        const prodCount: Record<string, number> = {};
        contracts.forEach((c) => { prodCount[c.product_id] = (prodCount[c.product_id] || 0) + 1; });
        const { data: products } = await supabase.from("products").select("id, name").in("id", Object.keys(prodCount));
        setProductData(
          (products || []).map((p) => ({ name: p.name, value: prodCount[p.id] || 0 })).sort((a, b) => b.value - a.value).slice(0, 5)
        );

        const sc: Record<string, number> = {};
        contracts.forEach((c) => { sc[c.status] = (sc[c.status] || 0) + 1; });
        setStatusData(Object.entries(sc).map(([name, value]) => ({ name, value })));
      }
      setLoading(false);
    };
    fetchData();
  }, [dealershipId, user]);

  if (dLoading || loading) {
    return (
      <DashboardLayout navItems={dealershipNavItems} title="Reporting">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const avgPerContract = totalContracts > 0 ? totalRevenue / totalContracts : 0;

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Reporting">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Contracts</p><p className="text-2xl font-bold">{totalContracts}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avg / Contract</p><p className="text-2xl font-bold">${avgPerContract.toFixed(0)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Products Sold</p><p className="text-2xl font-bold">{productData.length}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="revenue">
          <TabsList>
            <TabsTrigger value="revenue">Monthly Revenue</TabsTrigger>
            <TabsTrigger value="volume">Monthly Volume</TabsTrigger>
            <TabsTrigger value="products">By Product</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue">
            <Card>
              <CardContent className="pt-6">
                <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }} className="h-[300px]">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="volume">
            <Card>
              <CardContent className="pt-6">
                <ChartContainer config={{ count: { label: "Contracts", color: "hsl(var(--primary))" } }} className="h-[300px]">
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="products">
            <Card>
              <CardContent className="pt-6 space-y-3">
                {productData.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    <Badge variant="secondary">{p.value} sold</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DealershipReporting;
