import { useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrochureHeader from "@/components/brochure/BrochureHeader";
import VehicleInfoStep from "@/components/purchase/VehicleInfoStep";
import PlanSelectionStep from "@/components/purchase/PlanSelectionStep";
import TermPricingStep from "@/components/purchase/TermPricingStep";
import AddOnsStep from "@/components/purchase/AddOnsStep";
import CustomerInfoStep from "@/components/purchase/CustomerInfoStep";
import ReviewStep from "@/components/purchase/ReviewStep";
import PurchaseProgress from "@/components/purchase/PurchaseProgress";
import type { PurchaseState } from "@/components/purchase/types";

const STEPS = [
  { key: "vehicle", label: "Vehicle" },
  { key: "plan", label: "Plan" },
  { key: "term", label: "Term & Price" },
  { key: "addons", label: "Add-Ons" },
  { key: "customer", label: "Your Info" },
  { key: "review", label: "Review" },
] as const;

const PurchaseWizard = () => {
  const [searchParams] = useSearchParams();
  const preselectedPlan = searchParams.get("plan");

  const [step, setStep] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [state, setState] = useState<PurchaseState>({
    vehicle: null,
    selectedPlanSlug: preselectedPlan || null,
    selectedTierIndex: null,
    selectedTermIndex: null,
    selectedAddOns: [],
    customer: { firstName: "", lastName: "", email: "", phone: "" },
  });

  const updateState = (partial: Partial<PurchaseState>) => {
    setState(prev => ({ ...prev, ...partial }));
  };

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return !!state.vehicle;
      case 1: return !!state.selectedPlanSlug;
      case 2: return state.selectedTierIndex !== null && state.selectedTermIndex !== null;
      case 3: return true;
      case 4: return !!(state.customer.firstName && state.customer.lastName && state.customer.email);
      case 5: return true;
      default: return false;
    }
  }, [step, state]);

  // Track which steps have been completed (visited and filled)
  const completedSteps = useMemo(() => {
    return [
      !!state.vehicle,
      !!state.selectedPlanSlug,
      state.selectedTierIndex !== null && state.selectedTermIndex !== null,
      highestStep > 3, // add-ons are optional, mark as complete once passed
      !!(state.customer.firstName && state.customer.lastName && state.customer.email),
      false, // review is never "completed" in the progress
    ];
  }, [state, highestStep]);

  const next = useCallback(() => {
    if (canProceed && step < STEPS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setHighestStep(prev => Math.max(prev, nextStep));
    }
  }, [canProceed, step]);

  const back = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const handleStepClick = useCallback((targetStep: number) => {
    // Allow jumping to any previously visited step
    if (targetStep <= highestStep) {
      setStep(targetStep);
    }
  }, [highestStep]);

  return (
    <div className="min-h-screen bg-background">
      <BrochureHeader />

      <section className="pt-16 bg-gradient-to-br from-[hsl(225,80%,15%)] via-[hsl(225,70%,20%)] to-[hsl(225,60%,25%)] text-white">
        <div className="container mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <Link to="/brochure">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Plans
            </Link>
          </Button>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Get a Quote</h1>
          <p className="text-white/50 mt-1 text-sm">
            Enter your vehicle details and we'll show you exactly which plans you qualify for.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <PurchaseProgress
          steps={STEPS.map(s => s.label)}
          currentStep={step}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        <div className="mt-8 max-w-4xl mx-auto">
          {step === 0 && <VehicleInfoStep state={state} updateState={updateState} onNext={next} />}
          {step === 1 && <PlanSelectionStep state={state} updateState={updateState} onNext={next} onBack={back} />}
          {step === 2 && <TermPricingStep state={state} updateState={updateState} onNext={next} onBack={back} />}
          {step === 3 && <AddOnsStep state={state} updateState={updateState} onNext={next} onBack={back} />}
          {step === 4 && <CustomerInfoStep state={state} updateState={updateState} onNext={next} onBack={back} />}
          {step === 5 && <ReviewStep state={state} onBack={back} />}
        </div>
      </div>
    </div>
  );
};

export default PurchaseWizard;
