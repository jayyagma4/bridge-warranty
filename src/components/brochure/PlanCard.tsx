import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, ChevronRight, Shield } from "lucide-react";
import type { WarrantyPlan } from "@/data/warrantyPlans";

interface PlanCardProps {
  plan: WarrantyPlan;
  isSelected?: boolean;
  onToggleCompare?: (slug: string) => void;
}

const PlanCard = ({ plan, isSelected, onToggleCompare }: PlanCardProps) => {
  const coverageCount = plan.includedCoverage.length;
  const hasPricing = plan.pricingTiers.length > 0;
  const priceRange = hasPricing
    ? plan.pricingTiers.length === 1
      ? `$${plan.pricingTiers[0].perClaimAmount.toLocaleString()}`
      : `$${Math.min(...plan.pricingTiers.map(t => t.perClaimAmount)).toLocaleString()} – $${Math.max(...plan.pricingTiers.map(t => t.perClaimAmount)).toLocaleString()}`
    : null;

  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary to-accent" />
      
      <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
        {/* Provider + tier badges */}
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

        {/* Plan name + claim range */}
        <div>
          <h3 className="font-display font-bold text-lg text-foreground leading-tight">
            {plan.name}
          </h3>
          {priceRange && (
            <p className="text-sm font-semibold text-primary mt-0.5">{priceRange} Per Claim</p>
          )}
        </div>

        {/* Eligibility */}
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          {plan.eligibility}
        </p>

        {/* Coverage count + key features */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">{coverageCount} items</span>
            <span className="text-xs text-muted-foreground ml-1">covered</span>
          </div>
        </div>

        {/* Included coverage list */}
        <div className="flex-1">
          <ul className="space-y-1">
            {plan.includedCoverage.slice(0, 5).map((item, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-primary shrink-0" />
                {item}
              </li>
            ))}
            {plan.includedCoverage.length > 5 && (
              <li className="text-xs text-primary font-medium pl-[18px]">
                +{plan.includedCoverage.length - 5} more
              </li>
            )}
          </ul>
        </div>

        {/* Pricing tiers preview */}
        {hasPricing && plan.pricingTiers.length > 1 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {plan.pricingTiers.map((tier, i) => (
              <span
                key={i}
                className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
              >
                ${tier.perClaimAmount.toLocaleString()}
              </span>
            ))}
          </div>
        )}

        {/* Add-ons indicator */}
        {!plan.premiumFees && (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] border-accent/30 text-accent bg-accent/5">
              $0 Premium Fees
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 mt-auto">
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
