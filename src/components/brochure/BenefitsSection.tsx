import { Check } from "lucide-react";

interface Benefit {
  name: string;
  description: string;
  limit: string;
}

interface BenefitsSectionProps {
  benefits: Benefit[];
}

const BenefitsSection = ({ benefits }: BenefitsSectionProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {benefits.map((benefit) => (
        <div
          key={benefit.name}
          className="rounded-xl border bg-card p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow"
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <Check className="h-4 w-4" />
          </div>
          <div className="space-y-1 min-w-0">
            <h4 className="font-bold text-foreground">{benefit.name}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {benefit.description}
            </p>
            <p className="text-sm font-semibold text-primary">{benefit.limit}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BenefitsSection;
