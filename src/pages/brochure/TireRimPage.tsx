import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Check, Star, Info, AlertTriangle, CircleCheck } from "lucide-react";
import BrochureHeader from "@/components/brochure/BrochureHeader";
import {
  tireRimTiers,
  vehicleClasses,
  coveredServices,
  eligibilityConditions,
  disclaimers,
  roadsideCoverageConditions,
} from "@/data/tireRimPlans";

const TireRimPage = () => {
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
          <p className="text-white/60 mt-2">Coverage Plans — Confidential Price List V25</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-12">

        {/* Eligibility Conditions */}
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-5 space-y-3">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Eligibility & Conditions
          </h2>
          <ul className="space-y-2">
            {eligibilityConditions.map((cond, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CircleCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">{cond.label}:</span>{" "}
                  <span className="text-muted-foreground">{cond.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

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
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-foreground">{service.name}</h4>
                      <div className="flex gap-1">
                        {service.tiers.map(tier => (
                          <Badge
                            key={tier}
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 capitalize"
                          >
                            {tier === "essential" ? "Ess." : tier === "extended" ? "Ext." : "Sup."}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                    {service.subItems && (
                      <ul className="space-y-1 ml-1">
                        {service.subItems.map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-0.5 shrink-0">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {service.name === "Roadside Coverage" && (
                      <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                        {roadsideCoverageConditions.map((cond, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground/80 italic">{cond}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimers */}
        <div className="rounded-lg border border-muted bg-muted/20 p-4 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Important Notice</h3>
          {disclaimers.map((d, i) => (
            <p key={i} className="text-xs text-muted-foreground italic">{d}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TireRimPage;
