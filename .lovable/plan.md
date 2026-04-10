

## Plan: Add Suggested Selling Badges & Visual Highlights to Plan Selection

### What we're building
High-conversion visual cues on the plan selection step — "Most Popular", "Best Value", "Top Pick" badges with glowing borders and accent styling to guide buyers toward recommended plans.

### Approach

**1. Add a `salesTag` field to `WarrantyPlan` interface** (`src/data/warrantyPlans.ts`)
- New optional field: `salesTag?: { label: string; type: "popular" | "value" | "pick" }`
- Assign tags to specific plans:
  - **Essential Warranty** → `"Most Popular"` (type: `popular`) — best all-around coverage
  - **Powertrain Platinum** → `"Best Value"` (type: `value`) — strong coverage at competitive price
  - **Diamond Plus** → `"Top Pick"` (type: `pick`) — maximum protection

**2. Update `PlanSelectionStep.tsx`** — the purchase wizard plan cards
- If a plan has a `salesTag`, render a floating badge at the top-right of the card
- Apply a colored glow/ring effect based on tag type:
  - `popular` → gold/amber glow + ring (`ring-amber-400/40 shadow-amber-400/20`)
  - `value` → green glow (`ring-emerald-400/40 shadow-emerald-400/20`)
  - `pick` → blue/primary glow (`ring-primary/40 shadow-primary/20`)
- Add a subtle animated pulse on the badge to draw attention
- Sort tagged plans to appear first in the list (tagged plans float to top)

**3. Update `PlanCard.tsx`** — the brochure browse cards
- Same badge treatment so the suggested selling is consistent across brochure and purchase flows

### Visual result
- Tagged plan cards will have a colored ring border and soft outer glow
- A small pill badge sits at the top-right corner with the label (e.g. "⭐ Most Popular")
- Non-tagged plans remain visually neutral — the contrast naturally draws the eye to recommended options

### Files changed
- `src/data/warrantyPlans.ts` — add `salesTag` to interface + assign to 3 plans
- `src/components/purchase/PlanSelectionStep.tsx` — render badges, glow styles, sort order
- `src/components/brochure/PlanCard.tsx` — render badges on brochure cards too

