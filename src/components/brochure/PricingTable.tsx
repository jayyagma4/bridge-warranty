import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Check } from "lucide-react";
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

const PricingTierTable = ({ tier, tierIndex }: { tier: PricingTier; tierIndex: number }) => {
  const baseRow = tier.rows.find(r => r.label === "Base Price");
  const addOnRows = tier.rows.filter(r => r.label !== "Base Price");
  const hasMileageBands = tier.mileageBands && tier.mileageBands.length > 0;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Tier header */}
      <div className="bg-gradient-to-r from-[hsl(225,80%,15%)] to-[hsl(225,70%,25%)] px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-2xl text-white">
              ${tier.perClaimAmount.toLocaleString()}
            </span>
            <span className="text-white/50 text-sm">Per Claim</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/15 text-white/80 border-white/20 text-xs">
              ${tier.deductible} Deductible
            </Badge>
            <Badge className="bg-white/10 text-white/60 border-white/15 text-xs">
              {tier.terms.length} term{tier.terms.length > 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>

      {/* Pricing table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold text-muted-foreground min-w-[160px]">
                &nbsp;
              </TableHead>
              {tier.terms.map((t, i) => (
                <TableHead key={i} className="text-center min-w-[110px]">
                  <div className="text-xs font-bold text-foreground">
                    {t.months} Mo
                  </div>
                  <div className="text-[10px] text-muted-foreground font-normal">
                    {t.km} km
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Mileage bands (Diamond Plus) */}
            {hasMileageBands && (
              <>
                <TableRow className="bg-primary/5">
                  <TableCell colSpan={tier.terms.length + 1} className="py-1.5">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      Base Price by Vehicle Mileage
                    </span>
                  </TableCell>
                </TableRow>
                {tier.mileageBands!.map((band, bi) => (
                  <TableRow key={`band-${bi}`} className="bg-primary/5 hover:bg-primary/10 border-b">
                    <TableCell className="font-semibold text-xs text-foreground">
                      {band.label}
                    </TableCell>
                    {band.values.map((v, vi) => (
                      <TableCell key={vi} className="text-center text-sm font-bold text-primary">
                        ${v.toLocaleString()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}

            {/* Base price row — only if no mileage bands */}
            {!hasMileageBands && baseRow && (
              <TableRow className="bg-accent/5 border-b-2 border-accent/20">
                <TableCell className="font-bold text-sm text-foreground">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    Base Price
                  </div>
                </TableCell>
                {baseRow.values.map((v, vi) => (
                  <TableCell key={vi} className="text-center text-base font-bold text-foreground">
                    {formatPrice(v)}
                  </TableCell>
                ))}
              </TableRow>
            )}

            {/* Add-on section header */}
            {addOnRows.length > 0 && (
              <TableRow>
                <TableCell colSpan={tier.terms.length + 1} className="py-1.5 bg-muted/30">
                  <div className="flex items-center gap-1.5">
                    <Plus className="h-3 w-3 text-accent" />
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                      Available Add-Ons
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Add-on rows */}
            {addOnRows.map((row, ri) => (
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
      {plan.pricingTiers.map((tier, i) => (
        <PricingTierTable key={i} tier={tier} tierIndex={i} />
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
