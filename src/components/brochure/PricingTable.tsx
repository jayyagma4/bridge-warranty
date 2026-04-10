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
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Tier header — brochure-style large claim amount */}
      <div className="bg-gradient-to-r from-[#0f1b3d] to-[#1a3066] px-5 py-4 flex items-center justify-between">
        <div>
          <span className="font-display font-bold text-2xl text-white">
            ${tier.perClaimAmount.toLocaleString()}
          </span>
          <span className="text-white/60 text-sm ml-2">Per Claim</span>
        </div>
        <Badge className="bg-white/15 text-white/80 border-white/20 text-xs">
          ${tier.deductible} Deductible
        </Badge>
      </div>

      {/* Pricing table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold text-muted-foreground min-w-[160px]">
                Option
              </TableHead>
              {tier.terms.map((t, i) => (
                <TableHead key={i} className="text-center min-w-[110px]">
                  <div className="text-xs font-semibold text-foreground">{t.label.split("\n")[0] || t.label}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{t.km}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Mileage bands for Diamond Plus */}
            {tier.mileageBands?.map((band, bi) => (
              <TableRow key={`band-${bi}`} className="bg-primary/5 hover:bg-primary/10 border-b">
                <TableCell className="font-semibold text-xs text-foreground">{band.label}</TableCell>
                {band.values.map((v, vi) => (
                  <TableCell key={vi} className="text-center text-sm font-bold text-primary">
                    ${v.toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            {/* Base price row — highlighted */}
            {tier.rows.filter(r => r.label === "Base Price").map((row, ri) => (
              <TableRow key={ri} className="bg-accent/5 border-b-2 border-accent/20">
                <TableCell className="font-bold text-sm text-foreground">Base Price</TableCell>
                {row.values.map((v, vi) => (
                  <TableCell key={vi} className="text-center text-base font-bold text-foreground">
                    {formatPrice(v)}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Add-on rows */}
            {tier.rows.filter(r => r.label !== "Base Price").map((row, ri) => (
              <TableRow
                key={ri}
                className={`hover:bg-muted/30 transition-colors ${
                  row.label === "Premium Vehicle Fee" ? "bg-amber-50/50 dark:bg-amber-950/10" : ""
                }`}
              >
                <TableCell className={`text-xs ${
                  row.label === "Premium Vehicle Fee"
                    ? "text-amber-700 dark:text-amber-400 font-medium"
                    : "text-muted-foreground"
                }`}>
                  {row.label === "Premium Vehicle Fee" && (
                    <AlertTriangle className="h-3 w-3 inline mr-1 -mt-0.5" />
                  )}
                  {row.label}
                </TableCell>
                {row.values.map((v, vi) => (
                  <TableCell key={vi} className="text-center text-sm">
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
  return (
    <div className="space-y-6">
      {/* All tiers stacked — brochure-style */}
      {plan.pricingTiers.map((tier, i) => (
        <PricingTierTable key={i} tier={tier} />
      ))}
      
      {plan.premiumVehicleFee && <PremiumVehicleFeeNotice makes={plan.premiumVehicleFee.makes} />}
    </div>
  );
};

const PremiumVehicleFeeNotice = ({ makes }: { makes: string[] }) => (
  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/30 p-5">
    <div className="flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Premium Vehicle Fee</p>
        <p className="text-sm text-amber-700/80 dark:text-amber-500/80 mt-1">
          Additional charge will apply for the following makes:
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {makes.map(make => (
            <span key={make} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
              {make}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-amber-600/60 mt-2 italic">*List is subject to change without notice.</p>
      </div>
    </div>
  </div>
);

export default PricingTable;
