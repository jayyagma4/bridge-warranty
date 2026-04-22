

# Expand Configuration Pricing Editor (Plans → Tiers → Terms → Add-Ons)

## Problem

The dealership **Configuration** page (`src/pages/dealership/settings/Configuration.tsx`) currently only lets dealers set retail prices for the **Base Price** row of each plan. It ignores:

- **Multiple tiers** within a plan (e.g. Essential $1k / $1.5k / $3k claim, Diamond Plus mileage bands)
- **Add-on rows** (Zero Deductible, Unlimited km, Hi-Tech ELITE, Seals & Gaskets, Car Rental, etc.)
- **Mileage bands** (Diamond Plus 0–60k / 60–100k / 100–160k km)

Result: dealers can mark up base coverage but cannot mark up any add-ons that drive significant revenue.

## Solution

Restructure the right-hand panel into a hierarchy that mirrors how providers author pricing, with editable retail price + markup % for **every** cost cell.

### New layout

```text
Provider filter (top)            ← already exists
   └─ Plans list (left column)   ← already exists, slight polish
        └─ Tier selector (tabs)              ← NEW: e.g. "$1,000 claim", "$1,500 claim", "$3,000 claim"
              └─ Mileage band selector       ← NEW (only when tier has mileageBands, e.g. Diamond Plus)
                    └─ Pricing matrix        ← REBUILT
                         rows: Base Price + every add-on row
                         cols: each Term (3mo / 6mo / 12mo / 24mo / 36mo …)
                         each cell: dealer cost (read-only) + your retail (editable) + markup %
```

### Editing UX

- **Inline edit per cell**: click pencil → input appears in cell, save/cancel inline.
- **Edit row**: edits all terms in one row at once (e.g. mark up "Zero Deductible" across every term).
- **Edit all in tier**: bulk-edit every cell in the active tier with one Save button.
- **Default markup helper**: when a cell is empty, show greyed `cost × 1.4` as suggested retail; "Apply 40% markup to all empty" button at the top of the matrix.
- **Markup % chip** next to each retail price (green when set, muted when unset).
- **`n/a` cells**: rendered as a dash, not editable.
- **`Included` cells**: rendered as a green "Included" badge, not editable.

### Data model

No schema change needed. The existing `dealership_product_pricing.retail_price` JSONB already stores arbitrary `{key: number}` pairs. We extend the key format to uniquely identify any cell:

```text
old key:  "{termLabel}|{km}|{rowIndex}"          (base only, ambiguous across tiers)
new key:  "t{tierIdx}|m{bandIdx|-}|r{rowIdx}|term{termIdx}"
```

A small migration helper in code reads any old base-price keys on load and remaps them to `t0|m-|r0|term{i}` so existing dealer markups are preserved.

### Files to change

- `src/pages/dealership/settings/Configuration.tsx` — main rewrite of the right panel:
  - Replace `extractFlatTiers` with a structured extractor that returns `{ tiers: [{ label, mileageBands?, terms[], rows[{label, values[]}] }] }`.
  - Add `Tabs` for tier selection and (when present) mileage band selection.
  - Render an editable matrix table (`<table>` with sticky first column for row labels and sticky header for terms).
  - New per-cell save / per-row save / save-all logic writing into the same `dealership_product_pricing` row.
  - Add "Apply X% markup to all empty cells" toolbar action (default 40%, editable input).

### Verification

After build, on `/dealership/settings/configuration`:
1. Select **A-Protect** in the provider filter.
2. Open **Essential Warranty** → confirm 3 tier tabs appear ($1,000 / $1,500 / $3,000 claim) and each shows a 4-term × N-row matrix.
3. Open **Diamond Plus Warranty** → confirm a second selector for mileage bands (0–60k / 60–100k / 100–160k km).
4. Edit retail price on a non-base row (e.g. "Zero Deductible / 24 Mo"), save, refresh — value persists, markup % shown.
5. Open **Find Products** as the same dealer — your custom retail prices for add-ons flow through to the customer-facing display.

