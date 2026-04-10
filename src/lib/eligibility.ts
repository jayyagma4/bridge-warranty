// Plan eligibility engine — determines which plans a vehicle qualifies for
// Based on A-Protect V25 brochure eligibility rules

import type { VehicleInfo } from "@/components/purchase/types";

export interface EligibilityResult {
  planSlug: string;
  eligible: boolean;
  reason?: string; // why it's ineligible
}

const CURRENT_YEAR = new Date().getFullYear();

// Premium vehicle makes that incur additional fees
export const PREMIUM_VEHICLE_MAKES = [
  "BMW", "Mercedes", "Mercedes-Benz", "Audi", "Tesla", "Porsche", "Jaguar",
  "Lamborghini", "Ferrari", "Aston Martin", "Bentley", "McLaren", "Bugatti",
  "Maserati", "Alfa Romeo", "Land Rover", "Volvo", "MINI",
  "Lotus", "Rolls-Royce", "Rolls Royce", "DMC",
];

// Makes that trigger premium fees when specific models
export const PREMIUM_VEHICLE_MODELS: { make: string; models: string[] }[] = [
  { make: "Subaru", models: ["WRX"] },
  { make: "Chevrolet", models: ["Corvette"] },
  { make: "Hummer", models: [] }, // all Hummer models
];

export function isPremiumVehicle(make: string, model: string): boolean {
  const upperMake = make.toUpperCase();
  const upperModel = model.toUpperCase();

  if (PREMIUM_VEHICLE_MAKES.some(m => m.toUpperCase() === upperMake)) return true;

  for (const pm of PREMIUM_VEHICLE_MODELS) {
    if (pm.make.toUpperCase() === upperMake) {
      if (pm.models.length === 0) return true; // all models of this make
      if (pm.models.some(m => upperModel.includes(m.toUpperCase()))) return true;
    }
  }

  return false;
}

export function getVehicleAge(year: number): number {
  return CURRENT_YEAR - year;
}

/**
 * Check eligibility for all plans based on vehicle info.
 * Rules are derived from the A-Protect V25 brochure.
 */
export function checkAllPlanEligibility(vehicle: VehicleInfo): EligibilityResult[] {
  const age = getVehicleAge(vehicle.year);
  const km = vehicle.mileage;
  const results: EligibilityResult[] = [];

  // ─── Powertrain (Bronze/Silver/Gold/Platinum) ───
  // "Any Year, Make, Model or Mileage"
  // But mileage bands cap at 220,000 km
  for (const tier of ["powertrain-bronze", "powertrain-silver", "powertrain-gold", "powertrain-platinum"]) {
    if (km > 220000) {
      results.push({ planSlug: tier, eligible: false, reason: "Mileage exceeds 220,000 km limit" });
    } else {
      results.push({ planSlug: tier, eligible: true });
    }
  }

  // ─── Essential Warranty ───
  // "Any Year, Make, Model or Mileage (up to 220,000 km for higher tiers)"
  if (km > 220000) {
    results.push({ planSlug: "essential", eligible: false, reason: "Mileage exceeds 220,000 km limit" });
  } else {
    results.push({ planSlug: "essential", eligible: true });
  }

  // ─── Premium Special ───
  // "Any Year, Make, Model or Mileage (up to 220,000 km for higher tiers)"
  if (km > 220000) {
    results.push({ planSlug: "premium-special", eligible: false, reason: "Mileage exceeds 220,000 km limit" });
  } else {
    results.push({ planSlug: "premium-special", eligible: true });
  }

  // ─── Luxury Warranty ───
  // "Any Year, Make, Model or Mileage"
  if (km > 220000) {
    results.push({ planSlug: "luxury", eligible: false, reason: "Mileage exceeds 220,000 km limit" });
  } else {
    results.push({ planSlug: "luxury", eligible: true });
  }

  // ─── Diamond Plus ───
  // "7 Years or Newer and up to 160,000 km"
  if (age > 7) {
    results.push({ planSlug: "diamond-plus", eligible: false, reason: `Vehicle must be 7 years or newer (yours is ${age} years old)` });
  } else if (km > 160000) {
    results.push({ planSlug: "diamond-plus", eligible: false, reason: "Mileage exceeds 160,000 km limit" });
  } else {
    results.push({ planSlug: "diamond-plus", eligible: true });
  }

  // ─── Driver Program ───
  // "Vehicle models 10 years or newer and up to 180,000 km"
  if (age > 10) {
    results.push({ planSlug: "driver", eligible: false, reason: `Vehicle must be 10 years or newer (yours is ${age} years old)` });
  } else if (km > 180000) {
    results.push({ planSlug: "driver", eligible: false, reason: "Mileage exceeds 180,000 km limit" });
  } else {
    results.push({ planSlug: "driver", eligible: true });
  }

  // ─── Pro Warranty ───
  // $5K: "10 years or newer and up to 200,000 km"
  // $10K: "8 years or newer and up to 160,000 km"
  if (age > 10) {
    results.push({ planSlug: "pro", eligible: false, reason: `Vehicle must be 10 years or newer (yours is ${age} years old)` });
  } else if (km > 200000) {
    results.push({ planSlug: "pro", eligible: false, reason: "Mileage exceeds 200,000 km limit" });
  } else {
    results.push({ planSlug: "pro", eligible: true });
  }

  // ─── Top Up ───
  // "Vehicles with existing manufacturer powertrain warranty"
  // We can't verify this automatically, so always eligible but with a note
  results.push({ planSlug: "top-up", eligible: true });

  // ─── Tire & Rim ───
  // "Vehicles 10 Years or Newer, Not eligible for commercial business use"
  if (age > 10) {
    results.push({ planSlug: "tire-rim", eligible: false, reason: `Vehicle must be 10 years or newer (yours is ${age} years old)` });
  } else {
    results.push({ planSlug: "tire-rim", eligible: true });
  }

  return results;
}

/**
 * Quick lookup: is a specific plan eligible?
 */
export function isPlanEligible(vehicle: VehicleInfo, planSlug: string): EligibilityResult {
  const all = checkAllPlanEligibility(vehicle);
  // For grouped plans (powertrain-*), check the specific slug
  const result = all.find(r => r.planSlug === planSlug);
  if (!result) return { planSlug, eligible: true }; // unknown plan = allow
  return result;
}
