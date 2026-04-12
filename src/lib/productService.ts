// Product service — shared data layer for provider and dealer dashboards
// Fetches products from the database and converts them into display-ready formats

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

// ── Types ──────────────────────────────────────────

export interface DBProduct {
  id: string;
  name: string;
  type: string;
  description: string | null;
  provider_id: string;
  status: string;
  coverage_details: any;
  pricing: any;
  eligibility_rules: any;
  created_at: string;
  updated_at: string;
  provider?: { company_name: string };
}

export interface CoverageCategory {
  name: string;
  parts: string;
}

export interface PricingTier {
  perClaimAmount: number;
  deductible: number;
  terms: { label: string; months: number; km: string }[];
  rows: { label: string; values: (number | string | null)[] }[];
  mileageBands?: { label: string; values: number[] }[];
}

export interface DisplayProduct {
  id: string;
  name: string;
  slug: string;
  provider: string;
  providerId: string;
  type: string;
  tier?: string;
  group?: string;
  eligibility: string;
  claimRange: string;
  deductible: string;
  premiumFees: boolean;
  highlights: string[];
  includedCoverage: string[];
  coverageDetails: CoverageCategory[];
  benefits: { name: string; description: string; limit: string }[];
  pricingTiers: PricingTier[];
  premiumVehicleFee?: { makes: string[]; note: string };
  importantNotes?: string[];
  planExclusions?: string[];
  salesTag?: { label: string; type: "popular" | "value" | "pick" };
  status: string;
  // Tire & Rim specific
  includes?: string[];
  vehicleClasses?: any[];
  bestValue?: boolean;
}

// ── Fetch Functions ──────────────────────────────────

export async function fetchProducts(providerId?: string): Promise<DBProduct[]> {
  let query = supabase
    .from("products")
    .select("*, providers:provider_id(company_name)")
    .order("name");

  if (providerId) {
    query = query.eq("provider_id", providerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).map(p => ({
    ...p,
    provider: Array.isArray(p.providers) ? p.providers[0] : p.providers,
  })) as any;
}

export async function fetchProductById(id: string): Promise<DBProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, providers:provider_id(company_name)")
    .eq("id", id)
    .single();

  if (error) return null;
  return {
    ...data,
    provider: Array.isArray(data.providers) ? data.providers[0] : data.providers,
  } as any;
}

export async function fetchProductBySlug(slug: string): Promise<DBProduct | null> {
  // Slug is stored in coverage_details.slug
  const { data, error } = await supabase
    .from("products")
    .select("*, providers:provider_id(company_name)")
    .eq("status", "active");

  if (error) return null;
  
  const found = (data || []).find(p => {
    const cd = p.coverage_details as any;
    return cd?.slug === slug;
  });
  
  if (!found) return null;
  return {
    ...found,
    provider: Array.isArray((found as any).providers) ? (found as any).providers[0] : (found as any).providers,
  } as any;
}

// ── Conversion: DB → Display ──────────────────────────

export function dbToDisplay(product: DBProduct): DisplayProduct {
  const cd = (product.coverage_details || {}) as any;
  const pr = (product.pricing || {}) as any;
  const er = (product.eligibility_rules || {}) as any;
  const providerName = product.provider?.company_name || "Unknown Provider";

  const slug = cd.slug || product.id;
  
  // Extract highlights from included coverage (first 5)
  const included: string[] = cd.includedCoverage || cd.includes || [];
  const highlights = included.slice(0, 5);

  return {
    id: product.id,
    name: product.name,
    slug,
    provider: providerName,
    providerId: product.provider_id,
    type: product.type,
    tier: cd.tier,
    group: cd.group,
    eligibility: er.eligibility || "Contact for details",
    claimRange: pr.claimRange || "",
    deductible: pr.deductible || "",
    premiumFees: pr.premiumFees || false,
    highlights,
    includedCoverage: included,
    coverageDetails: cd.coverageCategories || [],
    benefits: pr.benefits || [],
    pricingTiers: pr.pricingTiers || [],
    premiumVehicleFee: pr.premiumVehicleFee,
    importantNotes: pr.importantNotes,
    salesTag: pr.salesTag,
    status: product.status,
    // Tire & Rim
    includes: cd.includes,
    vehicleClasses: cd.vehicleClasses,
    bestValue: cd.bestValue,
  };
}

export function dbToDisplayList(products: DBProduct[]): DisplayProduct[] {
  return products.map(dbToDisplay);
}

// ── Grouped plans (same as brochure logic) ──────────

export function getGroupedDisplayProducts(products: DisplayProduct[]): DisplayProduct[] {
  const seen = new Set<string>();
  return products.filter(p => {
    if (!p.group) return true;
    if (seen.has(p.group)) return false;
    seen.add(p.group);
    return true;
  });
}

export function getProductsByGroup(products: DisplayProduct[], group: string): DisplayProduct[] {
  return products.filter(p => p.group === group);
}

// ── Save/Update ──────────────────────────────────

export async function saveProduct(product: {
  id?: string;
  name: string;
  type: string;
  description: string;
  provider_id: string;
  status: string;
  coverage_details: any;
  pricing: any;
  eligibility_rules: any;
}): Promise<string> {
  if (product.id) {
    const { error } = await supabase
      .from("products")
      .update({
        name: product.name,
        type: product.type,
        description: product.description,
        coverage_details: product.coverage_details as Json,
        pricing: product.pricing as Json,
        eligibility_rules: product.eligibility_rules as Json,
        status: product.status,
      })
      .eq("id", product.id);
    if (error) throw error;
    return product.id;
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: product.name,
        type: product.type,
        description: product.description,
        provider_id: product.provider_id,
        coverage_details: product.coverage_details as Json,
        pricing: product.pricing as Json,
        eligibility_rules: product.eligibility_rules as Json,
        status: product.status,
      })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }
}

export async function cloneProduct(productId: string): Promise<string> {
  const original = await fetchProductById(productId);
  if (!original) throw new Error("Product not found");

  return saveProduct({
    name: `${original.name} (Copy)`,
    type: original.type,
    description: original.description || "",
    provider_id: original.provider_id,
    status: "draft",
    coverage_details: original.coverage_details,
    pricing: original.pricing,
    eligibility_rules: original.eligibility_rules,
  });
}

export async function toggleProductStatus(productId: string, currentStatus: string): Promise<void> {
  const newStatus = currentStatus === "active" ? "inactive" : "active";
  const { error } = await supabase
    .from("products")
    .update({ status: newStatus })
    .eq("id", productId);
  if (error) throw error;
}

// ── Type labels ──────────────────────────────────

export const TYPE_LABELS: Record<string, string> = {
  VSC: "Vehicle Service Contract",
  "Tire & Rim": "Tire & Rim Protection",
  GAP: "GAP Insurance",
  PPF: "Paint Protection Film",
  "Ceramic Coating": "Ceramic Coating",
  Undercoating: "Undercoating",
  "Key Replacement": "Key Replacement",
  "Dent Repair": "Dent Repair",
  Other: "Other",
};
