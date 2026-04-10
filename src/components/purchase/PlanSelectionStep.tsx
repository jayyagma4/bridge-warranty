import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, ArrowLeft, Ban } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { warrantyPlans, getGroupedPlans, getPlansByGroup } from "@/data/warrantyPlans";
import { checkAllPlanEligibility, isPremiumVehicle } from "@/lib/eligibility";
import type { EligibilityResult } from "@/lib/eligibility";
import type { StepProps } from "./types";

const PlanSelectionStep = ({ state, updateState, onNext, onBack }: StepProps) => {
  const displayPlans = useMemo(() => {
    const grouped = getGroupedPlans("A-Protect");
    const nonGrouped = warrantyPlans.filter(p => !p.group && p.provider === "A-Protect");
    return [...grouped, ...nonGrouped].filter(p => p.pricingTiers.length > 0);
  }, []);

  // Build eligibility map from vehicle info
  const eligibilityMap = useMemo(() => {
    if (!state.vehicle) return new Map<string, EligibilityResult>();
    const results = checkAllPlanEligibility(state.vehicle);
    const map = new Map<string, EligibilityResult>();
    results.forEach(r => map.set(r.planSlug, r));
    return map;
  }, [state.vehicle]);

  const handleSelect = (slug: string) => {
    // Check if this plan or its group is eligible
    const result = eligibilityMap.get(slug);
    if (result && !result.eligible) return; // blocked

    updateState({
      selectedPlanSlug: slug,
      selectedTierIndex: null,
      selectedTermIndex: null,
      selectedAddOns: [],
    });
  };

  const isPremium = state.vehicle
    ? isPremiumVehicle(state.vehicle.make, state.vehicle.model)
    : false;

  // Count eligible vs total
  const eligibleCount = displayPlans.filter(plan => {
    const groupPlans = plan.group ? getPlansByGroup(plan.group) : [plan];
    return groupPlans.some(gp => {
      const r = eligibilityMap.get(gp.slug);
      return !r || r.eligible;
    });
  }).length;

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
        <div className="mb-6 mt-3 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Badge variant="outline">
            {state.vehicle.year} {state.vehicle.make} {state.vehicle.model}
          </Badge>
          <span>•</span>
          <span>{state.vehicle.mileage.toLocaleString()} km</span>
          {isPremium && (
            <>
              <span>•</span>
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px]">
                Premium Vehicle
              </Badge>
            </>
          )}
          <span>•</span>
          <span className="text-primary font-medium">{eligibleCount} plans available</span>
        </div>
      )}

      <TooltipProvider delayDuration={200}>
        <div className="grid gap-4">
          {displayPlans.map(plan => {
            const groupPlans = plan.group ? getPlansByGroup(plan.group) : [plan];
            const isSelected = groupPlans.some(gp => gp.slug === state.selectedPlanSlug);
            const groupName = plan.group ? plan.name.replace(` ${plan.tier}`, "") : plan.name;

            // Check eligibility for all plans in the group
            const groupEligibility = groupPlans.map(gp => ({
              slug: gp.slug,
              result: eligibilityMap.get(gp.slug),
            }));
            const anyEligible = groupEligibility.some(ge => !ge.result || ge.result.eligible);
            const allIneligible = !anyEligible;
            const ineligibleReason = groupEligibility.find(ge => ge.result && !ge.result.eligible)?.result?.reason;

            // Price range across eligible plans in group
            const allPrices: number[] = [];
            groupPlans.forEach(gp => {
              const gpResult = eligibilityMap.get(gp.slug);
              if (gpResult && !gpResult.eligible) return; // skip ineligible
              gp.pricingTiers.forEach(tier => {
                const baseRow = tier.rows.find(r => r.label === "Base Price");
                baseRow?.values.forEach(v => {
                  if (typeof v === "number") allPrices.push(v);
                });
                tier.mileageBands?.forEach(b => b.values.forEach(v => allPrices.push(v)));
              });
            });
            const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
            const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

            const cardContent = (
              <div
                onClick={() => !allIneligible && handleSelect(groupPlans[0].slug)}
                className={`rounded-xl border p-5 transition-all ${
                  allIneligible
                    ? "opacity-50 cursor-not-allowed bg-muted/30 border-muted"
                    : isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 cursor-pointer"
                    : "hover:border-primary/30 hover:shadow-sm cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-foreground text-lg">{groupName}</h3>
                      {allIneligible && (
                        <Badge variant="outline" className="text-destructive border-destructive/30 text-[10px] gap-1">
                          <Ban className="h-3 w-3" /> Not Eligible
                        </Badge>
                      )}
                      {!allIneligible && !plan.premiumFees && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">
                          $0 Premium Fees
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.eligibility}</p>

                    {allIneligible && ineligibleReason && (
                      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                        <Ban className="h-3 w-3 shrink-0" /> {ineligibleReason}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {plan.includedCoverage.slice(0, 6).map(c => (
                        <span key={c} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Check className="h-3 w-3 text-primary" /> {c}
                        </span>
                      ))}
                      {plan.includedCoverage.length > 6 && (
                        <span className="text-xs text-muted-foreground">
                          +{plan.includedCoverage.length - 6} more
                        </span>
                      )}
                    </div>

                    {plan.group && (
                      <div className="flex items-center gap-1.5 mt-3">
                        <span className="text-xs text-muted-foreground">Tiers:</span>
                        {groupPlans.map(gp => {
                          const gpResult = eligibilityMap.get(gp.slug);
                          const gpEligible = !gpResult || gpResult.eligible;
                          const tierBtn = (
                            <button
                              key={gp.slug}
                              disabled={!gpEligible}
                              onClick={e => {
                                e.stopPropagation();
                                if (gpEligible) handleSelect(gp.slug);
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                                !gpEligible
                                  ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-transparent line-through"
                                  : state.selectedPlanSlug === gp.slug
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                              }`}
                            >
                              {gp.tier} ({gp.claimRange})
                            </button>
                          );

                          if (!gpEligible && gpResult?.reason) {
                            return (
                              <Tooltip key={gp.slug}>
                                <TooltipTrigger asChild>{tierBtn}</TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[250px] text-xs">
                                  {gpResult.reason}
                                </TooltipContent>
                              </Tooltip>
                            );
                          }
                          return tierBtn;
                        })}
                      </div>
                    )}
                  </div>

                  {!allIneligible && (
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-display font-bold text-xl text-primary">
                        ${minPrice.toLocaleString()}
                      </p>
                      {maxPrice !== minPrice && (
                        <p className="text-[10px] text-muted-foreground">
                          up to ${maxPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );

            if (allIneligible && ineligibleReason) {
              return (
                <Tooltip key={plan.slug}>
                  <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px] text-sm font-medium">
                    {ineligibleReason}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={plan.slug}>{cardContent}</div>;
          })}
        </div>
      </TooltipProvider>

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
