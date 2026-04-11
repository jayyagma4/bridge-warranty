import { useState } from "react";
import DashboardLayout, { providerNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Package, FileText, DollarSign, TrendingUp, Plus, Building2, BarChart3, Users,
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

const demoChartData = [
  { month: "Jan '25", contracts: 45 },
  { month: "Feb '25", contracts: 62 },
  { month: "Mar '25", contracts: 78 },
  { month: "Apr '25", contracts: 55 },
  { month: "May '25", contracts: 91 },
  { month: "Jun '25", contracts: 110 },
];

const demoTopProducts = [
  { name: "Gold VSC — Vehicle Service Contract", count: 110 },
  { name: "Silver VSC — Vehicle Service Contract", count: 85 },
  { name: "Platinum VSC — Vehicle Service Contract", count: 62 },
  { name: "Tire & Rim Protection — Standard", count: 48 },
  { name: "Bronze VSC — Vehicle Service Contract", count: 31 },
];

const demoTopDealerships = [
  { name: "AutoMax Toronto", contracts: 45 },
  { name: "Drive Nation Ottawa", contracts: 38 },
  { name: "Premier Auto Group", contracts: 32 },
  { name: "City Motors Hamilton", contracts: 28 },
  { name: "Valley Autos London", contracts: 22 },
];

const ProviderOverview = () => {
  const stats = {
    activeProducts: 12,
    totalContracts: 441,
    revenue: 662500,
    activeDealerships: 24,
    pendingRemittances: 8,
    avgPerContract: 1502,
  };

  const statCards = [
    { label: "Active Products", value: stats.activeProducts, icon: Package, color: "text-primary" },
    { label: "Total Contracts", value: stats.totalContracts, icon: FileText, color: "text-green-500" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Active Dealerships", value: stats.activeDealerships, icon: Building2, color: "text-amber-500" },
    { label: "Pending Remittances", value: stats.pendingRemittances, icon: DollarSign, color: "text-orange-500" },
    { label: "Avg / Contract", value: `$${stats.avgPerContract}`, icon: BarChart3, color: "text-primary" },
  ];

  const quickActions = [
    { label: "Add New Product", href: "/provider/products/new", icon: Plus },
    { label: "View Products", href: "/provider/products", icon: Package },
    { label: "View Contracts", href: "/provider/contracts", icon: FileText },
    { label: "Analytics", href: "/provider/analytics", icon: TrendingUp },
    { label: "Remittances", href: "/provider/remittances", icon: DollarSign },
  ];

  return (
    <DashboardLayout navItems={providerNavItems} title="Provider Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <CardTitle className="text-base">Contracts Sold (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ contracts: { label: "Contracts", color: "hsl(var(--primary))" } }} className="h-[250px]">
                <BarChart data={demoChartData}>
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

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoTopProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{i + 1}</Badge>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <Badge>{p.count} sold</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Dealerships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoTopDealerships.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{i + 1}</Badge>
                    <span className="text-sm font-medium">{d.name}</span>
                  </div>
                  <Badge variant="outline">{d.contracts} contracts</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderOverview;
