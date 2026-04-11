import { useEffect, useState, useMemo } from "react";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useDealership } from "@/hooks/useDealership";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { DollarSign, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SoldContract {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  contract_price: number | null;
  dealer_cost: number | null;
  product_id: string;
  provider_id: string;
  created_at: string;
}

interface Remittance {
  id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_date: string | null;
  created_at: string;
  contract_id: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid: "bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-300",
};

const TABS = ["all", "pending", "submitted", "approved", "paid"];

const demoSoldContracts: SoldContract[] = [
  { id: "sc1", customer_first_name: "John", customer_last_name: "Smith", contract_price: 1895, dealer_cost: 1200, product_id: "p1", provider_id: "pr1", created_at: "2025-06-01T10:00:00Z" },
  { id: "sc2", customer_first_name: "Sarah", customer_last_name: "Johnson", contract_price: 2295, dealer_cost: 1500, product_id: "p2", provider_id: "pr1", created_at: "2025-05-15T14:00:00Z" },
  { id: "sc3", customer_first_name: "Lisa", customer_last_name: "Taylor", contract_price: 1995, dealer_cost: 1300, product_id: "p3", provider_id: "pr1", created_at: "2025-04-20T08:00:00Z" },
];

const demoRemittances: Remittance[] = [
  { id: "r1", amount: 3500, status: "paid", due_date: "2025-04-15", paid_date: "2025-04-14", created_at: "2025-04-01T10:00:00Z", contract_id: "sc1" },
  { id: "r2", amount: 2800, status: "approved", due_date: "2025-05-15", paid_date: null, created_at: "2025-05-01T10:00:00Z", contract_id: "sc2" },
  { id: "r3", amount: 1500, status: "pending", due_date: "2025-06-15", paid_date: null, created_at: "2025-06-01T10:00:00Z", contract_id: "sc3" },
];

const DealershipRemittances = () => {
  const { dealershipId, loading: dLoading } = useDealership();
  const { user } = useAuth();
  const { toast } = useToast();
  const [soldContracts, setSoldContracts] = useState<SoldContract[]>([]);
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dealershipId) return;

    if (!user) {
      setSoldContracts(demoSoldContracts);
      setRemittances(demoRemittances);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      // Contracts ready for remittance (active, not yet remitted)
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, customer_first_name, customer_last_name, contract_price, dealer_cost, product_id, provider_id, created_at")
        .eq("dealership_id", dealershipId)
        .eq("status", "active");

      const { data: rems } = await supabase
        .from("remittances")
        .select("*")
        .order("created_at", { ascending: false });

      const remittedContractIds = new Set((rems || []).map((r) => r.contract_id));
      const unremitted = (contracts || []).filter((c) => !remittedContractIds.has(c.id));

      setSoldContracts(unremitted.length > 0 ? unremitted : demoSoldContracts);
      setRemittances(rems && rems.length > 0 ? rems : demoRemittances);
      setLoading(false);
    };
    fetchData();
  }, [dealershipId, user]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const selectedTotal = useMemo(
    () => soldContracts.filter((c) => selected.includes(c.id)).reduce((s, c) => s + (Number(c.dealer_cost) || 0), 0),
    [selected, soldContracts]
  );

  const filteredRemittances = useMemo(() => {
    if (tab === "all") return remittances;
    return remittances.filter((r) => r.status === tab);
  }, [remittances, tab]);

  const handleSubmitRemittance = async () => {
    if (!user) {
      toast({ title: "Demo Mode", description: "Remittance submitted (demo)" });
      setSoldContracts((prev) => prev.filter((c) => !selected.includes(c.id)));
      setSelected([]);
      return;
    }

    const selectedContracts = soldContracts.filter((c) => selected.includes(c.id));
    const inserts = selectedContracts.map((c) => ({
      contract_id: c.id,
      amount: Number(c.dealer_cost) || 0,
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: "pending",
    }));

    const { error } = await supabase.from("remittances").insert(inserts);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Submitted", description: `${selected.length} remittance(s) submitted.` });
      setSoldContracts((prev) => prev.filter((c) => !selected.includes(c.id)));
      setSelected([]);
    }
  };

  if (dLoading || loading) {
    return (
      <DashboardLayout navItems={dealershipNavItems} title="Remittances">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Remittances">
      <div className="space-y-6">
        {/* Ready to Remit */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ready to Remit</CardTitle>
              {selected.length > 0 && (
                <Button size="sm" onClick={handleSubmitRemittance}>
                  <Send className="w-4 h-4 mr-1" />
                  Submit {selected.length} — ${selectedTotal.toLocaleString()}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {soldContracts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No contracts ready for remittance.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Customer</TableHead>
                    <TableHead>Contract Price</TableHead>
                    <TableHead>Dealer Cost</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {soldContracts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{c.customer_first_name} {c.customer_last_name}</TableCell>
                      <TableCell>${Number(c.contract_price || 0).toLocaleString()}</TableCell>
                      <TableCell>${Number(c.dealer_cost || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Remittance History */}
        <Card>
          <Tabs value={tab} onValueChange={setTab}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Remittance History</CardTitle>
                <TabsList>
                  {TABS.map((t) => (
                    <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRemittances.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No remittances found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRemittances.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">${r.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[r.status] || ""} variant="secondary">{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{format(new Date(r.due_date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-sm">{r.paid_date ? format(new Date(r.paid_date), "MMM d, yyyy") : "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DealershipRemittances;
