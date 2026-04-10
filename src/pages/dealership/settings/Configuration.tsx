import { useEffect, useState, useMemo } from "react";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useDealership } from "@/hooks/useDealership";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Tag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  term: string;
  mileage_range: string;
  deductible: number;
  dealer_cost: number;
}

interface Product {
  id: string;
  name: string;
  type: string;
  pricing: { tiers?: PricingTier[]; base_price?: number; dealer_cost?: number } | null;
  provider_id: string;
}

interface RetailPriceMap {
  [tierKey: string]: number;
}

interface PricingConfig {
  product_id: string;
  retail_price: RetailPriceMap;
  confidentiality_enabled: boolean;
}

const Configuration = () => {
  const { dealershipId, memberRole, loading: dLoading } = useDealership();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Record<string, string>>({});
  const [pricingConfigs, setPricingConfigs] = useState<Record<string, PricingConfig>>({});
  const [confidentialityEnabled, setConfidentialityEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [editingTiers, setEditingTiers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const isAdmin = memberRole === "admin";

  useEffect(() => {
    if (!dealershipId) return;
    const fetchData = async () => {
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, type, pricing, provider_id")
        .eq("status", "active");
      const prodList = (prods as Product[]) || [];
      setProducts(prodList);

      const providerIds = [...new Set(prodList.map((p) => p.provider_id))];
      if (providerIds.length) {
        const { data: provs } = await supabase
          .from("providers")
          .select("id, company_name")
          .in("id", providerIds);
        const map: Record<string, string> = {};
        (provs || []).forEach((p) => { map[p.id] = p.company_name; });
        setProviders(map);
      }

      const { data: configs } = await supabase
        .from("dealership_product_pricing")
        .select("product_id, retail_price, confidentiality_enabled")
        .eq("dealership_id", dealershipId);

      const configMap: Record<string, PricingConfig> = {};
      (configs || []).forEach((c: any) => {
        configMap[c.product_id] = c;
        if (c.confidentiality_enabled) setConfidentialityEnabled(true);
      });
      setPricingConfigs(configMap);

      if (prodList.length > 0) setSelectedProduct(prodList[0].id);
      setLoading(false);
    };
    fetchData();
  }, [dealershipId]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesProvider = providerFilter === "all" || p.provider_id === providerFilter;
      return matchesSearch && matchesProvider;
    });
  }, [products, search, providerFilter]);

  const selectedProductData = products.find((p) => p.id === selectedProduct);
  const tiers: PricingTier[] = selectedProductData?.pricing?.tiers || [];

  const handleToggleConfidentiality = async (enabled: boolean) => {
    setConfidentialityEnabled(enabled);
    if (dealershipId) {
      for (const productId of Object.keys(pricingConfigs)) {
        await supabase
          .from("dealership_product_pricing")
          .update({ confidentiality_enabled: enabled })
          .eq("dealership_id", dealershipId)
          .eq("product_id", productId);
      }
    }
    toast({
      title: enabled ? "Confidentiality Pricing Enabled" : "Confidentiality Pricing Disabled",
      description: enabled
        ? "Retail pricing is now active for customers."
        : "Showing dealer internal cost.",
    });
  };

  const tierKey = (tier: PricingTier) => `${tier.term}|${tier.mileage_range}|${tier.deductible}`;

  const getRetailPrice = (productId: string, tier: PricingTier): number | null => {
    const config = pricingConfigs[productId];
    if (!config?.retail_price) return null;
    const key = tierKey(tier);
    const rp = (config.retail_price as Record<string, any>);
    return rp[key] ?? null;
  };

  const getMarkup = (cost: number, retail: number | null): string => {
    if (!retail || retail <= 0) return "0.0%";
    const pct = ((retail - cost) / cost) * 100;
    return `${pct.toFixed(1)}%`;
  };

  const handleSaveTierPrice = async (productId: string, tier: PricingTier) => {
    if (!dealershipId) return;
    const key = tierKey(tier);
    const priceStr = editingTiers[key];
    if (!priceStr) return;

    setSaving((prev) => ({ ...prev, [key]: true }));
    const price = parseFloat(priceStr);
    const existing = pricingConfigs[productId];
    const newRetailPrice = { ...(existing?.retail_price || {}), [key]: price };

    if (existing) {
      await supabase
        .from("dealership_product_pricing")
        .update({ retail_price: newRetailPrice, confidentiality_enabled: confidentialityEnabled })
        .eq("dealership_id", dealershipId)
        .eq("product_id", productId);
    } else {
      await supabase.from("dealership_product_pricing").insert({
        dealership_id: dealershipId,
        product_id: productId,
        retail_price: newRetailPrice,
        confidentiality_enabled: confidentialityEnabled,
      });
    }

    setPricingConfigs((prev) => ({
      ...prev,
      [productId]: {
        product_id: productId,
        retail_price: newRetailPrice,
        confidentiality_enabled: confidentialityEnabled,
      },
    }));
    setEditingTiers((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setSaving((prev) => ({ ...prev, [key]: false }));
    toast({ title: "Price Saved" });
  };

  if (dLoading || loading) {
    return (
      <DashboardLayout navItems={dealershipNavItems} title="Configuration">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Configuration">
      <div className="space-y-4">
        {/* Header with toggle */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Retail Pricing</h2>
                  <p className="text-sm text-muted-foreground">Select a product to configure its pricing terms.</p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Confidentiality Pricing</span>
                  <Switch checked={confidentialityEnabled} onCheckedChange={handleToggleConfidentiality} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Search</label>
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Provider</label>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {Object.entries(providers).map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Product list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors",
                      selectedProduct === p.id && "bg-primary/10 border-l-2 border-primary"
                    )}
                  >
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.type}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{providers[p.provider_id] || "—"}</span>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No products found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4" /> Product Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedProductData ? (
                <p className="text-muted-foreground text-center py-12">Select a product to view pricing details.</p>
              ) : (
                <div className="space-y-4">
                  {/* Product header */}
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Settings2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedProductData.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Provider: {providers[selectedProductData.provider_id] || "—"} • Type: {selectedProductData.type}
                      </p>
                    </div>
                  </div>

                  {/* Pricing table */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Pricing Configuration
                      </h4>
                      <span className="text-sm text-muted-foreground">{tiers.length} plans</span>
                    </div>

                    {tiers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No pricing tiers configured for this product.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[140px]">Term</TableHead>
                              <TableHead>Deductible</TableHead>
                              <TableHead>Cost Price</TableHead>
                              <TableHead>Suggested Retail</TableHead>
                              <TableHead className="min-w-[200px]">Your Retail Price</TableHead>
                              <TableHead>Markup %</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tiers.map((tier, i) => {
                              const key = tierKey(tier);
                              const retail = getRetailPrice(selectedProductData.id, tier);
                              const isEditing = key in editingTiers;
                              return (
                                <TableRow key={i}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium text-sm">{tier.term}</p>
                                      <p className="text-xs text-muted-foreground">Mileage: {tier.mileage_range}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>${tier.deductible.toFixed(2)}</TableCell>
                                  <TableCell className="font-medium">${tier.dealer_cost.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</TableCell>
                                  <TableCell className="text-muted-foreground">—</TableCell>
                                  <TableCell>
                                    {isEditing ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          className="w-28 h-8"
                                          placeholder="0.00"
                                          value={editingTiers[key]}
                                          onChange={(e) => setEditingTiers((prev) => ({ ...prev, [key]: e.target.value }))}
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() => handleSaveTierPrice(selectedProductData.id, tier)}
                                          disabled={saving[key]}
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        {isAdmin && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingTiers((prev) => ({ ...prev, [key]: retail?.toString() || "" }))}
                                          >
                                            Enter price
                                          </Button>
                                        )}
                                        {retail != null && (
                                          <span className="text-xs text-muted-foreground">
                                            Current: ${retail.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">{getMarkup(tier.dealer_cost, retail)}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Configuration;
