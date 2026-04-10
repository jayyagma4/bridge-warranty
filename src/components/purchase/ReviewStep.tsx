import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck, Car, Clock, Plus, User, Printer } from "lucide-react";
import { getPlanBySlug } from "@/data/warrantyPlans";
import { toast } from "@/hooks/use-toast";
import type { PurchaseState } from "./types";

interface ReviewStepProps {
  state: PurchaseState;
  onBack: () => void;
}

const ReviewStep = ({ state, onBack }: ReviewStepProps) => {
  const [submitting, setSubmitting] = useState(false);
  const plan = useMemo(() => getPlanBySlug(state.selectedPlanSlug || ""), [state.selectedPlanSlug]);

  const tier = useMemo(() => {
    if (!plan || state.selectedTierIndex === null) return null;
    return plan.pricingTiers[state.selectedTierIndex];
  }, [plan, state.selectedTierIndex]);

  const term = tier && state.selectedTermIndex !== null ? tier.terms[state.selectedTermIndex] : null;

  const basePrice = useMemo(() => {
    if (!tier || state.selectedTermIndex === null) return 0;
    if (tier.mileageBands) return tier.mileageBands[0]?.values[state.selectedTermIndex] ?? 0;
    const baseRow = tier.rows.find(r => r.label === "Base Price");
    const val = baseRow?.values[state.selectedTermIndex];
    return typeof val === "number" ? val : 0;
  }, [tier, state.selectedTermIndex]);

  const addOnPrices = useMemo(() => {
    if (!tier || state.selectedTermIndex === null) return [];
    return state.selectedAddOns.map(label => {
      const row = tier.rows.find(r => r.label === label);
      const val = row?.values[state.selectedTermIndex!];
      return { label, price: typeof val === "number" ? val : 0 };
    });
  }, [tier, state.selectedTermIndex, state.selectedAddOns]);

  const total = basePrice + addOnPrices.reduce((s, a) => s + a.price, 0);

  const handlePrintQuote = () => {
    setSubmitting(true);
    setTimeout(() => {
      window.print();
      setSubmitting(false);
      toast({
        title: "Quote ready",
        description: "Your warranty quote has been prepared for printing.",
      });
    }, 500);
  };

  if (!plan || !tier || !term || !state.vehicle) return null;

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Review Your Order</h2>
          <p className="text-sm text-muted-foreground">Confirm your warranty contract details before checkout.</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Vehicle */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Car className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Vehicle</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><p className="text-muted-foreground text-xs">Year</p><p className="font-medium">{state.vehicle.year}</p></div>
            <div><p className="text-muted-foreground text-xs">Make</p><p className="font-medium">{state.vehicle.make}</p></div>
            <div><p className="text-muted-foreground text-xs">Model</p><p className="font-medium">{state.vehicle.model}</p></div>
            <div><p className="text-muted-foreground text-xs">Mileage</p><p className="font-medium">{state.vehicle.mileage.toLocaleString()} km</p></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-mono">{state.vehicle.vin}</p>
        </div>

        {/* Plan & Term */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Plan & Term</p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Badge>{plan.name}</Badge>
            <Badge variant="outline">${tier.perClaimAmount.toLocaleString()}/claim</Badge>
          </div>
          <p className="text-sm text-foreground">{term.label}</p>
          <p className="text-xs text-muted-foreground mt-1">${tier.deductible} deductible</p>
        </div>

        {/* Add-Ons */}
        {addOnPrices.length > 0 && (
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Add-Ons</p>
            </div>
            <div className="space-y-1.5">
              {addOnPrices.map(a => (
                <div key={a.label} className="flex justify-between text-sm">
                  <span>{a.label}</span>
                  <span className="font-medium">+${a.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Customer</p>
          </div>
          <p className="text-sm">{state.customer.firstName} {state.customer.lastName}</p>
          <p className="text-sm text-muted-foreground">{state.customer.email}</p>
          {state.customer.phone && <p className="text-sm text-muted-foreground">{state.customer.phone}</p>}
        </div>

        {/* Total */}
        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span>${basePrice.toLocaleString()}</span>
            </div>
            {addOnPrices.map(a => (
              <div key={a.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{a.label}</span>
                <span>+${a.price.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between items-baseline">
              <span className="font-bold text-foreground text-lg">Total</span>
              <span className="font-display font-bold text-2xl text-primary">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={handlePrintQuote} disabled={submitting} size="lg">
          <Printer className="h-4 w-4 mr-1" />
          {submitting ? "Preparing..." : "Print Quote"}
        </Button>
      </div>
    </Card>
  );
};

export default ReviewStep;
