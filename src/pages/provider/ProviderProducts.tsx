import { useState, useMemo } from "react";
import DashboardLayout, { providerNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Package, Edit, Eye, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DemoProduct {
  id: string;
  name: string;
  type: string;
  status: string;
  tiers: number;
  totalContracts: number;
  lastUpdated: string;
  group?: string;
}

const demoProducts: DemoProduct[] = [
  { id: "p1", name: "Gold VSC", type: "warranty", status: "active", tiers: 6, totalContracts: 110, lastUpdated: "2025-06-01", group: "A-Protect VSC" },
  { id: "p2", name: "Silver VSC", type: "warranty", status: "active", tiers: 4, totalContracts: 85, lastUpdated: "2025-05-28", group: "A-Protect VSC" },
  { id: "p3", name: "Bronze VSC", type: "warranty", status: "active", tiers: 3, totalContracts: 31, lastUpdated: "2025-05-20", group: "A-Protect VSC" },
  { id: "p4", name: "Platinum VSC", type: "warranty", status: "active", tiers: 8, totalContracts: 62, lastUpdated: "2025-06-03", group: "A-Protect VSC" },
  { id: "p5", name: "Tire & Rim Standard", type: "tire_rim", status: "active", tiers: 4, totalContracts: 48, lastUpdated: "2025-05-15" },
  { id: "p6", name: "Tire & Rim Premium", type: "tire_rim", status: "active", tiers: 4, totalContracts: 22, lastUpdated: "2025-05-10" },
  { id: "p7", name: "GAP Insurance Basic", type: "gap", status: "draft", tiers: 2, totalContracts: 0, lastUpdated: "2025-06-08" },
  { id: "p8", name: "Theft Protection", type: "theft", status: "draft", tiers: 3, totalContracts: 0, lastUpdated: "2025-06-07" },
];

const typeLabels: Record<string, string> = {
  warranty: "Vehicle Service Contract",
  tire_rim: "Tire & Rim Protection",
  gap: "GAP Insurance",
  theft: "Theft Protection",
};

const ProviderProducts = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState(demoProducts);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || p.type === typeFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [products, search, typeFilter, statusFilter]);

  const toggleStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "active" ? "draft" : "active" } : p
      )
    );
    toast({ title: "Status Updated" });
  };

  return (
    <DashboardLayout navItems={providerNavItems} title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Your Products</h2>
            <p className="text-sm text-muted-foreground">Manage your warranty plans, tiers, and pricing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/provider/products/new?ai=true">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Import
              </Link>
            </Button>
            <Button asChild>
              <Link to="/provider/products/new">
                <Plus className="w-4 h-4 mr-1" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="warranty">Vehicle Service Contract</SelectItem>
              <SelectItem value="tire_rim">Tire & Rim</SelectItem>
              <SelectItem value="gap">GAP Insurance</SelectItem>
              <SelectItem value="theft">Theft Protection</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Products</p><p className="text-2xl font-bold">{products.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{products.filter((p) => p.status === "active").length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Draft</p><p className="text-2xl font-bold text-muted-foreground">{products.filter((p) => p.status === "draft").length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Contracts Sold</p><p className="text-2xl font-bold">{products.reduce((s, p) => s + p.totalContracts, 0)}</p></CardContent></Card>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{typeLabels[product.type] || product.type}</p>
                    {product.group && (
                      <Badge variant="outline" className="text-[10px] mt-1">{product.group}</Badge>
                    )}
                  </div>
                  <Badge variant={product.status === "active" ? "default" : "secondary"} className="capitalize ml-2">
                    {product.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-lg font-bold">{product.tiers}</p>
                    <p className="text-[10px] text-muted-foreground">Tiers</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-lg font-bold">{product.totalContracts}</p>
                    <p className="text-[10px] text-muted-foreground">Sold</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-[11px] font-medium">{product.lastUpdated}</p>
                    <p className="text-[10px] text-muted-foreground">Updated</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/provider/products/${product.id}`)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleStatus(product.id)}>
                    {product.status === "active" ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No products found</p>
              <p className="text-sm">Try adjusting your filters or add a new product.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderProducts;
