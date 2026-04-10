import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Shield, Wrench, ChevronDown, DollarSign, Clock, Gauge } from "lucide-react";
import BrochureHeader from "@/components/brochure/BrochureHeader";
import CoverageAccordion from "@/components/brochure/CoverageAccordion";
import PricingTable from "@/components/brochure/PricingTable";
import BenefitsSection from "@/components/brochure/BenefitsSection";
import { getPlanBySlug } from "@/data/warrantyPlans";
import { useState } from "react";

const PlanDetail = () => {
  const { planSlug } = useParams<{ planSlug: string }>();
  const plan = getPlanBySlug(planSlug || "");
  const [activeSection, setActiveSection] = useState<"overview" | "coverage" | "pricing" | "benefits">("overview");

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <BrochureHeader />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground">Plan not found</h1>
          <Button asChild variant="link" className="mt-4">
            <Link to="/brochure">← Back to all plans</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasPricing = plan.pricingTiers.length > 0;

  // Calculate price range from all tiers
  const allBasePrices: number[] = [];
  plan.pricingTiers.forEach(tier => {
    // Check mileage bands first (Diamond Plus style)
    if (tier.mileageBands) {
      tier.mileageBands.forEach(band => {
        band.values.forEach(v => allBasePrices.push(v));
      });
    } else {
      const baseRow = tier.rows.find(r => r.label === "Base Price");
      if (baseRow) {
        baseRow.values.forEach(v => {
          if (typeof v === "number") allBasePrices.push(v);
        });
      }
    }
  });
  const minPrice = allBasePrices.length > 0 ? Math.min(...allBasePrices) : null;
  const maxPrice = allBasePrices.length > 0 ? Math.max(...allBasePrices) : null;

  // Count total term options across all tiers
  const totalTermOptions = plan.pricingTiers.reduce((sum, t) => sum + t.terms.length, 0);

  const sections = [
    { key: "overview" as const, label: "Overview" },
    { key: "coverage" as const, label: "What's Covered" },
    ...(hasPricing ? [{ key: "pricing" as const, label: "Pricing & Options" }] : []),
    { key: "benefits" as const, label: "Benefits" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BrochureHeader />

      {/* Hero header */}
      <section className="pt-16 bg-gradient-to-br from-[hsl(var(--primary)/0.95)] via-[hsl(var(--primary)/0.85)] to-[hsl(var(--primary)/0.75)] text-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-6 -ml-2">
            <Link to="/brochure">
              <ArrowLeft className="mr-1 h-4 w-4" /> All Plans
            </Link>
          </Button>

          <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  {plan.provider}
                </Badge>
                {plan.tier && (
                  <Badge className="bg-white/10 text-white border-white/20">{plan.tier}</Badge>
                )}
                {!plan.premiumFees && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">$0 Premium Fees</Badge>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{plan.name}</h1>
              <p className="text-white/50 mt-2 text-sm">{plan.eligibility}</p>

              {/* Quick price summary */}
              {minPrice !== null && maxPrice !== null && (
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-accent font-display text-2xl font-bold">
                    ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}
                  </span>
                  <span className="text-white/40 text-sm">starting price range</span>
                </div>
              )}

              {/* Included coverage checklist */}
              <div className="mt-6">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Includes</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
                  {plan.includedCoverage.map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className="text-sm text-white/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right stats */}
            <div className="flex flex-wrap lg:flex-col gap-3">
              <div className="bg-white/10 rounded-lg px-5 py-3 min-w-[140px]">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Per Claim</p>
                <p className="font-bold text-accent text-lg">{plan.claimRange}</p>
              </div>
              <div className="bg-white/10 rounded-lg px-5 py-3 min-w-[140px]">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Deductible</p>
                <p className="font-bold text-white text-lg">{plan.deductible}</p>
              </div>
              {hasPricing && (
                <>
                  <div className="bg-white/10 rounded-lg px-5 py-3 min-w-[140px]">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Claim Tiers</p>
                    <p className="font-bold text-white text-lg">{plan.pricingTiers.length} options</p>
                  </div>
                  <div className="bg-white/10 rounded-lg px-5 py-3 min-w-[140px]">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Term Options</p>
                    <p className="font-bold text-white text-lg">{totalTermOptions} total</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section navigation */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-1 overflow-x-auto">
            {sections.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeSection === s.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeSection === "overview" && (
          <div className="space-y-8">
            {/* Pricing tier quick cards */}
            {hasPricing && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Available Options
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.pricingTiers.length} claim tier{plan.pricingTiers.length > 1 ? "s" : ""} available — click to see full pricing
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveSection("pricing")}>
                    View Full Pricing
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {plan.pricingTiers.map((tier, i) => {
                    // Get the price range for this tier
                    const tierPrices: number[] = [];
                    if (tier.mileageBands) {
                      tier.mileageBands.forEach(b => b.values.forEach(v => tierPrices.push(v)));
                    } else {
                      const baseRow = tier.rows.find(r => r.label === "Base Price");
                      baseRow?.values.forEach(v => { if (typeof v === "number") tierPrices.push(v); });
                    }
                    const tierMin = tierPrices.length > 0 ? Math.min(...tierPrices) : 0;
                    const tierMax = tierPrices.length > 0 ? Math.max(...tierPrices) : 0;
                    const addOnCount = tier.rows.filter(r => r.label !== "Base Price").length;

                    return (
                      <div
                        key={i}
                        className="rounded-xl border bg-card p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group"
                        onClick={() => setActiveSection("pricing")}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className="text-xs">
                            ${tier.deductible} Deductible
                          </Badge>
                          <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="font-display font-bold text-2xl text-foreground">
                          ${tier.perClaimAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Per Claim</p>
                        <div className="border-t mt-3 pt-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {tier.terms.length} term option{tier.terms.length > 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Gauge className="h-3 w-3" />
                            {tier.terms[0].km} – {tier.terms[tier.terms.length - 1].km} km
                          </div>
                          <p className="text-xs font-semibold text-primary mt-1">
                            From ${tierMin.toLocaleString()}
                            {tierMax !== tierMin && ` to $${tierMax.toLocaleString()}`}
                          </p>
                          {addOnCount > 0 && (
                            <p className="text-[10px] text-accent font-medium">
                              + {addOnCount} add-on option{addOnCount > 1 ? "s" : ""} available
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coverage summary cards */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Coverage Overview
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                This plan covers {plan.includedCoverage.length} component categories. Click "What's Covered" for detailed parts lists.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-foreground">Powertrain Coverage</h3>
                  </div>
                  <div className="space-y-2">
                    {plan.coverageDetails
                      .filter(c => ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger"].includes(c.name))
                      .map(cat => {
                        const isIncluded = plan.includedCoverage.some(c =>
                          c.toLowerCase().includes(cat.name.toLowerCase()) ||
                          cat.name.toLowerCase().includes(c.toLowerCase())
                        );
                        return (
                          <div key={cat.name} className="flex items-start gap-2">
                            {isIncluded ? (
                              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            ) : (
                              <span className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">—</span>
                            )}
                            <div>
                              <p className={`text-sm font-medium ${isIncluded ? "text-foreground" : "text-muted-foreground"}`}>
                                {cat.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{cat.parts.substring(0, 120)}…</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-accent" />
                    </div>
                    <h3 className="font-display font-bold text-foreground">Additional Coverage</h3>
                  </div>
                  <div className="space-y-2">
                    {plan.coverageDetails
                      .filter(c => !["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger"].includes(c.name))
                      .slice(0, 8)
                      .map(cat => {
                        const isIncluded = plan.includedCoverage.some(c =>
                          c.toLowerCase().includes(cat.name.toLowerCase()) ||
                          cat.name.toLowerCase().includes(c.toLowerCase())
                        );
                        return (
                          <div key={cat.name} className="flex items-start gap-2">
                            {isIncluded ? (
                              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            ) : (
                              <span className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">—</span>
                            )}
                            <div>
                              <p className={`text-sm font-medium ${isIncluded ? "text-foreground" : "text-muted-foreground"}`}>
                                {cat.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{cat.parts.substring(0, 80)}…</p>
                            </div>
                          </div>
                        );
                      })}
                    {plan.coverageDetails.filter(c => !["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger"].includes(c.name)).length > 8 && (
                      <button
                        onClick={() => setActiveSection("coverage")}
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-2"
                      >
                        View all coverage details <ChevronDown className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Included Benefits
                </h2>
                <Button variant="outline" size="sm" onClick={() => setActiveSection("benefits")}>
                  View All
                </Button>
              </div>
              <BenefitsSection benefits={plan.benefits} />
            </div>
          </div>
        )}

        {activeSection === "coverage" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                What's Covered
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Click any category below to see the full list of covered components and parts.
              </p>
              <CoverageAccordion
                categories={plan.coverageDetails}
                includedCoverage={plan.includedCoverage}
              />
            </div>
          </div>
        )}

        {activeSection === "pricing" && hasPricing && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Pricing & Options
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                All pricing tiers shown below. Base prices are highlighted — add-on options are listed beneath each tier.
              </p>
              <PricingTable plan={plan} />
            </div>
          </div>
        )}

        {activeSection === "benefits" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Included Benefits
              </h2>
              <BenefitsSection benefits={plan.benefits} />
            </div>

            {/* Free diagnostics callout */}
            <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">FREE Diagnostics Included</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive a free 20 min visual, scan and road test at an A-Protect Authorized Repair Centre. Pre-approval required. See Terms and Conditions for more information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanDetail;
