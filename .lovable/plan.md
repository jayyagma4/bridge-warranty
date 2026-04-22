

# Group Powertrain Plans by Their Shared "powertrain" Group

## Problem

The 4 A-Protect Powertrain products (Bronze, Silver, Gold, Platinum) appear as 4 separate rows in the Plans list. They share `coverage_details.group = "powertrain"`, so they should collapse into **one** card called "Powertrain Plan" with **4 tiers** — Bronze / Silver / Gold / Platinum — selectable inside the matrix view (same UX as the existing per-claim-amount tier tabs).

## Solution

Two small changes to `src/pages/dealership/settings/Configuration.tsx` — no DB or schema changes.

### 1. Plans list (Level 2) — collapse by `group`

When building `plansForActiveProvider`, group products that share a non-empty `coverage_details.group` and surface a single representative card:

- Card title: `"Powertrain Plan"` (capitalized group name + " Plan")
- Card subtitle: type label (e.g. "Vehicle Service Contract")
- Tier badge: `"4 tiers"` (count of products in the group)
- Ungrouped products keep current behavior

The existing `displayName()` helper returns "Powertrain Plan — Bronze" for individual rows; for the grouped card we'll use `"Powertrain Plan"` only.

### 2. Matrix view (Level 3) — merge sibling tiers

When the user opens a grouped plan, instead of loading one product's pricing, build a `Structured` from **all sibling products in the same group**, ordered Bronze → Silver → Gold → Platinum (or original DB order with a tier rank fallback). Each sibling becomes one entry in `structured.tiers`, labeled by its `coverage_details.tier` (e.g. "Bronze", "Silver"). 

The existing tier-tab UI already handles N tiers, so no UI changes — clicking a tab will display that powertrain product's terms / rows / matrix.

### 3. Pricing storage — keyed per product

The cell key currently includes only `tier|band|row|term` indices, scoped per-product (one row in `dealership_product_pricing` per product). For grouped plans we'll preserve that: each tier tab maps back to its underlying product id, and edits write to **that product's** `dealership_product_pricing` row. This keeps existing dealer markups intact and means provider-level data integrity is preserved (each product still owns its own pricing).

Internally we add a `tierProductId[tierIdx]` lookup so save/load picks the correct product's `retail_price` map.

### Files to change

- `src/pages/dealership/settings/Configuration.tsx`
  - Add `groupedPlans` memo that collapses products sharing `group`.
  - Render grouped cards with "N tiers" badge in the Plans list.
  - When a grouped plan is selected, build merged `structured.tiers` from all siblings and a parallel `tierProductIds` array.
  - Update `retailMap` lookup, cell save, and bulk markup actions to write to the active tier's underlying product id.

### Verification

1. `/dealership/settings/configuration` → A-Protect → Plans list shows **one** "Powertrain Plan" card with "4 tiers" badge (instead of Bronze/Silver/Gold/Platinum as separate cards).
2. Click "Powertrain Plan" → matrix view shows 4 tier tabs labeled Bronze, Silver, Gold, Platinum.
3. Switching tabs swaps the terms / rows / cells to that tier's pricing.
4. Editing a cell on the Gold tab saves to the Powertrain Gold product only — Silver/Bronze/Platinum unaffected.
5. Other plans without a `group` (Essential, Diamond Plus, Luxury, Tire & Rim, etc.) appear unchanged.

