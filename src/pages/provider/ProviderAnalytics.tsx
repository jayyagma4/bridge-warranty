import { useState } from "react";
import DashboardLayout, { providerNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(45, 93%, 58%)",
  "hsl(142, 76%, 36%)",
  "hsl(346, 87%, 53%)",
  "hsl(199, 89%, 48%)",
  "hsl(262, 83%, 58%)",
];

const monthlyRevenue = [
  { month: "Jan '25", revenue: 52500, contracts: 45 },
  { month: "Feb '25", revenue: 72000, contracts: 62 },
  { month: "Mar '25", revenue: 93600, contracts: 78 },
  { month: "Apr '25", revenue: 66000, contracts: 55 },
  { month: "May '25", revenue: 109200, contracts: 91 },
  { month: "Jun '25", revenue: 132000, contracts: 110 },
];

const productMix = [
  { name: "Gold VSC", value: 110, revenue: 131450 },
  { name: "Silver VSC", value: 85, revenue: 84575 },
  { name: "Platinum VSC", value: 62, revenue: 111600 },
  { name: "Tire & Rim Std", value: 48, revenue: 23760 },
  { name: "Bronze VSC", value: 31, revenue: 20150 },
  { name: "Tire & Rim Prm", value: 22, revenue: 17490 },
];

const dealershipPerformance = [
  { name: "AutoMax Toronto", contracts: 85, revenue: 127500 },
  { name: "Drive Nation Ottawa", contracts: 72, revenue: 108000 },
  { name: "Premier Auto Group", contracts: 58, revenue: 87000 },
  { name: "City Motors Hamilton", contracts: 45, revenue: 67500 },
  { name: "Valley Autos London", contracts: 38, revenue: 57000 },
  { name: "Maple Leaf Motors", contracts: 32, revenue: 48000 },
  { name: "Highway Auto Sales", contracts: 28, revenue: 42000 },
  { name: "Lakeshore Autos", contracts: 22, revenue: 33000 },
];

const ProviderAnalytics = () => {
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalContracts = monthlyRevenue.reduce((s, m) => s + m.contracts, 0);
  const avgPerContract = totalContracts > 0 ? Math.round(totalRevenue / totalContracts) : 0;

  return (
    <DashboardLayout navItems={providerNavItems} title="Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Revenue (6mo)</p><p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Contracts</p><p className="text-2xl font-bold">{totalContracts}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avg / Contract</p><p className="text-2xl font-bold">${avgPerContract}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active Dealerships</p><p className="text-2xl font-bold">24</p></CardContent></Card>
        </div>

        <Tabs defaultValue="revenue">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
            <TabsTrigger value="volume">Contract Volume</TabsTrigger>
            <TabsTrigger value="products">Product Mix</TabsTrigger>
            <TabsTrigger value="dealerships">Dealership Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader><CardTitle className="text-base">Monthly Revenue</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }} className="h-[350px]">
                  <BarChart data={monthlyRevenue}>
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
              <CardHeader><CardTitle className="text-base">Contract Volume Trend</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={{ contracts: { label: "Contracts", color: "hsl(var(--primary))" } }} className="h-[350px]">
                  <LineChart data={monthlyRevenue}>
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="contracts" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">By Volume</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ value: { label: "Contracts", color: "hsl(var(--primary))" } }} className="h-[300px]">
                    <BarChart data={productMix} layout="vertical">
                      <XAxis type="number" fontSize={12} />
                      <YAxis type="category" dataKey="name" fontSize={11} width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Revenue by Product</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {productMix.map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{p.value} sold</Badge>
                        <span className="text-sm font-bold">${p.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dealerships">
            <Card>
              <CardHeader><CardTitle className="text-base">Dealership Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dealershipPerformance.map((d, i) => {
                    const maxContracts = dealershipPerformance[0].contracts;
                    const pct = (d.contracts / maxContracts) * 100;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">{i + 1}</Badge>
                            <span className="text-sm font-medium">{d.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">{d.contracts} contracts</span>
                            <span className="font-bold">${d.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProviderAnalytics;
