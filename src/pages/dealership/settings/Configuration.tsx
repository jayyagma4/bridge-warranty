import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useDealership } from "@/hooks/useDealership";
import { useToast } from "@/hooks/use-toast";
import {
  Settings2, DollarSign, Pencil, Check, X, ChevronRight, Search, Package, Zap,
  Building2, ChevronLeft, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ───────────────────────── Types ─────────────────────────

interface Product {
  id: string;
  name: string;
  type: string;
  tier?: string;
  group?: string;
  pricing: any;
  coverage_details: any;
  eligibility_rules: any;
  provider_id: string;
}

interface PricingConfig {
  product_id: string;
  retail_price: Record<string, number>;
  confidentiality_enabled: boolean;
}

interface StructuredRow {
  label: string;
  /** values[bandIdx]?[termIdx] OR values[termIdx] when no mileage bands */
  values: (number | string)[];
}

interface StructuredBand {
  label: string;
  values: (number | string)[]; // per term
}

interface StructuredTier {
  label: string;
  perClaimAmount?: number;
  deductible?: number;
  terms: { label: string; months: number; km: string }[];
  /** When present, Base Price comes from these bands (rows are add-ons only). */
  mileageBands?: StructuredBand[];
  /** Add-on rows (excludes "Base Price" when bands exist; otherwise includes Base Price). */
  rows: StructuredRow[];
  /** Whether the rows array includes a "Base Price" row at index 0. */
  baseInRows: boolean;
}

interface Structured {
  tiers: StructuredTier[];
}

const fmt = (v: number) => `$${v.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// ───────────────────────── Extract structured pricing ─────────────────────────

function extractStructured(pricing: any): Structured {
  if (!pricing) return { tiers: [] };
  const pricingTiers = pricing.pricingTiers || [];
  const tiers: StructuredTier[] = [];

  for (const pt of pricingTiers) {
    const terms = pt.terms || [];
    const allRows = pt.rows || [];
    const mileageBands = pt.mileageBands;
    const baseRowIdx = allRows.findIndex((r: any) => r?.label === "Base Price");
    const baseInRows = baseRowIdx >= 0 && (!mileageBands || mileageBands.length === 0);

    // When mileage bands exist, "Base Price" comes from bands; rows are add-ons only
    // When no bands, "Base Price" is the first row (we surface it in the matrix too)
    const rows: StructuredRow[] = allRows.map((r: any) => ({
      label: r.label,
      values: r.values || [],
    }));

    const label = pt.perClaimAmount
      ? `$${pt.perClaimAmount.toLocaleString()} / claim`
      : pt.label || `Tier ${tiers.length + 1}`;

    tiers.push({
      label,
      perClaimAmount: pt.perClaimAmount,
      deductible: pt.deductible,
      terms,
      mileageBands: mileageBands && mileageBands.length ? mileageBands : undefined,
      rows,
      baseInRows,
    });
  }

  return { tiers };
}

// Cell key: t{tierIdx}|m{bandIdx|-}|r{rowIdx}|term{termIdx}
function cellKey(tierIdx: number, bandIdx: number | null, rowIdx: number, termIdx: number) {
  return `t${tierIdx}|m${bandIdx == null ? "-" : bandIdx}|r${rowIdx}|term${termIdx}`;
}

/** Migrate any legacy keys (termLabel|km|index → t0|m-|r0|term{i}) using the first tier's terms. */
function migrateLegacyKeys(retail: Record<string, number>, structured: Structured): Record<string, number> {
  const out: Record<string, number> = {};
  const firstTier = structured.tiers[0];
  for (const [k, v] of Object.entries(retail || {})) {
    if (/^t\d+\|m/.test(k)) { out[k] = v; continue; }
    // Legacy: "{termLabel}|{km}|{index}"
    if (firstTier && firstTier.baseInRows) {
      const parts = k.split("|");
      if (parts.length === 3) {
        const termLabel = parts[0];
        const termIdx = firstTier.terms.findIndex((t) => t.label === termLabel);
        if (termIdx >= 0) {
          const baseRowIdx = firstTier.rows.findIndex((r) => r.label === "Base Price");
          if (baseRowIdx >= 0) {
            out[cellKey(0, null, baseRowIdx, termIdx)] = v;
            continue;
          }
        }
      }
    }
    out[k] = v;
  }
  return out;
}

function displayName(product: Product): string {
  const cd = product.coverage_details || {};
  const tier = cd.tier || product.tier;
  const group = cd.group || product.group;
  if (group && tier) {
    const groupLabel = group.charAt(0).toUpperCase() + group.slice(1);
    return `${groupLabel} Plan — ${tier}`;
  }
  return product.name;
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    VSC: "Vehicle Service Contract",
    "Tire & Rim": "Tire & Rim Protection",
    GAP: "GAP Insurance",
    warranty: "Vehicle Service Contract",
    tire_rim: "Tire & Rim Protection",
  };
  return map[type] || type;
};

const isNumericCost = (v: any): v is number => typeof v === "number" && !isNaN(v);
const isIncluded = (v: any) => typeof v === "string" && v.trim().toLowerCase() === "included";
const isNA = (v: any) => v == null || (typeof v === "string" && (v.trim().toLowerCase() === "n/a" || v.trim() === "—" || v.trim() === ""));

// ───────────────────────── Component ─────────────────────────

const Configuration = () => {
  const { dealershipId, memberRole, loading: dLoading } = useDealership();
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Record<string, string>>({});
  const [pricingConfigs, setPricingConfigs] = useState<Record<string, PricingConfig>>({});
  const [confidentialityEnabled, setConfidentialityEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [activeTier, setActiveTier] = useState(0);
  const [activeBand, setActiveBand] = useState(0);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [bulkPercent, setBulkPercent] = useState("40");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const isAdmin = memberRole === "admin";

  useEffect(() => {
    const fetchData = async () => {
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, type, pricing, coverage_details, eligibility_rules, provider_id")
        .eq("status", "active")
        .order("name");

      const prodList = (prods || []).map((p: any) => ({
        ...p,
        tier: p.coverage_details?.tier,
        group: p.coverage_details?.group,
      })) as Product[];
      setProducts(prodList);

      const providerIds = [...new Set(prodList.map((p) => p.provider_id))];
      if (providerIds.length) {
        const { data: provs } = await supabase
          .from("providers")
          .select("id, company_name")
          .in("id", providerIds);
        const map: Record<string, string> = {};
        (provs || []).forEach((p: any) => { map[p.id] = p.company_name; });
        setProviders(map);
      }

      if (prodList.length > 0) setSelectedProduct(prodList[0].id);

      if (dealershipId) {
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
      }

      setLoading(false);
    };
    fetchData();
  }, [dealershipId, user]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search || displayName(p).toLowerCase().includes(search.toLowerCase());
      const matchesProvider = providerFilter === "all" || p.provider_id === providerFilter;
      return matchesSearch && matchesProvider;
    });
  }, [products, search, providerFilter]);

  const selectedProductData = products.find((p) => p.id === selectedProduct);
  const structured: Structured = useMemo(
    () => (selectedProductData ? extractStructured(selectedProductData.pricing) : { tiers: [] }),
    [selectedProductData],
  );

  // Reset tier/band when product changes
  useEffect(() => {
    setActiveTier(0);
    setActiveBand(0);
    setEditingCell(null);
  }, [selectedProduct]);

  const currentTier: StructuredTier | undefined = structured.tiers[activeTier];
  const hasBands = !!currentTier?.mileageBands?.length;

  const retailMap: Record<string, number> = useMemo(() => {
    if (!selectedProductData) return {};
    const raw = pricingConfigs[selectedProductData.id]?.retail_price || {};
    return migrateLegacyKeys(raw as Record<string, number>, structured);
  }, [pricingConfigs, selectedProductData, structured]);

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
      title: enabled ? "Customer-facing retail enabled" : "Customer-facing retail disabled",
      description: enabled ? "Customers will see your retail prices on quotes." : "Showing dealer cost only.",
    });
  };

  const persistRetail = async (newRetail: Record<string, number>) => {
    if (!selectedProductData || !dealershipId) return;
    const existing = pricingConfigs[selectedProductData.id];
    if (existing) {
      await supabase
        .from("dealership_product_pricing")
        .update({ retail_price: newRetail, confidentiality_enabled: confidentialityEnabled })
        .eq("dealership_id", dealershipId)
        .eq("product_id", selectedProductData.id);
    } else {
      await supabase.from("dealership_product_pricing").insert({
        dealership_id: dealershipId,
        product_id: selectedProductData.id,
        retail_price: newRetail,
        confidentiality_enabled: confidentialityEnabled,
      });
    }
    setPricingConfigs((prev) => ({
      ...prev,
      [selectedProductData.id]: {
        product_id: selectedProductData.id,
        retail_price: newRetail,
        confidentiality_enabled: confidentialityEnabled,
      },
    }));
  };

  const saveCell = async (key: string, value: number) => {
    if (!selectedProductData) return;
    setSavingKey(key);
    const newRetail = { ...retailMap, [key]: value };
    await persistRetail(newRetail);
    setSavingKey(null);
    setEditingCell(null);
    toast({ title: "Price saved" });
  };

  const clearCell = async (key: string) => {
    if (!selectedProductData) return;
    setSavingKey(key);
    const newRetail = { ...retailMap };
    delete newRetail[key];
    await persistRetail(newRetail);
    setSavingKey(null);
    setEditingCell(null);
    toast({ title: "Custom price cleared" });
  };

  const applyBulkMarkupToTier = async () => {
    if (!currentTier || !selectedProductData) return;
    const pct = parseFloat(bulkPercent);
    if (isNaN(pct) || pct < 0) {
      toast({ title: "Invalid markup", description: "Enter a positive number.", variant: "destructive" });
      return;
    }
    const factor = 1 + pct / 100;
    const newRetail = { ...retailMap };
    let count = 0;

    const fillFromCost = (cost: any, key: string) => {
      if (!isNumericCost(cost) || cost <= 0) return;
      if (newRetail[key] != null) return; // only fill empty
      newRetail[key] = Math.round(cost * factor);
      count++;
    };

    if (hasBands && currentTier.mileageBands) {
      // Base price cells per band+term
      currentTier.mileageBands.forEach((band, bIdx) => {
        currentTier.terms.forEach((_t, tIdx) => {
          const baseRowIdx = -1; // base row index = -1 sentinel for band-base
          fillFromCost(band.values[tIdx], cellKey(activeTier, bIdx, baseRowIdx, tIdx));
        });
      });
      // Add-on rows (shared across bands → bandIdx = null)
      currentTier.rows.forEach((row, rIdx) => {
        currentTier.terms.forEach((_t, tIdx) => {
          fillFromCost(row.values[tIdx], cellKey(activeTier, null, rIdx, tIdx));
        });
      });
    } else {
      currentTier.rows.forEach((row, rIdx) => {
        currentTier.terms.forEach((_t, tIdx) => {
          fillFromCost(row.values[tIdx], cellKey(activeTier, null, rIdx, tIdx));
        });
      });
    }

    await persistRetail(newRetail);
    toast({ title: "Bulk markup applied", description: `Filled ${count} empty cells with +${pct}% markup.` });
  };

  // ──────────────── Render ────────────────

  if (dLoading || loading) {
    return (
      <DashboardLayout navItems={dealershipNavItems} title="Configuration">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  // Build matrix rows for current tier/band
  type MatrixRow = {
    label: string;
    isBase: boolean;
    rowIdx: number; // -1 for band-base
    bandIdx: number | null;
    values: (number | string)[];
  };
  const matrixRows: MatrixRow[] = [];
  if (currentTier) {
    if (hasBands && currentTier.mileageBands) {
      const band = currentTier.mileageBands[activeBand];
      if (band) {
        matrixRows.push({
          label: "Base Price",
          isBase: true,
          rowIdx: -1,
          bandIdx: activeBand,
          values: band.values,
        });
      }
      currentTier.rows.forEach((r, idx) => {
        matrixRows.push({ label: r.label, isBase: false, rowIdx: idx, bandIdx: null, values: r.values });
      });
    } else {
      currentTier.rows.forEach((r, idx) => {
        matrixRows.push({
          label: r.label,
          isBase: r.label === "Base Price",
          rowIdx: idx,
          bandIdx: null,
          values: r.values,
        });
      });
    }
  }

  const renderCell = (mr: MatrixRow, termIdx: number) => {
    const raw = mr.values[termIdx];
    const key = cellKey(activeTier, mr.bandIdx, mr.rowIdx, termIdx);
    const customRetail = retailMap[key];

    if (isNA(raw)) {
      return <span className="text-muted-foreground/40 text-sm">—</span>;
    }
    if (isIncluded(raw)) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-[10px]">
          Included
        </Badge>
      );
    }
    if (!isNumericCost(raw)) {
      return <span className="text-sm">{String(raw)}</span>;
    }

    const cost = raw;
    const suggested = customRetail ?? Math.round(cost * 1.4);
    const hasCustom = customRetail != null;
    const markupPct = cost > 0 ? ((suggested - cost) / cost) * 100 : 0;
    const isEditing = editingCell === key;

    return (
      <div className="flex flex-col gap-1 min-w-[120px]">
        <span className="text-[11px] text-muted-foreground">Cost {fmt(cost)}</span>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                type="number"
                className="w-24 h-7 pl-5 text-xs"
                value={draftValue}
                autoFocus
                onChange={(e) => setDraftValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const n = parseFloat(draftValue);
                    if (!isNaN(n)) saveCell(key, n);
                  } else if (e.key === "Escape") {
                    setEditingCell(null);
                  }
                }}
              />
            </div>
            <Button
              size="icon" variant="ghost" className="h-6 w-6"
              disabled={savingKey === key}
              onClick={() => {
                const n = parseFloat(draftValue);
                if (!isNaN(n)) saveCell(key, n);
              }}
            >
              <Check className="w-3.5 h-3.5 text-green-600" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingCell(null)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-sm font-semibold",
                hasCustom ? "text-primary" : "text-muted-foreground/60 italic",
              )}
            >
              {fmt(suggested)}
            </span>
            <Badge
              variant={hasCustom ? "default" : "secondary"}
              className={cn(
                "text-[9px] px-1 py-0 h-4",
                hasCustom && "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
              )}
            >
              {markupPct >= 0 ? "+" : ""}{markupPct.toFixed(0)}%
            </Badge>
            {isAdmin && (
              <Button
                size="icon" variant="ghost" className="h-6 w-6 opacity-60 hover:opacity-100"
                onClick={() => {
                  setEditingCell(key);
                  setDraftValue(suggested.toString());
                }}
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
            {isAdmin && hasCustom && (
              <Button
                size="icon" variant="ghost" className="h-6 w-6 opacity-40 hover:opacity-100"
                onClick={() => clearCell(key)}
                title="Clear custom price"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Configuration">
      <div className="space-y-6 max-w-[1600px] mx-auto">

        {/* Header */}
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
                    Mark up dealer cost to your retail price for every base term and add-on.
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
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

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* Plans list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Plans ({filteredProducts.length})
            </p>
            <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const s = extractStructured(p.pricing);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p.id)}
                    className={cn(
                      "w-full text-left rounded-xl px-4 py-3 transition-all duration-150 hover:bg-muted/60",
                      selectedProduct === p.id
                        ? "bg-primary/10 border border-primary/30 shadow-sm"
                        : "bg-card border border-transparent",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{displayName(p)}</p>
                        <p className="text-xs text-muted-foreground truncate">{typeLabel(p.type)}</p>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 shrink-0",
                        selectedProduct === p.id ? "text-primary" : "text-muted-foreground/40",
                      )} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {providers[p.provider_id] || "Unknown"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {s.tiers.length} tier{s.tiers.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </button>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No products found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: detail */}
          <div className="space-y-5 min-w-0">
            {!selectedProductData ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium">Select a plan to configure pricing</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Plan header */}
                <Card>
                  <CardContent className="py-5 px-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold">{displayName(selectedProductData)}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {typeLabel(selectedProductData.type)} • {providers[selectedProductData.provider_id] || "Unknown Provider"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedProductData.eligibility_rules?.eligibility && (
                            <Badge variant="outline" className="font-normal">
                              {selectedProductData.eligibility_rules.eligibility}
                            </Badge>
                          )}
                          <Badge variant="outline" className="font-normal">
                            {structured.tiers.length} tier{structured.tiers.length === 1 ? "" : "s"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tier tabs */}
                {structured.tiers.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No pricing configured for this plan yet.
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-4 px-4 sm:px-6 space-y-4">
                      <Tabs
                        value={activeTier.toString()}
                        onValueChange={(v) => { setActiveTier(parseInt(v, 10)); setActiveBand(0); setEditingCell(null); }}
                      >
                        <TabsList className="flex-wrap h-auto">
                          {structured.tiers.map((t, i) => (
                            <TabsTrigger key={i} value={i.toString()} className="text-xs sm:text-sm">
                              {t.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>

                      {currentTier && (
                        <>
                          {/* Tier metadata + bulk action */}
                          <div className="flex flex-wrap items-center gap-2 justify-between">
                            <div className="flex flex-wrap gap-2">
                              {currentTier.perClaimAmount != null && (
                                <Badge variant="secondary">Per Claim: {fmt(currentTier.perClaimAmount)}</Badge>
                              )}
                              {currentTier.deductible != null && (
                                <Badge variant="secondary">
                                  Deductible: {currentTier.deductible === 0 ? "None" : fmt(currentTier.deductible)}
                                </Badge>
                              )}
                              <Badge variant="outline">{currentTier.terms.length} terms</Badge>
                              {hasBands && (
                                <Badge variant="outline">{currentTier.mileageBands!.length} mileage bands</Badge>
                              )}
                            </div>
                            {isAdmin && (
                              <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-1.5 border">
                                <Zap className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-medium whitespace-nowrap">Bulk markup</span>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={bulkPercent}
                                    onChange={(e) => setBulkPercent(e.target.value)}
                                    className="w-16 h-7 pr-5 text-xs"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                </div>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={applyBulkMarkupToTier}>
                                  Apply to empty
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Mileage band selector */}
                          {hasBands && currentTier.mileageBands && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Mileage Band
                              </span>
                              <Tabs
                                value={activeBand.toString()}
                                onValueChange={(v) => { setActiveBand(parseInt(v, 10)); setEditingCell(null); }}
                              >
                                <TabsList className="flex-wrap h-auto">
                                  {currentTier.mileageBands.map((b, i) => (
                                    <TabsTrigger key={i} value={i.toString()} className="text-xs">
                                      {b.label}
                                    </TabsTrigger>
                                  ))}
                                </TabsList>
                              </Tabs>
                            </div>
                          )}

                          {/* Pricing matrix */}
                          <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/40 sticky top-0">
                                <tr>
                                  <th className="text-left px-3 py-2 font-semibold sticky left-0 bg-muted/40 z-10 min-w-[180px]">
                                    Coverage / Add-on
                                  </th>
                                  {currentTier.terms.map((term, i) => (
                                    <th key={i} className="text-left px-3 py-2 font-semibold whitespace-nowrap">
                                      <div className="text-xs">{term.label}</div>
                                      <div className="text-[10px] text-muted-foreground font-normal">{term.km}</div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {matrixRows.map((mr, rIdx) => (
                                  <tr
                                    key={`${mr.rowIdx}-${mr.bandIdx ?? "x"}`}
                                    className={cn(
                                      "border-t",
                                      mr.isBase && "bg-primary/5",
                                      rIdx % 2 === 1 && !mr.isBase && "bg-muted/20",
                                    )}
                                  >
                                    <td className="px-3 py-2 font-medium sticky left-0 bg-inherit z-10">
                                      <div className="flex items-center gap-2">
                                        {mr.isBase && (
                                          <Badge className="bg-primary/15 text-primary hover:bg-primary/15 text-[9px] px-1 py-0 h-4">
                                            BASE
                                          </Badge>
                                        )}
                                        <span className={cn(mr.isBase && "font-bold")}>{mr.label}</span>
                                      </div>
                                    </td>
                                    {currentTier.terms.map((_t, tIdx) => (
                                      <td key={tIdx} className="px-3 py-2 align-top">
                                        {renderCell(mr, tIdx)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            Tip: Click the pencil icon on any cell to set a custom retail price. Greyed values are the suggested 40% markup —
                            customers only see your saved retail.
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
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
