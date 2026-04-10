import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RotateCcw,
  Car,
  Shield,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Check,
} from "lucide-react";
import PlanCard from "@/components/brochure/PlanCard";
import { getGroupedPlans, getPlansByGroup } from "@/data/warrantyPlans";
import { tireRimTiers } from "@/data/tireRimPlans";

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

const PROVIDERS = [
  { key: "A-Protect", active: true },
  { key: "Peoples Choice", active: false },
  { key: "Global Warranty", active: false },
  { key: "LGM", active: false },
];

const FindProducts = () => {
  const navigate = useNavigate();
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [selectedProvider, setSelectedProvider] = useState("A-Protect");
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDecode = () => setVehicleInfo(mockDecodeVin(vin));
  const handleReset = () => { setVin(""); setMileage(""); setLoanAmount(""); setVehicleInfo(null); };

  const toggleCompare = (slug: string) => {
    setCompareSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : prev.length < 3 ? [...prev, slug] : prev
    );
  };

  const plans = useMemo(() => {
    const allPlans = getGroupedPlans(selectedProvider);
    if (!searchQuery.trim()) return allPlans;
    const q = searchQuery.toLowerCase();
    return allPlans.filter(p => p.name.toLowerCase().includes(q) || p.tier?.toLowerCase().includes(q));
  }, [selectedProvider, searchQuery]);

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Find Products">
      <div className="space-y-6">
        {/* VIN Decode Bar */}
        <Card>
          <CardHeader className="pb-3">
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
                <Input id="mileage" type="number" placeholder="e.g. 45000" value={mileage} onChange={(e) => setMileage(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="loan" className="text-xs text-muted-foreground">Loan Amount ($)</Label>
                <Input id="loan" type="number" placeholder="For GAP calculations" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
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

        {/* Provider Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {PROVIDERS.map(prov => (
              <button
                key={prov.key}
                onClick={() => prov.active && setSelectedProvider(prov.key)}
                disabled={!prov.active}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedProvider === prov.key
                    ? "bg-primary text-primary-foreground"
                    : prov.active
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                {prov.key}
                {!prov.active && (
                  <span className="ml-1.5 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">Soon</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 h-9"
            />
            <Button asChild variant="outline" size="sm">
              <Link to="/brochure/compare">
                <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Compare All
              </Link>
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {selectedProvider} Warranty Plans
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {plans.length} plans available · Select up to 3 to compare
              </p>
            </div>
          </div>

          {plans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No plans match your search.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {plans.map(plan => {
                const groupPlans = plan.group ? getPlansByGroup(plan.group) : null;
                return (
                  <PlanCard
                    key={plan.slug}
                    plan={plan}
                    groupPlans={groupPlans}
                    isSelected={compareSlugs.includes(plan.slug)}
                    onToggleCompare={toggleCompare}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Tire & Rim Section */}
        <div className="border-t pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Tire & Rim Protection
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                3 tiers of protection for vehicles 10 years or newer
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/brochure/tire-rim">View All Details <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {tireRimTiers.map(tier => {
              const minPrice = Math.min(...tier.pricing.map(p => p.class1));
              const maxPrice = Math.max(...tier.pricing.map(p => p.class3));
              return (
                <div
                  key={tier.slug}
                  className={`rounded-lg border bg-card p-5 space-y-3 relative transition-all hover:shadow-md ${
                    tier.bestValue ? "ring-2 ring-accent shadow-lg" : "hover:border-primary/30"
                  }`}
                >
                  {tier.bestValue && (
                    <Badge className="absolute -top-2.5 right-4 bg-accent text-[#0f1b3d] font-semibold">
                      Best Value
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-display font-bold text-foreground">{tier.name}</h3>
                  </div>

                  <ul className="space-y-1.5">
                    {tier.includes.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Starting from</p>
                    <p className="font-display font-bold text-xl text-primary">${minPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Range: ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}
                    </p>
                  </div>

                  <Button asChild size="sm" className="w-full gap-1">
                    <Link to={`/brochure/tire-rim?tier=${tier.slug}`}>
                      View Details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating compare button */}
        {compareSlugs.length >= 2 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Button asChild size="lg" className="shadow-xl bg-accent text-[#0f1b3d] hover:bg-accent/90 font-semibold gap-2">
              <Link to={`/brochure/compare?plans=${compareSlugs.join(",")}`}>
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
