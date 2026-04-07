import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout, { adminNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Dealership {
  id: string;
  name: string;
  phone: string | null;
  province: string | null;
  status: string;
  admin_code: string;
  created_at: string;
}

const AdminDealerships = () => {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDealerships = async () => {
    const { data, error } = await supabase
      .from("dealerships")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setDealerships(data);
    setLoading(false);
  };

  useEffect(() => { fetchDealerships(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("dealerships").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Dealership ${status}`);
      fetchDealerships();
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
    <DashboardLayout navItems={adminNavItems} title="Manage Dealerships">
      <Card>
        <CardHeader>
          <CardTitle>All Dealerships</CardTitle>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Admin Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealerships.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.province || "—"}</TableCell>
                    <TableCell>{d.phone || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{d.admin_code}</TableCell>
                    <TableCell>{getStatusBadge(d.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {d.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(d.id, "approved")}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(d.id, "rejected")}>Reject</Button>
                          </>
                        )}
                        {d.status === "rejected" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(d.id, "approved")}>Approve</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {dealerships.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No dealerships found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminDealerships;
