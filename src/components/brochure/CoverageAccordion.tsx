import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";
import type { CoverageCategory } from "@/data/warrantyPlans";

interface CoverageAccordionProps {
  categories: CoverageCategory[];
  includedCoverage: string[];
}

const parseParts = (parts: string): string[] => {
  return parts
    .split(/,\s*/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
};

const CoverageAccordion = ({ categories, includedCoverage }: CoverageAccordionProps) => {
  return (
    <Accordion type="multiple" className="space-y-3">
      {categories.map((cat) => {
        const isIncluded = includedCoverage.some(c =>
          c.toLowerCase().includes(cat.name.toLowerCase()) ||
          cat.name.toLowerCase().includes(c.toLowerCase().replace("/starter/solenoid", "").replace("& rear ", ""))
        );
        const partsList = parseParts(cat.parts);

        return (
          <AccordionItem
            key={cat.name}
            value={cat.name}
            className="border rounded-xl px-5 bg-card data-[state=open]:shadow-sm"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isIncluded
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isIncluded ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-[10px]">—</span>
                  )}
                </div>
                <span className="font-semibold text-foreground">{cat.name}</span>
                <span className="text-xs text-muted-foreground font-medium">
                  ({partsList.length} parts)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 pl-9">
                {partsList.map((part, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">{part}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default CoverageAccordion;
