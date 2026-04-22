

# Group Tire & Rim Products into One Plan with 3 Tiers

## Problem

The 3 A-Protect Tire & Rim products (Essential, Extended, Superior Protection) appear as 3 separate cards in the Plans list. They should collapse into **one** "Tire & Rim Plan" card with **3 tiers** — Essential / Extended / Superior — exactly like the Powertrain grouping.

The grouping logic in `Configuration.tsx` already supports any product with `coverage_details.group` set. The Tire & Rim products simply don't have `group` or `tier` populated in the database.

## Solution

Two small changes — no UI rewrite needed.

### 1. Database backfill (migration)

Update the 3 Tire & Rim products to add `group` and `tier` to their `coverage_details`:

| Product | group | tier |
|---|---|---|
| Tire & Rim Essential Protection | `tire-rim` | `Essential` |
| Tire & Rim Extended Protection | `tire-rim` | `Extended` |
| Tire & Rim Superior Protection | `tire-rim` | `Superior` |

This uses `jsonb_set` to merge the new fields without disturbing any other coverage data (slug, includes, vehicleClasses, etc.).

### 2. Configuration.tsx — nicer labels and sort order

Two tiny adjustments to `src/pages/dealership/settings/Configuration.tsx`:

- **Label formatter**: replace the simple `grp.charAt(0).toUpperCase() + grp.slice(1)` with a small map so `"tire-rim"` renders as `"Tire & Rim Plan"` (and `"powertrain"` stays as `"Powertrain Plan"`). Falls back to title-cased group name for unknown groups.
- **Sort order in `sortSiblings`**: extend the rank list to include Essential → Extended → Superior so the tier tabs appear in the intended order.

### Files to change

- New migration: backfill `coverage_details.group` and `coverage_details.tier` on the 3 Tire & Rim products.
- `src/pages/dealership/settings/Configuration.tsx`: extend `sortSiblings` rank order and add a `prettyGroupLabel()` helper used in both `plansForActiveProvider` and the selected-plan branch.

### Verification

1. `/dealership/settings/configuration` → A-Protect → Plans list shows **one** "Tire & Rim Plan" card with "3 tiers" badge instead of 3 separate cards.
2. Click "Tire & Rim Plan" → matrix view shows 3 tier tabs in order: Essential, Extended, Superior.
3. Switching tabs swaps the pricing matrix to that tier's data.
4. Editing a cell on the Superior tab saves only to the Superior product.
5. Powertrain Plan still groups correctly (regression check).

