import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, BarChart3, ShoppingCart } from "lucide-react";
import BrochureHeader from "@/components/brochure/BrochureHeader";
import PlanCard from "@/components/brochure/PlanCard";
import { getGroupedPlans, getPlansByGroup } from "@/data/warrantyPlans";
import { tireRimTiers } from "@/data/tireRimPlans";

const PROVIDERS = [
  { key: "A-Protect", active: true },
  { key: "Peoples Choice", active: false },
  { key: "Global Warranty", active: false },
  { key: "LGM", active: false },
];

const BrochureHome = () => {
  const [selectedProvider, setSelectedProvider] = useState("A-Protect");
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);

  const toggleCompare = (slug: string) => {
    setCompareSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : prev.length < 3 ? [...prev, slug] : prev
    );
  };

  const plans = getGroupedPlans(selectedProvider);

  return (
    <div className="min-h-screen bg-background">
      <BrochureHeader />

      {/* Hero */}
      <section className="pt-16 bg-gradient-to-br from-[#0f1b3d] via-[#162554] to-[#1a3066] text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4">
              Digital Coverage Brochure
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Warranty Coverage
              <br />
              <span className="text-accent">Made Simple</span>
            </h1>
            <p className="text-white/60 mt-4 text-lg max-w-lg">
              Browse, compare and understand warranty plans from Canada's top providers. Built for dealerships and their customers.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button asChild size="lg" className="bg-accent text-[#0f1b3d] hover:bg-accent/90 font-semibold">
                <a href="#plans">
                  Browse Plans <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white bg-accent hover:bg-accent/90">
                <Link to="/purchase">
                  <ShoppingCart className="mr-1 h-4 w-4" /> Get a Quote
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                <Link to="/brochure/compare">
                  <BarChart3 className="mr-1 h-4 w-4" /> Compare Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Provider selector */}
      <div className="border-b bg-card/50 sticky top-16 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
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
        </div>
      </div>

      {/* Plans grid */}
      <section id="plans" className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {selectedProvider} Warranty Plans
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {plans.length} plans available · Select up to 3 to compare
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {plans.map(plan => {
            // For grouped plans, show the group info
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
      </section>

      {/* Tire & Rim section */}
      <section className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Tire & Rim Protection
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                3 tiers of protection for vehicles 10 years or newer
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/brochure/tire-rim">View All Details <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {tireRimTiers.map(tier => (
              <div
                key={tier.slug}
                className={`rounded-lg border bg-card p-5 space-y-3 relative ${
                  tier.bestValue ? "ring-2 ring-accent shadow-lg" : ""
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
                <ul className="space-y-1">
                  {tier.includes.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-foreground">
                  From ${Math.min(...tier.pricing.map(p => p.class1)).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
  );
};

export default BrochureHome;
