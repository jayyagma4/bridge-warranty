import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const JoinDealership = () => {
  const [adminCode, setAdminCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Find dealership by admin code
    const { data: dealership, error: findError } = await supabase
      .from("dealerships")
      .select("id, name")
      .eq("admin_code", adminCode)
      .single();

    if (findError || !dealership) {
      toast({ title: "Error", description: "Invalid admin code. Please check with your dealership admin.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
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
      setLoading(false);
      return;
    }

    // Add as dealership employee
    await supabase.from("dealership_members").insert({
      user_id: userId,
      dealership_id: dealership.id,
      role: "employee",
    });

    await supabase.from("user_roles").insert({
      user_id: userId,
      role: "dealership_employee",
    });

    setLoading(false);
    toast({ title: "Success", description: `You've joined ${dealership.name}! Please verify your email.` });
    navigate("/sign-in");
  };

  return (
    <AuthLayout title="Join Your Dealership" subtitle="Enter the admin code provided by your dealership manager to create your account.">
      <div>
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">BW</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">Bridge Warranty</span>
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Join a Dealership</h1>
        <p className="text-muted-foreground mb-8">Enter your dealership's admin code to get started</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Label>Admin Code</Label>
            <Input placeholder="Enter admin code" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required className="text-center text-lg tracking-widest font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Joining..." : "Join Dealership"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary font-medium hover:underline">Sign in</Link>
        </div>
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Own a dealership?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">Register instead</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default JoinDealership;
