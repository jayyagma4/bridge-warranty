import { useState } from "react";
import DashboardLayout, { providerNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, Shield, Plus, Save, UserCog } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

const demoTeam: TeamMember[] = [
  { id: "m1", name: "Sarah Director", email: "sarah@warrantyco.com", role: "admin", joinedAt: "2025-01-15" },
  { id: "m2", name: "Mike Underwriter", email: "mike@warrantyco.com", role: "member", joinedAt: "2025-02-20" },
  { id: "m3", name: "Lisa Claims", email: "lisa@warrantyco.com", role: "member", joinedAt: "2025-03-10" },
];

const ProviderSettings = () => {
  const { toast } = useToast();
  const [company, setCompany] = useState({
    name: "National Warranty Co.",
    description: "Canada's leading vehicle service contract provider, offering comprehensive warranty solutions for dealerships across Ontario and Quebec.",
    contactEmail: "info@nationalwarranty.ca",
    contactPhone: "1-800-555-0199",
    address: "100 King Street West, Suite 5600, Toronto, ON M5X 1C9",
    regions: ["Ontario", "Quebec", "British Columbia"],
  });
  const [team, setTeam] = useState(demoTeam);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "member" });
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: "Profile Saved", description: "Company profile has been updated." });
    setSaving(false);
  };

  const handleAddMember = () => {
    if (!newMember.email) return;
    toast({ title: "Invitation Sent", description: `An invitation has been sent to ${newMember.email}.` });
    setDialogOpen(false);
    setNewMember({ name: "", email: "", role: "member" });
  };

  const handleRoleChange = (id: string, role: string) => {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    toast({ title: "Role Updated" });
  };

  return (
    <DashboardLayout navItems={providerNavItems} title="Settings">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile" className="gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Company Profile
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5">
              <Users className="w-3.5 h-3.5" /> Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>Company Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input type="email" value={company.contactEmail} onChange={(e) => setCompany({ ...company, contactEmail: e.target.value })} />
                  </div>
                  <div>
                    <Label>Contact Phone</Label>
                    <Input value={company.contactPhone} onChange={(e) => setCompany({ ...company, contactPhone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} className="min-h-[100px]" />
                </div>
                <div>
                  <Label>Regions Served</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {company.regions.map((r, i) => (
                      <Badge key={i} variant="secondary">{r}</Badge>
                    ))}
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => {
                      const region = prompt("Enter region name:");
                      if (region) setCompany({ ...company, regions: [...company.regions, region] });
                    }}>
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Badge>
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{team.length}</p>
                      <p className="text-xs text-muted-foreground">Total Members</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold">{team.filter((m) => m.role === "admin").length}</p>
                      <p className="text-xs text-muted-foreground">Admins</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <UserCog className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{team.filter((m) => m.role === "member").length}</p>
                      <p className="text-xs text-muted-foreground">Members</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Team Members</CardTitle>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Member</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div>
                          <Label>Full Name</Label>
                          <Input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} placeholder="John Doe" />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} placeholder="john@company.com" />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Select value={newMember.role} onValueChange={(v) => setNewMember({ ...newMember, role: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={handleAddMember} disabled={!newMember.email}>
                          Send Invitation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">{m.name.charAt(0)}</span>
                              </div>
                              {m.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                          <TableCell>
                            <Badge variant={m.role === "admin" ? "default" : "secondary"} className="capitalize">{m.role}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{m.joinedAt}</TableCell>
                          <TableCell>
                            <Select value={m.role} onValueChange={(v) => handleRoleChange(m.id, v)}>
                              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProviderSettings;
