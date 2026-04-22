

# Finish Outstanding Find Products Fixes

Two items from earlier in this conversation were planned but never implemented. Bundling them into one pass.

## 1. Make hero buttons visible without hover

**File**: `src/pages/dealership/FindProducts.tsx` (the two outline buttons in the hero CTA row)

Replace `border-white/20 text-white hover:bg-white/10` with `bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm` so **Compare All Plans** and **New Quote** show as visible translucent pills against the dark hero. Primary yellow "Start with VIN" button unchanged.

## 2. Wire the "Show Retail to Customers" toggle into Find Products

Today the toggle in `/dealership/settings/configuration` saves `confidentiality_enabled` to `dealership_product_pricing` but Find Products ignores it and always shows raw dealer cost.

### Desired behavior

| Toggle | Find Products shows |
|---|---|
| **ON** | Only products with at least one configured retail price; cells use marked-up retail (cost as fallback per missing cell) |
| **OFF** | All active products at raw dealer cost |

### New file: `src/lib/dealershipPricing.ts`

- `fetchDealershipPricing(dealershipId)` → `{ confidentialityEnabled, byProductId: Record<productId, Record<cellKey, number>> }`
- `applyRetailOverlay(dbProduct, retailMap)` → returns a new `DBProduct` whose `pricing.pricingTiers[*].rows[*].values` and `mileageBands[*].values` are rewritten using the same `t{tier}|m{band}|r{row}|term{term}` keys Configuration writes. Missing cells fall back to cost.
- `hasAnyRetail(retailMap)` → true if at least one numeric override exists.

### Edit: `src/pages/dealership/FindProducts.tsx`

- Pull `dealershipId` via `useDealership()`.
- After `fetchProducts()`, call `fetchDealershipPricing()`.
- **ON**: keep only products where `hasAnyRetail(map[id])`, apply `applyRetailOverlay` before `dbToDisplayList`.
- **OFF**: pass raw products through (current behavior).
- Add a small header badge — "Showing: Retail" (yellow) / "Showing: Dealer Cost" (muted) — so dealers know which view their customers see.

### Edit: `src/pages/dealership/settings/Configuration.tsx`

When the dealer toggles ON, if no products have any retail overrides yet, show a non-blocking toast: *"No retail prices configured — Find Products will be empty for customers until you set prices."*

## Verification

1. Visit `/dealership/find-products` — both hero secondary buttons readable at rest.
2. Sign in as `ecat@bridgewarranty.com`, toggle **Show Retail OFF** in Configuration → Find Products lists all active plans at cost; badge reads "Dealer Cost".
3. Set a retail markup on one Powertrain tier, toggle **ON** → Find Products shows only the Powertrain card at retail price; badge reads "Retail"; other unconfigured plans hidden.
4. Toggling ON with zero retail prices set fires the warning toast.

