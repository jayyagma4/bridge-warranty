
-- Create dealership_product_pricing table for retail markup storage
CREATE TABLE public.dealership_product_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  retail_price JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidentiality_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dealership_id, product_id)
);

-- Enable RLS
ALTER TABLE public.dealership_product_pricing ENABLE ROW LEVEL SECURITY;

-- Dealership members can view their pricing
CREATE POLICY "Dealership members can view pricing"
ON public.dealership_product_pricing
FOR SELECT
USING (is_dealership_member(auth.uid(), dealership_id));

-- Dealership admins can insert pricing
CREATE POLICY "Dealership admins can insert pricing"
ON public.dealership_product_pricing
FOR INSERT
WITH CHECK (
  is_dealership_member(auth.uid(), dealership_id)
  AND EXISTS (
    SELECT 1 FROM public.dealership_members
    WHERE user_id = auth.uid() AND dealership_id = dealership_product_pricing.dealership_id AND role = 'admin'
  )
);

-- Dealership admins can update pricing
CREATE POLICY "Dealership admins can update pricing"
ON public.dealership_product_pricing
FOR UPDATE
USING (
  is_dealership_member(auth.uid(), dealership_id)
  AND EXISTS (
    SELECT 1 FROM public.dealership_members
    WHERE user_id = auth.uid() AND dealership_id = dealership_product_pricing.dealership_id AND role = 'admin'
  )
);

-- Super admins can manage all pricing
CREATE POLICY "Super admins can manage pricing"
ON public.dealership_product_pricing
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_dealership_product_pricing_updated_at
BEFORE UPDATE ON public.dealership_product_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Allow dealership members to insert remittances for their contracts
CREATE POLICY "Dealership members can create remittances"
ON public.remittances
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = remittances.contract_id
    AND is_dealership_member(auth.uid(), c.dealership_id)
  )
);

-- Allow dealership members to update remittances for their contracts
CREATE POLICY "Dealership members can update remittances"
ON public.remittances
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM contracts c
    WHERE c.id = remittances.contract_id
    AND is_dealership_member(auth.uid(), c.dealership_id)
  )
);

-- Allow dealership members to update their own contracts (e.g. mark as sold)
CREATE POLICY "Dealership members can update contracts"
ON public.contracts
FOR UPDATE
USING (is_dealership_member(auth.uid(), dealership_id));
