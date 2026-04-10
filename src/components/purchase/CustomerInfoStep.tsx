import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { StepProps } from "./types";

const CustomerInfoStep = ({ state, updateState, onNext, onBack }: StepProps) => {
  const { user } = useAuth();
  const c = state.customer;

  const update = (field: string, value: string) => {
    updateState({ customer: { ...c, [field]: value } });
  };

  const canContinue = c.firstName.trim() && c.lastName.trim() && c.email.trim();

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Customer Information</h2>
          <p className="text-sm text-muted-foreground">
            {user ? "Enter the customer's details for this warranty contract." : "Enter your details for the warranty contract."}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={c.firstName}
            onChange={e => update("firstName", e.target.value)}
            placeholder="John"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={c.lastName}
            onChange={e => update("lastName", e.target.value)}
            placeholder="Smith"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={c.email}
            onChange={e => update("email", e.target.value)}
            placeholder="john@example.com"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={c.phone}
            onChange={e => update("phone", e.target.value)}
            placeholder="(416) 555-0123"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={onNext} disabled={!canContinue}>
          Continue to Review →
        </Button>
      </div>
    </Card>
  );
};

export default CustomerInfoStep;
