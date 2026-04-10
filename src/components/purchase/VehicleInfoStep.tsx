import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Search, AlertCircle } from "lucide-react";
import type { StepProps, VehicleInfo } from "./types";

// Mock VIN decoder — replace with real API later
function mockDecodeVin(vin: string): Omit<VehicleInfo, "vin" | "mileage"> | null {
  if (vin.length !== 17) return null;
  const makes: Record<string, { make: string; model: string }> = {
    "1": { make: "Chevrolet", model: "Silverado" },
    "2": { make: "Ford", model: "F-150" },
    "3": { make: "Toyota", model: "Camry" },
    "4": { make: "Honda", model: "Civic" },
    "5": { make: "BMW", model: "3 Series" },
    J: { make: "Subaru", model: "Outback" },
    W: { make: "Mercedes", model: "C-Class" },
  };
  const first = vin[0].toUpperCase();
  const match = makes[first] || { make: "Generic", model: "Vehicle" };
  const yearDigit = parseInt(vin[9], 36);
  const year = 2000 + (yearDigit > 30 ? yearDigit - 30 : yearDigit);
  return { year: Math.min(Math.max(year, 2000), 2026), make: match.make, model: match.model };
}

const VehicleInfoStep = ({ state, updateState, onNext }: StepProps) => {
  const [vin, setVin] = useState(state.vehicle?.vin || "");
  const [mileage, setMileage] = useState(state.vehicle?.mileage?.toString() || "");
  const [decoded, setDecoded] = useState<Omit<VehicleInfo, "vin" | "mileage"> | null>(
    state.vehicle ? { year: state.vehicle.year, make: state.vehicle.make, model: state.vehicle.model } : null
  );
  const [error, setError] = useState("");

  const handleDecode = () => {
    setError("");
    const result = mockDecodeVin(vin);
    if (!result) {
      setError("Invalid VIN. Must be 17 characters.");
      return;
    }
    setDecoded(result);
  };

  const handleContinue = () => {
    if (!decoded || !mileage) return;
    const miles = parseInt(mileage.replace(/,/g, ""));
    if (isNaN(miles) || miles < 0) {
      setError("Enter a valid mileage.");
      return;
    }
    updateState({
      vehicle: { vin, year: decoded.year, make: decoded.make, model: decoded.model, mileage: miles },
      // Reset downstream selections when vehicle changes
      selectedPlanSlug: null, selectedTierIndex: null, selectedTermIndex: null, selectedAddOns: [],
    });
    onNext();
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Car className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Vehicle Information</h2>
          <p className="text-sm text-muted-foreground">Enter your VIN to identify your vehicle.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              id="vin"
              placeholder="e.g. 1HGBH41JXMN109186"
              value={vin}
              maxLength={17}
              onChange={e => { setVin(e.target.value.toUpperCase()); setError(""); }}
              className="font-mono tracking-wider"
            />
            <Button onClick={handleDecode} variant="secondary" disabled={vin.length < 17}>
              <Search className="h-4 w-4 mr-1" /> Decode
            </Button>
          </div>
          {error && (
            <p className="text-destructive text-sm mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}
        </div>

        {decoded && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Decoded Vehicle</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Year</p>
                <p className="font-bold text-foreground">{decoded.year}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Make</p>
                <p className="font-bold text-foreground">{decoded.make}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Model</p>
                <p className="font-bold text-foreground">{decoded.model}</p>
              </div>
            </div>
            {["BMW", "Mercedes", "Audi", "Tesla", "Porsche", "Jaguar", "Land Rover", "Volvo", "MINI"].includes(decoded.make) && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                Premium Vehicle — additional fees may apply
              </Badge>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="mileage">Current Mileage (km)</Label>
          <Input
            id="mileage"
            type="text"
            placeholder="e.g. 85,000"
            value={mileage}
            onChange={e => setMileage(e.target.value)}
            className="mt-1.5 max-w-[200px]"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleContinue} disabled={!decoded || !mileage}>
          Continue to Plan Selection →
        </Button>
      </div>
    </Card>
  );
};

export default VehicleInfoStep;
