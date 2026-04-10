import { AlertTriangle, FileText, ShieldAlert, MapPin, Clock, Scale } from "lucide-react";
import { GENERAL_TERMS, GENERAL_EXCLUSIONS, COVERAGE_TERRITORY, WAITING_PERIOD, DISPUTE_RESOLUTION } from "@/data/warrantyPlans";

interface FinePrintSectionProps {
  importantNotes?: string[];
  planExclusions?: string[];
  premiumVehicleFee?: { makes: string[]; note: string };
}

const FinePrintSection = ({ importantNotes, planExclusions, premiumVehicleFee }: FinePrintSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Plan-specific important notes */}
      {importantNotes && importantNotes.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-display font-bold text-foreground">Important Notes for This Plan</h3>
          </div>
          <ul className="space-y-2">
            {importantNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-sm text-foreground/80 leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Premium Vehicle Fee */}
      {premiumVehicleFee && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="font-display font-bold text-foreground">Premium Vehicle Fee</h3>
          </div>
          <p className="text-sm text-foreground/80 mb-3">{premiumVehicleFee.note}</p>
          <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Applicable Makes:</p>
          <div className="flex flex-wrap gap-1.5">
            {premiumVehicleFee.makes.map(make => (
              <span key={make} className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-md font-medium">
                {make}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Waiting Period & Territory */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-display font-bold text-sm text-foreground">Waiting Period</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{WAITING_PERIOD}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-display font-bold text-sm text-foreground">Coverage Territory</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{COVERAGE_TERRITORY}</p>
        </div>
      </div>

      {/* General Terms & Conditions */}
      {GENERAL_TERMS.map((section) => (
        <div key={section.heading} className="rounded-xl border bg-card p-6">
          <h3 className="font-display font-bold text-foreground mb-4">{section.heading}</h3>
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* General Exclusions */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </div>
          <h3 className="font-display font-bold text-foreground">General Exclusions</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">The following are NOT covered under any A-Protect warranty plan:</p>
        <ul className="space-y-2">
          {GENERAL_EXCLUSIONS.map((exclusion, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive/40 shrink-0" />
              <span className="text-sm text-muted-foreground leading-relaxed">{exclusion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Plan-specific exclusions */}
      {planExclusions && planExclusions.length > 0 && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <h3 className="font-display font-bold text-foreground mb-4">Additional Plan-Specific Exclusions</h3>
          <ul className="space-y-2">
            {planExclusions.map((exclusion, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive/40 shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{exclusion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dispute Resolution */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-display font-bold text-sm text-foreground">Dispute Resolution</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{DISPUTE_RESOLUTION}</p>
      </div>

      {/* Disclaimer */}
      <div className="border-t pt-6">
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          This information is provided as a summary of the warranty coverage offered by A-Protect Warranty Corporation. 
          The actual terms and conditions of coverage are governed by the warranty contract issued at the time of purchase. 
          In the event of any discrepancy between this summary and the warranty contract, the warranty contract shall prevail. 
          A-Protect Warranty Corporation reserves the right to modify terms, pricing, and coverage without prior notice. 
          All prices are in Canadian dollars and are subject to applicable taxes. 
          Coverage and benefits described herein are subject to the terms, conditions, limitations, and exclusions set forth in the warranty contract.
        </p>
      </div>
    </div>
  );
};

export default FinePrintSection;
