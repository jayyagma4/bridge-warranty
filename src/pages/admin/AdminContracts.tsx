import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout, { adminNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Contract {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  status: string;
  contract_price: number | null;
  created_at: string;
}

const AdminContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      const { data } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setContracts(data);
      setLoading(false);
    };
    fetchContracts();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      submitted: "bg-primary/10 text-primary border-primary/20",
      approved: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      active: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="All Contracts">
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.customer_first_name} {c.customer_last_name}</TableCell>
                    <TableCell>{c.vehicle_year} {c.vehicle_make} {c.vehicle_model}</TableCell>
                    <TableCell>{c.contract_price ? `$${c.contract_price.toLocaleString()}` : "—"}</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {contracts.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No contracts found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminContracts;
