DROP POLICY IF EXISTS "Authenticated can view active products" ON public.products;

CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
USING (status = 'active');