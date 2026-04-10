import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus } from "lucide-react";
import { getPlanBySlug } from "@/data/warrantyPlans";
import type { StepProps } from "./types";

const AddOnsStep = ({ state, updateState, onNext, onBack }: StepProps) => {
  const plan = useMemo(() => getPlanBySlug(state.selectedPlanSlug || ""), [state.selectedPlanSlug]);

  const tier = useMemo(() => {
    if (!plan || state.selectedTierIndex === null) return null;
    return plan.pricingTiers[state.selectedTierIndex];
  }, [plan, state.selectedTierIndex]);

  const addOns = useMemo(() => {
    if (!tier || state.selectedTermIndex === null) return [];
    return tier.rows
      .filter(r => r.label !== "Base Price")
      .map(r => {
        const val = r.values[state.selectedTermIndex!];
        const price = typeof val === "number" ? val : null;
        const isNA = val === "n/a";
        const isIncluded = val === "Included";
        return { label: r.label, price, isNA, isIncluded };
      });
  }, [tier, state.selectedTermIndex]);

  const basePrice = useMemo(() => {
    if (!tier || state.selectedTermIndex === null) return 0;
    if (tier.mileageBands) {
      return tier.mileageBands[0]?.values[state.selectedTermIndex] ?? 0;
    }
    const baseRow = tier.rows.find(r => r.label === "Base Price");
    const val = baseRow?.values[state.selectedTermIndex];
    return typeof val === "number" ? val : 0;
  }, [tier, state.selectedTermIndex]);

  const addOnTotal = useMemo(() => {
    return addOns
      .filter(a => state.selectedAddOns.includes(a.label) && a.price !== null)
      .reduce((sum, a) => sum + (a.price || 0), 0);
  }, [addOns, state.selectedAddOns]);

  const toggleAddOn = (label: string) => {
    const current = state.selectedAddOns;
    if (current.includes(label)) {
      updateState({ selectedAddOns: current.filter(a => a !== label) });
    } else {
      updateState({ selectedAddOns: [...current, label] });
    }
  };

  const availableAddOns = addOns.filter(a => !a.isNA);
  const hasAddOns = availableAddOns.length > 0;

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Add-On Options</h2>
          <p className="text-sm text-muted-foreground">
            {hasAddOns ? "Enhance your coverage with optional add-ons." : "No add-ons available for this configuration."}
          </p>
        </div>
      </div>

      {hasAddOns ? (
        <div className="space-y-3">
          {availableAddOns.map(addon => (
            <label
              key={addon.label}
              className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
                addon.isIncluded
                  ? "bg-green-50 border-green-200 dark:bg-green-500/5 dark:border-green-500/20"
                  : state.selectedAddOns.includes(addon.label)
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "hover:border-primary/30"
              }`}
            >
              {addon.isIncluded ? (
                <div className="w-4 h-4 rounded-sm bg-green-500 flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <Checkbox
                  checked={state.selectedAddOns.includes(addon.label)}
                  onCheckedChange={() => toggleAddOn(addon.label)}
                  disabled={addon.isNA}
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-foreground">{addon.label}</p>
              </div>
              <div className="text-right">
                {addon.isIncluded ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Included</Badge>
                ) : addon.price !== null ? (
                  <p className="font-bold text-foreground">+${addon.price.toLocaleString()}</p>
                ) : null}
              </div>
            </label>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No optional add-ons are available for this plan and term combination.</p>
        </div>
      )}

      {/* Running total */}
      <div className="mt-6 rounded-lg bg-muted/30 border p-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price</span>
            <span className="text-foreground">${basePrice.toLocaleString()}</span>
          </div>
          {state.selectedAddOns.map(label => {
            const addon = addOns.find(a => a.label === label);
            if (!addon || !addon.price) return null;
            return (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground">+${addon.price.toLocaleString()}</span>
              </div>
            );
          })}
          <div className="border-t pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-display font-bold text-xl text-primary">${(basePrice + addOnTotal).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={onNext}>
          Continue to Your Info →
        </Button>
      </div>
    </Card>
  );
};

export default AddOnsStep;
