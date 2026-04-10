// All A-Protect warranty plan data from the V25 brochure

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

export interface WarrantyPlan {
  name: string;
  slug: string;
  provider: string;
  tier?: string;
  /** Plans sharing a group slug are shown as one card with sub-tier tabs */
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
  premiumVehicleFee?: {
    makes: string[];
    note: string;
  };
}

const PREMIUM_MAKES = [
  "BMW", "Mercedes", "Audi", "Tesla", "Porsche", "Jaguar", "Lamborghini",
  "Ferrari", "Aston Martin", "Bentley", "McLaren", "Bugatti", "Maserati",
  "Alfa Romeo", "Land Rover", "Subaru WRX", "Chevrolet Corvette", "Hummer",
  "Volvo", "DMC", "Lotus", "MINI", "Rolls Royce", "Diesel Trucks"
];

const SHARED_BENEFITS = [
  { name: "Towing", description: "Reimbursement for towing expenses due to a contract-covered breakdown.", limit: "$60/day" },
  { name: "Trip Interruption", description: "Lodging, meals, bus, taxi if repair facility is 200+ km away and cannot provide same-day service.", limit: "$150 max" },
  { name: "Roadside Coverage", description: "Towing, fuel delivery, battery boost, lockout, tire change, winching. Max 3 calls per term.", limit: "$75/occurrence ($225 max)" },
  { name: "Car Rental", description: "Car rental if covered repairs exceed 1 business day.", limit: "$40/day ($240 max)" },
  { name: "Free Diagnostics", description: "Free 20 min visual, scan and road test at A-Protect Authorized Repair Centre.", limit: "Included" },
];

const POWERTRAIN_COVERAGE_DETAILS: CoverageCategory[] = [
  { name: "Engine", parts: "Engine block, crankshaft, pistons and piston rings, connecting rods and bearings, cylinder head(s), valves (intake and exhaust), camshaft and engine main bearings, valve lifters, valve springs and retainers, pushrods, rocker arm assemblies, wrist pins, oil pump, sprockets, timing chain and guides, timing chain tensioner, internal variable timing components." },
  { name: "Transmission", parts: "Automatic: Transmission case, gear sets, input and output shaft, torque converter, solenoid packs, valve body, accumulator, fluid pump, countershaft, modulator valve, bearings, bands, bands apply servo, parking pawl. Manual: Transmission housing, bearings, input and output shaft, counter shaft, synchro assemblies, gear sets, selector shaft and shifter forks." },
  { name: "Transfer Case/4x4", parts: "Auxiliary differential and transfer case housing (including gears, sprockets and internal bearings)." },
  { name: "Differential", parts: "FWD: Housing, bearings, crown and pinion. RWD: Housing, carrier gear and case, driver pinion and pinion gear, ring gear, differential cover, differential mounts and bearings, viscous couplers." },
  { name: "Turbo/Supercharger", parts: "Turbo/supercharger assembly and housing, supercharger compressor, turbo internal bearings and lubricated parts, clutch and pulley, wastegate and wastegate actuator, wastegate linkage, wastegate controller, blow off valve, diverter valve, mechanical pressure release valve, bypass valve, intercooler, turbo/supercharger water pump." },
];

const ADDITIONAL_COVERAGE_DETAILS: CoverageCategory[] = [
  { name: "Air Conditioning", parts: "A/C compressor, A/C condenser, evaporator core, expansion valve, receiver/dryer, accumulator, A/C compressor clutch assembly, orifice tube, A/C seals and gaskets (within covered components), schrader valves. Exclusions: Freon and recharge." },
  { name: "Brakes", parts: "Master cylinder, brake calipers, brake vacuum booster, wheel cylinders, brake flex hoses, hydraulic steel lines and fittings, proportioning valve. Excludes: ABS Brakes." },
  { name: "Cooling System", parts: "Water pump, radiator cooling fan (electric/mechanical), auxiliary water pump, heater core, coolant reservoir (overflow/compression tank), heater control valve, cooling fan clutch (mechanical)." },
  { name: "Electrical", parts: "Alternator, starter motor, starter motor solenoid, alternator voltage regulator, windshield washer pump (front & rear), heater fan, electrical air conditioning condenser fan motor, horn assembly, electric radiator fan, motor & assembly, heater motor, windshield wiper motor (front & rear)." },
  { name: "Fuel System", parts: "Fuel injectors, fuel pressure regulator, fuel pump, fuel rails, fuel injector lines, fuel gauge sender (sending unit), fuel tank, direct injection fuel pump." },
  { name: "Front Suspension", parts: "Control arms (upper and lower), control arm bushings, ball joints (upper and lower), steering knuckles." },
  { name: "Rear Suspension", parts: "Control arms (upper and lower), control arm bushings, ball joints (upper and lower)." },
  { name: "Power Steering", parts: "Power steering pump (including its seals and gaskets), rack and pinion (including its seals and gaskets), manual and power steering box, electric power assist motor." },
  { name: "Seals & Gaskets", parts: "Internal seals and gaskets used to contain fluids/lubricants within covered parts. Crankshaft seal (front and rear), camshaft seals, cylinder head gaskets, oil pan gasket, timing cover gasket, valve cover gasket, intake manifold gaskets, valve guide seals, transmission/transaxle seals and gaskets, transfer case seals and gaskets, differential seals and gaskets. Exclusions: Axle seals." },
  { name: "Supplementary Parts", parts: "Motor mounts, oil pan, harmonic balancer, intake and exhaust manifold, timing cover, oil pressure sending unit, temperature gauge sending unit, dipstick and tube, flywheel, engine cooling fan clutch and assembly, drive shafts & universal joints, wheel bearings, cv axle shafts, cv joints and boots, transfer case mounts, transmission mounts, torque struts, hanger bearings, flexplate and flywheel ring/gear." },
  { name: "Wear & Tear", parts: "Worn out parts within covered parts. Exclusions: Rust/Corrosion." },
  { name: "Hi-Tech Components", parts: "Electronic instrument displays (speedometer, tachometer, odometer, fuel, oil, temperature, voltage), collision avoidance system sensors & modules, adaptive cruise control components, display & screen (including navigation, climate control & media settings), GPS control module, power window motors, power door lock actuator motors, power seat motor, power sliding door motor, power window regulators, power window switches, blind spot monitoring sensors, bluetooth voice activation control module, cameras (front/rear/side), entertainment systems (radio/dvd/cd), exterior mirror motors, heated mirrors, heated seat components, heated steering wheel components, lane assist/collision avoidance system components, lift gate motor, parking assist sensors (front/rear), power mirror controllers." },
  { name: "Hi-Tech ELITE", parts: "All Hi-Tech Components plus: anti-theft control module, auto lights sensors, auto wiper sensors, body/power control module, centre console lock actuators, child safety door lock mechanisms, convertible top motor, cruise control radar distance sensor, daytime running lights module, door keypad receiver, electric hood release actuator motor, electric trunk release actuator motor, glove box lock actuators, ignition switch, interior manually operated electrical switches, keyless entry door handle sensor, keyless entry door keypad, keyless entry receiver, power antenna motor, sunroof motor, tailgate activation sensor, tire pressure warning control module (TPMS), wi-fi control module." },
  { name: "Powertrain PLUS", parts: "Engine Management: Electronic control module, powertrain control module, engine management sensors, fuel injection management sensors, idle air control module and valve, engine wiring harness. 4x4/Drivetrain: 4x4 Locking hubs, transfer case and differential engagement components, transfer case control module, transmission computer control module, transmission wiring harness. Suspension and Safety: Air ride/load leveling compressors, air ride/load leveling dampening control module, airbag module and controllers, ABS pump and pressure modulator assembly, anti-lock brake sensor rings, anti-lock brake/traction control module. Sensors: Crankshaft, camshaft, knock, NOx, oxygen, mass airflow, MAP/manifold pressure, wheel speed sensors. Emission control: EVAP emissions control components, PCV valve, purge canister and solenoid. Ignition/intake: Electronic ignition, ignition coils/coil packs, throttle body and actuators, intake manifold actuators." },
  { name: "Hybrid Components", parts: "Hybrid control module, inverter, hybrid electric motor(s)/generator/drive unit, hybrid specific transaxle and transmission housing, voltage inverter module, battery control module, battery pack cooling fan, DC/DC converter, onboard charger and fan. Excludes: Battery." },
];

export const warrantyPlans: WarrantyPlan[] = [
  // ═══════════════════════════════════════════════
  // POWERTRAIN BRONZE
  // ═══════════════════════════════════════════════
  {
    name: "Powertrain Bronze",
    slug: "powertrain-bronze",
    provider: "A-Protect",
    tier: "Bronze",
    eligibility: "Any Year, Make, Model or Mileage",
    claimRange: "$750 Per Claim",
    deductible: "$100",
    premiumFees: false,
    highlights: ["Any vehicle eligible", "No premium fees", "Light duty commercial OK"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Towing", "Trip Interruption"],
    coverageDetails: POWERTRAIN_COVERAGE_DETAILS,
    benefits: SHARED_BENEFITS.filter(b => !["Roadside Coverage", "Car Rental"].includes(b.name)),
    pricingTiers: [{
      perClaimAmount: 750,
      deductible: 100,
      terms: [
        { label: "3 Mo / 3,000 km", months: 3, km: "3,000" },
        { label: "6 Mo / 6,000 km", months: 6, km: "6,000" },
        { label: "12 Mo / 12,000 km", months: 12, km: "12,000" },
        { label: "24 Mo / 24,000 km", months: 24, km: "24,000" },
        { label: "36 Mo / 36,000 km", months: 36, km: "36,000" },
      ],
      rows: [
        { label: "Base Price", values: [559, 569, 589, 609, 629] },
        { label: "Unlimited km", values: [50, 50, 50, 50, 50] },
      ],
    }],
  },

  // ═══════════════════════════════════════════════
  // POWERTRAIN SILVER
  // ═══════════════════════════════════════════════
  {
    name: "Powertrain Silver",
    slug: "powertrain-silver",
    provider: "A-Protect",
    tier: "Silver",
    eligibility: "Any Year, Make, Model or Mileage",
    claimRange: "$1,000 Per Claim",
    deductible: "$100",
    premiumFees: false,
    highlights: ["Any vehicle eligible", "No premium fees", "Add-on options available"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Towing", "Trip Interruption"],
    coverageDetails: POWERTRAIN_COVERAGE_DETAILS,
    benefits: SHARED_BENEFITS.filter(b => !["Roadside Coverage", "Car Rental"].includes(b.name)),
    pricingTiers: [{
      perClaimAmount: 1000,
      deductible: 100,
      terms: [
        { label: "3 Mo / 3,000 km", months: 3, km: "3,000" },
        { label: "6 Mo / 6,000 km", months: 6, km: "6,000" },
        { label: "12 Mo / 12,000 km", months: 12, km: "12,000" },
        { label: "24 Mo / 24,000 km", months: 24, km: "24,000" },
        { label: "36 Mo / 36,000 km", months: 36, km: "36,000" },
      ],
      rows: [
        { label: "Base Price", values: [579, 589, 629, 659, 689] },
        { label: "Unlimited km", values: ["n/a", 125, 135, 145, 165] },
        { label: "Zero Deductible", values: [125, 130, 135, 145, 155] },
        { label: "Seals & Gaskets", values: [155, 165, 170, 180, 190] },
        { label: "Car Rental", values: [125, 125, 135, 145, 155] },
      ],
    }],
  },

  // ═══════════════════════════════════════════════
  // POWERTRAIN GOLD
  // ═══════════════════════════════════════════════
  {
    name: "Powertrain Gold",
    slug: "powertrain-gold",
    provider: "A-Protect",
    tier: "Gold",
    eligibility: "Any Year, Make, Model or Mileage",
    claimRange: "$1,500 Per Claim",
    deductible: "$100",
    premiumFees: false,
    highlights: ["Any vehicle eligible", "No premium fees", "A/C & Hi-Tech add-ons"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Towing", "Trip Interruption"],
    coverageDetails: POWERTRAIN_COVERAGE_DETAILS,
    benefits: SHARED_BENEFITS.filter(b => !["Roadside Coverage", "Car Rental"].includes(b.name)),
    pricingTiers: [{
      perClaimAmount: 1500,
      deductible: 100,
      terms: [
        { label: "3 Mo / Unlimited", months: 3, km: "Unlimited" },
        { label: "6 Mo / Unlimited", months: 6, km: "Unlimited" },
        { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
        { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
        { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
      ],
      rows: [
        { label: "Base Price", values: [599, 649, 689, 749, 779] },
        { label: "Unlimited km", values: ["Included", "Included", 170, 185, 200] },
        { label: "Zero Deductible", values: [125, 125, 135, 145, 155] },
        { label: "Seals & Gaskets", values: [155, 165, 175, 185, 220] },
        { label: "Car Rental", values: [125, 125, 135, 145, 155] },
        { label: "Air Conditioning", values: ["n/a", "n/a", 220, 230, 240] },
        { label: "Hi-Tech Components", values: ["n/a", "n/a", 260, 270, 280] },
      ],
    }],
  },

  // ═══════════════════════════════════════════════
  // POWERTRAIN PLATINUM
  // ═══════════════════════════════════════════════
  {
    name: "Powertrain Platinum",
    slug: "powertrain-platinum",
    provider: "A-Protect",
    tier: "Platinum",
    eligibility: "Any Year, Make, Model or Mileage",
    claimRange: "$2,500 – $3,000 Per Claim",
    deductible: "$100",
    premiumFees: false,
    highlights: ["Any vehicle eligible", "No premium fees", "Up to $3,000/claim", "A/C & Hi-Tech add-ons"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Towing", "Trip Interruption"],
    coverageDetails: POWERTRAIN_COVERAGE_DETAILS,
    benefits: SHARED_BENEFITS.filter(b => !["Roadside Coverage", "Car Rental"].includes(b.name)),
    pricingTiers: [
      {
        perClaimAmount: 2500,
        deductible: 100,
        terms: [
          { label: "6 Mo / Unlimited", months: 6, km: "Unlimited" },
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
          { label: "48 Mo / 80,000 km", months: 48, km: "80,000" },
        ],
        rows: [
          { label: "Base Price", values: [689, 749, 819, 889, 989] },
          { label: "Unlimited km", values: ["Included", 170, 185, 225, "n/a"] },
          { label: "Zero Deductible", values: [125, 135, 145, 155, 175] },
          { label: "Seals & Gaskets", values: [165, 185, 200, 250, 275] },
          { label: "Car Rental", values: [125, 135, 145, 155, 155] },
          { label: "Air Conditioning", values: ["n/a", 220, 240, 260, 280] },
          { label: "Hi-Tech Components", values: ["n/a", 260, 270, 280, 300] },
        ],
      },
      {
        perClaimAmount: 3000,
        deductible: 100,
        terms: [
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
          { label: "48 Mo / 80,000 km", months: 48, km: "80,000" },
        ],
        rows: [
          { label: "Base Price", values: [999, 1099, 1249, 1309] },
          { label: "Unlimited km", values: [170, 185, 225, "n/a"] },
          { label: "Zero Deductible", values: [135, 145, 155, 175] },
          { label: "Seals & Gaskets", values: [185, 200, 250, 275] },
          { label: "Car Rental", values: [135, 145, 155, 155] },
          { label: "Air Conditioning", values: [220, 240, 260, 280] },
          { label: "Hi-Tech Components", values: [260, 270, 280, 300] },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // ESSENTIAL WARRANTY
  // ═══════════════════════════════════════════════
  {
    name: "Essential Warranty",
    slug: "essential",
    provider: "A-Protect",
    eligibility: "Any Year, Make, Model or Mileage (up to 220,000 km for higher tiers)",
    claimRange: "$1,000 – $10,000 Per Claim",
    deductible: "$100 – $150",
    premiumFees: false,
    highlights: ["Seals & Gaskets included", "Wear & Tear included", "Car Rental included", "Roadside Coverage included"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Towing", "Roadside Coverage", "Trip Interruption", "Seals & Gaskets", "Wear & Tear", "Car Rental"],
    coverageDetails: [...POWERTRAIN_COVERAGE_DETAILS, ...ADDITIONAL_COVERAGE_DETAILS.filter(c => ["Seals & Gaskets", "Wear & Tear"].includes(c.name))],
    benefits: SHARED_BENEFITS,
    pricingTiers: [
      {
        perClaimAmount: 1000,
        deductible: 100,
        terms: [
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
          { label: "48 Mo / 80,000 km", months: 48, km: "80,000" },
        ],
        rows: [
          { label: "Base Price", values: [889, 919, 959, 1069] },
          { label: "Unlimited km", values: [200, 200, 200, 250] },
          { label: "Zero Deductible", values: [185, 220, 250, 250] },
          { label: "Air Conditioning", values: [220, 230, 240, 260] },
        ],
      },
      {
        perClaimAmount: 1500,
        deductible: 100,
        terms: [
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
          { label: "48 Mo / 80,000 km", months: 48, km: "80,000" },
        ],
        rows: [
          { label: "Base Price", values: [919, 1009, 1079, 1189] },
          { label: "Unlimited km", values: [200, 200, 200, 250] },
          { label: "Zero Deductible", values: [185, 220, 250, 250] },
          { label: "Air Conditioning", values: [220, 230, 240, 260] },
          { label: "Hi-Tech Components", values: [260, 270, 280, 300] },
        ],
      },
      {
        perClaimAmount: 3000,
        deductible: 100,
        terms: [
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
          { label: "48 Mo / 80,000 km", months: 48, km: "80,000" },
        ],
        rows: [
          { label: "Base Price", values: [1369, 1479, 1659, 1769] },
          { label: "Unlimited km", values: [200, 200, 200, "n/a"] },
          { label: "Zero Deductible", values: [185, 220, 250, 250] },
          { label: "Air Conditioning", values: [220, 240, 260, 280] },
          { label: "Hi-Tech Components", values: [260, 270, 280, 300] },
          { label: "Hybrid Components", values: [349, 399, 449, 549] },
        ],
      },
      {
        perClaimAmount: 5000,
        deductible: 150,
        terms: [
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
          { label: "48 Mo / 80,000 km", months: 48, km: "80,000" },
        ],
        rows: [
          { label: "Base Price", values: [1729, 1849, 1959, 2159] },
          { label: "Unlimited km", values: [200, 200, "n/a", "n/a"] },
          { label: "Zero Deductible", values: [225, 225, 250, 250] },
          { label: "Air Conditioning", values: [260, 270, 290, 300] },
          { label: "Hi-Tech ELITE", values: [449, 499, 549, 549] },
          { label: "Hybrid Components", values: [449, 499, 569, 659] },
          { label: "Premium Vehicle Fee", values: [350, 450, 550, 600] },
        ],
      },
      {
        perClaimAmount: 7500,
        deductible: 150,
        terms: [
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
          { label: "48 Mo / 80,000 km", months: 48, km: "80,000" },
        ],
        rows: [
          { label: "Base Price", values: [2279, 2409, 2639] },
          { label: "Unlimited km", values: [200, "n/a", "n/a"] },
          { label: "Zero Deductible", values: [225, 250, 250] },
          { label: "Air Conditioning", values: [270, 290, 300] },
          { label: "Hi-Tech ELITE", values: [499, 549, 549] },
          { label: "Hybrid Components", values: [499, 569, 659] },
          { label: "Premium Vehicle Fee", values: [450, 550, 600] },
        ],
      },
      {
        perClaimAmount: 10000,
        deductible: 150,
        terms: [
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
          { label: "48 Mo / 80,000 km", months: 48, km: "80,000" },
        ],
        rows: [
          { label: "Base Price", values: [2399, 2559, 2809] },
          { label: "Unlimited km", values: [200, "n/a", "n/a"] },
          { label: "Zero Deductible", values: [225, 250, 250] },
          { label: "Air Conditioning", values: [270, 290, 300] },
          { label: "Hi-Tech ELITE", values: [499, 549, 549] },
          { label: "Hybrid Components", values: [499, 569, 659] },
          { label: "Premium Vehicle Fee", values: [450, 550, 600] },
        ],
      },
    ],
    premiumVehicleFee: { makes: PREMIUM_MAKES, note: "Additional charge applies. List is subject to change without notice." },
  },

  // ═══════════════════════════════════════════════
  // PREMIUM SPECIAL WARRANTY
  // ═══════════════════════════════════════════════
  {
    name: "Premium Special Warranty",
    slug: "premium-special",
    provider: "A-Protect",
    eligibility: "Any Year, Make, Model or Mileage (up to 220,000 km for higher tiers)",
    claimRange: "$3,000 – $5,000 Per Claim",
    deductible: "$100",
    premiumFees: false,
    highlights: ["Electrical included", "A/C included", "Seals & Gaskets included", "Wear & Tear included"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Towing", "Roadside Coverage", "Trip Interruption", "Alternator/Starter/Solenoid", "Water Pump", "Air Conditioning", "Electrical", "Seals & Gaskets", "Wear & Tear", "Car Rental"],
    coverageDetails: [...POWERTRAIN_COVERAGE_DETAILS, ...ADDITIONAL_COVERAGE_DETAILS.filter(c => ["Air Conditioning", "Electrical", "Seals & Gaskets", "Wear & Tear"].includes(c.name))],
    benefits: SHARED_BENEFITS,
    pricingTiers: [
      {
        perClaimAmount: 3000,
        deductible: 100,
        terms: [
          { label: "3 Mo / Unlimited", months: 3, km: "Unlimited" },
          { label: "6 Mo / Unlimited", months: 6, km: "Unlimited" },
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
          { label: "48 Mo / 80,000 km", months: 48, km: "80,000" },
        ],
        rows: [
          { label: "Base Price", values: [1389, 1539, 1679, 1819, 1939, 2099] },
          { label: "Unlimited km", values: ["Included", "Included", 200, 200, "n/a", "n/a"] },
          { label: "Zero Deductible", values: [135, 155, 185, 220, 250, 250] },
          { label: "Hi-Tech Components", values: ["n/a", "n/a", 260, 270, 280, 300] },
          { label: "Hybrid Components", values: ["n/a", "n/a", 349, 399, 449, 549] },
        ],
      },
      {
        perClaimAmount: 4000,
        deductible: 100,
        terms: [
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 70,000 km", months: 36, km: "70,000" },
          { label: "48 Mo / 90,000 km", months: 48, km: "90,000" },
        ],
        rows: [
          { label: "Base Price", values: [2139, 2239, 2389, 2589] },
          { label: "Unlimited km", values: [200, 200, "n/a", "n/a"] },
          { label: "Zero Deductible", values: [185, 220, 250, 250] },
          { label: "Hi-Tech Components", values: [260, 270, 280, 300] },
          { label: "Hi-Tech ELITE", values: [449, 499, 549, 549] },
          { label: "Hybrid Components", values: [349, 399, 449, 549] },
          { label: "Premium Vehicle Fee", values: [350, 450, 550, 600] },
        ],
      },
      {
        perClaimAmount: 5000,
        deductible: 100,
        terms: [
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 70,000 km", months: 36, km: "70,000" },
          { label: "48 Mo / 90,000 km", months: 48, km: "90,000" },
        ],
        rows: [
          { label: "Base Price", values: [2199, 2289, 2439, 2749] },
          { label: "Unlimited km", values: [100, 250, 350, 450] },
          { label: "Zero Deductible", values: [185, 220, 250, 250] },
          { label: "Hi-Tech Components", values: [260, 270, 280, 300] },
          { label: "Hi-Tech ELITE", values: [449, 499, 549, 549] },
          { label: "Hybrid Components", values: [449, 499, 549, 549] },
          { label: "Premium Vehicle Fee", values: [350, 450, 550, 600] },
        ],
      },
    ],
    premiumVehicleFee: { makes: PREMIUM_MAKES, note: "Additional charge applies. List is subject to change without notice." },
  },

  // ═══════════════════════════════════════════════
  // LUXURY WARRANTY
  // ═══════════════════════════════════════════════
  {
    name: "Luxury Warranty",
    slug: "luxury",
    provider: "A-Protect",
    eligibility: "Any Year, Make, Model or Mileage",
    claimRange: "$1,000 – $3,000 Per Claim",
    deductible: "$100",
    premiumFees: false,
    highlights: ["Most comprehensive standard coverage", "Brakes included", "Cooling System included", "Fuel System included", "Suspension included"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Towing", "Roadside Coverage", "Trip Interruption", "Alternator/Starter/Solenoid", "Water Pump", "Air Conditioning", "Brakes", "Cooling System", "Electrical", "Front Suspension", "Fuel System", "Power Steering", "Seals & Gaskets", "Supplementary Parts", "Car Rental", "Wear & Tear"],
    coverageDetails: [...POWERTRAIN_COVERAGE_DETAILS, ...ADDITIONAL_COVERAGE_DETAILS.filter(c => ["Air Conditioning", "Brakes", "Cooling System", "Electrical", "Fuel System", "Front Suspension", "Power Steering", "Seals & Gaskets", "Supplementary Parts", "Wear & Tear"].includes(c.name))],
    benefits: SHARED_BENEFITS,
    pricingTiers: [
      {
        perClaimAmount: 1000,
        deductible: 100,
        terms: [
          { label: "3 Mo / 3,000 km", months: 3, km: "3,000" },
          { label: "6 Mo / 6,000 km", months: 6, km: "6,000" },
          { label: "12 Mo / 12,000 km", months: 12, km: "12,000" },
          { label: "24 Mo / 24,000 km", months: 24, km: "24,000" },
          { label: "36 Mo / 36,000 km", months: 36, km: "36,000" },
        ],
        rows: [
          { label: "Base Price", values: [819, 909, 1279, 1329, 1399] },
          { label: "Zero Deductible", values: [135, 155, 185, 215, 235] },
        ],
      },
      {
        perClaimAmount: 1500,
        deductible: 100,
        terms: [
          { label: "3 Mo / 3,000 km", months: 3, km: "3,000" },
          { label: "6 Mo / 6,000 km", months: 6, km: "6,000" },
          { label: "12 Mo / 12,000 km", months: 12, km: "12,000" },
          { label: "24 Mo / 24,000 km", months: 24, km: "24,000" },
          { label: "36 Mo / 36,000 km", months: 36, km: "36,000" },
        ],
        rows: [
          { label: "Base Price", values: [889, 989, 1319, 1379, 1459] },
          { label: "Zero Deductible", values: [135, 155, 185, 215, 235] },
        ],
      },
      {
        perClaimAmount: 2500,
        deductible: 100,
        terms: [
          { label: "6 Mo / Unlimited", months: 6, km: "Unlimited" },
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
        ],
        rows: [
          { label: "Base Price", values: [1049, 1479, 1629, 1779] },
          { label: "Zero Deductible", values: [155, 185, 215, 235] },
          { label: "Hi-Tech Components", values: ["n/a", 229, 249, 279] },
          { label: "Hybrid Components", values: ["n/a", 349, 399, 449] },
          { label: "Premium Vehicle Fee", values: ["n/a", 200, 250, 300] },
        ],
      },
      {
        perClaimAmount: 3000,
        deductible: 100,
        terms: [
          { label: "12 Mo / 20,000 km", months: 12, km: "20,000" },
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 60,000 km", months: 36, km: "60,000" },
        ],
        rows: [
          { label: "Base Price", values: [1989, 2349, 2689] },
          { label: "Zero Deductible", values: [185, 215, 235] },
          { label: "Hi-Tech Components", values: [229, 249, 279] },
          { label: "Hybrid Components", values: [349, 399, 449] },
          { label: "Premium Vehicle Fee", values: [200, 250, 300] },
        ],
      },
    ],
    premiumVehicleFee: { makes: PREMIUM_MAKES, note: "Additional charge applies. List is subject to change without notice." },
  },

  // ═══════════════════════════════════════════════
  // DIAMOND PLUS WARRANTY
  // ═══════════════════════════════════════════════
  {
    name: "Diamond Plus Warranty",
    slug: "diamond-plus",
    provider: "A-Protect",
    eligibility: "7 Years or Newer and up to 160,000 km",
    claimRange: "$5,000 – $20,000 Per Claim",
    deductible: "$0 (No Deductible)",
    premiumFees: false,
    highlights: ["Zero deductible included", "Hi-Tech Components included", "Most comprehensive plan", "Front & rear suspension"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Towing", "Roadside Coverage", "Trip Interruption", "Alternator/Starter/Solenoid", "Water Pump", "Air Conditioning", "Brakes", "Cooling System", "Electrical", "Front & Rear Suspension", "Fuel System", "Hi-Tech Components", "Power Steering", "Seals & Gaskets", "Supplementary Parts", "Car Rental", "Wear & Tear", "Zero Deductible"],
    coverageDetails: [...POWERTRAIN_COVERAGE_DETAILS, ...ADDITIONAL_COVERAGE_DETAILS.filter(c => ["Air Conditioning", "Brakes", "Cooling System", "Electrical", "Fuel System", "Front Suspension", "Rear Suspension", "Power Steering", "Seals & Gaskets", "Supplementary Parts", "Wear & Tear", "Hi-Tech Components"].includes(c.name))],
    benefits: SHARED_BENEFITS,
    pricingTiers: [
      {
        perClaimAmount: 5000,
        deductible: 0,
        terms: [
          { label: "12 Mo / Unlimited", months: 12, km: "Unlimited" },
          { label: "24 Mo / Unlimited", months: 24, km: "Unlimited" },
          { label: "36 Mo / 70,000 km", months: 36, km: "70,000" },
          { label: "48 Mo / 90,000 km", months: 48, km: "90,000" },
        ],
        rows: [
          { label: "Powertrain PLUS", values: [395, 395, 445, 445] },
          { label: "Hi-Tech ELITE", values: [449, 499, 549, 549] },
          { label: "Hybrid Components", values: [449, 499, 589, 659] },
          { label: "Premium Vehicle Fee", values: [350, 450, 550, 600] },
        ],
        mileageBands: [
          { label: "0 – 60,000 km", values: [3279, 3379, 3479, 3599] },
          { label: "60,001 – 100,000 km", values: [3579, 3739, 3839, 4049] },
          { label: "100,001 – 160,000 km", values: [3719, 3979, 4079, 4379] },
        ],
      },
      {
        perClaimAmount: 7500,
        deductible: 0,
        terms: [
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 70,000 km", months: 36, km: "70,000" },
          { label: "48 Mo / 90,000 km", months: 48, km: "90,000" },
        ],
        rows: [
          { label: "Unlimited km", values: [200, 200, 200] },
          { label: "Powertrain PLUS", values: [395, 395, 445] },
          { label: "Hi-Tech ELITE", values: [449, 499, 549] },
          { label: "Hybrid Components", values: [499, 589, 659] },
          { label: "Premium Vehicle Fee", values: [450, 550, 600] },
        ],
        mileageBands: [
          { label: "0 – 60,000 km", values: [3489, 3589, 3799] },
          { label: "60,001 – 100,000 km", values: [3849, 4009, 4249] },
          { label: "100,001 – 160,000 km", values: [4139, 4264, 4764] },
        ],
      },
      {
        perClaimAmount: 10000,
        deductible: 0,
        terms: [
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 70,000 km", months: 36, km: "70,000" },
          { label: "48 Mo / 90,000 km", months: 48, km: "90,000" },
        ],
        rows: [
          { label: "Unlimited km", values: [350, "n/a", "n/a"] },
          { label: "Powertrain PLUS", values: [395, 395, 445] },
          { label: "Hi-Tech ELITE", values: [449, 499, 549] },
          { label: "Hybrid Components", values: [499, 589, 659] },
          { label: "Premium Vehicle Fee", values: [450, 550, 600] },
        ],
        mileageBands: [
          { label: "0 – 60,000 km", values: [4099, 4199, 4499] },
          { label: "60,001 – 100,000 km", values: [4459, 4679, 4949] },
          { label: "100,001 – 160,000 km", values: [4799, 4949, 5649] },
        ],
      },
      {
        perClaimAmount: 20000,
        deductible: 0,
        terms: [
          { label: "24 Mo / 40,000 km", months: 24, km: "40,000" },
          { label: "36 Mo / 70,000 km", months: 36, km: "70,000" },
          { label: "48 Mo / 90,000 km", months: 48, km: "90,000" },
        ],
        rows: [
          { label: "Powertrain PLUS", values: [395, 395, 445] },
          { label: "Hi-Tech ELITE", values: [449, 499, 549] },
          { label: "Hybrid Components", values: [499, 589, 659] },
          { label: "Premium Vehicle Fee", values: [450, 550, 600] },
        ],
        mileageBands: [
          { label: "0 – 60,000 km", values: [4679, 4789, 5179] },
          { label: "60,001 – 100,000 km", values: [5059, 5289, 5659] },
          { label: "100,001 – 160,000 km", values: [5409, 5559, 6399] },
        ],
      },
    ],
    premiumVehicleFee: { makes: [...PREMIUM_MAKES.filter(m => m !== "Mercedes"), "Mercedes AMG"], note: "Additional charge applies. List is subject to change without notice." },
  },

  // ═══════════════════════════════════════════════
  // DRIVER PROGRAM
  // ═══════════════════════════════════════════════
  {
    name: "Driver Program",
    slug: "driver",
    provider: "A-Protect",
    eligibility: "Vehicle models 10 years or newer and up to 180,000 km",
    claimRange: "$1,500 – $3,000 Per Claim",
    deductible: "$100 – $150",
    premiumFees: false,
    highlights: ["Rideshare & delivery vehicles", "Seals & Gaskets included", "Wear & Tear included", "30 min free diagnostics"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Roadside Coverage", "Trip Interruption", "Alternator/Starter/Solenoid", "Water Pump", "Seals & Gaskets", "Wear & Tear"],
    coverageDetails: [...POWERTRAIN_COVERAGE_DETAILS, ...ADDITIONAL_COVERAGE_DETAILS.filter(c => ["Seals & Gaskets", "Wear & Tear"].includes(c.name))],
    benefits: [
      ...SHARED_BENEFITS.filter(b => b.name !== "Free Diagnostics"),
      { name: "Free Diagnostics", description: "Free 30 min visual, scan and road test at A-Protect Authorized Repair Centre.", limit: "Included" },
    ],
    pricingTiers: [
      {
        perClaimAmount: 1500,
        deductible: 100,
        terms: [
          { label: "12 Mo / Unlimited", months: 12, km: "Unlimited" },
          { label: "24 Mo / 60,000 km", months: 24, km: "60,000" },
          { label: "36 Mo / 90,000 km", months: 36, km: "90,000" },
        ],
        rows: [
          { label: "Base Price", values: [1399, 1499, 1599] },
          { label: "Car Rental", values: [125, 135, 145] },
          { label: "Zero Deductible", values: [150, 175, 145] },
          { label: "Air Conditioning", values: [175, 200, 225] },
          { label: "Hi-Tech Components", values: [200, 250, 300] },
          { label: "Hybrid Components", values: [450, 550, 650] },
          { label: "Add extra 10,000 km", values: ["n/a", 275, 325] },
        ],
      },
      {
        perClaimAmount: 3000,
        deductible: 150,
        terms: [
          { label: "12 Mo / Unlimited", months: 12, km: "Unlimited" },
          { label: "24 Mo / 60,000 km", months: 24, km: "60,000" },
          { label: "36 Mo / 90,000 km", months: 36, km: "90,000" },
        ],
        rows: [
          { label: "Base Price", values: [1599, 1799, 1999] },
          { label: "Car Rental", values: [125, 135, 145] },
          { label: "Zero Deductible", values: [175, 200, 225] },
          { label: "Air Conditioning", values: [200, 225, 350] },
          { label: "Hi-Tech Components", values: [250, 300, 350] },
          { label: "Hybrid Components", values: [550, 650, 750] },
          { label: "Add extra 10,000 km", values: ["n/a", 275, 325] },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // PRO WARRANTY
  // ═══════════════════════════════════════════════
  {
    name: "Pro Warranty",
    slug: "pro",
    provider: "A-Protect",
    eligibility: "Vehicle models 10 years or newer, up to 200,000 km ($5K) / 8 years, 160,000 km ($10K)",
    claimRange: "$5,000 – $10,000 Per Claim",
    deductible: "$100 – $250",
    premiumFees: false,
    highlights: ["Light-duty commercial trucks/vans", "Diesel components included", "Fuel system included", "A/C included", "30 min free diagnostics"],
    includedCoverage: ["Engine", "Transmission", "Transfer Case/4x4", "Differential", "Turbo/Supercharger", "Roadside Coverage", "Trip Interruption", "Air Conditioning", "Alternator/Starter/Solenoid", "Water Pump", "Seals & Gaskets", "Wear & Tear", "Fuel System", "Diesel Components"],
    coverageDetails: [
      ...POWERTRAIN_COVERAGE_DETAILS,
      ...ADDITIONAL_COVERAGE_DETAILS.filter(c => ["Air Conditioning", "Fuel System", "Seals & Gaskets", "Wear & Tear"].includes(c.name)),
      { name: "Diesel Components", parts: "Fuel pumps, injection & distribution pumps, diesel exhaust fluid (DEF) tank, diesel exhaust fluid (DEF) heater, sending unit, fuel injectors, fuel rails, fuel hard lines, pressure regulator, vacuum pump, high pressure oil pump, high pressure injection pump, glow plugs, glow plug harness, glow plug controller, pump mounted driver module and diesel nitrogen oxygen (NOx) sensor." },
      { name: "GPS & Tech Package", parts: "Back up camera, digital display/gps monitor (including touchscreen), bluetooth/handsfree module, gps control module, power door lock keypad, keyless entry door handle sensor, keyless entry/remote door lock receiver, touchscreen interface module, parking assist module and sensors, tire pressure monitoring system module, wi-fi/mobile data control module." },
    ],
    benefits: [
      ...SHARED_BENEFITS.filter(b => b.name !== "Free Diagnostics"),
      { name: "Free Diagnostics", description: "Free 30 min visual, scan and road test at A-Protect Authorized Repair Centre.", limit: "Included" },
    ],
    pricingTiers: [
      {
        perClaimAmount: 5000,
        deductible: 100,
        terms: [
          { label: "12 Mo / Unlimited", months: 12, km: "Unlimited" },
          { label: "24 Mo / Unlimited", months: 24, km: "Unlimited" },
          { label: "36 Mo / 90,000 km", months: 36, km: "90,000" },
        ],
        rows: [
          { label: "Base Price", values: [3799, 4099, 4399] },
          { label: "Car Rental", values: [125, 135, 145] },
          { label: "Zero Deductible", values: [225, 275, 325] },
          { label: "GPS & Tech Package", values: [250, 300, 350] },
          { label: "Hi-Tech Components", values: [250, 300, 350] },
          { label: "Hybrid Components", values: [599, 699, 799] },
          { label: "Add extra 10,000 km", values: ["n/a", "n/a", 399] },
        ],
      },
      {
        perClaimAmount: 10000,
        deductible: 250,
        terms: [
          { label: "12 Mo / Unlimited", months: 12, km: "Unlimited" },
          { label: "24 Mo / 60,000 km", months: 24, km: "60,000" },
          { label: "36 Mo / 90,000 km", months: 36, km: "90,000" },
        ],
        rows: [
          { label: "Base Price", values: [4129, 4449, 4849] },
          { label: "Car Rental", values: [125, 135, 145] },
          { label: "Zero Deductible", values: [250, 300, 350] },
          { label: "GPS & Tech Package", values: [300, 350, 400] },
          { label: "Hi-Tech Components", values: [275, 325, 375] },
          { label: "Hybrid Components", values: [599, 699, 799] },
          { label: "Add extra 10,000 km", values: ["n/a", 299, 399] },
        ],
      },
    ],
  },
  // ── Top Up Warranty ──────────────────────────────────────────────────
  {
    name: "Top Up Warranty",
    slug: "top-up",
    provider: "A-Protect",
    tier: "Add-On",
    eligibility: "Vehicles with existing manufacturer powertrain warranty",
    claimRange: "Varies by coverage",
    deductible: "$0",
    premiumFees: false,
    highlights: [
      "Extends manufacturer powertrain warranty",
      "Zero deductible included",
      "Roadside Coverage & Car Rental included",
    ],
    includedCoverage: [
      "Towing", "Trip Interruption", "Roadside Coverage", "Seals & Gaskets",
      "Car Rental", "Wear & Tear", "Electrical", "Fuel System",
      "Air Conditioning", "Brakes", "Front Suspension", "Rear Suspension",
      "Power Steering", "Supplementary Parts", "Zero Deductible",
    ],
    coverageDetails: [
      ...ADDITIONAL_COVERAGE_DETAILS,
      { name: "Seals & Gaskets", parts: ADDITIONAL_COVERAGE_DETAILS.find(c => c.name === "Seals & Gaskets")?.parts || "" },
    ].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i),
    benefits: SHARED_BENEFITS,
    pricingTiers: [], // No standalone pricing — sold as add-on to manufacturer warranty
  },
];

export const getProviders = () => {
  const providers = [...new Set(warrantyPlans.map(p => p.provider))];
  return providers;
};

export const getPlansByProvider = (provider: string) => {
  return warrantyPlans.filter(p => p.provider === provider);
};

export const getPlanBySlug = (slug: string) => {
  return warrantyPlans.find(p => p.slug === slug);
};
