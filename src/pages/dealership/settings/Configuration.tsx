import { useEffect, useState } from "react";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useDealership } from "@/hooks/useDealership";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, DollarSign, Lock, Unlock } from "lucide-react";

interface Product {
  id: string;
  name: string;
  type: string;
  pricing: any;
  provider_id: string;
}

interface PricingConfig {
  product_id: string;
  retail_price: Record<string, number>;
  confidentiality_enabled: boolean;
}

const Configuration = () => {
  const { dealershipId, memberRole, loading: dLoading } = useDealership();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Record<string, string>>({});
  const [pricingConfigs, setPricingConfigs] = useState<Record<string, PricingConfig>>({});
  const [retailMode, setRetailMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const isAdmin = memberRole === "admin";

  useEffect(() => {
    if (!dealershipId) return;
    const fetchData = async () => {
      const { data: prods } = await supabase.from("products").select("id, name, type, pricing, provider_id").eq("status", "active");
      setProducts((prods as Product[]) || []);

      const providerIds = [...new Set((prods || []).map((p: Product) => p.provider_id))];
      if (providerIds.length) {
        const { data: provs } = await supabase.from("providers").select("id, company_name").in("id", providerIds);
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
        if (c.confidentiality_enabled) setRetailMode(true);
      });
      setPricingConfigs(configMap);
      setLoading(false);
    };
    fetchData();
  }, [dealershipId]);

  const handleToggleRetailMode = async (enabled: boolean) => {
    setRetailMode(enabled);
    // Update all existing configs
    if (dealershipId) {
      for (const productId of Object.keys(pricingConfigs)) {
        await supabase
          .from("dealership_product_pricing")
          .update({ confidentiality_enabled: enabled })
          .eq("dealership_id", dealershipId)
          .eq("product_id", productId);
      }
    }
    toast({ title: enabled ? "Confidentiality Pricing Enabled" : "Dealer Internal Cost Mode", description: enabled ? "Retail pricing is now visible to customers." : "Showing dealer cost internally." });
  };

  const handleSavePrice = async (productId: string) => {
    if (!dealershipId || !editPrice) return;
    setSaving(true);
    const retailPrice = { default: parseFloat(editPrice) };

    const existing = pricingConfigs[productId];
    if (existing) {
      await supabase
        .from("dealership_product_pricing")
        .update({ retail_price: retailPrice, confidentiality_enabled: retailMode })
        .eq("dealership_id", dealershipId)
        .eq("product_id", productId);
    } else {
      await supabase.from("dealership_product_pricing").insert({
        dealership_id: dealershipId,
        product_id: productId,
        retail_price: retailPrice,
        confidentiality_enabled: retailMode,
      });
    }

    setPricingConfigs((prev) => ({
      ...prev,
      [productId]: { product_id: productId, retail_price: retailPrice, confidentiality_enabled: retailMode },
    }));
    setEditingProduct(null);
    setEditPrice("");
    setSaving(false);
    toast({ title: "Price Saved", description: "Retail markup has been updated." });
  };

  const getDealerCost = (product: Product): string => {
    if (product.pricing && typeof product.pricing === "object") {
      const p = product.pricing as Record<string, any>;
      if (p.base_price) return `$${Number(p.base_price).toLocaleString()}`;
      if (p.dealer_cost) return `$${Number(p.dealer_cost).toLocaleString()}`;
    }
    return "—";
  };

  const getRetailPrice = (productId: string): string => {
    const config = pricingConfigs[productId];
    if (config?.retail_price?.default) return `$${Number(config.retail_price.default).toLocaleString()}`;
    return "Not set";
  };

  if (dLoading) return <DashboardLayout navItems={dealershipNavItems} title="Configuration"><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div></DashboardLayout>;

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Configuration">
      <div className="space-y-6">
        {/* Confidentiality Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {retailMode ? <Lock className="w-5 h-5 text-amber-500" /> : <Unlock className="w-5 h-5 text-muted-foreground" />}
                  Confidentiality Pricing
                </CardTitle>
                <CardDescription className="mt-1">
                  {retailMode
                    ? "Retail pricing is active. Customers see marked-up prices."
                    : "Showing dealer internal cost. Toggle to enable retail pricing for customers."}
                </CardDescription>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{retailMode ? "Retail Mode" : "Internal Mode"}</span>
                  <Switch checked={retailMode} onCheckedChange={handleToggleRetailMode} />
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Mode Indicator */}
        <div className="flex items-center gap-2">
          <Badge variant={retailMode ? "default" : "secondary"} className="gap-1">
            {retailMode ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {retailMode ? "Confidentiality Pricing" : "Dealer Internal Cost"}
          </Badge>
        </div>

        {/* Products Pricing Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Pricing</CardTitle>
            <CardDescription>Configure retail markup for each product. Customers will see the retail price when Confidentiality Pricing is enabled.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active products found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dealer Cost</TableHead>
                    <TableHead>{retailMode ? "Retail Price" : "Retail Price (Hidden)"}</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{providers[p.provider_id] || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{p.type}</Badge></TableCell>
                      <TableCell className="text-sm">{getDealerCost(p)}</TableCell>
                      <TableCell>
                        {editingProduct === p.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-28 h-8"
                              placeholder="0.00"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                            />
                            <Button size="sm" onClick={() => handleSavePrice(p.id)} disabled={saving}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingProduct(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <span className={retailMode ? "font-medium text-green-600" : "text-muted-foreground"}>
                            {getRetailPrice(p.id)}
                          </span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {editingProduct !== p.id && (
                            <Button size="sm" variant="outline" onClick={() => { setEditingProduct(p.id); setEditPrice(pricingConfigs[p.id]?.retail_price?.default?.toString() || ""); }}>
                              <DollarSign className="w-3 h-3 mr-1" /> Set Price
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Configuration;
