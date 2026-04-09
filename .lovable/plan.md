

# Bridge Warranty — Digital Coverage Brochure

## Summary

Build a full interactive digital brochure system at `/brochure` that digitizes the A-Protect warranty PDF into a professional, mobile-friendly web experience. This is Bridge Warranty's core sales tool — finance managers use it to present warranty options to customers, and customers can browse it independently. Unlike A-Protect's static PDF, this is interactive with expandable details, side-by-side comparison, and a dealer pricing toggle.

Key difference from A-Protect: Bridge Warranty is a **marketplace** — the brochure architecture supports multiple providers (A-Protect, Peoples Choice, Global Warranty, LGM, etc.), with provider-scoped browsing.

## Data Architecture

Two large static data files with every number from the PDF hardcoded (no database needed):

**`src/data/warrantyPlans.ts`** — Contains all 10 A-Protect warranty plans:
- Powertrain Bronze ($750/claim), Silver ($1000), Gold ($1500), Platinum ($2500 + $3000)
- Essential ($1000/$1500/$3000/$5000/$7500/$10,000 per claim tiers)
- Premium Special ($3000/$4000/$5000 per claim)
- Luxury ($1000/$1500/$2500/$3000 per claim)
- Diamond Plus ($5000/$7500/$10,000/$20,000 per claim, mileage-banded pricing)
- Driver ($1500/$3000 per claim, rideshare/delivery)
- Pro ($5000/$10,000 per claim, commercial trucks)
- Top Up (add-on to manufacturer warranty)

Each plan object includes: name, slug, provider ("A-Protect"), eligibility rules, included coverage list, per-claim-amount pricing grids (term × km with base price + add-on rows), benefits (towing $60, trip interruption $150, roadside $75, car rental $40, diagnostics), premium vehicle fee info, and the full parts list per coverage category.

**`src/data/tireRimPlans.ts`** — Tire & Rim with 3 tiers (Essential/Extended/Superior), 3 vehicle classes, 6 term lengths, and covered services details.

**`src/data/coverageMatrix.ts`** — The page 4 master comparison matrix (Powertrain Coverage + Additional Options rows × plan columns with ✓/●/blank values).

## Pages & Routes

### 1. `/brochure` — BrochureHome
- Bridge Warranty branded hero (navy gradient, gold accents)
- Provider selector tabs (A-Protect shown first, other providers as "Coming Soon" placeholders)
- Grid of warranty plan cards, each showing: plan name, eligibility, claim range, key included items count, highlights
- "View Details" and "Add to Compare" buttons per card
- Tire & Rim section at bottom as separate card group
- Floating "Compare (N)" button when 2+ plans selected

### 2. `/brochure/:planSlug` — PlanDetail
Three tabbed sections:

**Coverage Tab:**
- Accordion list of all coverage categories (Engine, Transmission, Differential, etc.)
- Each accordion header shows ✓ Included / ● Add-on / — Not available status
- Expanding reveals the full parts list (e.g., "Engine block, crankshaft, pistons and piston rings, connecting rods...")
- Benefits section: Towing, Trip Interruption, Roadside, Car Rental, Diagnostics with dollar limits

**Pricing Tab (hidden by default in customer mode):**
- Per-claim-amount selector tabs ($1000 / $1500 / $3000 etc.)
- Interactive pricing grid: rows = term/km combos, columns show base price + each add-on option price
- Highlighted row on hover, responsive horizontal scroll on mobile
- Premium Vehicle Fee notice with the luxury makes list when applicable
- Diamond Plus shows additional mileage band rows (0-60k, 60k-100k, 100k-160k)

**Compare Tab:**
- Quick visual of where this plan sits vs. others using the page 4 matrix for this plan's column

### 3. `/brochure/compare` — ComparePlans
- Select 2-3 plans from dropdowns (pre-filled if navigated from "Add to Compare")
- Full coverage matrix from page 4 rendered as interactive table
- Rows: Engine, Transmission, Transfer Case, Turbo, Differential, Towing, Trip Interruption, Roadside, Seals & Gaskets, Car Rental, Wear & Tear, Electrical, Fuel System, A/C, Brakes, Cooling, Suspension, Power Steering, Supplementary Parts, Zero Deductible, Hi-Tech, Hi-Tech Elite, Powertrain Plus, Hybrid, Unlimited km
- Columns: selected plans with ✓ (included), ● (available add-on), blank (not available)
- Price comparison row at a selected term
- Differences highlighted

### 4. `/brochure/tire-rim` — TireRimPage
- 3 tier cards (Essential/Extended/Superior) with included services
- Vehicle class breakdown (Class 1/2/3 with make lists)
- Pricing tables per tier: 6 terms × 3 classes
- Covered services detail section (from page 19)

## Key Components

```text
src/components/brochure/BrochureHeader.tsx      — Sticky nav + Dealer Mode toggle
src/components/brochure/PlanCard.tsx             — Card for overview grid
src/components/brochure/CoverageAccordion.tsx    — Expandable parts list per category
src/components/brochure/PricingTable.tsx         — Interactive term/km pricing grid
src/components/brochure/ComparisonMatrix.tsx     — Side-by-side ✓/●/blank table
src/components/brochure/BenefitsSection.tsx      — Towing, roadside, car rental, etc.
src/components/brochure/DealerModeToggle.tsx     — Show/hide pricing switch
```

## Interactive Features

1. **Dealer Mode Toggle** — Persistent switch (localStorage) in brochure header. When OFF, all pricing tables are hidden — customers see coverage only. When ON, finance managers see full pricing grids. Styled as a subtle lock icon toggle.

2. **Expandable Coverage Accordions** — Click "Engine" to see: "Engine block, crankshaft, pistons and piston rings, connecting rods and bearings, cylinder head(s), valves (intake and exhaust)..." exactly as in the PDF.

3. **Interactive Pricing Tables** — Tabs for per-claim amounts. Grid shows term/km columns with base price + add-on rows. Hover highlights entire row. Mobile-friendly with horizontal scroll.

4. **Plan Comparison** — Select plans from dropdowns, see the full page 4 matrix. Differences auto-highlighted. Can also compare pricing at a matching term.

5. **Provider Scope** — Top-level provider selector. A-Protect data populated now. Other providers (Peoples Choice, Global, LGM) shown as "Coming Soon" cards — same architecture ready to receive their data later.

## Design

- Deep navy header (#0f1b3d), Bridge Warranty gold accents (hsl(45,93%,58%))
- Plus Jakarta Sans headings, Inter body
- Status icons: Green checkmark (included), blue dot (available add-on), empty/dash (not available)
- Card-based layout with generous whitespace
- Sticky brochure navigation for quick plan switching
- Responsive: cards stack on mobile, pricing tables scroll horizontally, accordions work with touch

## Routes to Add in App.tsx

All public (no auth required):
- `/brochure` → BrochureHome
- `/brochure/compare` → ComparePlans  
- `/brochure/tire-rim` → TireRimPage
- `/brochure/:planSlug` → PlanDetail

Add "Coverage Brochure" link to landing page navbar.

## Implementation Order

1. Create all three data files with every plan, pricing grid, and parts list from the PDF
2. Build BrochureHeader with dealer mode toggle + BrochureHome with plan cards grid
3. Build PlanDetail with coverage accordions + pricing tables + benefits
4. Build ComparePlans with the full coverage matrix
5. Build TireRimPage with tier cards and pricing
6. Add routes and navbar link

## Technical Notes

- No database changes — all data is static in TypeScript files
- No new dependencies needed — uses existing shadcn components (Accordion, Tabs, Table, Card, Badge, Switch)
- Provider-aware architecture: each plan has a `provider` field, making it trivial to add new providers later
- Approximately 8-10 new files total

