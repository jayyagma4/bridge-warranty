import { useEffect, useState, useMemo, useCallback } from "react";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useDealership } from "@/hooks/useDealership";
import { useToast } from "@/hooks/use-toast";
import { Settings2, DollarSign, Pencil, Check, X, ChevronRight, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  term: string;
  dealer_cost: number;
  suggested_retail: number;
  mileage_bracket?: string;
  vehicle_class?: string;
}

interface Product {
  id: string;
  name: string;
  type: string;
  pricing: {
    per_claim?: number;
    deductible?: number;
    eligibility?: string;
    tiers?: PricingTier[];
  } | null;
  provider_id: string;
}

interface PricingConfig {
  product_id: string;
  retail_price: Record<string, number>;
  confidentiality_enabled: boolean;
}

const fmt = (v: number) => `$${v.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;

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
  const [editAllMode, setEditAllMode] = useState(false);

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

  const tierKey = (tier: PricingTier, index: number) => {
    const parts = [tier.term];
    if (tier.mileage_bracket) parts.push(tier.mileage_bracket);
    if (tier.vehicle_class) parts.push(tier.vehicle_class);
    parts.push(String(index));
    return parts.join("|");
  };

  const getRetailPrice = (productId: string, tier: PricingTier, index: number): number | null => {
    const config = pricingConfigs[productId];
    if (!config?.retail_price) return null;
    const key = tierKey(tier, index);
    return (config.retail_price as Record<string, number>)[key] ?? null;
  };

  const getMarkup = (cost: number, retail: number | null): string => {
    if (!retail || retail <= 0) return "—";
    const pct = ((retail - cost) / cost) * 100;
    return `${pct.toFixed(1)}%`;
  };

  const handleSaveTierPrice = async (productId: string, tier: PricingTier, index: number) => {
    if (!dealershipId) return;
    const key = tierKey(tier, index);
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

  const handleEditAll = useCallback(() => {
    if (!selectedProductData) return;
    const newEditing: Record<string, string> = {};
    tiers.forEach((tier, i) => {
      const key = tierKey(tier, i);
      const customRetail = getRetailPrice(selectedProductData.id, tier, i);
      newEditing[key] = customRetail?.toString() || tier.suggested_retail.toString();
    });
    setEditingTiers(newEditing);
    setEditAllMode(true);
  }, [selectedProductData, tiers, pricingConfigs]);

  const handleSaveAll = async () => {
    if (!selectedProductData || !dealershipId) return;
    setSaving((prev) => ({ ...prev, __all: true }));

    const existing = pricingConfigs[selectedProductData.id];
    const newRetailPrice = { ...(existing?.retail_price || {}) };

    tiers.forEach((tier, i) => {
      const key = tierKey(tier, i);
      if (editingTiers[key]) {
        newRetailPrice[key] = parseFloat(editingTiers[key]);
      }
    });

    if (existing) {
      await supabase
        .from("dealership_product_pricing")
        .update({ retail_price: newRetailPrice, confidentiality_enabled: confidentialityEnabled })
        .eq("dealership_id", dealershipId)
        .eq("product_id", selectedProductData.id);
    } else {
      await supabase.from("dealership_product_pricing").insert({
        dealership_id: dealershipId,
        product_id: selectedProductData.id,
        retail_price: newRetailPrice,
        confidentiality_enabled: confidentialityEnabled,
      });
    }

    setPricingConfigs((prev) => ({
      ...prev,
      [selectedProductData.id]: {
        product_id: selectedProductData.id,
        retail_price: newRetailPrice,
        confidentiality_enabled: confidentialityEnabled,
      },
    }));
    setEditingTiers({});
    setEditAllMode(false);
    setSaving((prev) => ({ ...prev, __all: false }));
    toast({ title: "All Prices Saved", description: `Updated ${tiers.length} pricing tiers.` });
  };

  const handleCancelAll = () => {
    setEditingTiers({});
    setEditAllMode(false);
  };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      warranty: "Vehicle Service Contract",
      vsc: "Vehicle Service Contract",
      tire_rim: "Tire & Rim Protection",
      gap: "GAP Insurance",
      theft: "Theft Protection",
    };
    return map[type.toLowerCase()] || type;
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
      <div className="space-y-6 max-w-[1400px] mx-auto">

        {/* Header card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-5 px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Dealer Pricing Configuration</h2>
                  <p className="text-sm text-muted-foreground">
                    Set your retail prices for each product. Customers will see these prices on quotes.
                  </p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-3 bg-background/80 rounded-xl px-4 py-2.5 border">
                  <span className="text-sm font-medium whitespace-nowrap">Show Retail to Customers</span>
                  <Switch checked={confidentialityEnabled} onCheckedChange={handleToggleConfidentiality} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {Object.entries(providers).map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* Left: Product list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Products ({filteredProducts.length})
            </p>
            <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProduct(p.id); setEditingTiers({}); setEditAllMode(false); }}
                  className={cn(
                    "w-full text-left rounded-xl px-4 py-3 transition-all duration-150",
                    "hover:bg-muted/60",
                    selectedProduct === p.id
                      ? "bg-primary/10 border border-primary/30 shadow-sm"
                      : "bg-card border border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{typeLabel(p.type)}</p>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      selectedProduct === p.id ? "text-primary" : "text-muted-foreground/40"
                    )} />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {providers[p.provider_id] || "Unknown"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {p.pricing?.tiers?.length || 0} tiers
                    </Badge>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No products found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product detail + pricing cards */}
          <div className="space-y-5">
            {!selectedProductData ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium">Select a product to configure pricing</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Choose from the list on the left</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Product header card */}
                <Card>
                  <CardContent className="py-5 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{selectedProductData.name}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {typeLabel(selectedProductData.type)} • {providers[selectedProductData.provider_id] || "Unknown Provider"}
                          </p>
                          {selectedProductData.pricing && (
                            <div className="flex flex-wrap gap-3 mt-3">
                              {selectedProductData.pricing.deductible != null && (
                                <Badge variant="outline" className="font-normal">
                                  Deductible: {selectedProductData.pricing.deductible === 0 ? "None ($0)" : fmt(selectedProductData.pricing.deductible)}
                                </Badge>
                              )}
                              {selectedProductData.pricing.per_claim != null && (
                                <Badge variant="outline" className="font-normal">
                                  Per Claim: {fmt(selectedProductData.pricing.per_claim)}
                                </Badge>
                              )}
                              {selectedProductData.pricing.eligibility && (
                                <Badge variant="outline" className="font-normal">
                                  Eligibility: {selectedProductData.pricing.eligibility}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit All / Save All buttons */}
                      {isAdmin && tiers.length > 0 && (
                        <div className="flex items-center gap-2 shrink-0">
                          {editAllMode ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={handleCancelAll}>
                                <X className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                              <Button size="sm" onClick={handleSaveAll} disabled={saving.__all}>
                                <Check className="w-4 h-4 mr-1" /> Save All
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={handleEditAll}>
                              <Pencil className="w-4 h-4 mr-1" /> Edit All Prices
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing tiers heading */}
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Pricing Tiers ({tiers.length})
                  </h4>
                </div>

                {/* Pricing tier cards */}
                {tiers.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No pricing tiers configured for this product yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tiers.map((tier, i) => {
                      const key = tierKey(tier, i);
                      const customRetail = getRetailPrice(selectedProductData.id, tier, i);
                      const isEditing = key in editingTiers;
                      const markup = getMarkup(tier.dealer_cost, customRetail ?? tier.suggested_retail);

                      return (
                        <Card key={i} className={cn(
                          "transition-all duration-150",
                          isEditing && "ring-2 ring-primary/30 border-primary/20"
                        )}>
                          <CardContent className="py-4 px-5">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">

                              {/* Left: Tier info */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                                {/* Term */}
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Term</p>
                                  <p className="font-semibold text-sm">{tier.term}</p>
                                </div>

                                {/* Mileage */}
                                {tier.mileage_bracket && (
                                  <div>
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Mileage</p>
                                    <p className="font-medium text-sm">{tier.mileage_bracket}</p>
                                  </div>
                                )}

                                {/* Vehicle Class */}
                                {tier.vehicle_class && (
                                  <div>
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Vehicle Class</p>
                                    <p className="font-medium text-sm">{tier.vehicle_class}</p>
                                  </div>
                                )}

                                {/* Dealer Cost */}
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Your Cost</p>
                                  <p className="font-bold text-sm">{fmt(tier.dealer_cost)}</p>
                                </div>

                                {/* Suggested Retail */}
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Suggested Retail</p>
                                  <p className="text-sm text-muted-foreground">{fmt(tier.suggested_retail)}</p>
                                </div>

                                {/* Your Retail */}
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Your Retail Price</p>
                                  {isEditing ? (
                                    <div className="flex items-center gap-2">
                                      <div className="relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                        <Input
                                          type="number"
                                          className="w-28 h-8 pl-6 text-sm"
                                          placeholder="0.00"
                                          value={editingTiers[key]}
                                          onChange={(e) => setEditingTiers((prev) => ({ ...prev, [key]: e.target.value }))}
                                          autoFocus={!editAllMode}
                                        />
                                      </div>
                                      {!editAllMode && (
                                        <>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => handleSaveTierPrice(selectedProductData.id, tier, i)}
                                            disabled={saving[key]}
                                          >
                                            <Check className="w-4 h-4 text-green-600" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => setEditingTiers((prev) => { const n = { ...prev }; delete n[key]; return n; })}
                                          >
                                            <X className="w-4 h-4 text-muted-foreground" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      {customRetail != null ? (
                                        <span className="font-bold text-sm text-primary">{fmt(customRetail)}</span>
                                      ) : (
                                        <span className="text-sm text-muted-foreground/50 italic">Not set</span>
                                      )}
                                      {isAdmin && !editAllMode && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7"
                                          onClick={() => setEditingTiers((prev) => ({
                                            ...prev,
                                            [key]: customRetail?.toString() || tier.suggested_retail.toString()
                                          }))}
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Markup */}
                                <div>
                                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Markup</p>
                                  <Badge
                                    variant={markup !== "—" ? "default" : "secondary"}
                                    className={cn(
                                      "text-xs",
                                      markup !== "—" && "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                    )}
                                  >
                                    {markup}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Configuration;
