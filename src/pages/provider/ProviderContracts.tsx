import { useState, useMemo } from "react";
import DashboardLayout, { providerNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { format } from "date-fns";

interface Contract {
  id: string;
  dealership: string;
  customerName: string;
  vehicle: string;
  product: string;
  status: string;
  contractPrice: number;
  dealerCost: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-destructive/10 text-destructive",
};

const TABS = ["all", "active", "submitted", "expired", "cancelled"];

const demoContracts: Contract[] = [
  { id: "c1", dealership: "AutoMax Toronto", customerName: "John Smith", vehicle: "2022 Honda Civic", product: "Gold VSC", status: "active", contractPrice: 1895, dealerCost: 1200, createdAt: "2025-06-01T10:00:00Z" },
  { id: "c2", dealership: "Drive Nation Ottawa", customerName: "Sarah Johnson", vehicle: "2023 Toyota Camry", product: "Silver VSC", status: "active", contractPrice: 2295, dealerCost: 1500, createdAt: "2025-05-15T14:00:00Z" },
  { id: "c3", dealership: "AutoMax Toronto", customerName: "Mike Davis", vehicle: "2021 BMW 328i", product: "Platinum VSC", status: "active", contractPrice: 2795, dealerCost: 1800, createdAt: "2025-06-05T09:00:00Z" },
  { id: "c4", dealership: "Premier Auto Group", customerName: "Emily Wilson", vehicle: "2024 Chevrolet Malibu", product: "Gold VSC", status: "submitted", contractPrice: 1695, dealerCost: 1100, createdAt: "2025-06-08T16:00:00Z" },
  { id: "c5", dealership: "City Motors Hamilton", customerName: "James Brown", vehicle: "2020 Nissan Altima", product: "Silver VSC", status: "expired", contractPrice: 1495, dealerCost: 950, createdAt: "2024-01-10T11:00:00Z" },
  { id: "c6", dealership: "Valley Autos London", customerName: "Lisa Taylor", vehicle: "2023 Ford Fusion", product: "Tire & Rim Standard", status: "active", contractPrice: 795, dealerCost: 495, createdAt: "2025-04-20T08:00:00Z" },
  { id: "c7", dealership: "Drive Nation Ottawa", customerName: "David Chen", vehicle: "2022 Hyundai Elantra", product: "Gold VSC", status: "active", contractPrice: 1895, dealerCost: 1200, createdAt: "2025-03-18T12:00:00Z" },
  { id: "c8", dealership: "Premier Auto Group", customerName: "Maria Garcia", vehicle: "2021 Kia Forte", product: "Bronze VSC", status: "cancelled", contractPrice: 995, dealerCost: 650, createdAt: "2025-02-05T09:30:00Z" },
];

const ProviderContracts = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    let list = demoContracts;
    if (tab !== "all") list = list.filter((c) => c.status === tab);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.customerName.toLowerCase().includes(s) ||
          c.dealership.toLowerCase().includes(s) ||
          c.product.toLowerCase().includes(s) ||
          c.vehicle.toLowerCase().includes(s)
      );
    }
    return list;
  }, [tab, search]);

  return (
    <DashboardLayout navItems={providerNavItems} title="Contracts">
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by customer, dealership, product..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Card>
          <Tabs value={tab} onValueChange={setTab}>
            <CardHeader className="pb-3">
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t} value={t} className="capitalize">
                    {t} ({t === "all" ? demoContracts.length : demoContracts.filter((c) => c.status === t).length})
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No contracts found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealership</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Contract Price</TableHead>
                      <TableHead>Your Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.dealership}</TableCell>
                        <TableCell>{c.customerName}</TableCell>
                        <TableCell className="text-sm">{c.vehicle}</TableCell>
                        <TableCell className="text-sm">{c.product}</TableCell>
                        <TableCell>${c.contractPrice.toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-green-600">${c.dealerCost.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[c.status] || ""} variant="secondary">{c.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(c.createdAt), "MMM d, yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProviderContracts;
