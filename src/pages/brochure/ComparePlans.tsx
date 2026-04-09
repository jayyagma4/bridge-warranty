import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import BrochureHeader from "@/components/brochure/BrochureHeader";
import ComparisonMatrix from "@/components/brochure/ComparisonMatrix";
import { warrantyPlans } from "@/data/warrantyPlans";
import { PLAN_COLUMNS } from "@/data/coverageMatrix";

const ComparePlans = () => {
  const [searchParams] = useSearchParams();
  const initialPlans = searchParams.get("plans")?.split(",").filter(Boolean) || [];

  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => {
    // Map plan slugs to matrix column keys
    const mapped = initialPlans.map(slug => {
      if (slug.startsWith("powertrain-")) return "powertrain";
      return slug;
    }).filter(key => PLAN_COLUMNS.some(c => c.key === key));
    return [...new Set(mapped)].slice(0, 3);
  });

  const availableColumns = PLAN_COLUMNS;

  const handleSelect = (index: number, value: string) => {
    setSelectedKeys(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addSlot = () => {
    if (selectedKeys.length < 4) {
      const unused = availableColumns.find(c => !selectedKeys.includes(c.key));
      if (unused) setSelectedKeys(prev => [...prev, unused.key]);
    }
  };

  const removeSlot = (index: number) => {
    setSelectedKeys(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <BrochureHeader />

      <div className="pt-16 bg-gradient-to-br from-[#0f1b3d] to-[#1a3066] text-white">
        <div className="container mx-auto px-4 py-12">
          <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <Link to="/brochure"><ArrowLeft className="mr-1 h-4 w-4" /> All Plans</Link>
          </Button>
          <h1 className="font-display text-3xl font-bold">Compare Plans</h1>
          <p className="text-white/60 mt-2">Select 2–4 warranty plans to compare coverage side by side.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Plan selectors */}
        <div className="flex flex-wrap items-end gap-3">
          {selectedKeys.map((key, i) => (
            <div key={i} className="space-y-1">
              <label className="text-xs text-muted-foreground">Plan {i + 1}</label>
              <div className="flex gap-1">
                <Select value={key} onValueChange={(v) => handleSelect(i, v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map(col => (
                      <SelectItem key={col.key} value={col.key}>{col.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedKeys.length > 2 && (
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => removeSlot(i)}>
                    ×
                  </Button>
                )}
              </div>
            </div>
          ))}
          {selectedKeys.length < 4 && (
            <Button variant="outline" size="sm" onClick={addSlot} className="mb-0.5">
              + Add Plan
            </Button>
          )}
        </div>

        {/* Matrix */}
        {selectedKeys.length >= 2 ? (
          <ComparisonMatrix selectedPlanKeys={selectedKeys} />
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            Select at least 2 plans to compare
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePlans;
