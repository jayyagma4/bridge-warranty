import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Shield, Check, Star, Info } from "lucide-react";
import BrochureHeader, { useDealerMode } from "@/components/brochure/BrochureHeader";
import { tireRimTiers, vehicleClasses, coveredServices } from "@/data/tireRimPlans";

const TireRimPage = () => {
  const dealerMode = useDealerMode();
  const [activeTier, setActiveTier] = useState("essential");

  return (
    <div className="min-h-screen bg-background">
      <BrochureHeader />

      {/* Hero */}
      <section className="pt-16 bg-gradient-to-br from-[#0f1b3d] to-[#1a3066] text-white">
        <div className="container mx-auto px-4 py-12">
          <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <Link to="/brochure"><ArrowLeft className="mr-1 h-4 w-4" /> All Plans</Link>
          </Button>
          <Badge className="bg-accent/20 text-accent border-accent/30 mb-3">A-Protect</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Tire & Rim Protection</h1>
          <p className="text-white/60 mt-2">Available on vehicles 10 years or newer. Not eligible for commercial use.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Tier cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {tireRimTiers.map(tier => (
            <div
              key={tier.slug}
              onClick={() => setActiveTier(tier.slug)}
              className={`rounded-lg border p-5 space-y-3 cursor-pointer transition-all ${
                activeTier === tier.slug
                  ? "ring-2 ring-primary shadow-md border-primary/30"
                  : "hover:border-primary/20 bg-card"
              } ${tier.bestValue ? "relative" : ""}`}
            >
              {tier.bestValue && (
                <Badge className="absolute -top-2.5 right-4 bg-accent text-[#0f1b3d] font-semibold gap-1">
                  <Star className="h-3 w-3" /> Best Value
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold text-foreground">{tier.name}</h3>
              </div>
              <ul className="space-y-1.5">
                {tier.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pricing */}
        {dealerMode && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-foreground">Pricing</h2>
            <Tabs value={activeTier} onValueChange={setActiveTier}>
              <TabsList>
                {tireRimTiers.map(t => (
                  <TabsTrigger key={t.slug} value={t.slug} className="text-xs">{t.name}</TabsTrigger>
                ))}
              </TabsList>
              {tireRimTiers.map(tier => (
                <TabsContent key={tier.slug} value={tier.slug}>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#0f1b3d]">
                          <TableHead className="text-white/80 text-xs font-medium">Term</TableHead>
                          <TableHead className="text-white/80 text-xs font-medium text-center">Class 1</TableHead>
                          <TableHead className="text-white/80 text-xs font-medium text-center">Class 2</TableHead>
                          <TableHead className="text-white/80 text-xs font-medium text-center">Class 3</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tier.pricing.map((row, i) => (
                          <TableRow key={i} className="hover:bg-muted/50">
                            <TableCell className="text-xs font-medium text-foreground">{row.term}</TableCell>
                            <TableCell className="text-center text-sm font-semibold">${row.class1.toLocaleString()}</TableCell>
                            <TableCell className="text-center text-sm font-semibold">${row.class2.toLocaleString()}</TableCell>
                            <TableCell className="text-center text-sm font-semibold">${row.class3.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* Vehicle classes */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">Vehicle Classes</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {vehicleClasses.map(vc => (
              <div key={vc.classNumber} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary text-sm">{vc.classNumber}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">Class {vc.classNumber}</h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  {vc.makes.map(make => (
                    <Badge key={make} variant="secondary" className="text-[10px]">{make}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Covered services */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">Covered Services</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {coveredServices.map(service => (
              <div key={service.name} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{service.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TireRimPage;
