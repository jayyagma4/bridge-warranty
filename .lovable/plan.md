

# Plan: Add Infinite Auto Care as Provider with PPF and Ceramic Coating Products

## Summary

Scrape data from infiniteautocare.ca has been completed. We will create **Infinite Auto Care** as a new provider and upload their **2 product groups** (Paint Protection Film with 5 packages, Ceramic Coating with 4 packages) into the marketplace.

## Extracted Product Data

### Provider: Infinite Auto Care
- Location: Ottawa & Gatineau
- Services: PPF (XPEL Authorized Dealer), Ceramic Coating (Feynlab Certified)

### Product 1: Paint Protection Film (type: "PPF")
**Plan Group: XPEL Paint Protection Film** — 5 tiers:

| Tier | Starting Price | Coverage |
|------|---------------|----------|
| High Impact Package | $399.99 | Partial Hood, Partial Fenders, Headlights |
| Partial Front End Package | $899.99 | Front Bumper, Partial Hood, Partial Fenders, Headlights |
| Full Front End Package | $1,699.00 | Full Front Bumper, Full Hood, Full Fenders, Headlights, Mirrors |
| Full Vehicle PPF Package | $4,499.00 | Full Exterior Coverage (also available in Stealth PPF) |
| Track Pack | $1,999.00 | Full Front Bumper, Full Hood, Full Fenders, Headlights, Mirrors, Rocker Panels, Lower Doors |

Features: Self-healing technology, 10-year warranty, UV protection, stain resistance

### Product 2: Ceramic Coating (type: "Ceramic Coating")
**Plan Group: Feynlab Ceramic Coating** — 4 tiers:

| Tier | Starting Price | Warranty |
|------|---------------|----------|
| FeynLab V3 | $899.99 | 3 Years |
| FeynLab Ultra V2 | $999.99 | 5 Years |
| FeynLab Self Heal Lite | Contact for Pricing | 5 Years |
| FeynLab Self Heal Plus | Contact for Pricing | 7 Years |

## Implementation Steps

### Step 1: Create Provider Record
- Insert "Infinite Auto Care" into the `providers` table with status "approved"
- Create a migration or use the existing provider insertion pattern

### Step 2: Insert 9 Product Records
Each product will be a row in the `products` table with:
- `provider_id` pointing to Infinite Auto Care
- `type`: "PPF" or "Ceramic Coating"  
- `coverage_details` JSONB: `{ group, tier, slug, includedCoverage, coverageCategories }`
- `pricing` JSONB: `{ pricingTiers, claimRange, deductible }`
- `eligibility_rules` JSONB: eligibility info
- `status`: "active"

**PPF products** (5 rows) all share group "XPEL Paint Protection Film":
- Each tier stores its coverage areas, starting price, and warranty details

**Ceramic Coating products** (4 rows) all share group "Feynlab Ceramic Coating":
- Each tier stores its features, warranty duration, and price

### Step 3: Ensure Product Type Support
- Add "PPF" and "Ceramic Coating" to `TYPE_LABELS` in `productService.ts` (PPF is already there, Ceramic Coating is already there)
- No code changes needed for type support

### Step 4: Verify Display
- Products will automatically appear on Provider Products page, Dealer Find Products page, and brochure pages via existing `fetchProducts()` logic
- The group/tier structure will render correctly using the existing `coverage_details.group` and `coverage_details.tier` fields

## Technical Details

The database inserts will use a migration to create the provider and all 9 products in one transaction. The JSONB structure matches the existing A-Protect product format so no UI code changes are needed.

