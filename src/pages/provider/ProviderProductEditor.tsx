import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout, { providerNavItems } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Save, ArrowLeft, Plus, Trash2, Sparkles, Eye, GripVertical,
  ChevronDown, ChevronUp, FileText, Shield, DollarSign, Award, Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverageCategory {
  name: string;
  parts: string[];
}

interface PricingRow {
  term: string;
  mileageBracket: string;
  vehicleClass: string;
  dealerCost: number;
  suggestedRetail: number;
}

interface Benefit {
  name: string;
  included: boolean;
  description?: string;
}

interface TermsSection {
  title: string;
  content: string;
}

interface ProductForm {
  name: string;
  type: string;
  description: string;
  group: string;
  maxAge: string;
  maxMileage: string;
  vehicleTypes: string;
  premiumMakes: string;
  deductible: string;
  perClaim: string;
  coverageCategories: CoverageCategory[];
  pricingRows: PricingRow[];
  benefits: Benefit[];
  termsSections: TermsSection[];
  exclusions: string;
  waitingPeriod: string;
  coverageTerritory: string;
  disputeResolution: string;
  importantNotes: string;
}

const defaultBenefits: Benefit[] = [
  { name: "24/7 Roadside Assistance", included: true },
  { name: "Towing (up to 100km)", included: true },
  { name: "Rental Car Allowance", included: false },
  { name: "Trip Interruption", included: false },
  { name: "Transferable Coverage", included: true },
  { name: "No Deductible Option", included: false },
  { name: "OEM Parts Coverage", included: false },
  { name: "Diminishing Deductible", included: false },
];

const defaultTermsSections: TermsSection[] = [
  { title: "Conditions of Coverage", content: "Vehicle must be maintained according to manufacturer specifications..." },
  { title: "Maintenance Requirements", content: "Regular oil changes, fluid checks, and scheduled maintenance must be documented..." },
  { title: "Claims Process", content: "Contact the claims department at the toll-free number. Present your contract at the repair facility..." },
  { title: "Cancellation Policy", content: "Full refund within 30 days. Pro-rated refund thereafter, less a $50 administrative fee..." },
];

const emptyForm: ProductForm = {
  name: "",
  type: "warranty",
  description: "",
  group: "",
  maxAge: "10",
  maxMileage: "200000",
  vehicleTypes: "Cars, Light Trucks, SUVs",
  premiumMakes: "BMW, Mercedes-Benz, Audi, Lexus, Porsche, Land Rover, Jaguar",
  deductible: "200",
  perClaim: "",
  coverageCategories: [
    { name: "Engine", parts: ["Engine block", "Cylinder head", "Pistons", "Crankshaft", "Camshaft"] },
    { name: "Transmission", parts: ["Transmission case", "Gears", "Torque converter", "Valve body"] },
    { name: "Electrical", parts: ["Alternator", "Starter motor", "Wiring harness"] },
  ],
  pricingRows: [
    { term: "12 months", mileageBracket: "0-80,000 km", vehicleClass: "Class 1", dealerCost: 895, suggestedRetail: 1295 },
    { term: "24 months", mileageBracket: "0-80,000 km", vehicleClass: "Class 1", dealerCost: 1195, suggestedRetail: 1695 },
    { term: "36 months", mileageBracket: "0-80,000 km", vehicleClass: "Class 1", dealerCost: 1495, suggestedRetail: 2095 },
  ],
  benefits: defaultBenefits,
  termsSections: defaultTermsSections,
  exclusions: "Pre-existing conditions\nCosmetic damage\nNormal wear and tear\nModified or altered vehicles\nRacing or competition use",
  waitingPeriod: "30 days and 1,000 km",
  coverageTerritory: "Canada and Continental United States",
  disputeResolution: "Disputes shall be resolved through binding arbitration in accordance with applicable provincial laws.",
  importantNotes: "Premium vehicle surcharge may apply for luxury makes.\nAll claims subject to inspection.",
};

const ProviderProductEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = !id || id === "new";
  const showAI = searchParams.get("ai") === "true";

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [activeTab, setActiveTab] = useState(showAI ? "ai-assist" : "basic");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // If editing existing, load demo data
  useEffect(() => {
    if (!isNew) {
      setForm({
        ...emptyForm,
        name: "Gold VSC",
        type: "warranty",
        description: "Comprehensive vehicle service contract covering major mechanical and electrical components.",
        group: "A-Protect VSC",
      });
    }
  }, [isNew]);

  const updateForm = (updates: Partial<ProductForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const addCoverageCategory = () => {
    updateForm({ coverageCategories: [...form.coverageCategories, { name: "", parts: [""] }] });
  };

  const removeCoverageCategory = (index: number) => {
    updateForm({ coverageCategories: form.coverageCategories.filter((_, i) => i !== index) });
  };

  const updateCategory = (index: number, updates: Partial<CoverageCategory>) => {
    const cats = [...form.coverageCategories];
    cats[index] = { ...cats[index], ...updates };
    updateForm({ coverageCategories: cats });
  };

  const addPartToCategory = (catIndex: number) => {
    const cats = [...form.coverageCategories];
    cats[catIndex].parts.push("");
    updateForm({ coverageCategories: cats });
  };

  const updatePart = (catIndex: number, partIndex: number, value: string) => {
    const cats = [...form.coverageCategories];
    cats[catIndex].parts[partIndex] = value;
    updateForm({ coverageCategories: cats });
  };

  const removePart = (catIndex: number, partIndex: number) => {
    const cats = [...form.coverageCategories];
    cats[catIndex].parts = cats[catIndex].parts.filter((_, i) => i !== partIndex);
    updateForm({ coverageCategories: cats });
  };

  const addPricingRow = () => {
    updateForm({
      pricingRows: [...form.pricingRows, { term: "12 months", mileageBracket: "0-80,000 km", vehicleClass: "Class 1", dealerCost: 0, suggestedRetail: 0 }],
    });
  };

  const removePricingRow = (index: number) => {
    updateForm({ pricingRows: form.pricingRows.filter((_, i) => i !== index) });
  };

  const updatePricingRow = (index: number, updates: Partial<PricingRow>) => {
    const rows = [...form.pricingRows];
    rows[index] = { ...rows[index], ...updates };
    updateForm({ pricingRows: rows });
  };

  const toggleBenefit = (index: number) => {
    const benefits = [...form.benefits];
    benefits[index] = { ...benefits[index], included: !benefits[index].included };
    updateForm({ benefits });
  };

  const addTermsSection = () => {
    updateForm({ termsSections: [...form.termsSections, { title: "", content: "" }] });
  };

  const removeTermsSection = (index: number) => {
    updateForm({ termsSections: form.termsSections.filter((_, i) => i !== index) });
  };

  const updateTermsSection = (index: number, updates: Partial<TermsSection>) => {
    const sections = [...form.termsSections];
    sections[index] = { ...sections[index], ...updates };
    updateForm({ termsSections: sections });
  };

  const handleAIExtract = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-plan-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: aiText }),
        }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "AI extraction failed");
      }
      const data = await response.json();
      if (data.product) {
        const p = data.product;
        updateForm({
          name: p.name || form.name,
          type: p.type || form.type,
          description: p.description || form.description,
          group: p.group || form.group,
          maxAge: p.maxAge || form.maxAge,
          maxMileage: p.maxMileage || form.maxMileage,
          deductible: p.deductible || form.deductible,
          perClaim: p.perClaim || form.perClaim,
          coverageCategories: p.coverageCategories?.length ? p.coverageCategories : form.coverageCategories,
          pricingRows: p.pricingRows?.length ? p.pricingRows : form.pricingRows,
          benefits: p.benefits?.length ? p.benefits : form.benefits,
          termsSections: p.termsSections?.length ? p.termsSections : form.termsSections,
          exclusions: p.exclusions || form.exclusions,
          waitingPeriod: p.waitingPeriod || form.waitingPeriod,
          coverageTerritory: p.coverageTerritory || form.coverageTerritory,
          importantNotes: p.importantNotes || form.importantNotes,
        });
        toast({ title: "AI Extraction Complete", description: "Plan data has been populated. Review and adjust as needed." });
        setActiveTab("basic");
      }
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast({ title: "Missing Name", description: "Please enter a product name.", variant: "destructive" });
      return;
    }
    setSaving(true);
    // Demo: just show success
    await new Promise((r) => setTimeout(r, 800));
    toast({ title: isNew ? "Product Created" : "Product Saved", description: `${form.name} has been saved successfully.` });
    setSaving(false);
    navigate("/provider/products");
  };

  const tabs = [
    { value: "ai-assist", label: "AI Assist", icon: Sparkles },
    { value: "basic", label: "Basic Info", icon: FileText },
    { value: "eligibility", label: "Eligibility", icon: Shield },
    { value: "coverage", label: "Coverage", icon: Shield },
    { value: "pricing", label: "Pricing & Tiers", icon: DollarSign },
    { value: "benefits", label: "Benefits", icon: Award },
    { value: "terms", label: "Terms & Conditions", icon: Scale },
    { value: "preview", label: "Preview", icon: Eye },
  ];

  return (
    <DashboardLayout navItems={providerNavItems} title={isNew ? "New Product" : "Edit Product"}>
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/provider/products")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <h2 className="text-xl font-bold">{isNew ? "Create New Product" : `Edit: ${form.name}`}</h2>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs sm:text-sm">
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* AI Assist */}
          <TabsContent value="ai-assist">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI-Powered Plan Import
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Paste your existing plan document, PDF text, or description below. Our AI will extract all the details and auto-fill the form for you.
                </p>
                <Textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Paste your plan document text here... Include coverage details, pricing tiers, terms and conditions, exclusions, etc."
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{aiText.length} characters</p>
                  <Button onClick={handleAIExtract} disabled={aiLoading || !aiText.trim()}>
                    <Sparkles className="w-4 h-4 mr-1" />
                    {aiLoading ? "Extracting..." : "Extract & Auto-Fill"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Basic Info */}
          <TabsContent value="basic">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Product Name *</Label>
                    <Input value={form.name} onChange={(e) => updateForm({ name: e.target.value })} placeholder="e.g., Gold VSC" />
                  </div>
                  <div>
                    <Label>Product Type *</Label>
                    <Select value={form.type} onValueChange={(v) => updateForm({ type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warranty">Vehicle Service Contract</SelectItem>
                        <SelectItem value="tire_rim">Tire & Rim Protection</SelectItem>
                        <SelectItem value="gap">GAP Insurance</SelectItem>
                        <SelectItem value="theft">Theft Protection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Product Group / Family</Label>
                    <Input value={form.group} onChange={(e) => updateForm({ group: e.target.value })} placeholder="e.g., A-Protect VSC" />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => updateForm({ description: e.target.value })} placeholder="Describe what this product covers..." className="min-h-[100px]" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Eligibility */}
          <TabsContent value="eligibility">
            <Card>
              <CardHeader><CardTitle>Eligibility Rules</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Max Vehicle Age (years)</Label>
                    <Input type="number" value={form.maxAge} onChange={(e) => updateForm({ maxAge: e.target.value })} />
                  </div>
                  <div>
                    <Label>Max Mileage (km)</Label>
                    <Input type="number" value={form.maxMileage} onChange={(e) => updateForm({ maxMileage: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Eligible Vehicle Types</Label>
                  <Input value={form.vehicleTypes} onChange={(e) => updateForm({ vehicleTypes: e.target.value })} placeholder="Cars, Light Trucks, SUVs" />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated list</p>
                </div>
                <div>
                  <Label>Premium Makes (surcharge applies)</Label>
                  <Input value={form.premiumMakes} onChange={(e) => updateForm({ premiumMakes: e.target.value })} placeholder="BMW, Mercedes-Benz, Audi..." />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated list</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coverage */}
          <TabsContent value="coverage">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Coverage Details</CardTitle>
                  <Button size="sm" variant="outline" onClick={addCoverageCategory}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {form.coverageCategories.map((cat, catIdx) => (
                  <div key={catIdx} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={cat.name}
                        onChange={(e) => updateCategory(catIdx, { name: e.target.value })}
                        placeholder="Category name (e.g., Engine)"
                        className="font-semibold max-w-xs"
                      />
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeCoverageCategory(catIdx)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {cat.parts.map((part, partIdx) => (
                        <div key={partIdx} className="flex items-center gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30" />
                          <Input
                            value={part}
                            onChange={(e) => updatePart(catIdx, partIdx, e.target.value)}
                            placeholder="Covered part..."
                            className="flex-1"
                          />
                          <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => removePart(catIdx, partIdx)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" onClick={() => addPartToCategory(catIdx)} className="text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add Part
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pricing & Tiers</CardTitle>
                  <Button size="sm" variant="outline" onClick={addPricingRow}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Tier
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Deductible ($)</Label>
                    <Input type="number" value={form.deductible} onChange={(e) => updateForm({ deductible: e.target.value })} />
                  </div>
                  <div>
                    <Label>Per-Claim Maximum ($)</Label>
                    <Input type="number" value={form.perClaim} onChange={(e) => updateForm({ perClaim: e.target.value })} placeholder="Leave blank for unlimited" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium">Term</th>
                        <th className="text-left p-3 font-medium">Mileage Bracket</th>
                        <th className="text-left p-3 font-medium">Vehicle Class</th>
                        <th className="text-right p-3 font-medium">Dealer Cost</th>
                        <th className="text-right p-3 font-medium">Suggested Retail</th>
                        <th className="text-right p-3 font-medium">Margin</th>
                        <th className="p-3 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {form.pricingRows.map((row, i) => {
                        const margin = row.suggestedRetail > 0 ? ((row.suggestedRetail - row.dealerCost) / row.suggestedRetail * 100).toFixed(1) : "0";
                        return (
                          <tr key={i} className="border-b hover:bg-muted/30">
                            <td className="p-2">
                              <Input value={row.term} onChange={(e) => updatePricingRow(i, { term: e.target.value })} className="h-9" />
                            </td>
                            <td className="p-2">
                              <Input value={row.mileageBracket} onChange={(e) => updatePricingRow(i, { mileageBracket: e.target.value })} className="h-9" />
                            </td>
                            <td className="p-2">
                              <Input value={row.vehicleClass} onChange={(e) => updatePricingRow(i, { vehicleClass: e.target.value })} className="h-9" />
                            </td>
                            <td className="p-2">
                              <Input type="number" value={row.dealerCost} onChange={(e) => updatePricingRow(i, { dealerCost: Number(e.target.value) })} className="h-9 text-right" />
                            </td>
                            <td className="p-2">
                              <Input type="number" value={row.suggestedRetail} onChange={(e) => updatePricingRow(i, { suggestedRetail: Number(e.target.value) })} className="h-9 text-right" />
                            </td>
                            <td className="p-2 text-right">
                              <Badge variant="secondary" className="text-xs">{margin}%</Badge>
                            </td>
                            <td className="p-2">
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removePricingRow(i)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits */}
          <TabsContent value="benefits">
            <Card>
              <CardHeader><CardTitle>Included Benefits</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {form.benefits.map((benefit, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between rounded-lg border p-4 transition-colors cursor-pointer",
                      benefit.included ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                    )} onClick={() => toggleBenefit(i)}>
                      <div className="flex items-center gap-3">
                        <Switch checked={benefit.included} onCheckedChange={() => toggleBenefit(i)} />
                        <span className={cn("font-medium text-sm", !benefit.included && "text-muted-foreground")}>{benefit.name}</span>
                      </div>
                      {benefit.included && <Badge variant="secondary" className="text-[10px]">Included</Badge>}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4" onClick={() => updateForm({ benefits: [...form.benefits, { name: "", included: true }] })}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Benefit
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms & Conditions */}
          <TabsContent value="terms">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Terms & Conditions</CardTitle>
                    <Button size="sm" variant="outline" onClick={addTermsSection}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Section
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.termsSections.map((section, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Input
                          value={section.title}
                          onChange={(e) => updateTermsSection(i, { title: e.target.value })}
                          placeholder="Section Title"
                          className="font-semibold max-w-sm"
                        />
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeTermsSection(i)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Textarea
                        value={section.content}
                        onChange={(e) => updateTermsSection(i, { content: e.target.value })}
                        placeholder="Section content..."
                        className="min-h-[100px]"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Additional Terms</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>General Exclusions</Label>
                    <Textarea value={form.exclusions} onChange={(e) => updateForm({ exclusions: e.target.value })} placeholder="One exclusion per line..." className="min-h-[120px]" />
                    <p className="text-xs text-muted-foreground mt-1">One exclusion per line</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Waiting Period</Label>
                      <Input value={form.waitingPeriod} onChange={(e) => updateForm({ waitingPeriod: e.target.value })} />
                    </div>
                    <div>
                      <Label>Coverage Territory</Label>
                      <Input value={form.coverageTerritory} onChange={(e) => updateForm({ coverageTerritory: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Dispute Resolution</Label>
                    <Textarea value={form.disputeResolution} onChange={(e) => updateForm({ disputeResolution: e.target.value })} className="min-h-[80px]" />
                  </div>
                  <div>
                    <Label>Important Notes</Label>
                    <Textarea value={form.importantNotes} onChange={(e) => updateForm({ importantNotes: e.target.value })} placeholder="One note per line..." className="min-h-[80px]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">{form.type === "warranty" ? "Vehicle Service Contract" : form.type}</Badge>
                      <CardTitle className="text-2xl">{form.name || "Untitled Product"}</CardTitle>
                      {form.group && <p className="text-sm text-muted-foreground mt-1">{form.group}</p>}
                    </div>
                    <Badge variant="secondary">Preview</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{form.description || "No description provided."}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Eligibility</p>
                    <p className="text-sm">Up to {form.maxAge} years / {Number(form.maxMileage).toLocaleString()} km</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Deductible</p>
                    <p className="text-sm">${form.deductible}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Coverage Categories</p>
                    <p className="text-sm">{form.coverageCategories.length} categories</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Pricing Tiers ({form.pricingRows.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2">Term</th>
                          <th className="text-left p-2">Mileage</th>
                          <th className="text-left p-2">Class</th>
                          <th className="text-right p-2">Dealer Cost</th>
                          <th className="text-right p-2">Retail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.pricingRows.map((row, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-2">{row.term}</td>
                            <td className="p-2">{row.mileageBracket}</td>
                            <td className="p-2">{row.vehicleClass}</td>
                            <td className="p-2 text-right">${row.dealerCost.toLocaleString()}</td>
                            <td className="p-2 text-right">${row.suggestedRetail.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Benefits</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {form.benefits.filter((b) => b.included).map((b, i) => (
                      <Badge key={i} variant="secondary">{b.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Coverage Categories</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {form.coverageCategories.map((cat, i) => (
                    <div key={i}>
                      <p className="font-semibold text-sm mb-1">{cat.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {cat.parts.filter(Boolean).map((p, j) => (
                          <Badge key={j} variant="outline" className="text-xs">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProviderProductEditor;
