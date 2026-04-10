import { Check } from "lucide-react";

interface PurchaseProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps?: boolean[];
  onStepClick?: (stepIndex: number) => void;
}

const PurchaseProgress = ({ steps, currentStep, completedSteps, onStepClick }: PurchaseProgressProps) => {
  return (
    <div className="flex items-center justify-between max-w-3xl mx-auto">
      {steps.map((label, i) => {
        const isCompleted = completedSteps?.[i] ?? i < currentStep;
        const isCurrent = i === currentStep;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(i)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isCompleted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    : isCurrent
                    ? "bg-primary/20 text-primary border-2 border-primary cursor-default"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  isClickable && !isCurrent ? "cursor-pointer hover:text-primary" : ""
                } ${isCurrent ? "text-primary" : "text-muted-foreground"}`}
                onClick={() => isClickable && onStepClick?.(i)}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mt-[-12px] ${isCompleted ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseProgress;
