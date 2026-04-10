import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import BrochureHeader from "@/components/brochure/BrochureHeader";
import ComparisonMatrix from "@/components/brochure/ComparisonMatrix";

const ComparePlans = () => {
  return (
    <div className="min-h-screen bg-background">
      <BrochureHeader />

      <div className="pt-16 bg-gradient-to-br from-[hsl(225,80%,15%)] to-[hsl(225,60%,25%)] text-white">
        <div className="container mx-auto px-4 py-12">
          <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <Link to="/brochure"><ArrowLeft className="mr-1 h-4 w-4" /> All Plans</Link>
          </Button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">Coverage Comparison</h1>
              <p className="text-white/60 mt-2 max-w-lg">
                Compare all warranty plans side by side. See exactly what's included, available as an add-on, or coverage-specific for each plan.
              </p>
            </div>
            <Button asChild size="lg" className="bg-accent text-[#0f1b3d] hover:bg-accent/90 font-semibold">
              <Link to="/purchase">
                <ShoppingCart className="mr-1 h-4 w-4" /> Get a Quote
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ComparisonMatrix />

        {/* Note about Top Up */}
        <div className="mt-6 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Note:</span> The <span className="font-semibold">Top Up Warranty</span> is an add-on to existing manufacturer powertrain warranty coverage — it is not sold as a standalone plan. Click any plan header to view full details and pricing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparePlans;
