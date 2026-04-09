import { useParams, Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check } from "lucide-react";
import BrochureHeader, { useDealerMode } from "@/components/brochure/BrochureHeader";
import CoverageAccordion from "@/components/brochure/CoverageAccordion";
import PricingTable from "@/components/brochure/PricingTable";
import BenefitsSection from "@/components/brochure/BenefitsSection";
import { getPlanBySlug } from "@/data/warrantyPlans";

const PlanDetail = () => {
  const { planSlug } = useParams<{ planSlug: string }>();
  const dealerMode = useDealerMode();
  const plan = getPlanBySlug(planSlug || "");

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <BrochureHeader />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground">Plan not found</h1>
          <Button asChild variant="link" className="mt-4">
            <Link to="/brochure">← Back to all plans</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BrochureHeader />

      {/* Header */}
      <section className="pt-16 bg-gradient-to-br from-[#0f1b3d] via-[#162554] to-[#1a3066] text-white">
        <div className="container mx-auto px-4 py-12">
          <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-6 -ml-2">
            <Link to="/brochure">
              <ArrowLeft className="mr-1 h-4 w-4" /> All Plans
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge className="bg-accent/20 text-accent border-accent/30 mb-3">
                {plan.provider}
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{plan.name}</h1>
              <p className="text-white/60 mt-2">{plan.eligibility}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Claim Range</p>
                <p className="font-semibold text-accent">{plan.claimRange}</p>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Deductible</p>
                <p className="font-semibold text-white">{plan.deductible}</p>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Components</p>
                <p className="font-semibold text-white">{plan.includedCoverage.length} covered</p>
              </div>
            </div>
          </div>

          {/* Included coverage chips */}
          <div className="flex flex-wrap gap-1.5 mt-6">
            {plan.includedCoverage.map(item => (
              <span key={item} className="inline-flex items-center gap-1 bg-white/10 text-white/80 text-xs px-2.5 py-1 rounded-full">
                <Check className="h-3 w-3 text-accent" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="coverage">
          <TabsList className="mb-6">
            <TabsTrigger value="coverage">Coverage Details</TabsTrigger>
            {dealerMode && <TabsTrigger value="pricing">Pricing</TabsTrigger>}
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>

          <TabsContent value="coverage" className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                What's Covered
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Click any category to see the full list of covered components.
              </p>
              <CoverageAccordion
                categories={plan.coverageDetails}
                includedCoverage={plan.includedCoverage}
              />
            </div>
          </TabsContent>

          {dealerMode && (
            <TabsContent value="pricing" className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  Pricing Grid
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Select a per-claim amount to see pricing for all available terms. Add-on options shown below the base price.
                </p>
                <PricingTable plan={plan} />
              </div>
            </TabsContent>
          )}

          <TabsContent value="benefits" className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Included Benefits
              </h2>
              <BenefitsSection benefits={plan.benefits} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlanDetail;
