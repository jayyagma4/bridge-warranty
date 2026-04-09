import { Truck, MapPin, Wrench, Car, Shield } from "lucide-react";

interface Benefit {
  name: string;
  description: string;
  limit: string;
}

interface BenefitsSectionProps {
  benefits: Benefit[];
}

const iconMap: Record<string, React.ReactNode> = {
  "Towing": <Truck className="h-5 w-5" />,
  "Trip Interruption": <MapPin className="h-5 w-5" />,
  "Roadside Coverage": <Shield className="h-5 w-5" />,
  "Car Rental": <Car className="h-5 w-5" />,
  "Free Diagnostics": <Wrench className="h-5 w-5" />,
};

const BenefitsSection = ({ benefits }: BenefitsSectionProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {benefits.map((benefit) => (
        <div
          key={benefit.name}
          className="rounded-lg border bg-card p-4 space-y-2 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {iconMap[benefit.name] || <Shield className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">{benefit.name}</h4>
              <span className="text-xs font-medium text-accent">{benefit.limit}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {benefit.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BenefitsSection;
