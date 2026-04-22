// Dealership retail pricing overlay
// Mirrors the cell-key scheme used by Configuration.tsx:
//   cellKey: t{tierIdx}|m{bandIdx | "-"}|r{rowIdx}|term{termIdx}

import { supabase } from "@/integrations/supabase/client";
import type { DBProduct } from "./productService";

export interface DealershipPricing {
  confidentialityEnabled: boolean;
  byProductId: Record<string, Record<string, number>>;
}

const cellKey = (tierIdx: number, bandIdx: number | null, rowIdx: number, termIdx: number) =>
  `t${tierIdx}|m${bandIdx == null ? "-" : bandIdx}|r${rowIdx}|term${termIdx}`;

export async function fetchDealershipPricing(dealershipId: string | null | undefined): Promise<DealershipPricing> {
  if (!dealershipId) return { confidentialityEnabled: false, byProductId: {} };

  const { data, error } = await supabase
    .from("dealership_product_pricing")
    .select("product_id, retail_price, confidentiality_enabled")
    .eq("dealership_id", dealershipId);

  if (error || !data) return { confidentialityEnabled: false, byProductId: {} };

  const byProductId: Record<string, Record<string, number>> = {};
  let confidentialityEnabled = false;
  for (const row of data) {
    byProductId[row.product_id] = (row.retail_price as Record<string, number>) || {};
    if (row.confidentiality_enabled) confidentialityEnabled = true;
  }
  return { confidentialityEnabled, byProductId };
}

export function hasAnyRetail(retailMap: Record<string, number> | undefined): boolean {
  if (!retailMap) return false;
  return Object.values(retailMap).some((v) => typeof v === "number" && !isNaN(v));
}

/** Returns a new DBProduct with pricing.pricingTiers values overridden by retailMap (cost as fallback). */
export function applyRetailOverlay(product: DBProduct, retailMap: Record<string, number> | undefined): DBProduct {
  if (!retailMap || !hasAnyRetail(retailMap)) return product;
  const pricing = product.pricing as any;
  if (!pricing?.pricingTiers?.length) return product;

  const newTiers = pricing.pricingTiers.map((tier: any, tierIdx: number) => {
    const newTier = { ...tier };

    // Mileage bands (tier-level base price grids)
    if (Array.isArray(tier.mileageBands) && tier.mileageBands.length) {
      newTier.mileageBands = tier.mileageBands.map((band: any, bandIdx: number) => ({
        ...band,
        values: (band.values || []).map((v: any, termIdx: number) => {
          const k = cellKey(tierIdx, bandIdx, 0, termIdx);
          const r = retailMap[k];
          return typeof r === "number" ? r : v;
        }),
      }));
    }

    // Rows (Base Price + add-ons)
    if (Array.isArray(tier.rows)) {
      newTier.rows = tier.rows.map((row: any, rowIdx: number) => ({
        ...row,
        values: (row.values || []).map((v: any, termIdx: number) => {
          const k = cellKey(tierIdx, null, rowIdx, termIdx);
          const r = retailMap[k];
          return typeof r === "number" ? r : v;
        }),
      }));
    }

    return newTier;
  });

  return {
    ...product,
    pricing: { ...pricing, pricingTiers: newTiers },
  };
}
