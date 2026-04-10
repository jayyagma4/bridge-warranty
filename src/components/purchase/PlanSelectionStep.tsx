import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, ArrowLeft } from "lucide-react";
import { warrantyPlans, getGroupedPlans, getPlansByGroup } from "@/data/warrantyPlans";
import type { StepProps } from "./types";

const PlanSelectionStep = ({ state, updateState, onNext, onBack }: StepProps) => {
  // Get unique plans (collapse grouped plans into one card)
  const displayPlans = useMemo(() => {
    const grouped = getGroupedPlans("A-Protect");
    // Also include non-grouped plans
    const nonGrouped = warrantyPlans.filter(p => !p.group && p.provider === "A-Protect");
    return [...grouped, ...nonGrouped].filter(p => p.pricingTiers.length > 0);
  }, []);

  const handleSelect = (slug: string) => {
    updateState({
      selectedPlanSlug: slug,
      selectedTierIndex: null,
      selectedTermIndex: null,
      selectedAddOns: [],
    });
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Select a Plan</h2>
          <p className="text-sm text-muted-foreground">
            Choose the warranty plan for your {state.vehicle?.year} {state.vehicle?.make} {state.vehicle?.model}.
          </p>
        </div>
      </div>

      {state.vehicle && (
        <div className="mb-6 mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{state.vehicle.year} {state.vehicle.make} {state.vehicle.model}</Badge>
          <span>•</span>
          <span>{state.vehicle.mileage.toLocaleString()} km</span>
        </div>
      )}

      <div className="grid gap-4">
        {displayPlans.map(plan => {
          const groupPlans = plan.group ? getPlansByGroup(plan.group) : [plan];
          const isSelected = groupPlans.some(gp => gp.slug === state.selectedPlanSlug);
          const groupName = plan.group ? plan.name.replace(` ${plan.tier}`, "") : plan.name;

          // Price range across group
          const allPrices: number[] = [];
          groupPlans.forEach(gp => {
            gp.pricingTiers.forEach(tier => {
              const baseRow = tier.rows.find(r => r.label === "Base Price");
              baseRow?.values.forEach(v => { if (typeof v === "number") allPrices.push(v); });
              tier.mileageBands?.forEach(b => b.values.forEach(v => allPrices.push(v)));
            });
          });
          const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
          const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

          return (
            <div
              key={plan.slug}
              onClick={() => handleSelect(groupPlans[0].slug)}
              className={`rounded-xl border p-5 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-foreground text-lg">{groupName}</h3>
                    {!plan.premiumFees && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">$0 Premium Fees</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.eligibility}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {plan.includedCoverage.slice(0, 6).map(c => (
                      <span key={c} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" /> {c}
                      </span>
                    ))}
                    {plan.includedCoverage.length > 6 && (
                      <span className="text-xs text-muted-foreground">+{plan.includedCoverage.length - 6} more</span>
                    )}
                  </div>
                  {plan.group && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="text-xs text-muted-foreground">Tiers:</span>
                      {groupPlans.map(gp => (
                        <button
                          key={gp.slug}
                          onClick={e => { e.stopPropagation(); handleSelect(gp.slug); }}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                            state.selectedPlanSlug === gp.slug
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                          }`}
                        >
                          {gp.tier} ({gp.claimRange})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-display font-bold text-xl text-primary">${minPrice.toLocaleString()}</p>
                  {maxPrice !== minPrice && (
                    <p className="text-[10px] text-muted-foreground">up to ${maxPrice.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={onNext} disabled={!state.selectedPlanSlug}>
          Continue to Term Selection →
        </Button>
      </div>
    </Card>
  );
};

export default PlanSelectionStep;
