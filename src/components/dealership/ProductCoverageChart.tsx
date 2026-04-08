import React from "react";
import { Check, Circle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type CoverageStatus = "included" | "not_included" | "term_specific";

interface CoverageItem {
  key: string;
  label: string;
}

const POWERTRAIN_ITEMS: CoverageItem[] = [
  { key: "engine", label: "Engine" },
  { key: "transmission", label: "Transmission" },
  { key: "transfer_case", label: "Transfer Case / 4×4" },
  { key: "turbo_supercharger", label: "Turbo / Supercharger" },
  { key: "differential", label: "Differential Assembly" },
  { key: "drive_axle", label: "Drive Axle" },
  { key: "cooling_system", label: "Cooling System" },
  { key: "fuel_system", label: "Fuel Delivery System" },
  { key: "exhaust", label: "Exhaust System" },
  { key: "hybrid_ev", label: "Hybrid / EV Components" },
];

const ADDITIONAL_ITEMS: CoverageItem[] = [
  { key: "air_conditioning", label: "Air Conditioning / Heating" },
  { key: "electrical", label: "Electrical System" },
  { key: "brakes", label: "Brake System" },
  { key: "steering", label: "Steering Components" },
  { key: "suspension", label: "Suspension" },
  { key: "seals_gaskets", label: "Seals & Gaskets" },
  { key: "technology", label: "Technology / Infotainment" },
  { key: "roadside_assistance", label: "24/7 Roadside Assistance" },
  { key: "rental_car", label: "Rental Car Allowance" },
  { key: "trip_interruption", label: "Trip Interruption" },
];

interface ProductCoverageChartProps {
  productName: string;
  providerName: string;
  productType?: string;
  claimRange?: string;
  coverageDetails?: Record<string, any> | null;
}

const StatusIcon = ({ status }: { status: CoverageStatus }) => {
  switch (status) {
    case "included":
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600">
          <Check className="w-4 h-4" strokeWidth={3} />
        </span>
      );
    case "term_specific":
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-100 text-sky-600">
          <Info className="w-4 h-4" strokeWidth={2.5} />
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-500">
          <Circle className="w-3 h-3 fill-current" />
        </span>
      );
  }
};

const getStatus = (
  coverageDetails: Record<string, any> | null | undefined,
  section: string,
  key: string
): CoverageStatus => {
  if (!coverageDetails) return "not_included";
  const sectionData = coverageDetails[section];
  if (!sectionData || typeof sectionData !== "object") return "not_included";
  const val = sectionData[key];
  if (val === "included" || val === true) return "included";
  if (val === "term_specific") return "term_specific";
  return "not_included";
};

const CoverageSection = ({
  title,
  items,
  section,
  coverageDetails,
}: {
  title: string;
  items: CoverageItem[];
  section: string;
  coverageDetails: Record<string, any> | null | undefined;
}) => (
  <div>
    <div className="px-6 py-3 bg-[hsl(225,50%,18%)] border-b border-white/10">
      <h3 className="text-sm font-bold text-white tracking-wide uppercase">{title}</h3>
    </div>
    <div>
      {items.map((item, i) => {
        const status = getStatus(coverageDetails, section, item.key);
        return (
          <div
            key={item.key}
            className={cn(
              "flex items-center justify-between px-6 py-3 border-b border-border/50",
              i % 2 === 0 ? "bg-background" : "bg-muted/30"
            )}
          >
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            <StatusIcon status={status} />
          </div>
        );
      })}
    </div>
  </div>
);

const ProductCoverageChart: React.FC<ProductCoverageChartProps> = ({
  productName,
  providerName,
  productType,
  claimRange,
  coverageDetails,
}) => {
  const details = coverageDetails as Record<string, any> | null;
  const displayClaimRange = claimRange || (details?.claim_range as string) || null;

  return (
    <div className="max-w-2xl mx-auto bg-card rounded-xl overflow-hidden shadow-lg border border-border">
      {/* Header */}
      <div className="bg-gradient-to-br from-[hsl(225,50%,15%)] to-[hsl(225,50%,22%)] px-6 py-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(45,93%,58%,0.08),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(45,93%,58%)] flex items-center justify-center">
              <span className="text-[hsl(225,50%,15%)] font-extrabold text-xs">BW</span>
            </div>
            <span className="text-white/90 font-bold text-sm tracking-widest uppercase">Bridge Warranty</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white mt-4 tracking-tight">
            Extended Warranty Coverage
          </h1>
          <div className="mt-2 h-0.5 w-16 mx-auto bg-[hsl(45,93%,58%)] rounded-full" />
          <p className="text-white/80 text-base font-semibold mt-4">{productName}</p>
          <p className="text-white/50 text-sm mt-1">by {providerName}</p>
          {productType && (
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium tracking-wide uppercase">
              {productType}
            </span>
          )}
          {displayClaimRange && (
            <p className="text-[hsl(45,93%,58%)] text-sm font-bold mt-4 tracking-wide">
              {displayClaimRange} Per Claim
            </p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mx-6 my-5 rounded-lg bg-[hsl(45,90%,95%)] border border-[hsl(45,80%,80%)] px-5 py-3">
        <p className="text-xs font-bold text-[hsl(45,50%,30%)] uppercase tracking-wider mb-2">Legend</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-2 text-sm text-foreground">
            <StatusIcon status="included" />
            Included
          </span>
          <span className="flex items-center gap-2 text-sm text-foreground">
            <StatusIcon status="not_included" />
            Not Included
          </span>
          <span className="flex items-center gap-2 text-sm text-foreground">
            <StatusIcon status="term_specific" />
            Term / Coverage Specific
          </span>
        </div>
      </div>

      {/* Powertrain */}
      <CoverageSection
        title="Powertrain Coverage"
        items={POWERTRAIN_ITEMS}
        section="powertrain"
        coverageDetails={details}
      />

      {/* Additional */}
      <div className="mt-1">
        <CoverageSection
          title="Additional Coverage & Benefits"
          items={ADDITIONAL_ITEMS}
          section="additional"
          coverageDetails={details}
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-5 bg-muted/40 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-md mx-auto">
          Coverage details are subject to the terms and conditions of the specific warranty contract.
          This chart is for illustration purposes only. Contact your dealership for full plan details.
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 opacity-60">
          <div className="w-5 h-5 rounded bg-[hsl(45,93%,58%)] flex items-center justify-center">
            <span className="text-[hsl(225,50%,15%)] font-extrabold text-[8px]">BW</span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground tracking-wider">BRIDGE WARRANTY</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCoverageChart;
