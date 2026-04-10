import { useEffect, useState, useMemo } from "react";
import DashboardLayout, { dealershipNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useDealership } from "@/hooks/useDealership";
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

const DealershipRemittances = () => {
  const { dealershipId, loading: dLoading } = useDealership();
  const { toast } = useToast();
  const [soldContracts, setSoldContracts] = useState<SoldContract[]>([]);
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dealershipId) return;
    const fetchData = async () => {
      // Sold contracts not yet remitted
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, customer_first_name, customer_last_name, contract_price, dealer_cost, product_id, provider_id, created_at")
        .eq("dealership_id", dealershipId)
        .eq("status", "submitted");

      // Existing remittances
      const { data: allContracts } = await supabase
        .from("contracts")
        .select("id")
        .eq("dealership_id", dealershipId);
      const contractIds = (allContracts || []).map((c) => c.id);

      let rems: Remittance[] = [];
      if (contractIds.length) {
        const { data } = await supabase
          .from("remittances")
          .select("*")
          .in("contract_id", contractIds)
          .order("created_at", { ascending: false });
        rems = (data as Remittance[]) || [];
      }

      const remittedContractIds = new Set(rems.map((r) => r.contract_id));
      const unremitted = (contracts || []).filter((c) => !remittedContractIds.has(c.id));

      setSoldContracts(unremitted as SoldContract[]);
      setRemittances(rems);
      setLoading(false);
    };
    fetchData();
  }, [dealershipId]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedTotal = useMemo(
    () => soldContracts.filter((c) => selected.has(c.id)).reduce((s, c) => s + (Number(c.dealer_cost) || 0), 0),
    [selected, soldContracts]
  );

  const handleSubmitRemittance = async () => {
    if (selected.size === 0) return;
    const selectedContracts = soldContracts.filter((c) => selected.has(c.id));
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const inserts = selectedContracts.map((c) => ({
      contract_id: c.id,
      amount: Number(c.dealer_cost) || 0,
      due_date: dueDate.toISOString().split("T")[0],
      status: "pending",
    }));

    const { error } = await supabase.from("remittances").insert(inserts);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Remittance Created", description: `${selected.size} contract(s) submitted for remittance.` });
      // Update contract status to active
      await supabase.from("contracts").update({ status: "active" }).in("id", Array.from(selected));
      setSoldContracts((prev) => prev.filter((c) => !selected.has(c.id)));
      setSelected(new Set());
    }
  };

  const filteredRems = useMemo(() => {
    if (tab === "all") return remittances;
    return remittances.filter((r) => r.status === tab);
  }, [remittances, tab]);

  if (dLoading) return <DashboardLayout navItems={dealershipNavItems} title="Remittances"><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div></DashboardLayout>;

  return (
    <DashboardLayout navItems={dealershipNavItems} title="Remittances">
      <div className="space-y-6">
        {/* Ready to Remit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Ready to Remit ({soldContracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
            ) : soldContracts.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No sold contracts ready for remittance.</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contract Price</TableHead>
                      <TableHead>Dealer Cost</TableHead>
                      <TableHead>Date Sold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soldContracts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                        </TableCell>
                        <TableCell className="font-medium">{c.customer_first_name} {c.customer_last_name}</TableCell>
                        <TableCell>${Number(c.contract_price || 0).toLocaleString()}</TableCell>
                        <TableCell>${Number(c.dealer_cost || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div>
                    <span className="text-sm text-muted-foreground">{selected.size} selected</span>
                    <span className="text-sm font-medium ml-4">Total: ${selectedTotal.toLocaleString()}</span>
                  </div>
                  <Button onClick={handleSubmitRemittance} disabled={selected.size === 0}>
                    <Send className="w-4 h-4 mr-1" /> Submit Remittance
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Remittance History */}
        <Card>
          <Tabs value={tab} onValueChange={setTab}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base mb-2">Remittance History</CardTitle>
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>
            <CardContent>
              {filteredRems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No remittances found.</p>
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
                    {filteredRems.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">${r.amount.toLocaleString()}</TableCell>
                        <TableCell><Badge className={statusColors[r.status] || ""} variant="secondary">{r.status}</Badge></TableCell>
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
