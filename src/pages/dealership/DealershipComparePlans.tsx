import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import ComparisonMatrix from "@/components/brochure/ComparisonMatrix";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const DealershipComparePlans = () => {
  return (
    <DashboardLayout navItems={dealershipNavItems} title="Compare Plans">
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/dealership/find-products">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Products
          </Link>
        </Button>

        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Plan Comparison</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Side-by-side coverage comparison across all warranty tiers.
          </p>
        </div>

        <ComparisonMatrix basePath="/dealership/plans" />

        <p className="text-xs text-muted-foreground italic">
          * "Top Up Warranty" is an add-on that extends your coverage from one tier to another.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default DealershipComparePlans;
