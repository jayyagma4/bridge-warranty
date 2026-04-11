import { useState, useMemo } from "react";
import DashboardLayout, { providerNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface Remittance {
  id: string;
  dealership: string;
  amount: number;
  contractCount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  paid: "bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const TABS = ["all", "pending", "submitted", "paid", "overdue"];

const demoRemittances: Remittance[] = [
  { id: "r1", dealership: "AutoMax Toronto", amount: 4800, contractCount: 4, status: "paid", dueDate: "2025-04-15", paidDate: "2025-04-14", createdAt: "2025-04-01T10:00:00Z" },
  { id: "r2", dealership: "Drive Nation Ottawa", amount: 3600, contractCount: 3, status: "paid", dueDate: "2025-04-15", paidDate: "2025-04-15", createdAt: "2025-04-01T10:00:00Z" },
  { id: "r3", dealership: "AutoMax Toronto", amount: 5400, contractCount: 4, status: "submitted", dueDate: "2025-05-15", paidDate: null, createdAt: "2025-05-01T10:00:00Z" },
  { id: "r4", dealership: "Premier Auto Group", amount: 2700, contractCount: 2, status: "pending", dueDate: "2025-06-15", paidDate: null, createdAt: "2025-06-01T10:00:00Z" },
  { id: "r5", dealership: "City Motors Hamilton", amount: 1950, contractCount: 2, status: "pending", dueDate: "2025-06-15", paidDate: null, createdAt: "2025-06-01T10:00:00Z" },
  { id: "r6", dealership: "Valley Autos London", amount: 3200, contractCount: 3, status: "overdue", dueDate: "2025-05-01", paidDate: null, createdAt: "2025-04-15T10:00:00Z" },
];

const ProviderRemittances = () => {
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    if (tab === "all") return demoRemittances;
    return demoRemittances.filter((r) => r.status === tab);
  }, [tab]);

  const totalReceived = demoRemittances.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const totalPending = demoRemittances.filter((r) => ["pending", "submitted"].includes(r.status)).reduce((s, r) => s + r.amount, 0);
  const totalOverdue = demoRemittances.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amount, 0);

  return (
    <DashboardLayout navItems={providerNavItems} title="Remittances">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Received</p>
                <p className="text-xl font-bold text-green-600">${totalReceived.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">${totalPending.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold text-red-600">${totalOverdue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Remittances</p>
                <p className="text-xl font-bold">{demoRemittances.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <Tabs value={tab} onValueChange={setTab}>
            <CardHeader className="pb-3">
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No remittances found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealership</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Contracts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Paid Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.dealership}</TableCell>
                        <TableCell className="font-medium">${r.amount.toLocaleString()}</TableCell>
                        <TableCell>{r.contractCount}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[r.status] || ""} variant="secondary">{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{format(new Date(r.dueDate), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-sm">{r.paidDate ? format(new Date(r.paidDate), "MMM d, yyyy") : "—"}</TableCell>
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

export default ProviderRemittances;
