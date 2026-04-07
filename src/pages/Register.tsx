import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick",
  "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
  "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon",
];

const STEPS = ["Dealership Info", "Compliance", "Create Account"];

const Register = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    dealershipName: "",
    dealershipPhone: "",
    province: "",
    address: "",
    licenseNumber: "",
    omvicRegistration: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 0) return form.dealershipName && form.dealershipPhone && form.province;
    if (step === 1) return true; // compliance optional
    if (step === 2) return form.fullName && form.email && form.password && form.password === form.confirmPassword;
    return false;
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      toast({ title: "Error", description: authError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      toast({ title: "Error", description: "Failed to create account", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Create dealership
    const { data: dealership, error: dealershipError } = await supabase
      .from("dealerships")
      .insert({
        name: form.dealershipName,
        phone: form.dealershipPhone,
        province: form.province,
        address: form.address,
        license_number: form.licenseNumber,
        compliance_info: {
          omvic_registration: form.omvicRegistration,
        },
      })
      .select()
      .single();

    if (dealershipError) {
      toast({ title: "Error", description: dealershipError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Add user as dealership admin
    await supabase.from("dealership_members").insert({
      user_id: userId,
      dealership_id: dealership.id,
      role: "admin",
    });

    // Assign dealership_admin role
    await supabase.from("user_roles").insert({
      user_id: userId,
      role: "dealership_admin",
    });

    setLoading(false);
    toast({ title: "Success", description: "Your dealership has been registered! Please check your email to verify your account." });
    navigate("/sign-in");
  };

  return (
    <AuthLayout title="Register Your Dealership" subtitle="Join Canada's growing network of dealerships using Bridge Warranty to connect with top protection providers.">
      <div>
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">BW</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">Bridge Warranty</span>
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Register Your Dealership</h1>
        <p className="text-muted-foreground mb-6">Step {step + 1} of 3 — {STEPS[step]}</p>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dealership Name *</Label>
              <Input placeholder="Your Dealership Name" value={form.dealershipName} onChange={(e) => update("dealershipName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input placeholder="(416) 555-0123" value={form.dealershipPhone} onChange={(e) => update("dealershipPhone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Province *</Label>
              <Select value={form.province} onValueChange={(v) => update("province", v)}>
                <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="123 Main St, Toronto" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business License Number</Label>
              <Input placeholder="License number" value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>OMVIC Registration (Ontario)</Label>
              <Input placeholder="OMVIC registration number" value={form.omvicRegistration} onChange={(e) => update("omvicRegistration", e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">Compliance information helps us verify your dealership faster. You can complete this later.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input placeholder="John Smith" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="john@dealership.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password *</Label>
              <Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          ) : (
            <div />
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
              {loading ? "Creating..." : "Create Account"} <Check className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
