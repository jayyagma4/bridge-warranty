
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'dealership_admin', 'dealership_employee', 'provider');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create dealerships table
CREATE TABLE public.dealerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  province TEXT,
  license_number TEXT,
  admin_code TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  compliance_info JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;

-- Create dealership_members table
CREATE TABLE public.dealership_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dealership_id UUID REFERENCES public.dealerships(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, dealership_id)
);
ALTER TABLE public.dealership_members ENABLE ROW LEVEL SECURITY;

-- Create providers table
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  regions_served TEXT[] DEFAULT '{"Ontario"}',
  description TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Create provider_members table
CREATE TABLE public.provider_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider_id)
);
ALTER TABLE public.provider_members ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('VSC', 'GAP', 'Tire & Rim', 'PPF', 'Ceramic Coating', 'Undercoating', 'Key Replacement', 'Dent Repair', 'Other')),
  description TEXT,
  coverage_details JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  eligibility_rules JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID REFERENCES public.dealerships(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.providers(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  vehicle_vin TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INT NOT NULL,
  vehicle_mileage INT,
  contract_price DECIMAL(10,2),
  dealer_cost DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'active', 'cancelled', 'expired')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Create remittances table
CREATE TABLE public.remittances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  paid_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.remittances ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check dealership membership
CREATE OR REPLACE FUNCTION public.is_dealership_member(_user_id UUID, _dealership_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dealership_members WHERE user_id = _user_id AND dealership_id = _dealership_id
  )
$$;

-- Function to check provider membership
CREATE OR REPLACE FUNCTION public.is_provider_member(_user_id UUID, _provider_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.provider_members WHERE user_id = _user_id AND provider_id = _provider_id
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dealerships_updated_at BEFORE UPDATE ON public.dealerships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_remittances_updated_at BEFORE UPDATE ON public.remittances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS POLICIES

-- Profiles: users see own, super_admin sees all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- User roles: users see own, super_admin manages all
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Dealerships
CREATE POLICY "Members can view their dealership" ON public.dealerships FOR SELECT USING (public.is_dealership_member(auth.uid(), id));
CREATE POLICY "Super admins can view all dealerships" ON public.dealerships FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can manage dealerships" ON public.dealerships FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Authenticated can insert dealerships" ON public.dealerships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Dealership admins can update their dealership" ON public.dealerships FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.dealership_members WHERE user_id = auth.uid() AND dealership_id = id AND role = 'admin')
);

-- Dealership members
CREATE POLICY "Members can view their dealership members" ON public.dealership_members FOR SELECT USING (
  public.is_dealership_member(auth.uid(), dealership_id)
);
CREATE POLICY "Authenticated can insert dealership members" ON public.dealership_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Super admins can manage dealership members" ON public.dealership_members FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Providers: all authenticated can view approved, members see own
CREATE POLICY "Authenticated can view approved providers" ON public.providers FOR SELECT USING (status = 'approved' AND auth.uid() IS NOT NULL);
CREATE POLICY "Provider members can view own" ON public.providers FOR SELECT USING (public.is_provider_member(auth.uid(), id));
CREATE POLICY "Super admins can manage providers" ON public.providers FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Authenticated can insert providers" ON public.providers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Provider admins can update own" ON public.providers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.provider_members WHERE user_id = auth.uid() AND provider_id = id AND role = 'admin')
);

-- Provider members
CREATE POLICY "Members can view provider members" ON public.provider_members FOR SELECT USING (public.is_provider_member(auth.uid(), provider_id));
CREATE POLICY "Authenticated can insert provider members" ON public.provider_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Super admins can manage provider members" ON public.provider_members FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Products: all authenticated can view active
CREATE POLICY "Authenticated can view active products" ON public.products FOR SELECT USING (status = 'active' AND auth.uid() IS NOT NULL);
CREATE POLICY "Provider members can view own products" ON public.products FOR SELECT USING (public.is_provider_member(auth.uid(), provider_id));
CREATE POLICY "Provider members can manage own products" ON public.products FOR INSERT WITH CHECK (public.is_provider_member(auth.uid(), provider_id));
CREATE POLICY "Provider members can update own products" ON public.products FOR UPDATE USING (public.is_provider_member(auth.uid(), provider_id));
CREATE POLICY "Super admins can manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Contracts
CREATE POLICY "Dealership members can view contracts" ON public.contracts FOR SELECT USING (public.is_dealership_member(auth.uid(), dealership_id));
CREATE POLICY "Provider can view their contracts" ON public.contracts FOR SELECT USING (public.is_provider_member(auth.uid(), provider_id));
CREATE POLICY "Dealership members can create contracts" ON public.contracts FOR INSERT WITH CHECK (public.is_dealership_member(auth.uid(), dealership_id));
CREATE POLICY "Super admins can manage contracts" ON public.contracts FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Remittances
CREATE POLICY "Contract parties can view remittances" ON public.remittances FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.id = contract_id
    AND (public.is_dealership_member(auth.uid(), c.dealership_id) OR public.is_provider_member(auth.uid(), c.provider_id))
  )
);
CREATE POLICY "Super admins can manage remittances" ON public.remittances FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow public read of providers for landing page
CREATE POLICY "Public can view approved providers" ON public.providers FOR SELECT USING (status = 'approved');
