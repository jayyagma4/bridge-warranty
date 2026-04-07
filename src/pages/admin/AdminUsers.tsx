import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout, { adminNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserWithRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: { full_name: string; phone: string | null } | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (rolesData) {
        const userIds = rolesData.map((r) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, phone")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
        setUsers(
          rolesData.map((r) => ({
            ...r,
            profile: profileMap.get(r.user_id) || null,
          }))
        );
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: "bg-destructive/10 text-destructive border-destructive/20",
      dealership_admin: "bg-primary/10 text-primary border-primary/20",
      dealership_employee: "bg-chart-4/10 text-chart-4 border-chart-4/20",
      provider: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    };
    return <Badge className={colors[role] || ""}>{role.replace(/_/g, " ")}</Badge>;
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Manage Users">
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
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
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.profile?.full_name || "—"}</TableCell>
                    <TableCell>{u.profile?.phone || "—"}</TableCell>
                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminUsers;
