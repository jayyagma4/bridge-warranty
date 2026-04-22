

# Fix A-Protect Dealer Cost Pricing to Match Dealer Book V25

## Problem confirmed

I parsed the uploaded **Dealer Book V25** and compared every plan against the database. **Dealer costs in the database are wrong across all A-Protect products.** Examples:

| Plan | Tier / Term | Dealer Book V25 | Database (current) |
|------|-------------|-----------------|--------------------|
| Powertrain Bronze | 12 Mo / 12,000 km | **$89** | $1,279 |
| Powertrain Silver | 24 Mo / 24,000 km | **$159** | $1,329 |
| Powertrain Gold | 36 Mo / 60,000 km | **$279** | (mismatch) |
| Powertrain Platinum | 48 Mo / 80,000 km | **$489** | (mismatch) |
| Essential $1000 / 12 Mo | Base Price | **$189** | $889 |
| Essential $1500 / 12 Mo | Base Price | **$219** | $919 |
| Essential $3000 / 12 Mo | Base Price | **$369** | $1,369 |
| Essential $5000 / 12 Mo | Base Price | **$529** | (mismatch) |
| Premium Special $3000 / 12 Mo | Base Price | **$479** | (mismatch) |
| Premium Special $4000 / 12 Mo | Base Price | **$639** | (mismatch) |
| Premium Special $5000 / 12 Mo | Base Price | **$699** | (mismatch) |
| Luxury $1000 / 12 Mo | Base Price | **$279** | (mismatch) |
| Luxury $2500 / 24 Mo | Base Price | **$629** | (mismatch) |
| Diamond Plus $5000 / 12 Mo (0–60k) | Base Price | **$819** | $3,279 |
| Diamond Plus $7500 / 24 Mo (0–60k) | Base Price | **$989** | $3,489 |
| Diamond Plus $10,000 / 24 Mo (0–60k) | Base Price | **$1,099** | $4,099 |

The DB values look like inflated retail markups. The dealer book numbers are the true dealer cost.

## Plan

Rebuild the `pricing.pricingTiers` JSON for every A-Protect product using exact values from the Dealer Book V25 PDF. One data-only update per product — no schema or UI changes needed.

### Products to update (provider: A-Protect Warranty Corporation)

1. **Powertrain Bronze** — $750/claim, 5 terms (3/6/12/24/36 mo), base + add-ons
2. **Powertrain Silver** — $1,000/claim, 5 terms, base + 4 add-on rows
3. **Powertrain Gold** — $1,500/claim, 5 terms, base + 6 add-on rows
4. **Powertrain Platinum** — $2,500/claim, 5 terms, base + 6 add-on rows
5. **Powertrain Diamond** — $3,000/claim, 4 terms, base + 6 add-on rows
6. **Essential Warranty** — 3 tiers ($1,000 / $1,500 / $3,000 per claim) + 3 extended tiers ($5,000 / $7,500 / $10,000 with Premium Vehicle Fee) — 4 terms each
7. **Premium Special Warranty** — 3 tiers ($3,000 / $4,000 / $5,000 per claim) with Hi-Tech ELITE, Hybrid, Premium Vehicle Fee
8. **Luxury Warranty** — 4 tiers ($1,000 / $1,500 / $2,500 / $3,000 per claim)
9. **Diamond Plus Warranty** — 3 tiers ($5,000 / $7,500 / $10,000 per claim) with mileage bands (0-60k / 60-100k / 100-160k km)
10. **Driver Program** — $1,500 and $3,000 per claim (rideshare/delivery)
11. **Pro Warranty** — $5,000 and $10,000 per claim (light commercial)
12. **Tire & Rim Protection** — Class 1/2/3 vehicle classes × terms 12/24/36/48/60/72/84 months

### Execution

- Single data update (insert tool with UPDATE statements) writing the corrected `pricing` JSONB for each product.
- Preserve existing `coverage_details`, `eligibility_rules`, benefits, salesTag, premiumVehicleFee makes list, and importantNotes — only `pricingTiers` values are corrected.
- After update, the dealer-facing **Find Products**, **Configuration**, and **Plan Detail** pages will automatically display the correct dealer costs (they all read from the same `pricing` field).

### Verification

After update I will re-query the database for 3 spot checks (Powertrain Gold 24mo, Essential $1000 12mo, Diamond Plus $5000 12mo 0-60k) and confirm each matches the PDF exactly.

