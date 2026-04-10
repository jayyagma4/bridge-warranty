export interface VehicleInfo {
  vin: string;
  year: number;
  make: string;
  model: string;
  mileage: number;
  bodyClass?: string;
  vehicleType?: string;
  driveType?: string;
  fuelType?: string;
  engineCylinders?: string;
  displacementL?: string;
  gvwr?: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PurchaseState {
  vehicle: VehicleInfo | null;
  selectedPlanSlug: string | null;
  selectedTierIndex: number | null;
  selectedTermIndex: number | null;
  selectedAddOns: string[];
  customer: CustomerInfo;
}

export interface StepProps {
  state: PurchaseState;
  updateState: (partial: Partial<PurchaseState>) => void;
  onNext: () => void;
  onBack?: () => void;
}
