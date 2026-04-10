import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Shield, Wrench, ChevronDown } from "lucide-react";
import BrochureHeader from "@/components/brochure/BrochureHeader";
import CoverageAccordion from "@/components/brochure/CoverageAccordion";
import BenefitsSection from "@/components/brochure/BenefitsSection";
import FinePrintSection from "@/components/brochure/FinePrintSection";
import { getPlanBySlug, getPlansByGroup } from "@/data/warrantyPlans";
import { useState, useMemo } from "react";

const PlanDetail = () => {
  const { planSlug } = useParams<{ planSlug: string }>();
  const navigate = useNavigate();
  const plan = getPlanBySlug(planSlug || "");
  const [activeSection, setActiveSection] = useState<"overview" | "coverage" | "benefits" | "fine-print">("overview");

  const groupPlans = useMemo(() => {
    if (!plan?.group) return null;
    return getPlansByGroup(plan.group);
  }, [plan?.group]);

  const isGrouped = groupPlans && groupPlans.length > 1;

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

  const groupName = isGrouped ? plan.name.replace(` ${plan.tier}`, "") : plan.name;

  const sections = [
    { key: "overview" as const, label: "Overview" },
    { key: "coverage" as const, label: "What's Covered" },
    { key: "benefits" as const, label: "Benefits" },
    { key: "fine-print" as const, label: "Terms & Conditions" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BrochureHeader />

      {/* Hero header — no pricing */}
      <section className="pt-16 bg-gradient-to-br from-[hsl(225,80%,15%)] via-[hsl(225,70%,20%)] to-[hsl(225,60%,25%)] text-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-6 -ml-2">
            <Link to="/brochure">
              <ArrowLeft className="mr-1 h-4 w-4" /> All Plans
            </Link>
          </Button>

          <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-accent/20 text-accent border-accent/30">{plan.provider}</Badge>
                {plan.tier && !isGrouped && <Badge className="bg-white/10 text-white border-white/20">{plan.tier}</Badge>}
                {!plan.premiumFees && <Badge className="bg-green-500/20 text-green-300 border-green-500/30">$0 Premium Fees</Badge>}
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold">{isGrouped ? groupName : plan.name}</h1>

              {isGrouped && (
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  {groupPlans.map(gp => {
                    const isActive = gp.slug === plan.slug;
                    return (
                      <button
                        key={gp.slug}
                        onClick={() => navigate(`/brochure/${gp.slug}`, { replace: true })}
                        className={`px-6 py-3 rounded-lg text-sm font-bold transition-all border-2 ${
                          isActive
                            ? "bg-accent text-[#0f1b3d] border-accent shadow-lg shadow-accent/30 scale-105"
                            : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
                        }`}
                      >
                        <span className="block text-base">{gp.tier}</span>
                        <span className={`block text-[11px] mt-0.5 font-medium ${isActive ? "text-[#0f1b3d]/70" : "text-white/50"}`}>{gp.claimRange}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-white/50 mt-3 text-sm">{plan.eligibility}</p>

              <div className="mt-4 rounded-lg bg-white/10 border border-white/20 px-4 py-3 inline-block">
                <p className="text-sm text-white/80">
                  <Shield className="h-4 w-4 inline mr-1.5 text-accent" />
                  Sign in to your dealership account to view pricing and create quotes.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-2 border-white/20 text-white hover:bg-white/10">
                  <Link to="/sign-in">Sign In →</Link>
                </Button>
              </div>

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

            {/* Right stats — no pricing, just claim/deductible info */}
            <div className="flex flex-wrap lg:flex-col gap-3">
              <div className="bg-white/10 rounded-lg px-5 py-3 min-w-[140px]">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Per Claim</p>
                <p className="font-bold text-accent text-lg">{plan.claimRange}</p>
              </div>
              <div className="bg-white/10 rounded-lg px-5 py-3 min-w-[140px]">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Deductible</p>
                <p className="font-bold text-white text-lg">{plan.deductible}</p>
              </div>
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

      {/* Content — no pricing section */}
      <div className="container mx-auto px-4 py-8">
        {activeSection === "overview" && (
          <div className="space-y-8">
            {/* Coverage summary */}
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
                    {plan.coverageDetails
                      .filter(c => ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger"].includes(c.name))
                      .map(cat => (
                        <div key={cat.name} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{cat.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{cat.parts.substring(0, 120)}…</p>
                          </div>
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
                    {plan.coverageDetails
                      .filter(c => !["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger"].includes(c.name))
                      .slice(0, 8)
                      .map(cat => {
                        const isIncluded = plan.includedCoverage.some(c =>
                          c.toLowerCase().includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes(c.toLowerCase())
                        );
                        return (
                          <div key={cat.name} className="flex items-start gap-2">
                            {isIncluded ? <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> : <span className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">—</span>}
                            <div>
                              <p className={`text-sm font-medium ${isIncluded ? "text-foreground" : "text-muted-foreground"}`}>{cat.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{cat.parts.substring(0, 80)}…</p>
                            </div>
                          </div>
                        );
                      })}
                    {plan.coverageDetails.filter(c => !["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger"].includes(c.name)).length > 8 && (
                      <button onClick={() => setActiveSection("coverage")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-2">
                        View all coverage details <ChevronDown className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
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
            <p className="text-sm text-muted-foreground mb-6">Click any category to see covered components and parts.</p>
            <CoverageAccordion categories={plan.coverageDetails} includedCoverage={plan.includedCoverage} />
          </div>
        )}

        {activeSection === "benefits" && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Included Benefits</h2>
            <BenefitsSection benefits={plan.benefits} />
            <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">FREE Diagnostics Included</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive a free 20 min visual, scan and road test at an A-Protect Authorized Repair Centre.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "fine-print" && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Terms, Conditions & Exclusions</h2>
            <FinePrintSection
              importantNotes={plan.importantNotes}
              planExclusions={plan.planExclusions}
              premiumVehicleFee={plan.premiumVehicleFee}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanDetail;
