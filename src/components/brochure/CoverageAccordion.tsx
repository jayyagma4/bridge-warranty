import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";
import type { CoverageCategory } from "@/data/warrantyPlans";

interface CoverageAccordionProps {
  categories: CoverageCategory[];
  includedCoverage: string[];
}

const CoverageAccordion = ({ categories, includedCoverage }: CoverageAccordionProps) => {
  return (
    <Accordion type="multiple" className="space-y-2">
      {categories.map((cat) => {
        const isIncluded = includedCoverage.some(c =>
          c.toLowerCase().includes(cat.name.toLowerCase()) ||
          cat.name.toLowerCase().includes(c.toLowerCase().replace("/starter/solenoid", "").replace("& rear ", ""))
        );

        return (
          <AccordionItem
            key={cat.name}
            value={cat.name}
            className="border rounded-lg px-4 bg-card data-[state=open]:shadow-sm"
          >
            <AccordionTrigger className="hover:no-underline py-3">
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
                <span className="font-medium text-sm text-foreground">{cat.name}</span>
                {isIncluded && (
                  <span className="text-[10px] text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full">
                    INCLUDED
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed pl-9">
                {cat.parts}
              </p>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default CoverageAccordion;
