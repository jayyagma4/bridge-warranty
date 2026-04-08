

# Product Finder & Comparison Page

## What we're building

A dedicated **Find Products** page (accessible from the dealership dashboard sidebar) that mirrors the layout in your screenshot — a professional product search and comparison tool where dealership users can:

1. **Search by vehicle** — Enter VIN, mileage; decode vehicle details
2. **Filter & sort** — By product type, provider, price
3. **Browse eligible products** — Grouped by provider, displayed as cards with pricing, coverage duration, deductible, and a "View" button
4. **Compare plans side-by-side** — Select multiple products and compare features in a table

## Layout (reference: your screenshot)

```text
┌─────────────────────────────────────────────────────┐
│  Sidebar (existing DashboardLayout)                 │
│  + "Find Products" nav item                         │
├─────────────────────────────────────────────────────┤
│  MAIN CONTENT                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ Vehicle & Deal Info  │  │ Filters & Sorting    │ │
│  │ VIN input + Decode   │  │ Product type dropdown│ │
│  │ Mileage input        │  │ Sort by dropdown     │ │
│  └──────────────────────┘  │ Provider dropdown    │ │
│  ┌──────────────────────┐  │ Active filter chips  │ │
│  │ GAP Insurance Details│  └──────────────────────┘ │
│  │ Loan amount input    │                           │
│  │ Compare Plans button │                           │
│  └──────────────────────┘                           │
│  ┌──────────────────────┐                           │
│  │ Vehicle Summary      │                           │
│  │ Year/Make/Model/Trim │                           │
│  └──────────────────────┘                           │
│                                                     │
│  Eligible Products (grouped by provider)            │
│  ┌──────────────────────────────────────────┐       │
│  │ Provider Name — N plans          [logo]  │       │
│  │ ┌────────┐ ┌────────┐ ┌────────┐         │       │
│  │ │Plan Card│ │Plan Card│ │Plan Card│       │       │
│  │ │Type     │ │Type     │ │Type     │       │       │
│  │ │Duration │ │Duration │ │Duration │       │       │
│  │ │Deductib.│ │Deductib.│ │Deductib.│       │       │
│  │ │$Price   │ │$Price   │ │$Price   │       │       │
│  │ │[View]   │ │[View]   │ │[View]   │       │       │
│  │ └────────┘ └────────┘ └────────┘         │       │
│  └──────────────────────────────────────────┘       │
│  (repeat for each provider)                         │
│                                                     │
│  ── Compare Modal/Sheet ──                          │
│  Side-by-side table of selected products            │
│  Rows: Coverage, Duration, Deductible, Price, etc.  │
└─────────────────────────────────────────────────────┘
```

## Implementation steps

### 1. Create the Find Products page (`src/pages/dealership/FindProducts.tsx`)
- **Search section**: VIN input with Decode/Reset buttons, mileage input
- **GAP section**: Loan amount input, "Compare Plans" button
- **Vehicle Summary**: Displays decoded vehicle info (year, make, model, trim, powertrain)
- **Filters sidebar** (right column): Product type, sort-by, provider dropdowns + active filter chips with clear-all
- **Product cards**: Grouped by provider with horizontal scrollable rows of plan cards showing type, duration/km, deductible, price, and View button
- **Compare modal**: Sheet/dialog with a comparison table when user selects multiple products

### 2. Add route and nav item
- Add `/dealership/find-products` route in `App.tsx` (protected for dealership roles)
- Add "Find Products" to `dealershipNavItems` in `DashboardLayout.tsx`

### 3. Data layer
- Fetch products from existing `products` table (grouped by `provider_id`)
- Fetch providers for names/logos
- Client-side filtering by type, provider, and sorting by price
- VIN decode will be a placeholder/mock for now (no external API needed)

### 4. Compare feature
- Checkbox selection on product cards
- Floating "Compare (N)" button when 2+ selected
- Opens a full-width sheet with a feature comparison table

## Technical notes
- Uses existing `products` and `providers` tables — no database changes needed
- Products use `pricing` (jsonb) for price/deductible, `coverage_details` (jsonb) for duration/km
- All within the existing `DashboardLayout` wrapper
- Responsive: cards stack on mobile, horizontal scroll on tablet

