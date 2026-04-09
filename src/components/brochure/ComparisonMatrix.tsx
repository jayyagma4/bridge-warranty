import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Circle } from "lucide-react";
import { coverageMatrix, PLAN_COLUMNS, type CoverageStatus } from "@/data/coverageMatrix";

interface ComparisonMatrixProps {
  selectedPlanKeys?: string[];
}

const StatusIcon = ({ status }: { status: CoverageStatus }) => {
  switch (status) {
    case "included":
      return (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      );
    case "available":
      return (
        <div className="flex items-center justify-center">
          <Circle className="h-3 w-3 fill-accent text-accent" />
        </div>
      );
    default:
      return <div className="flex items-center justify-center text-muted-foreground/30">—</div>;
  }
};

const ComparisonMatrix = ({ selectedPlanKeys }: ComparisonMatrixProps) => {
  const columns = selectedPlanKeys
    ? PLAN_COLUMNS.filter(c => selectedPlanKeys.includes(c.key))
    : PLAN_COLUMNS;

  const powertrainRows = coverageMatrix.filter(r => r.section === "powertrain");
  const additionalRows = coverageMatrix.filter(r => r.section === "additional");

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#0f1b3d]">
            <TableHead className="text-white/80 text-xs font-medium min-w-[160px] sticky left-0 bg-[#0f1b3d] z-10">
              Coverage
            </TableHead>
            {columns.map(col => (
              <TableHead key={col.key} className="text-center min-w-[110px]">
                <div className="text-white text-xs font-bold">{col.label}</div>
                <div className="text-white/50 text-[10px]">{col.sublabel}</div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Powertrain section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={columns.length + 1} className="py-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Powertrain Coverage
              </span>
            </TableCell>
          </TableRow>
          {powertrainRows.map(row => (
            <TableRow key={row.category} className="hover:bg-muted/30">
              <TableCell className="text-xs font-medium text-foreground sticky left-0 bg-card z-10">
                {row.category}
              </TableCell>
              {columns.map(col => (
                <TableCell key={col.key} className="text-center">
                  <StatusIcon status={row.values[col.key] || "none"} />
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* Additional Options section */}
          <TableRow className="bg-muted/50">
            <TableCell colSpan={columns.length + 1} className="py-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Additional Options
              </span>
            </TableCell>
          </TableRow>
          {additionalRows.map(row => (
            <TableRow key={row.category} className="hover:bg-muted/30">
              <TableCell className="text-xs font-medium text-foreground sticky left-0 bg-card z-10">
                {row.category}
              </TableCell>
              {columns.map(col => (
                <TableCell key={col.key} className="text-center">
                  <StatusIcon status={row.values[col.key] || "none"} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Legend */}
      <div className="flex items-center gap-6 p-3 border-t bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-3 w-3 text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground">Included</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-accent text-accent" />
          <span className="text-[11px] text-muted-foreground">Available Add-on</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/30 text-sm">—</span>
          <span className="text-[11px] text-muted-foreground">Not Available</span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonMatrix;
