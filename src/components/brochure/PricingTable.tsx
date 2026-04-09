import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { PricingTier, WarrantyPlan } from "@/data/warrantyPlans";

interface PricingTableProps {
  plan: WarrantyPlan;
}

const formatPrice = (val: number | string | null) => {
  if (val === null || val === "n/a") return <span className="text-muted-foreground text-xs">n/a</span>;
  if (val === "Included") return <span className="text-primary font-medium text-xs">Included</span>;
  if (typeof val === "number") return <span className="font-semibold">${val.toLocaleString()}</span>;
  return <span>{val}</span>;
};

const PricingTierTable = ({ tier }: { tier: PricingTier }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="font-semibold">
          ${tier.perClaimAmount.toLocaleString()} Per Claim
        </Badge>
        <span className="text-xs text-muted-foreground">
          ${tier.deductible} Deductible
        </span>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0f1b3d]">
              <TableHead className="text-white/80 text-xs font-medium min-w-[140px]">Option</TableHead>
              {tier.terms.map((t, i) => (
                <TableHead key={i} className="text-white/80 text-xs font-medium text-center min-w-[100px]">
                  {t.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Mileage bands for Diamond Plus */}
            {tier.mileageBands?.map((band, bi) => (
              <TableRow key={`band-${bi}`} className="bg-primary/5 hover:bg-primary/10">
                <TableCell className="font-semibold text-xs text-foreground">{band.label}</TableCell>
                {band.values.map((v, vi) => (
                  <TableCell key={vi} className="text-center text-sm font-bold text-primary">
                    ${v.toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            {/* Regular rows */}
            {tier.rows.map((row, ri) => (
              <TableRow
                key={ri}
                className={`hover:bg-muted/50 transition-colors ${
                  row.label === "Base Price" ? "bg-muted/30 font-semibold" : ""
                }`}
              >
                <TableCell className={`text-xs ${
                  row.label === "Base Price" ? "font-semibold text-foreground" : "text-muted-foreground"
                } ${
                  row.label === "Premium Vehicle Fee" ? "text-amber-600" : ""
                }`}>
                  {row.label}
                </TableCell>
                {row.values.map((v, vi) => (
                  <TableCell key={vi} className={`text-center text-sm ${
                    row.label === "Base Price" ? "text-foreground" : ""
                  }`}>
                    {formatPrice(v)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const PricingTable = ({ plan }: PricingTableProps) => {
  const [activeTab, setActiveTab] = useState("0");

  if (plan.pricingTiers.length === 1) {
    return (
      <div className="space-y-4">
        <PricingTierTable tier={plan.pricingTiers[0]} />
        {plan.premiumVehicleFee && <PremiumVehicleFeeNotice makes={plan.premiumVehicleFee.makes} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          {plan.pricingTiers.map((tier, i) => (
            <TabsTrigger key={i} value={String(i)} className="text-xs">
              ${tier.perClaimAmount.toLocaleString()}/claim
            </TabsTrigger>
          ))}
        </TabsList>
        {plan.pricingTiers.map((tier, i) => (
          <TabsContent key={i} value={String(i)}>
            <PricingTierTable tier={tier} />
          </TabsContent>
        ))}
      </Tabs>
      {plan.premiumVehicleFee && <PremiumVehicleFeeNotice makes={plan.premiumVehicleFee.makes} />}
    </div>
  );
};

const PremiumVehicleFeeNotice = ({ makes }: { makes: string[] }) => (
  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/30 p-4">
    <div className="flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Premium Vehicle Fee</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1">
          Additional charge applies for: {makes.join(", ")}
        </p>
        <p className="text-[10px] text-amber-600/60 mt-1 italic">List is subject to change without notice.</p>
      </div>
    </div>
  </div>
);

export default PricingTable;
