// Tire and Rim Protection data from page 18-19 of the A-Protect brochure

export interface TireRimTier {
  name: string;
  slug: string;
  bestValue?: boolean;
  includes: string[];
  pricing: { term: string; class1: number; class2: number; class3: number }[];
}

export interface VehicleClass {
  classNumber: number;
  makes: string[];
}

export const vehicleClasses: VehicleClass[] = [
  {
    classNumber: 1,
    makes: ["Buick", "Chevrolet (except Corvette)", "Chrysler", "Dodge (except Viper)", "Ford (except GT350)", "GMC", "Honda", "Hyundai", "Jeep", "Kia", "Mitsubishi", "Nissan", "Subaru", "Toyota", "Volkswagen"],
  },
  {
    classNumber: 2,
    makes: ["Acura", "Cadillac", "Hummer", "Infiniti", "Jaguar", "Land Rover", "Lexus", "Lincoln", "Saab", "Volvo"],
  },
  {
    classNumber: 3,
    makes: ["Audi", "BMW", "Mercedes", "MINI", "Range Rover", "Maserati", "Porsche", "Dodge Viper", "Alfa Romeo"],
  },
];

export const tireRimTiers: TireRimTier[] = [
  {
    name: "Essential Protection",
    slug: "essential",
    includes: [
      "Tire/Wheel/Rim Repair and Replacement",
      "Tire and Wheel Mounting and Balancing",
      "Roadside Coverage",
    ],
    pricing: [
      { term: "24 Months", class1: 630, class2: 750, class3: 1050 },
      { term: "36 Months", class1: 640, class2: 760, class3: 1080 },
      { term: "48 Months", class1: 650, class2: 770, class3: 1110 },
      { term: "60 Months", class1: 660, class2: 780, class3: 1140 },
      { term: "72 Months", class1: 670, class2: 790, class3: 1170 },
      { term: "84 Months", class1: 680, class2: 800, class3: 1200 },
    ],
  },
  {
    name: "Extended Protection",
    slug: "extended",
    includes: [
      "Tire/Wheel/Rim Repair and Replacement",
      "Tire and Wheel Mounting and Balancing",
      "Roadside Coverage",
      "Key and Remote Replacement",
      "Car Rental",
    ],
    pricing: [
      { term: "24 Months", class1: 970, class2: 1150, class3: 1560 },
      { term: "36 Months", class1: 980, class2: 1170, class3: 1572 },
      { term: "48 Months", class1: 990, class2: 1190, class3: 1600 },
      { term: "60 Months", class1: 1000, class2: 1205, class3: 1619 },
      { term: "72 Months", class1: 1010, class2: 1215, class3: 1629 },
      { term: "84 Months", class1: 1020, class2: 1230, class3: 1649 },
    ],
  },
  {
    name: "Superior Protection",
    slug: "superior",
    bestValue: true,
    includes: [
      "Tire/Wheel/Rim Repair and Replacement",
      "Tire and Wheel Mounting and Balancing",
      "Roadside Coverage",
      "Key and Remote Replacement",
      "Car Rental",
      "Windshield, Headlight and Taillight Lens Protection",
      "Paintless Dent Repair",
      "Rip/Tear/Burn Puncture Repair",
    ],
    pricing: [
      { term: "24 Months", class1: 1295, class2: 1507, class3: 1899 },
      { term: "36 Months", class1: 1308, class2: 1536, class3: 1910 },
      { term: "48 Months", class1: 1325, class2: 1548, class3: 1939 },
      { term: "60 Months", class1: 1342, class2: 1561, class3: 1956 },
      { term: "72 Months", class1: 1362, class2: 1574, class3: 1975 },
      { term: "84 Months", class1: 1390, class2: 1591, class3: 1993 },
    ],
  },
];

export const coveredServices = [
  {
    name: "Tire/Wheel/Rim Repair and Replacement",
    description: "Flat tire replacement, tire replacement (if rendered unserviceable), wheels (rims) repair or replacement if unable to seal with its tire, cosmetic wheel repair (for alloy wheels) due to damage from street curbs.",
  },
  {
    name: "Tire/Wheel/Rim Mounting & Balancing",
    description: "Mounting, balancing, valve stems and tire disposal for covered tires. Excludes: Shop supplies, unspecified charges.",
  },
  {
    name: "Roadside Coverage",
    description: "Reimbursement up to $100/occurrence for: towing, winching, flat tire change, fuel delivery (excludes fuel cost), battery boost, lockout services (excludes locksmith). Up to 3 service calls per 12-month period.",
  },
  {
    name: "Key & Remote Replacement",
    description: "If the original key is lost, stolen or destroyed, coverage up to $800/year or $1,600 term maximum. Prior approval required.",
  },
  {
    name: "Car Rental",
    description: "Reimbursement up to $70/day for car rental if covered repairs exceed 1 business day. Prior approval and valid receipts required.",
  },
  {
    name: "Windshield, Headlight & Tail Light Lens Repair",
    description: "Repair of minor chips and cracks for windshield, headlight and taillight lenses as a direct result of road objects such as propelled rocks or debris.",
  },
  {
    name: "Paintless Dent Repair",
    description: "Dent repairs up to 5 cm in diameter and scratches up to 30 cm in length on external body panels/parts due to public lot damage.",
  },
  {
    name: "Rip/Tear/Burn Puncture",
    description: "Repair of accidental rips, tears, burns, or punctures up to 3 cm in length for the upholstered seats of the covered vehicle.",
  },
];
