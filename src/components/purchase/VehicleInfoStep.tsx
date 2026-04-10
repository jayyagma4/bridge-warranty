import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Search, AlertCircle, Loader2, Fuel, Gauge, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isPremiumVehicle } from "@/lib/eligibility";
import type { StepProps, VehicleInfo } from "./types";

interface DecodedVehicle {
  year: number | null;
  make: string | null;
  model: string | null;
  bodyClass?: string | null;
  vehicleType?: string | null;
  driveType?: string | null;
  fuelType?: string | null;
  engineCylinders?: string | null;
  displacementL?: string | null;
  gvwr?: string | null;
  warning?: string;
}

const VehicleInfoStep = ({ state, updateState, onNext }: StepProps) => {
  const [vin, setVin] = useState(state.vehicle?.vin || "");
  const [mileage, setMileage] = useState(state.vehicle?.mileage?.toString() || "");
  const [decoded, setDecoded] = useState<DecodedVehicle | null>(
    state.vehicle
      ? {
          year: state.vehicle.year,
          make: state.vehicle.make,
          model: state.vehicle.model,
          bodyClass: state.vehicle.bodyClass,
          vehicleType: state.vehicle.vehicleType,
          driveType: state.vehicle.driveType,
          fuelType: state.vehicle.fuelType,
          engineCylinders: state.vehicle.engineCylinders,
          displacementL: state.vehicle.displacementL,
          gvwr: state.vehicle.gvwr,
        }
      : null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    setError("");
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("decode-vin", {
        body: { vin },
      });

      if (fnError || data?.error) {
        setError(data?.error || fnError?.message || "Failed to decode VIN");
        setDecoded(null);
        return;
      }

      setDecoded(data as DecodedVehicle);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!decoded?.year || !decoded?.make || !decoded?.model || !mileage) return;
    const km = parseInt(mileage.replace(/,/g, ""));
    if (isNaN(km) || km < 0) {
      setError("Enter a valid mileage.");
      return;
    }
    updateState({
      vehicle: {
        vin,
        year: decoded.year,
        make: decoded.make,
        model: decoded.model,
        mileage: km,
        bodyClass: decoded.bodyClass || undefined,
        vehicleType: decoded.vehicleType || undefined,
        driveType: decoded.driveType || undefined,
        fuelType: decoded.fuelType || undefined,
        engineCylinders: decoded.engineCylinders || undefined,
        displacementL: decoded.displacementL || undefined,
        gvwr: decoded.gvwr || undefined,
      },
      // Reset downstream selections when vehicle changes
      selectedPlanSlug: null,
      selectedTierIndex: null,
      selectedTermIndex: null,
      selectedAddOns: [],
    });
    onNext();
  };

  const isPremium = decoded?.make && decoded?.model ? isPremiumVehicle(decoded.make, decoded.model) : false;

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Car className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Vehicle Information</h2>
          <p className="text-sm text-muted-foreground">Enter your VIN to automatically identify your vehicle.</p>
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
              onChange={e => {
                setVin(e.target.value.toUpperCase());
                setError("");
              }}
              className="font-mono tracking-wider"
            />
            <Button onClick={handleDecode} variant="secondary" disabled={vin.length < 17 || loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
              Decode
            </Button>
          </div>
          {error && (
            <p className="text-destructive text-sm mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}
        </div>

        {decoded && decoded.year && decoded.make && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <p className="text-sm font-semibold text-foreground">Decoded Vehicle</p>

            {/* Primary info */}
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

            {/* Extended info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/50">
              {decoded.bodyClass && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Body</p>
                  <p className="text-xs font-medium text-foreground">{decoded.bodyClass}</p>
                </div>
              )}
              {decoded.driveType && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Drive</p>
                  <p className="text-xs font-medium text-foreground">{decoded.driveType}</p>
                </div>
              )}
              {decoded.fuelType && (
                <div className="flex items-start gap-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fuel</p>
                    <p className="text-xs font-medium text-foreground">{decoded.fuelType}</p>
                  </div>
                </div>
              )}
              {decoded.engineCylinders && decoded.displacementL && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Engine</p>
                  <p className="text-xs font-medium text-foreground">
                    {decoded.engineCylinders}-cyl {decoded.displacementL}L
                  </p>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {isPremium && (
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                  Premium Vehicle — additional fees apply
                </Badge>
              )}
              {decoded.fuelType?.toLowerCase().includes("electric") && (
                <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                  <Fuel className="h-3 w-3 mr-1" /> Electric Vehicle
                </Badge>
              )}
              {decoded.fuelType?.toLowerCase().includes("hybrid") && (
                <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                  Hybrid — additional coverage available
                </Badge>
              )}
              {decoded.warning && (
                <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                  <Info className="h-3 w-3 mr-1" /> Partial decode — verify details
                </Badge>
              )}
            </div>
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
        <Button onClick={handleContinue} disabled={!decoded?.year || !decoded?.make || !mileage}>
          Continue to Plan Selection →
        </Button>
      </div>
    </Card>
  );
};

export default VehicleInfoStep;
