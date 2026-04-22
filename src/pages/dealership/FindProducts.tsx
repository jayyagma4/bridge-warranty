import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search, RotateCcw, Car, Shield, ArrowRight, BarChart3,
  ChevronRight, Check, ShoppingCart, Loader2,
} from "lucide-react";
import { fetchProducts, dbToDisplayList, getGroupedDisplayProducts, getProductsByGroup, type DisplayProduct } from "@/lib/productService";
import { fetchDealershipPricing, applyRetailOverlay, hasAnyRetail } from "@/lib/dealershipPricing";
import { useDealership } from "@/hooks/useDealership";
import PlanCard from "@/components/brochure/PlanCard";

interface VehicleInfo {
  year: number;
  make: string;
  model: string;
  trim: string;
  powertrain: string;
}

const mockDecodeVin = (vin: string): VehicleInfo | null => {
  if (vin.length < 5) return null;
  return { year: 2022, make: "Toyota", model: "Camry", trim: "SE", powertrain: "2.5L 4-Cylinder" };
};

const FindProducts = () => {
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [showingRetail, setShowingRetail] = useState(false);
  const { dealershipId } = useDealership();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProducts();
        const { confidentialityEnabled, byProductId } = await fetchDealershipPricing(dealershipId);
        setShowingRetail(confidentialityEnabled);

        let processed = data;
        if (confidentialityEnabled) {
          // Only products with at least one configured retail price; overlay retail values
          processed = data
            .filter((p) => hasAnyRetail(byProductId[p.id]))
            .map((p) => applyRetailOverlay(p, byProductId[p.id]));
        }

        const display = dbToDisplayList(processed);
        setAllProducts(display);

        // Extract unique providers
        const provs = [...new Set(display.map(p => p.provider))].sort();
        setProviders(provs);
        if (provs.length > 0) setSelectedProvider(provs[0]);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dealershipId]);

  const handleDecode = () => setVehicleInfo(mockDecodeVin(vin));
  const handleReset = () => { setVin(""); setMileage(""); setLoanAmount(""); setVehicleInfo(null); };

  const toggleCompare = (slug: string) => {
    setCompareSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : prev.length < 3 ? [...prev, slug] : prev
    );
  };

  const filterByType = (type: string, group = true) => {
    const providerProducts = allProducts.filter(p => p.provider === selectedProvider && p.type === type && p.status === "active");
    const result = group ? getGroupedDisplayProducts(providerProducts) : providerProducts;
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(p => p.name.toLowerCase().includes(q));
  };

  const warrantyProducts = useMemo(() => filterByType("VSC"), [allProducts, selectedProvider, searchQuery]);
  const tireRimProducts = useMemo(() => filterByType("Tire & Rim", false), [allProducts, selectedProvider, searchQuery]);
  const ppfProducts = useMemo(() => filterByType("PPF", false), [allProducts, selectedProvider, searchQuery]);
  const ceramicProducts = useMemo(() => filterByType("Ceramic Coating", false), [allProducts, selectedProvider, searchQuery]);

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Find Products">
      <div className="-m-6">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[hsl(225,80%,15%)] via-[hsl(225,70%,20%)] to-[hsl(225,60%,25%)] text-white">
          <div className="px-6 md:px-8 py-10 md:py-14">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-accent/20 text-accent border-accent/30">Dealer Product Finder</Badge>
                <Badge
                  className={
                    showingRetail
                      ? "bg-accent text-[#0f1b3d] border-transparent"
                      : "bg-white/10 text-white border-white/30"
                  }
                >
                  Showing: {showingRetail ? "Retail" : "Dealer Cost"}
                </Badge>
              </div>
              <h1 className="font-display text-2xl md:text-4xl font-bold leading-tight">
                Browse & Quote<br />
                <span className="text-accent">Warranty Plans</span>
              </h1>
              <p className="text-white/60 mt-3 text-base max-w-lg">
                Decode a vehicle, browse coverage options, compare plans, and generate print-ready quotes — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button asChild size="lg" className="bg-accent text-[#0f1b3d] hover:bg-accent/90 font-semibold">
                  <a href="#vin-bar"><Car className="mr-1.5 h-4 w-4" /> Start with VIN</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                  <Link to="/dealership/compare"><BarChart3 className="mr-1.5 h-4 w-4" /> Compare All Plans</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                  <Link to="/purchase"><ShoppingCart className="mr-1.5 h-4 w-4" /> New Quote</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* VIN Decode Bar */}
        <section id="vin-bar" className="bg-card border-b border-border">
          <div className="px-6 md:px-8 py-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-display font-bold text-foreground">Vehicle & Deal Information</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 items-end">
              <div>
                <Label htmlFor="vin" className="text-xs text-muted-foreground">VIN Number</Label>
                <Input id="vin" placeholder="Enter 17-character VIN" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} maxLength={17} className="font-mono tracking-wider" />
              </div>
              <Button onClick={handleDecode} disabled={vin.length < 5} size="sm" className="gap-1.5">
                <Search className="w-3.5 h-3.5" /> Decode
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm" className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label htmlFor="mileage" className="text-xs text-muted-foreground">Vehicle Mileage (km)</Label>
                <Input id="mileage" type="number" placeholder="e.g. 45000" value={mileage} onChange={(e) => setMileage(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="loan" className="text-xs text-muted-foreground">Loan Amount ($)</Label>
                <Input id="loan" type="number" placeholder="For GAP calculations" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* Vehicle Summary */}
        {vehicleInfo && (
          <section className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-primary/20">
            <div className="px-6 md:px-8 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-foreground">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
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
                  <div key={item.label} className="bg-card rounded-lg p-3 border border-border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Provider selector */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-6 md:px-8">
            <div className="flex items-center justify-between gap-3 py-2 overflow-x-auto">
              <div className="flex items-center gap-1">
                {providers.map(prov => (
                  <button
                    key={prov}
                    onClick={() => setSelectedProvider(prov)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedProvider === prov
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search plans..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-44 h-8 pl-8 text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid — show VSC section only if there are VSC products */}
        {warrantyProducts.length > 0 && (
        <section className="px-6 md:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {selectedProvider} Warranty Plans
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {warrantyProducts.length} plans available · Select up to 3 to compare
              </p>
            </div>
          </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {warrantyProducts.map(plan => {
                const groupPlans = plan.group ? getProductsByGroup(allProducts.filter(p => p.provider === selectedProvider), plan.group) : null;
                const planForCard = {
                  name: plan.name,
                  slug: plan.slug,
                  provider: plan.provider,
                  tier: plan.tier,
                  group: plan.group,
                  eligibility: plan.eligibility,
                  claimRange: plan.claimRange,
                  deductible: plan.deductible,
                  premiumFees: plan.premiumFees,
                  highlights: plan.highlights,
                  includedCoverage: plan.includedCoverage,
                  coverageDetails: plan.coverageDetails,
                  benefits: plan.benefits,
                  pricingTiers: plan.pricingTiers,
                  salesTag: plan.salesTag,
                };
                return (
                  <PlanCard
                    key={plan.slug}
                    plan={planForCard as any}
                    groupPlans={groupPlans as any}
                    isSelected={compareSlugs.includes(plan.slug)}
                    onToggleCompare={toggleCompare}
                    basePath="/dealership/plans"
                  />
                );
              })}
            </div>
        </section>
        )}

        {/* PPF Section */}
        {ppfProducts.length > 0 && (
          <section className="bg-muted/30 border-t">
            <div className="px-6 md:px-8 py-10">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground">Paint Protection Film</h2>
                <p className="text-sm text-muted-foreground mt-1">{ppfProducts.length} packages available</p>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {ppfProducts.map(product => {
                  const startingPrice = product.pricingTiers?.[0]?.rows?.[0]?.values?.[0];
                  return (
                    <div key={product.slug} className="rounded-xl border bg-card p-6 space-y-4 hover:shadow-lg transition-all hover:border-primary/30">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="font-display font-bold text-lg text-foreground">{product.name}</h3>
                      </div>
                      {product.tier && (
                        <Badge variant="outline" className="text-xs">{product.group}</Badge>
                      )}
                      <ul className="space-y-1.5">
                        {(product.includedCoverage || []).slice(0, 5).map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                      {startingPrice != null && (
                        <div className="pt-3 border-t border-border/50">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Starting from</p>
                          <p className="font-display font-bold text-2xl text-primary">${Number(startingPrice).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Ceramic Coating Section */}
        {ceramicProducts.length > 0 && (
          <section className="border-t">
            <div className="px-6 md:px-8 py-10">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground">Ceramic Coating</h2>
                <p className="text-sm text-muted-foreground mt-1">{ceramicProducts.length} tiers available</p>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {ceramicProducts.map(product => {
                  const startingPrice = product.pricingTiers?.[0]?.rows?.[0]?.values?.[0];
                  const warranty = (product as any).eligibility || "";
                  return (
                    <div key={product.slug} className="rounded-xl border bg-card p-6 space-y-4 hover:shadow-lg transition-all hover:border-primary/30">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="font-display font-bold text-lg text-foreground">{product.name}</h3>
                      </div>
                      {product.tier && (
                        <Badge variant="outline" className="text-xs">{product.group}</Badge>
                      )}
                      <ul className="space-y-1.5">
                        {(product.includedCoverage || []).slice(0, 4).map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Starting from</p>
                        {startingPrice != null ? (
                          <p className="font-display font-bold text-2xl text-primary">${Number(startingPrice).toLocaleString()}</p>
                        ) : (
                          <p className="font-display font-bold text-lg text-muted-foreground">Contact for Pricing</p>
                        )}
                        {warranty && <p className="text-[10px] text-muted-foreground">Warranty: {warranty}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Show empty state only if NO products at all for this provider */}
        {!loading && warrantyProducts.length === 0 && tireRimProducts.length === 0 && ppfProducts.length === 0 && ceramicProducts.length === 0 && (
          <section className="px-6 md:px-8 py-8">
            <div className="rounded-xl border bg-card py-16 text-center">
              <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No products match your search.</p>
            </div>
          </section>
        )}

        {/* Tire & Rim Section */}
        {tireRimProducts.length > 0 && (
          <section className="bg-muted/30 border-t">
            <div className="px-6 md:px-8 py-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Tire & Rim Protection</h2>
                  <p className="text-sm text-muted-foreground mt-1">{tireRimProducts.length} tiers of protection for vehicles 10 years or newer</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dealership/tire-rim">View All Details <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                {tireRimProducts.map(tier => {
                  const pr = tier.pricingTiers?.[0] as any;
                  const pricing = pr?.pricing || [];
                  const minPrice = pricing.length > 0 ? Math.min(...pricing.map((p: any) => p.class1)) : 0;
                  const maxPrice = pricing.length > 0 ? Math.max(...pricing.map((p: any) => p.class3)) : 0;
                  return (
                    <div
                      key={tier.slug}
                      className={`rounded-xl border bg-card p-6 space-y-4 relative transition-all hover:shadow-lg ${
                        tier.bestValue ? "ring-2 ring-accent shadow-lg" : "hover:border-primary/30"
                      }`}
                    >
                      {tier.bestValue && (
                        <Badge className="absolute -top-2.5 right-4 bg-accent text-[#0f1b3d] font-semibold">Best Value</Badge>
                      )}
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="font-display font-bold text-lg text-foreground">{tier.name}</h3>
                      </div>

                      <ul className="space-y-1.5">
                        {(tier.includes || []).map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {item}
                          </li>
                        ))}
                      </ul>

                      <div className="pt-3 border-t border-border/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Starting from</p>
                        <p className="font-display font-bold text-2xl text-primary">${minPrice.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Range: ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}</p>
                      </div>

                      <Button asChild size="sm" className="w-full gap-1">
                        <Link to={`/dealership/tire-rim?tier=${tier.slug}`}>View Details <ChevronRight className="h-3.5 w-3.5" /></Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Floating compare button */}
        {compareSlugs.length >= 2 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Button asChild size="lg" className="shadow-xl bg-accent text-[#0f1b3d] hover:bg-accent/90 font-semibold gap-2">
              <Link to={`/dealership/compare?plans=${compareSlugs.join(",")}`}>
                <BarChart3 className="h-4 w-4" />
                Compare {compareSlugs.length} Plans
              </Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FindProducts;
