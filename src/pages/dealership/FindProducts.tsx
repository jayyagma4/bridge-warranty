import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  RotateCcw,
  Car,
  Shield,
  DollarSign,
  Clock,
  Filter,
  X,
  BarChart3,
  ChevronRight,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface VehicleInfo {
  year: number;
  make: string;
  model: string;
  trim: string;
  powertrain: string;
}

const mockDecodeVin = (vin: string): VehicleInfo | null => {
  if (vin.length < 5) return null;
  return {
    year: 2022,
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    powertrain: "2.5L 4-Cylinder",
  };
};

const FindProducts = () => {
  const navigate = useNavigate();
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("price-asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<any | null>(null);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products-find"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["providers-find"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("status", "approved");
      if (error) throw error;
      return data;
    },
  });

  const providerMap = useMemo(() => {
    const map: Record<string, { company_name: string; logo_url: string | null }> = {};
    providers.forEach((p) => {
      map[p.id] = { company_name: p.company_name, logo_url: p.logo_url };
    });
    return map;
  }, [providers]);

  const productTypes = useMemo(() => {
    const types = new Set(products.map((p) => p.type));
    return Array.from(types);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (filterType !== "all") result = result.filter((p) => p.type === filterType);
    if (filterProvider !== "all") result = result.filter((p) => p.provider_id === filterProvider);
    result.sort((a, b) => {
      const priceA = (a.pricing as any)?.dealer_cost ?? (a.pricing as any)?.price ?? 0;
      const priceB = (b.pricing as any)?.dealer_cost ?? (b.pricing as any)?.price ?? 0;
      return sortBy === "price-desc" ? priceB - priceA : priceA - priceB;
    });
    return result;
  }, [products, filterType, filterProvider, sortBy]);

  const groupedByProvider = useMemo(() => {
    const groups: Record<string, typeof filteredProducts> = {};
    filteredProducts.forEach((p) => {
      if (!groups[p.provider_id]) groups[p.provider_id] = [];
      groups[p.provider_id].push(p);
    });
    return groups;
  }, [filteredProducts]);

  const activeFilters = [
    filterType !== "all" && { label: `Type: ${filterType}`, clear: () => setFilterType("all") },
    filterProvider !== "all" && {
      label: `Provider: ${providerMap[filterProvider]?.company_name || filterProvider}`,
      clear: () => setFilterProvider("all"),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const handleDecode = () => {
    const info = mockDecodeVin(vin);
    setVehicleInfo(info);
  };

  const handleReset = () => {
    setVin("");
    setMileage("");
    setLoanAmount("");
    setVehicleInfo(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedProducts = products.filter((p) => selectedIds.has(p.id));

  const getPrice = (p: any) => (p.pricing as any)?.dealer_cost ?? (p.pricing as any)?.price ?? "N/A";
  const getDeductible = (p: any) => (p.pricing as any)?.deductible ?? "N/A";
  const getDuration = (p: any) => (p.coverage_details as any)?.duration_months ?? "N/A";
  const getMaxKm = (p: any) => (p.coverage_details as any)?.max_km ?? (p.coverage_details as any)?.max_mileage ?? "N/A";
  const getCoverage = (p: any) => (p.coverage_details as any)?.coverage_type ?? p.type;

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Find Products">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Vehicle & Deal Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                Vehicle & Deal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
                <div>
                  <Label htmlFor="vin" className="text-xs text-muted-foreground">VIN Number</Label>
                  <Input
                    id="vin"
                    placeholder="Enter 17-character VIN"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    maxLength={17}
                    className="font-mono tracking-wider"
                  />
                </div>
                <Button onClick={handleDecode} disabled={vin.length < 5} size="sm" className="gap-1.5">
                  <Search className="w-3.5 h-3.5" /> Decode
                </Button>
                <Button onClick={handleReset} variant="outline" size="sm" className="gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="mileage" className="text-xs text-muted-foreground">Vehicle Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="e.g. 45000"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="loan" className="text-xs text-muted-foreground">Loan Amount ($)</Label>
                  <Input
                    id="loan"
                    type="number"
                    placeholder="For GAP calculations"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Summary */}
          {vehicleInfo && (
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Car className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                    </p>
                    <p className="text-xs text-muted-foreground">{vehicleInfo.trim} · {vehicleInfo.powertrain}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { label: "Year", value: vehicleInfo.year },
                    { label: "Make", value: vehicleInfo.make },
                    { label: "Model", value: vehicleInfo.model },
                    { label: "Mileage", value: mileage ? `${Number(mileage).toLocaleString()} km` : "—" },
                  ].map((item) => (
                    <div key={item.label} className="bg-card rounded-md p-2 border border-border">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products grouped by provider */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Eligible Products
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredProducts.length} plans found)
                </span>
              </h2>
              {selectedIds.size >= 2 && (
                <Button size="sm" onClick={() => setCompareOpen(true)} className="gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Compare ({selectedIds.size})
                </Button>
              )}
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : Object.keys(groupedByProvider).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No products match your filters.</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedByProvider).map(([providerId, plans]) => (
                <Card key={providerId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {providerMap[providerId]?.company_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <CardTitle className="text-sm">
                            {providerMap[providerId]?.company_name || "Unknown Provider"}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">{plans.length} plan{plans.length > 1 ? "s" : ""} available</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {plans.map((product) => {
                        const isSelected = selectedIds.has(product.id);
                        return (
                          <div
                            key={product.id}
                            className={cn(
                              "relative rounded-lg border p-4 transition-all cursor-pointer hover:shadow-md",
                              isSelected
                                ? "border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/20"
                                : "border-border hover:border-primary/30"
                            )}
                            onClick={() => toggleSelect(product.id)}
                          >
                            <div className="absolute top-3 right-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelect(product.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <Badge variant="secondary" className="text-[10px] mb-2">
                              {product.type}
                            </Badge>
                            <h4 className="text-sm font-semibold text-foreground mb-3 pr-6">{product.name}</h4>
                            <div className="space-y-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-primary/60" />
                                <span>{getDuration(product)} months / {getMaxKm(product) !== "N/A" ? `${Number(getMaxKm(product)).toLocaleString()} km` : "Unlimited"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-primary/60" />
                                <span>${getDeductible(product)} deductible</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Gauge className="w-3.5 h-3.5 text-primary/60" />
                                <span>{getCoverage(product)}</span>
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                              <p className="text-lg font-bold text-foreground">${Number(getPrice(product)).toLocaleString()}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs gap-1 text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/dealership/product-coverage/${product.id}`);
                                }}
                              >
                                Coverage <ChevronRight className="w-3 h-3" />
                              </Button>
                                  setViewProduct(product);
                                }}
                              >
                                View <ChevronRight className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right column — Filters */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Filters & Sorting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Product Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {productTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Provider</Label>
                <Select value={filterProvider} onValueChange={setFilterProvider}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All providers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.company_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {activeFilters.length > 0 && (
            <Card>
              <CardContent className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Active Filters</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => { setFilterType("all"); setFilterProvider("all"); }}
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeFilters.map((f) => (
                    <Badge key={f.label} variant="outline" className="text-xs gap-1 pr-1">
                      {f.label}
                      <button onClick={f.clear} className="ml-0.5 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedIds.size > 0 && (
            <Card className="border-primary/30 bg-primary/[0.02]">
              <CardContent className="py-4 text-center">
                <p className="text-sm font-medium text-foreground mb-2">
                  {selectedIds.size} product{selectedIds.size > 1 ? "s" : ""} selected
                </p>
                {selectedIds.size >= 2 ? (
                  <Button size="sm" className="w-full gap-1.5" onClick={() => setCompareOpen(true)}>
                    <BarChart3 className="w-3.5 h-3.5" />
                    Compare Plans
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">Select at least 2 to compare</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Compare Sheet */}
      <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Plan Comparison ({selectedProducts.length} products)
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(80vh-100px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px] text-xs">Feature</TableHead>
                  {selectedProducts.map((p) => (
                    <TableHead key={p.id} className="text-xs min-w-[180px]">
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="font-normal text-muted-foreground">
                          {providerMap[p.provider_id]?.company_name}
                        </p>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { label: "Type", fn: (p: any) => p.type },
                  { label: "Coverage", fn: getCoverage },
                  { label: "Duration", fn: (p: any) => `${getDuration(p)} months` },
                  { label: "Max Mileage", fn: (p: any) => getMaxKm(p) !== "N/A" ? `${Number(getMaxKm(p)).toLocaleString()} km` : "Unlimited" },
                  { label: "Deductible", fn: (p: any) => `$${getDeductible(p)}` },
                  { label: "Dealer Cost", fn: (p: any) => `$${Number(getPrice(p)).toLocaleString()}` },
                  { label: "Description", fn: (p: any) => p.description || "—" },
                ].map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium text-xs text-muted-foreground">{row.label}</TableCell>
                    {selectedProducts.map((p) => (
                      <TableCell key={p.id} className="text-sm">{row.fn(p)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* View Product Sheet */}
      <Sheet open={!!viewProduct} onOpenChange={() => setViewProduct(null)}>
        <SheetContent>
          {viewProduct && (
            <>
              <SheetHeader>
                <SheetTitle>{viewProduct.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Provider</p>
                  <p className="text-sm font-medium">{providerMap[viewProduct.provider_id]?.company_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
                  <Badge variant="secondary">{viewProduct.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Description</p>
                  <p className="text-sm">{viewProduct.description || "No description available."}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Duration", value: `${getDuration(viewProduct)} months` },
                    { label: "Max KM", value: getMaxKm(viewProduct) !== "N/A" ? `${Number(getMaxKm(viewProduct)).toLocaleString()} km` : "Unlimited" },
                    { label: "Deductible", value: `$${getDeductible(viewProduct)}` },
                    { label: "Dealer Cost", value: `$${Number(getPrice(viewProduct)).toLocaleString()}` },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/50 rounded-md p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-bold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default FindProducts;
