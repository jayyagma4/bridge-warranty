import { useEffect, useState, useMemo } from "react";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useDealership } from "@/hooks/useDealership";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";

interface Contract {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  vehicle_vin: string;
  vehicle_year: number;
  vehicle_make: string;
  vehicle_model: string;
  status: string;
  contract_price: number | null;
  dealer_cost: number | null;
  created_at: string;
  product_id: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-destructive/10 text-destructive",
};

const TABS = ["all", "draft", "submitted", "active", "expired", "cancelled"];

const demoContracts: Contract[] = [
  { id: "d1", customer_first_name: "John", customer_last_name: "Smith", vehicle_vin: "1HGBH41JXMN109186", vehicle_year: 2022, vehicle_make: "Honda", vehicle_model: "Civic", status: "active", contract_price: 1895, dealer_cost: 1200, created_at: "2025-06-01T10:00:00Z", product_id: "p1" },
  { id: "d2", customer_first_name: "Sarah", customer_last_name: "Johnson", vehicle_vin: "5YJSA1DG9DFP14705", vehicle_year: 2023, vehicle_make: "Toyota", vehicle_model: "Camry", status: "active", contract_price: 2295, dealer_cost: 1500, created_at: "2025-05-15T14:00:00Z", product_id: "p2" },
  { id: "d3", customer_first_name: "Mike", customer_last_name: "Davis", vehicle_vin: "WBAPH5C55BA271838", vehicle_year: 2021, vehicle_make: "BMW", vehicle_model: "328i", status: "submitted", contract_price: 2795, dealer_cost: 1800, created_at: "2025-06-05T09:00:00Z", product_id: "p3" },
  { id: "d4", customer_first_name: "Emily", customer_last_name: "Wilson", vehicle_vin: "1G1YY22G955104367", vehicle_year: 2024, vehicle_make: "Chevrolet", vehicle_model: "Malibu", status: "draft", contract_price: 1695, dealer_cost: 1100, created_at: "2025-06-08T16:00:00Z", product_id: "p1" },
  { id: "d5", customer_first_name: "James", customer_last_name: "Brown", vehicle_vin: "JN1TANT31Z0000001", vehicle_year: 2020, vehicle_make: "Nissan", vehicle_model: "Altima", status: "expired", contract_price: 1495, dealer_cost: 950, created_at: "2024-01-10T11:00:00Z", product_id: "p2" },
  { id: "d6", customer_first_name: "Lisa", customer_last_name: "Taylor", vehicle_vin: "3FA6P0HD5LR123456", vehicle_year: 2023, vehicle_make: "Ford", vehicle_model: "Fusion", status: "active", contract_price: 1995, dealer_cost: 1300, created_at: "2025-04-20T08:00:00Z", product_id: "p3" },
];

const demoProducts: Record<string, string> = {
  p1: "Gold VSC — Vehicle Service Contract",
  p2: "Silver VSC — Vehicle Service Contract",
  p3: "Platinum VSC — Vehicle Service Contract",
};

const DealershipContracts = () => {
  const { dealershipId, loading: dLoading } = useDealership();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [products, setProducts] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dealershipId) return;

    // Demo mode
    if (!user) {
      setContracts(demoContracts);
      setProducts(demoProducts);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const { data } = await supabase
        .from("contracts")
        .select("*")
        .eq("dealership_id", dealershipId)
        .order("created_at", { ascending: false });

      const contractData = (data as Contract[]) || [];
      if (contractData.length === 0) {
        setContracts(demoContracts);
        setProducts(demoProducts);
      } else {
        setContracts(contractData);
        const productIds = [...new Set(contractData.map((c) => c.product_id))];
        if (productIds.length) {
          const { data: prods } = await supabase.from("products").select("id, name").in("id", productIds);
          const map: Record<string, string> = {};
          (prods || []).forEach((p) => { map[p.id] = p.name; });
          setProducts(map);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [dealershipId, user]);

  const filtered = useMemo(() => {
    let list = contracts;
    if (tab !== "all") list = list.filter((c) => c.status === tab);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.customer_first_name.toLowerCase().includes(s) ||
          c.customer_last_name.toLowerCase().includes(s) ||
          c.vehicle_vin.toLowerCase().includes(s) ||
          (products[c.product_id] || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [contracts, tab, search, products]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!user) {
      setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      return;
    }
    await supabase.from("contracts").update({ status: newStatus }).eq("id", id);
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  };

  if (dLoading) return <DashboardLayout navItems={dealershipNavItems} title="Contracts"><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div></DashboardLayout>;

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Contracts">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, VIN, product..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button asChild>
            <Link to="/purchase"><Plus className="w-4 h-4 mr-1" /> New Contract</Link>
          </Button>
        </div>

        <Card>
          <Tabs value={tab} onValueChange={setTab}>
            <CardHeader className="pb-3">
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t} value={t} className="capitalize">
                    {t} {t === "all" ? `(${contracts.length})` : `(${contracts.filter((c) => c.status === t).length})`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No contracts found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.customer_first_name} {c.customer_last_name}</TableCell>
                        <TableCell>{c.vehicle_year} {c.vehicle_make} {c.vehicle_model}</TableCell>
                        <TableCell className="text-sm">{products[c.product_id] || "—"}</TableCell>
                        <TableCell>${Number(c.contract_price || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[c.status] || ""} variant="secondary">{c.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {c.status === "draft" && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(c.id, "submitted")}>Submit</Button>
                            )}
                            {(c.status === "draft" || c.status === "submitted") && (
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleStatusChange(c.id, "cancelled")}>Cancel</Button>
                            )}
                          </div>
                        </TableCell>
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

export default DealershipContracts;
