import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, ChevronRight } from "lucide-react";
import type { WarrantyPlan } from "@/data/warrantyPlans";

interface PlanCardProps {
  plan: WarrantyPlan;
  isSelected?: boolean;
  onToggleCompare?: (slug: string) => void;
}

const PlanCard = ({ plan, isSelected, onToggleCompare }: PlanCardProps) => {
  const coverageCount = plan.includedCoverage.length;

  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary to-accent" />
      
      <CardContent className="p-5 space-y-4">
        {/* Provider badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px] font-medium">
            {plan.provider}
          </Badge>
          {plan.tier && (
            <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
              {plan.tier}
            </Badge>
          )}
        </div>

        {/* Plan name */}
        <div>
          <h3 className="font-display font-bold text-lg text-foreground leading-tight">
            {plan.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{plan.claimRange}</p>
        </div>

        {/* Eligibility */}
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          {plan.eligibility}
        </p>

        {/* Coverage count */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">{coverageCount} items</span>
            <span className="text-xs text-muted-foreground ml-1">covered</span>
          </div>
        </div>

        {/* Highlights */}
        <ul className="space-y-1.5">
          {plan.highlights.slice(0, 3).map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild size="sm" className="flex-1 gap-1">
            <Link to={`/brochure/${plan.slug}`}>
              View Details
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {onToggleCompare && (
            <Button
              size="sm"
              variant={isSelected ? "secondary" : "outline"}
              className="gap-1"
              onClick={() => onToggleCompare(plan.slug)}
            >
              <Plus className={`h-3.5 w-3.5 ${isSelected ? "rotate-45" : ""} transition-transform`} />
              {isSelected ? "Remove" : "Compare"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
