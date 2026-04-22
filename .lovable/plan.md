

# Restore the $3,000 Per-Claim Tier on Powertrain Platinum

## Problem

Powertrain Platinum is supposed to have **two per-claim tiers** ($2,500 and $3,000). The seed data file (`src/data/warrantyPlans.ts`) contains both, but the database row only stores the $2,500 tier — so Configuration only lets the dealer mark up the lower tier. Find Products shows the range "$2,500 – $3,000" because that text comes from the `claimRange` string, not from real pricing.

There's also a secondary bug in `Configuration.tsx`: when a product belongs to a `group`, the merged-tier builder takes only `s.tiers[0]` from each sibling, so even if the $3,000 tier were restored it would be silently dropped.

## Fix

Two small changes — no schema changes.

### 1. Backfill the missing $3,000 tier on Powertrain Platinum

Update `products.pricing.pricingTiers` for `Powertrain Platinum` to append the second tier from the canonical seed data:

```
perClaimAmount: 3000, deductible: 100
terms: 12 / 24 / 36 / 48 mo
rows: Base Price, Unlimited km, Zero Deductible, Seals & Gaskets,
      Car Rental, Air Conditioning, Hi-Tech Components
```

Done with a single `UPDATE` using `jsonb_set` on the `pricing` column — no other product affected.

### 2. Make grouped plans expose every per-claim tier

In `src/pages/dealership/settings/Configuration.tsx`, the `structured / tierProductIds / tierStorageIdx` memo currently does:

```ts
const t0 = s.tiers[0];           // ← drops $3,000 tier
tiers.push({ ...t0, label: tierLabel });
```

Replace with a loop so **every** `pricingTiers` entry on each sibling becomes its own tab:

- For sibling with 1 tier → label tab as the sibling tier name (e.g. "Bronze").
- For sibling with 2+ tiers → label tabs as `"{Tier} — ${perClaim}/claim"` (e.g. "Platinum — $2,500/claim", "Platinum — $3,000/claim").
- `tierProductIds[i]` keeps mapping back to the correct product id.
- `tierStorageIdx[i]` records the original `pricingTiers` index so saves write to `t{idx}|m…|r…|term…` correctly (no collision between the $2,500 and $3,000 cells of the same product).

Single-product (non-grouped) selection already iterates all tiers correctly — no change needed there.

### Files to change

- **DB update** (insert tool): backfill `pricing.pricingTiers` on the Powertrain Platinum row.
- **Edit** `src/pages/dealership/settings/Configuration.tsx`: in the `structured` memo for `kind === "group"`, iterate over `s.tiers` instead of taking only `s.tiers[0]`.

### Verification

1. Reload `/dealership/settings/configuration` → A-Protect → Powertrain Plan.
2. Click the **Platinum** tier → tab strip now shows two sub-tabs: `Platinum — $2,500/claim` and `Platinum — $3,000/claim`.

   *(Bronze / Silver / Gold still show as single tabs since they only have one per-claim tier.)*
3. Switch to the $3,000 tab → matrix shows the 4-term, 7-row pricing from the spec; cost values match Find Products.
4. Edit a $3,000-tier cell and save → reloading shows the value persisted, and the $2,500 tab is unaffected.
5. Find Products quoting flow continues to show both per-claim options.

