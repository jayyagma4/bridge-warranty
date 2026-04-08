import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCoverageChart from "@/components/dealership/ProductCoverageChart";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const MOCK_COVERAGE: Record<string, any> = {
  powertrain: {
    engine: "included",
    transmission: "included",
    transfer_case: "included",
    turbo_supercharger: "not_included",
    differential: "included",
    drive_axle: "included",
    cooling_system: "included",
    fuel_system: "term_specific",
    exhaust: "not_included",
    hybrid_ev: "term_specific",
  },
  additional: {
    air_conditioning: "included",
    electrical: "included",
    brakes: "not_included",
    steering: "included",
    suspension: "term_specific",
    seals_gaskets: "included",
    technology: "term_specific",
    roadside_assistance: "included",
    rental_car: "included",
    trip_interruption: "not_included",
  },
  claim_range: "$1,000 - $10,000",
};

const ProductCoverage = () => {
  const { id } = useParams<{ id: string }>();
  const isValidId = !!id && id !== ":id" && id.length > 8;

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product-coverage", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isValidId,
  });

  const { data: provider } = useQuery({
    queryKey: ["provider-coverage", product?.provider_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("company_name")
        .eq("id", product!.provider_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!product?.provider_id,
  });

  if (productLoading && isValidId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show mock/demo chart when no valid product ID or product not found
  if (!product) {
    const demoName = product ? (product as any).name : "Powertrain Plus Coverage";
    const demoProvider = "A-Protect Warranty Corporation";

    return (
      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Link to="/dealership/find-products">
              <ArrowLeft className="w-4 h-4" /> Back to Products
            </Link>
          </Button>
          {!isValidId && (
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Demo Preview</span>
          )}
        </div>
        <ProductCoverageChart
          productName={demoName}
          providerName={demoProvider}
          productType="Extended Warranty"
          coverageDetails={MOCK_COVERAGE}
        />
      </div>
    );
  }

  const hasCoverageData =
    product.coverage_details &&
    typeof product.coverage_details === "object" &&
    (product.coverage_details as any).powertrain;

  const coverageToUse = hasCoverageData
    ? (product.coverage_details as Record<string, any>)
    : MOCK_COVERAGE;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Link to="/dealership/find-products">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
        </Button>
      </div>
      <ProductCoverageChart
        productName={product.name}
        providerName={provider?.company_name || "Loading..."}
        productType={product.type}
        coverageDetails={coverageToUse}
      />
    </div>
  );
};

export default ProductCoverage;
