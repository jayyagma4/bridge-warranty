

# Product Coverage Detail Page

## What we're building

A dedicated **Product Coverage** component/page that displays a single product's coverage details in a professional, branded chart format — inspired by the A-Protect reference image but designed with Bridge Warranty's own identity (blue/gold palette, Plus Jakarta Sans headings, Inter body).

This is a reusable template that can be shown for any product, displaying:
- Product name, provider, tier, and per-claim range at the top
- A two-section table: **Powertrain Coverage** and **Additional Options**
- Each row shows a coverage item with a checkmark (included), a red dot (not included), or a blue dot (term-specific)
- Legend explaining the symbols
- Bridge Warranty branding at the bottom

## Layout

```text
┌─────────────────────────────────────────────────┐
│  BW Logo          BRIDGE WARRANTY               │
│                                                 │
│  EXTENDED WARRANTY COVERAGE PLANS               │
│  [Product Name] — [Provider Name]               │
│  $X,XXX - $XX,XXX Per Claim                     │
│                                                 │
│  ┌─────────┐                                    │
│  │ Legend   │  ✓ Included  ● Not Included       │
│  │          │  ◉ Term/Coverage Specific          │
│  └─────────┘                                    │
│                                                 │
│  POWERTRAIN COVERAGE                            │
│  ┌──────────────────────┬───────────┐           │
│  │ Engine               │    ✓      │           │
│  │ Transmission         │    ✓      │           │
│  │ Transfer Case/4x4    │    ✓      │           │
│  │ Turbo/Supercharger   │    ●      │           │
│  │ Differential         │    ✓      │           │
│  │ ...                  │    ...    │           │
│  └──────────────────────┴───────────┘           │
│                                                 │
│  ADDITIONAL OPTIONS                             │
│  ┌──────────────────────┬───────────┐           │
│  │ Air Conditioning     │    ✓      │           │
│  │ Brakes               │    ●      │           │
│  │ ...                  │    ...    │           │
│  └──────────────────────┴───────────┘           │
│                                                 │
│  Footer disclaimer + BW branding                │
└─────────────────────────────────────────────────┘
```

## Implementation steps

### 1. Create `src/components/dealership/ProductCoverageChart.tsx`
- Accepts a product object (or product ID) as prop
- Renders the branded coverage chart with the layout above
- Coverage items are defined as a static list of all possible features (Engine, Transmission, etc.)
- The product's `coverage_details` JSONB field maps which items are included/not/term-specific
- Uses Bridge Warranty colors: deep blue header, gold accents, clean white rows with alternating subtle gray stripes

### 2. Create route and integrate
- Add `/dealership/product-coverage/:id` route in `App.tsx` (public like find-products)
- Also add a "View Coverage" button on the FindProducts page product cards that links/opens this view
- Can also be rendered in a Sheet/Dialog from the FindProducts page

### 3. Design details
- Header: Deep navy gradient with product name in white, gold accent line
- Legend box: Light cream/gold background with icon explanations
- Table: Clean rows with subtle alternating backgrounds, generous padding
- Icons: Custom SVG checkmark (blue/teal), red circle for not included, blue dot for term-specific
- Section headers ("Powertrain Coverage", "Additional Options") as bold navy dividers
- Footer: Small disclaimer text + BW logo
- Fully responsive — stacks cleanly on mobile

### 4. Data structure
Uses the existing `coverage_details` JSONB on the `products` table. Expected shape:
```json
{
  "powertrain": {
    "engine": "included",
    "transmission": "included",
    "turbo_supercharger": "not_included"
  },
  "additional": {
    "air_conditioning": "term_specific",
    "brakes": "not_included"
  },
  "claim_range": "$1,000 - $10,000"
}
```
If coverage_details is empty/null, all items show as "not_included" by default. No DB migration needed — just uses existing JSONB field.

## Technical notes
- No database changes required
- Reusable component that works for any product
- Mock/fallback data for products without coverage_details populated yet

