import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Circle } from "lucide-react";
import { coverageMatrix, PLAN_COLUMNS, type CoverageStatus, type PlanColumn } from "@/data/coverageMatrix";

interface ComparisonMatrixProps {
  selectedPlanKeys?: string[];
}

const StatusIcon = ({ status }: { status: CoverageStatus }) => {
  switch (status) {
    case "included":
      return (
        <div className="flex items-center justify-center">
          <Check className="h-4 w-4 text-primary" strokeWidth={3} />
        </div>
      );
    case "available":
      return (
        <div className="flex items-center justify-center">
          <Circle className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        </div>
      );
    case "specific":
      return (
        <div className="flex items-center justify-center">
          <Circle className="h-3.5 w-3.5 fill-sky-500 text-sky-500" />
        </div>
      );
    default:
      return <div className="flex items-center justify-center text-muted-foreground/20">—</div>;
  }
};

const PlanHeader = ({ col }: { col: PlanColumn }) => {
  // Map column keys to plan detail slugs
  const slugMap: Record<string, string> = {
    powertrain: "powertrain-bronze",
    essential: "essential",
    "premium-special": "premium-special",
    luxury: "luxury",
    "diamond-plus": "diamond-plus",
    "top-up": "top-up",
  };

  return (
    <TableHead key={col.key} className="text-center p-0 min-w-[120px]">
      <Link
        to={`/brochure/${slugMap[col.key] || col.key}`}
        className="block p-3 hover:opacity-90 transition-opacity"
        style={{ backgroundColor: col.color }}
      >
        <div
          className="text-xs font-bold leading-tight"
          style={{ color: col.textColor || "white" }}
        >
          {col.label}
        </div>
        <div
          className="text-[10px] leading-tight mt-0.5 opacity-70"
          style={{ color: col.textColor || "white" }}
        >
          {col.sublabel}
        </div>
        <div
          className="text-[10px] font-bold mt-1.5 pt-1.5 border-t"
          style={{
            color: col.textColor || "white",
            borderColor: col.textColor ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.25)",
          }}
        >
          {col.claimRange}
        </div>
        <div
          className="text-[9px] opacity-60"
          style={{ color: col.textColor || "white" }}
        >
          Per Claim
        </div>
      </Link>
    </TableHead>
  );
};

const ComparisonMatrix = ({ selectedPlanKeys }: ComparisonMatrixProps) => {
  const columns = selectedPlanKeys
    ? PLAN_COLUMNS.filter(c => selectedPlanKeys.includes(c.key))
    : PLAN_COLUMNS;

  const powertrainRows = coverageMatrix.filter(r => r.section === "powertrain");
  const additionalRows = coverageMatrix.filter(r => r.section === "additional");

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 px-1">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" strokeWidth={3} />
          <span className="text-xs font-semibold text-foreground">INCLUDED</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-foreground">AVAILABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-3.5 w-3.5 fill-sky-500 text-sky-500" />
          <span className="text-xs font-semibold text-foreground">TERM(S) AND/OR COVERAGE SPECIFIC</span>
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px] sticky left-0 z-10 bg-card" />
              {columns.map(col => (
                <PlanHeader key={col.key} col={col} />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Powertrain Coverage section */}
            <TableRow className="bg-muted/60 border-y">
              <TableCell
                className="py-2.5 sticky left-0 z-10 bg-muted/60"
              >
                <span className="text-[11px] font-extrabold text-foreground uppercase tracking-widest">
                  Powertrain Coverage
                </span>
              </TableCell>
              {columns.map(col => (
                <TableCell key={col.key} />
              ))}
            </TableRow>
            {powertrainRows.map((row, i) => (
              <TableRow key={row.category} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                <TableCell className={`text-sm text-foreground sticky left-0 z-10 py-2.5 ${i % 2 === 0 ? "bg-card" : "bg-muted/20"} ${row.bold ? "font-bold" : ""} ${row.highlight ? "text-primary font-semibold" : ""}`}>
                  {row.category}
                </TableCell>
                {columns.map(col => (
                  <TableCell key={col.key} className="text-center py-2.5">
                    <StatusIcon status={row.values[col.key] || "none"} />
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Additional Options section */}
            <TableRow className="bg-muted/60 border-y">
              <TableCell
                className="py-2.5 sticky left-0 z-10 bg-muted/60"
              >
                <span className="text-[11px] font-extrabold text-foreground uppercase tracking-widest">
                  Additional Options
                </span>
              </TableCell>
              {columns.map(col => (
                <TableCell key={col.key} />
              ))}
            </TableRow>
            {additionalRows.map((row, i) => (
              <TableRow key={row.category} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                <TableCell className={`text-sm text-foreground sticky left-0 z-10 py-2.5 ${i % 2 === 0 ? "bg-card" : "bg-muted/20"} ${row.bold ? "font-bold" : ""} ${row.highlight ? "text-primary font-semibold" : ""}`}>
                  {row.category}
                </TableCell>
                {columns.map(col => (
                  <TableCell key={col.key} className="text-center py-2.5">
                    <StatusIcon status={row.values[col.key] || "none"} />
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

export default ComparisonMatrix;
