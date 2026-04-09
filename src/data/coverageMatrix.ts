// Coverage comparison matrix from page 4 of the A-Protect brochure
// ✓ = included, ● = available as add-on, "" = not available

export type CoverageStatus = "included" | "available" | "none";

export interface MatrixRow {
  category: string;
  section: "powertrain" | "additional";
  values: Record<string, CoverageStatus>;
}

export const PLAN_COLUMNS = [
  { key: "powertrain", label: "Powertrain", sublabel: "Bronze/Silver/Gold/Platinum" },
  { key: "essential", label: "Essential", sublabel: "Warranty" },
  { key: "premium-special", label: "Premium Special", sublabel: "Warranty" },
  { key: "luxury", label: "Luxury", sublabel: "Warranty" },
  { key: "diamond-plus", label: "Diamond Plus", sublabel: "Warranty" },
  { key: "top-up", label: "Top Up", sublabel: "Warranty" },
];

export const coverageMatrix: MatrixRow[] = [
  // POWERTRAIN COVERAGE
  { category: "Engine", section: "powertrain", values: { "powertrain": "included", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "none" } },
  { category: "Transmission", section: "powertrain", values: { "powertrain": "included", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "none" } },
  { category: "Transfer Case/4x4", section: "powertrain", values: { "powertrain": "included", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "none" } },
  { category: "Turbo/Supercharger", section: "powertrain", values: { "powertrain": "included", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "none" } },
  { category: "Differential", section: "powertrain", values: { "powertrain": "included", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "none" } },
  { category: "Towing", section: "powertrain", values: { "powertrain": "included", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Trip Interruption", section: "powertrain", values: { "powertrain": "included", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Roadside Coverage", section: "powertrain", values: { "powertrain": "none", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Seals & Gaskets", section: "powertrain", values: { "powertrain": "available", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Car Rental", section: "powertrain", values: { "powertrain": "available", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Wear & Tear", section: "powertrain", values: { "powertrain": "none", "essential": "included", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Electrical", section: "powertrain", values: { "powertrain": "none", "essential": "none", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Fuel System", section: "powertrain", values: { "powertrain": "none", "essential": "none", "premium-special": "none", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  
  // ADDITIONAL OPTIONS
  { category: "Air Conditioning", section: "additional", values: { "powertrain": "available", "essential": "available", "premium-special": "included", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Brakes", section: "additional", values: { "powertrain": "none", "essential": "none", "premium-special": "none", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Cooling System", section: "additional", values: { "powertrain": "none", "essential": "none", "premium-special": "none", "luxury": "included", "diamond-plus": "included", "top-up": "none" } },
  { category: "Front Suspension", section: "additional", values: { "powertrain": "none", "essential": "none", "premium-special": "none", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Rear Suspension", section: "additional", values: { "powertrain": "none", "essential": "none", "premium-special": "none", "luxury": "none", "diamond-plus": "included", "top-up": "included" } },
  { category: "Power Steering", section: "additional", values: { "powertrain": "none", "essential": "none", "premium-special": "none", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Supplementary Parts", section: "additional", values: { "powertrain": "none", "essential": "none", "premium-special": "none", "luxury": "included", "diamond-plus": "included", "top-up": "included" } },
  { category: "Zero Deductible", section: "additional", values: { "powertrain": "available", "essential": "available", "premium-special": "available", "luxury": "available", "diamond-plus": "included", "top-up": "included" } },
  { category: "Hi-Tech Components", section: "additional", values: { "powertrain": "available", "essential": "available", "premium-special": "available", "luxury": "available", "diamond-plus": "included", "top-up": "none" } },
  { category: "Hi-Tech ELITE", section: "additional", values: { "powertrain": "none", "essential": "available", "premium-special": "available", "luxury": "none", "diamond-plus": "available", "top-up": "available" } },
  { category: "Powertrain PLUS", section: "additional", values: { "powertrain": "none", "essential": "none", "premium-special": "none", "luxury": "none", "diamond-plus": "available", "top-up": "available" } },
  { category: "Hybrid Components", section: "additional", values: { "powertrain": "none", "essential": "available", "premium-special": "available", "luxury": "available", "diamond-plus": "available", "top-up": "available" } },
  { category: "Unlimited km", section: "additional", values: { "powertrain": "available", "essential": "available", "premium-special": "available", "luxury": "available", "diamond-plus": "available", "top-up": "available" } },
];
