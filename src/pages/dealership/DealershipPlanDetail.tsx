import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Shield, Wrench, ChevronDown, DollarSign, Clock, Gauge } from "lucide-react";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import CoverageAccordion from "@/components/brochure/CoverageAccordion";
import PricingTable from "@/components/brochure/PricingTable";
import BenefitsSection from "@/components/brochure/BenefitsSection";
import FinePrintSection from "@/components/brochure/FinePrintSection";
import { getPlanBySlug, getPlansByGroup } from "@/data/warrantyPlans";
import { useState, useMemo } from "react";

const DealershipPlanDetail = () => {
  const { planSlug } = useParams<{ planSlug: string }>();
  const navigate = useNavigate();
  const plan = getPlanBySlug(planSlug || "");
  const [activeSection, setActiveSection] = useState<"overview" | "coverage" | "pricing" | "benefits" | "fine-print">("overview");

  const groupPlans = useMemo(() => {
    if (!plan?.group) return null;
    return getPlansByGroup(plan.group);
  }, [plan?.group]);

  const isGrouped = groupPlans && groupPlans.length > 1;

  if (!plan) {
    return (
      <DashboardLayout navItems={dealershipNavItems} title="Plan Details">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-foreground">Plan not found</h1>
          <Button asChild variant="link" className="mt-4">
            <Link to="/dealership/find-products">← Back to products</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hasPricing = plan.pricingTiers.length > 0;
  const groupName = isGrouped ? plan.name.replace(` ${plan.tier}`, "") : plan.name;

  const allBasePrices: number[] = [];
  plan.pricingTiers.forEach(tier => {
    if (tier.mileageBands) {
      tier.mileageBands.forEach(band => band.values.forEach(v => allBasePrices.push(v)));
    } else {
      const baseRow = tier.rows.find(r => r.label === "Base Price");
      if (baseRow) baseRow.values.forEach(v => { if (typeof v === "number") allBasePrices.push(v); });
    }
  });
  const minPrice = allBasePrices.length > 0 ? Math.min(...allBasePrices) : null;
  const maxPrice = allBasePrices.length > 0 ? Math.max(...allBasePrices) : null;
  const totalTermOptions = plan.pricingTiers.reduce((sum, t) => sum + t.terms.length, 0);

  const sections = [
    { key: "overview" as const, label: "Overview" },
    { key: "coverage" as const, label: "What's Covered" },
    ...(hasPricing ? [{ key: "pricing" as const, label: "Pricing & Options" }] : []),
    { key: "benefits" as const, label: "Benefits" },
    { key: "fine-print" as const, label: "Terms & Conditions" },
  ];

  return (
    <DashboardLayout navItems={dealershipNavItems} title={plan.name}>
      <div className="space-y-6">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/dealership/find-products">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Products
          </Link>
        </Button>

        {/* Hero card */}
        <div className="rounded-xl bg-gradient-to-br from-[hsl(225,80%,15%)] via-[hsl(225,70%,20%)] to-[hsl(225,60%,25%)] text-white p-6 md:p-8">
          <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-accent/20 text-accent border-accent/30">{plan.provider}</Badge>
                {plan.tier && !isGrouped && <Badge className="bg-white/10 text-white border-white/20">{plan.tier}</Badge>}
                {!plan.premiumFees && <Badge className="bg-green-500/20 text-green-300 border-green-500/30">$0 Premium Fees</Badge>}
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold">{isGrouped ? groupName : plan.name}</h1>

              {isGrouped && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {groupPlans.map(gp => {
                    const isActive = gp.slug === plan.slug;
                    return (
                      <button
                        key={gp.slug}
                        onClick={() => navigate(`/dealership/plans/${gp.slug}`, { replace: true })}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${
                          isActive
                            ? "bg-accent text-[#0f1b3d] border-accent shadow-lg shadow-accent/30 scale-105"
                            : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
                        }`}
                      >
                        <span className="block text-sm">{gp.tier}</span>
                        <span className={`block text-[10px] mt-0.5 font-medium ${isActive ? "text-[#0f1b3d]/70" : "text-white/50"}`}>{gp.claimRange}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-white/50 mt-3 text-sm">{plan.eligibility}</p>

              {minPrice !== null && maxPrice !== null && (
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-accent font-display text-2xl font-bold">
                    ${minPrice.toLocaleString()}{maxPrice !== minPrice && ` – $${maxPrice.toLocaleString()}`}
                  </span>
                  <span className="text-white/40 text-sm">starting price range</span>
                </div>
              )}

              <Button asChild size="lg" className="mt-4 bg-accent text-[#0f1b3d] hover:bg-accent/90 font-semibold">
                <Link to={`/purchase?plan=${plan.slug}`}>Get a Quote →</Link>
              </Button>

              <div className="mt-5">
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
                    <p className="font-bold text-white text-lg">{plan.pricingTiers.length} option{plan.pricingTiers.length > 1 ? "s" : ""}</p>
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

        {/* Section navigation */}
        <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40 rounded-lg">
          <div className="flex items-center gap-1 py-1 px-2 overflow-x-auto">
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

        {/* Content */}
        {activeSection === "overview" && (
          <div className="space-y-8">
            {hasPricing && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">Available Options</h2>
                    <p className="text-sm text-muted-foreground mt-1">{plan.pricingTiers.length} claim tier{plan.pricingTiers.length > 1 ? "s" : ""} available</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveSection("pricing")}>View Full Pricing</Button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {plan.pricingTiers.map((tier, i) => {
                    const tierPrices: number[] = [];
                    if (tier.mileageBands) tier.mileageBands.forEach(b => b.values.forEach(v => tierPrices.push(v)));
                    else { const baseRow = tier.rows.find(r => r.label === "Base Price"); baseRow?.values.forEach(v => { if (typeof v === "number") tierPrices.push(v); }); }
                    const tierMin = tierPrices.length > 0 ? Math.min(...tierPrices) : 0;
                    const tierMax = tierPrices.length > 0 ? Math.max(...tierPrices) : 0;
                    const addOnCount = tier.rows.filter(r => r.label !== "Base Price").length;
                    return (
                      <div key={i} className="rounded-xl border bg-card p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group" onClick={() => setActiveSection("pricing")}>
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary" className="text-xs">${tier.deductible} Deductible</Badge>
                          <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="font-display font-bold text-2xl text-foreground">${tier.perClaimAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Per Claim</p>
                        <div className="border-t mt-3 pt-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{tier.terms.length} term option{tier.terms.length > 1 ? "s" : ""}</div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gauge className="h-3 w-3" />{tier.terms[0].km} – {tier.terms[tier.terms.length - 1].km} km</div>
                          <p className="text-xs font-semibold text-primary mt-1">From ${tierMin.toLocaleString()}{tierMax !== tierMin && ` to $${tierMax.toLocaleString()}`}</p>
                          {addOnCount > 0 && <p className="text-[10px] text-accent font-medium">+ {addOnCount} add-on{addOnCount > 1 ? "s" : ""} available</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Coverage Overview</h2>
              <p className="text-sm text-muted-foreground mb-6">This plan covers {plan.includedCoverage.length} component categories.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="h-4 w-4 text-primary" /></div>
                    <h3 className="font-display font-bold text-foreground">Powertrain Coverage</h3>
                  </div>
                  <div className="space-y-2">
                    {plan.coverageDetails.filter(c => ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger"].includes(c.name)).map(cat => (
                      <div key={cat.name} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div><p className="text-sm font-medium text-foreground">{cat.name}</p><p className="text-xs text-muted-foreground line-clamp-2">{cat.parts.substring(0, 120)}…</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Wrench className="h-4 w-4 text-accent" /></div>
                    <h3 className="font-display font-bold text-foreground">Additional Coverage</h3>
                  </div>
                  <div className="space-y-2">
                    {plan.coverageDetails.filter(c => !["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger"].includes(c.name)).slice(0, 8).map(cat => {
                      const isIncluded = plan.includedCoverage.some(c => c.toLowerCase().includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes(c.toLowerCase()));
                      return (
                        <div key={cat.name} className="flex items-start gap-2">
                          {isIncluded ? <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> : <span className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">—</span>}
                          <div><p className={`text-sm font-medium ${isIncluded ? "text-foreground" : "text-muted-foreground"}`}>{cat.name}</p><p className="text-xs text-muted-foreground line-clamp-1">{cat.parts.substring(0, 80)}…</p></div>
                        </div>
                      );
                    })}
                    {plan.coverageDetails.filter(c => !["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger"].includes(c.name)).length > 8 && (
                      <button onClick={() => setActiveSection("coverage")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-2">View all coverage details <ChevronDown className="h-3 w-3" /></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">Included Benefits</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveSection("benefits")}>View All</Button>
              </div>
              <BenefitsSection benefits={plan.benefits} />
            </div>
          </div>
        )}

        {activeSection === "coverage" && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-2">What's Covered</h2>
            <CoverageAccordion categories={plan.coverageDetails} includedCoverage={plan.includedCoverage} />
          </div>
        )}

        {activeSection === "pricing" && hasPricing && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Pricing & Options</h2>
            <PricingTable plan={plan} />
          </div>
        )}

        {activeSection === "benefits" && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Included Benefits</h2>
            <BenefitsSection benefits={plan.benefits} />
          </div>
        )}

        {activeSection === "fine-print" && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Terms, Conditions & Exclusions</h2>
            <FinePrintSection importantNotes={plan.importantNotes} planExclusions={plan.planExclusions} premiumVehicleFee={plan.premiumVehicleFee} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DealershipPlanDetail;
