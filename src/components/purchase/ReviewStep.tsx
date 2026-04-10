import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Shield } from "lucide-react";
import { getPlanBySlug, GENERAL_TERMS, GENERAL_EXCLUSIONS, COVERAGE_TERRITORY, WAITING_PERIOD, DISPUTE_RESOLUTION } from "@/data/warrantyPlans";
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
  const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

  const handlePrintQuote = () => {
    setSubmitting(true);
    setTimeout(() => {
      window.print();
      setSubmitting(false);
      toast({ title: "Contract ready", description: "Your warranty contract has been prepared for printing." });
    }, 500);
  };

  if (!plan || !tier || !term || !state.vehicle) return null;

  return (
    <Card className="p-0 overflow-hidden print:shadow-none print:border-none">
      {/* Contract Document */}
      <div className="p-6 md:p-10 max-w-[800px] mx-auto space-y-6 print:p-8 print:max-w-none">

        {/* Header: Bridge Warranty + Provider */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-primary/20">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Bridge Warranty</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Canada's Warranty Marketplace</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-lg text-foreground">A-Protect Warranty</span>
            </div>
            <p className="text-xs text-muted-foreground">Warranty Provider &amp; Administrator</p>
          </div>
        </div>

        {/* Contract Title */}
        <div className="text-center py-3">
          <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-wide">Vehicle Service Contract</h2>
          <p className="text-xs text-muted-foreground mt-1">This contract is administered by A-Protect Warranty Corporation and sold through Bridge Warranty, an authorized third-party marketplace.</p>
        </div>

        {/* Contract Date */}
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Contract Date:</span>{" "}
            <span className="font-medium text-foreground">{today}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Contract #:</span>{" "}
            <span className="font-mono text-foreground text-xs">BW-{Date.now().toString(36).toUpperCase()}</span>
          </div>
        </div>

        <Separator />

        {/* Section: Customer */}
        <div>
          <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider mb-2">Contract Holder</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm border rounded-lg p-4 bg-muted/20">
            <div><span className="text-muted-foreground text-xs">Name</span><p className="font-medium">{state.customer.firstName} {state.customer.lastName}</p></div>
            <div><span className="text-muted-foreground text-xs">Email</span><p className="font-medium">{state.customer.email}</p></div>
            {state.customer.phone && <div><span className="text-muted-foreground text-xs">Phone</span><p className="font-medium">{state.customer.phone}</p></div>}
          </div>
        </div>

        {/* Section: Vehicle */}
        <div>
          <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider mb-2">Covered Vehicle</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm border rounded-lg p-4 bg-muted/20">
            <div><span className="text-muted-foreground text-xs">Year</span><p className="font-medium">{state.vehicle.year}</p></div>
            <div><span className="text-muted-foreground text-xs">Make</span><p className="font-medium">{state.vehicle.make}</p></div>
            <div><span className="text-muted-foreground text-xs">Model</span><p className="font-medium">{state.vehicle.model}</p></div>
            <div><span className="text-muted-foreground text-xs">Odometer</span><p className="font-medium">{state.vehicle.mileage.toLocaleString()} km</p></div>
            <div className="col-span-2 sm:col-span-4 mt-1">
              <span className="text-muted-foreground text-xs">VIN</span>
              <p className="font-mono font-medium text-xs">{state.vehicle.vin}</p>
            </div>
          </div>
        </div>

        {/* Section: Coverage Details */}
        <div>
          <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider mb-2">Coverage Details</h3>
          <div className="border rounded-lg p-4 bg-muted/20 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-bold text-foreground">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coverage Term</span>
              <span className="font-medium">{term.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Per-Claim Limit</span>
              <span className="font-medium">${tier.perClaimAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deductible</span>
              <span className="font-medium">${tier.deductible}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">A-Protect Warranty Corporation</span>
            </div>
          </div>
        </div>

        {/* Section: Pricing Breakdown */}
        <div>
          <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider mb-2">Pricing</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="divide-y">
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span>Base Coverage</span>
                <span className="font-medium">${basePrice.toLocaleString()}</span>
              </div>
              {addOnPrices.map(a => (
                <div key={a.label} className="flex justify-between px-4 py-2.5 text-sm">
                  <span>{a.label}</span>
                  <span className="font-medium">+${a.price.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-primary/5 border-t-2 border-primary/20">
                <span className="font-bold text-foreground">Total Contract Price</span>
                <span className="font-display font-bold text-xl text-primary">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section: Covered Components Summary */}
        <div>
          <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider mb-2">Covered Components</h3>
          <div className="flex flex-wrap gap-1.5">
            {plan.includedCoverage.map(c => (
              <Badge key={c} variant="outline" className="text-xs font-normal">{c}</Badge>
            ))}
          </div>
        </div>

        {/* Section: Terms & Conditions */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider">Terms & Conditions</h3>

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground text-xs mb-1">Coverage Territory</p>
            <p>{COVERAGE_TERRITORY}</p>
          </div>

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground text-xs mb-1">Waiting Period</p>
            <p>{WAITING_PERIOD}</p>
          </div>

          {GENERAL_TERMS.map((section) => (
            <div key={section.heading} className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground text-xs mb-1">{section.heading}</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Plan-specific notes */}
          {plan.importantNotes && plan.importantNotes.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground text-xs mb-1">Plan-Specific Notes</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {plan.importantNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Exclusions */}
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground text-xs mb-1">General Exclusions</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {GENERAL_EXCLUSIONS.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>

          {plan.planExclusions && plan.planExclusions.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground text-xs mb-1">Additional Plan Exclusions</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {plan.planExclusions.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground text-xs mb-1">Dispute Resolution</p>
            <p>{DISPUTE_RESOLUTION}</p>
          </div>
        </div>

        <Separator />

        {/* Signature Block */}
        <div className="space-y-2">
          <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider mb-4">Authorization & Signatures</h3>
          <p className="text-xs text-muted-foreground mb-6">
            By signing below, both parties acknowledge that they have read, understood, and agree to all the terms and conditions outlined in this Vehicle Service Contract.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Client */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground uppercase tracking-wider">Client / Contract Holder</p>
              <div className="border-b-2 border-foreground/30 h-12 mt-4" />
              <p className="text-xs text-muted-foreground">Signature</p>
              <div className="border-b border-muted-foreground/20 h-8 mt-2" />
              <p className="text-xs text-muted-foreground">Print Name</p>
              <div className="border-b border-muted-foreground/20 h-8 mt-2" />
              <p className="text-xs text-muted-foreground">Date</p>
            </div>

            {/* Authorized Seller */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground uppercase tracking-wider">Authorized Seller</p>
              <div className="border-b-2 border-foreground/30 h-12 mt-4" />
              <p className="text-xs text-muted-foreground">Signature</p>
              <div className="border-b border-muted-foreground/20 h-8 mt-2" />
              <p className="text-xs text-muted-foreground">Print Name</p>
              <div className="border-b border-muted-foreground/20 h-8 mt-2" />
              <p className="text-xs text-muted-foreground">Date</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Footer: Marketplace Disclaimer */}
        <div className="text-center text-[10px] text-muted-foreground space-y-1 pb-2">
          <p className="font-medium">Bridge Warranty is an authorized marketplace and third-party reseller of warranty products.</p>
          <p>This contract is issued, administered, and backed by <strong>A-Protect Warranty Corporation</strong>. Bridge Warranty facilitates the sale but is not the warranty provider or administrator. All claims, coverage decisions, and obligations under this contract are the sole responsibility of A-Protect Warranty Corporation.</p>
        </div>
      </div>

      {/* Action bar (hidden on print) */}
      <div className="border-t bg-muted/20 px-6 md:px-10 py-4 flex justify-between print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={handlePrintQuote} disabled={submitting} size="lg">
          <Printer className="h-4 w-4 mr-1" />
          {submitting ? "Preparing..." : "Print Contract"}
        </Button>
      </div>
    </Card>
  );
};

export default ReviewStep;
