

# Complete A-Protect Data — Already Extracted

After cross-referencing every page of the V25 PDF against `src/data/warrantyPlans.ts`, all pricing and coverage data is already accurately captured:

- **10 plan entries** with correct pricing across all tiers
- **All add-on rows** (Zero Deductible, Hi-Tech, Hybrid, etc.) match exactly
- **Coverage details** (parts lists) are complete
- **Premium Vehicle Fee** makes list is correct
- **Tire & Rim** data in `tireRimPlans.ts` is complete
- **Coverage matrix** in `coverageMatrix.ts` matches page 4

## One Missing Item: Top Up Warranty

The **Top Up Warranty** (add-on to existing manufacturer powertrain warranty) appears in the coverage matrix but doesn't have its own plan card. The PDF doesn't show a dedicated pricing page for Top Up — it's referenced only in the comparison matrix. However, the matrix shows it includes:
- Towing, Trip Interruption, Roadside Coverage, Seals & Gaskets, Car Rental, Wear & Tear, Electrical, Fuel System, A/C, Brakes, Front/Rear Suspension, Power Steering, Supplementary Parts, Zero Deductible, Hi-Tech ELITE, Powertrain PLUS, Hybrid, Unlimited km (as options)

## What Actually Needs Fixing

The real issue you reported — **not being able to select dedicated plans within each category** — is a UI problem, not a data problem. Currently:

1. **Powertrain plans** (Bronze/Silver/Gold/Platinum) show as 4 separate cards, which is correct
2. **Essential Warranty** shows as 1 card with 6 pricing tiers inside — this is correct per the brochure
3. Each plan's "View Details" button navigates to `/brochure/:planSlug` which should work

### Recommended Fix
If the issue is that clicking plan cards doesn't navigate properly, I'll:
1. Verify the routing works for all plan slugs
2. Ensure the plan detail page loads correctly for each plan
3. Add the Top Up Warranty as a plan entry (even without pricing, showing coverage info)

Shall I proceed with fixing the navigation/selection issue and adding the Top Up plan?

