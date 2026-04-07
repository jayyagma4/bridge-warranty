import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout, { adminNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Provider {
  id: string;
  company_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  regions_served: string[] | null;
  created_at: string;
}

const AdminProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    const { data } = await supabase.from("providers").select("*").order("created_at", { ascending: false });
    if (data) setProviders(data);
    setLoading(false);
  };

  useEffect(() => { fetchProviders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("providers").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Provider ${status}`);
      fetchProviders();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">Approved</Badge>;
      case "pending": return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Manage Providers">
      <Card>
        <CardHeader>
          <CardTitle>All Providers</CardTitle>
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
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Regions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.company_name}</TableCell>
                    <TableCell>{p.contact_email || "—"}</TableCell>
                    <TableCell>{p.contact_phone || "—"}</TableCell>
                    <TableCell>{p.regions_served?.join(", ") || "—"}</TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {p.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(p.id, "approved")}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(p.id, "rejected")}>Reject</Button>
                          </>
                        )}
                        {p.status === "rejected" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "approved")}>Approve</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {providers.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No providers found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminProviders;
