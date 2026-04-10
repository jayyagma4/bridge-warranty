import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";
import { getPlanBySlug } from "@/data/warrantyPlans";
import type { StepProps } from "./types";

const TermPricingStep = ({ state, updateState, onNext, onBack }: StepProps) => {
  const plan = useMemo(() => getPlanBySlug(state.selectedPlanSlug || ""), [state.selectedPlanSlug]);

  const tiers = plan?.pricingTiers ?? [];

  const selectedTier = state.selectedTierIndex !== null && tiers[state.selectedTierIndex] ? tiers[state.selectedTierIndex] : null;

  // Get base price for selected term
  const basePrice = useMemo(() => {
    if (!selectedTier || state.selectedTermIndex === null) return null;
    if (selectedTier.mileageBands) {
      return selectedTier.mileageBands[0]?.values[state.selectedTermIndex] ?? null;
    }
    const baseRow = selectedTier.rows.find(r => r.label === "Base Price");
    const val = baseRow?.values[state.selectedTermIndex];
    return typeof val === "number" ? val : null;
  }, [selectedTier, state.selectedTermIndex]);

  // Auto-select tier if only one option
  useEffect(() => {
    if (tiers.length === 1 && state.selectedTierIndex === null) {
      updateState({ selectedTierIndex: 0 });
    }
  }, [tiers.length, state.selectedTierIndex]);

  if (!plan) return null;

  const handleTierSelect = (tierIndex: number) => {
    updateState({ selectedTierIndex: tierIndex, selectedTermIndex: null, selectedAddOns: [] });
  };

  const handleTermSelect = (termIndex: number) => {
    updateState({ selectedTermIndex: termIndex, selectedAddOns: [] });
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Term & Pricing</h2>
          <p className="text-sm text-muted-foreground">
            Choose your per-claim tier and coverage term for <span className="font-semibold text-foreground">{plan.name}</span>.
          </p>
        </div>
      </div>

      {/* Tier selection (per-claim amount) */}
      {tiers.length > 1 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-foreground mb-3">Per-Claim Amount</p>
          <div className="flex flex-wrap gap-3">
            {tiers.map((tier, i) => (
              <button
                key={i}
                onClick={() => handleTierSelect(i)}
                className={`px-5 py-3 rounded-lg border-2 text-center transition-all ${
                  state.selectedTierIndex === i
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="font-display font-bold text-lg text-foreground">${tier.perClaimAmount.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">${tier.deductible} deductible</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auto-select tier if only one */}
      {tiers.length === 1 && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">${tiers[0].perClaimAmount.toLocaleString()} Per Claim</Badge>
            <Badge variant="outline">${tiers[0].deductible} Deductible</Badge>
          </div>
        </div>
      )}

      {/* Term selection */}
      {selectedTier && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Coverage Term</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedTier.terms.map((term, i) => {
              const isSelected = state.selectedTermIndex === i;
              let price: number | null = null;
              if (selectedTier.mileageBands) {
                price = selectedTier.mileageBands[0]?.values[i] ?? null;
              } else {
                const baseRow = selectedTier.rows.find(r => r.label === "Base Price");
                const val = baseRow?.values[i];
                price = typeof val === "number" ? val : null;
              }

              return (
                <button
                  key={i}
                  onClick={() => handleTermSelect(i)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="font-semibold text-foreground">{term.label}</p>
                  {price !== null && (
                    <p className="text-primary font-display font-bold text-lg mt-1">${price.toLocaleString()}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {basePrice !== null && selectedTier && state.selectedTermIndex !== null && (
        <div className="mt-6 rounded-lg bg-muted/30 border p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Base Price</p>
            <p className="font-display font-bold text-xl text-foreground">${basePrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {selectedTier.terms[state.selectedTermIndex].label}
            </p>
            <p className="text-sm text-muted-foreground">
              ${selectedTier.perClaimAmount.toLocaleString()}/claim • ${selectedTier.deductible} deductible
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={onNext} disabled={state.selectedTierIndex === null || state.selectedTermIndex === null}>
          Continue to Add-Ons →
        </Button>
      </div>
    </Card>
  );
};

export default TermPricingStep;
