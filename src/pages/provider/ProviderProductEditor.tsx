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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fetchProductById, saveProduct, TYPE_LABELS } from "@/lib/productService";
import {
  Save, ArrowLeft, Plus, Trash2, Sparkles, Eye, GripVertical,
  FileText, Shield, DollarSign, Award, Scale, Upload, Download, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────

interface CoverageCategory { name: string; parts: string[]; }
interface PricingRow { term: string; mileageBracket: string; vehicleClass: string; dealerCost: number; suggestedRetail: number; }
interface Benefit { name: string; included: boolean; description?: string; }
interface TermsSection { title: string; content: string; }

interface ProductForm {
  name: string;
  type: string;
  description: string;
  group: string;
  tier: string;
  slug: string;
  maxAge: string;
  maxMileage: string;
  vehicleTypes: string;
  premiumMakes: string;
  deductible: string;
  perClaim: string;
  eligibilityLabel: string;
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
];

const emptyForm: ProductForm = {
  name: "", type: "VSC", description: "", group: "", tier: "", slug: "",
  maxAge: "10", maxMileage: "200000", vehicleTypes: "Cars, Light Trucks, SUVs",
  premiumMakes: "BMW, Mercedes-Benz, Audi, Lexus, Porsche, Land Rover, Jaguar",
  deductible: "200", perClaim: "", eligibilityLabel: "",
  coverageCategories: [
    { name: "Engine", parts: ["Engine block", "Cylinder head", "Pistons"] },
    { name: "Transmission", parts: ["Transmission case", "Gears", "Torque converter"] },
  ],
  pricingRows: [
    { term: "12mo/20000km", mileageBracket: "", vehicleClass: "Class 1", dealerCost: 0, suggestedRetail: 0 },
  ],
  benefits: defaultBenefits,
  termsSections: [
    { title: "Conditions of Coverage", content: "Vehicle must be maintained according to manufacturer specifications..." },
    { title: "Claims Process", content: "Contact the claims department at the toll-free number..." },
  ],
  exclusions: "Pre-existing conditions\nCosmetic damage\nNormal wear and tear",
  waitingPeriod: "30 days and 1,000 km",
  coverageTerritory: "Canada and Continental United States",
  disputeResolution: "Disputes shall be resolved through binding arbitration.",
  importantNotes: "",
};

// ── Helpers to convert DB product → form and back ──

function dbProductToForm(product: any): ProductForm {
  const cd = product.coverage_details || {};
  const pr = product.pricing || {};
  const er = product.eligibility_rules || {};

  const pricingRows: PricingRow[] = (pr.tiers || []).map((t: any) => ({
    term: t.term || "",
    mileageBracket: t.mileage_bracket || "",
    vehicleClass: t.vehicle_class || "Class 1",
    dealerCost: t.dealer_cost || 0,
    suggestedRetail: t.suggested_retail || 0,
  }));

  const coverageCategories: CoverageCategory[] = (cd.coverageCategories || []).map((c: any) => ({
    name: c.name || "",
    parts: Array.isArray(c.parts) ? c.parts : (c.parts || "").split(",").map((s: string) => s.trim()),
  }));

  const benefits: Benefit[] = (pr.benefits || defaultBenefits).map((b: any) =>
    typeof b === "string" ? { name: b, included: true } : { name: b.name, included: b.included ?? true, description: b.description }
  );

  return {
    name: product.name || "",
    type: product.type || "VSC",
    description: product.description || "",
    group: cd.group || "",
    tier: cd.tier || "",
    slug: cd.slug || "",
    maxAge: String(er.max_age || "10"),
    maxMileage: String(er.max_mileage || "200000"),
    vehicleTypes: er.vehicle_types || "Cars, Light Trucks, SUVs",
    premiumMakes: (er.premium_makes || []).join(", "),
    deductible: String(pr.deductible || ""),
    perClaim: String(pr.per_claim || ""),
    eligibilityLabel: pr.eligibility || "",
    coverageCategories: coverageCategories.length ? coverageCategories : emptyForm.coverageCategories,
    pricingRows: pricingRows.length ? pricingRows : emptyForm.pricingRows,
    benefits,
    termsSections: cd.termsSections || emptyForm.termsSections,
    exclusions: (cd.exclusions || []).join?.("\n") || emptyForm.exclusions,
    waitingPeriod: cd.waitingPeriod || emptyForm.waitingPeriod,
    coverageTerritory: cd.coverageTerritory || emptyForm.coverageTerritory,
    disputeResolution: cd.disputeResolution || emptyForm.disputeResolution,
    importantNotes: (pr.importantNotes || []).join?.("\n") || "",
  };
}

function formToDbFields(form: ProductForm) {
  return {
    coverage_details: {
      group: form.group || undefined,
      tier: form.tier || undefined,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      coverageCategories: form.coverageCategories.map(c => ({ name: c.name, parts: c.parts.filter(Boolean) })),
      termsSections: form.termsSections,
      exclusions: form.exclusions.split("\n").filter(Boolean),
      waitingPeriod: form.waitingPeriod,
      coverageTerritory: form.coverageTerritory,
      disputeResolution: form.disputeResolution,
    },
    pricing: {
      deductible: Number(form.deductible) || 0,
      per_claim: Number(form.perClaim) || undefined,
      eligibility: form.eligibilityLabel,
      tiers: form.pricingRows.map(r => ({
        term: r.term,
        mileage_bracket: r.mileageBracket,
        vehicle_class: r.vehicleClass,
        dealer_cost: r.dealerCost,
        suggested_retail: r.suggestedRetail,
      })),
      benefits: form.benefits.filter(b => b.included).map(b => ({ name: b.name, description: b.description })),
      importantNotes: form.importantNotes.split("\n").filter(Boolean),
    },
    eligibility_rules: {
      max_age: Number(form.maxAge) || undefined,
      max_mileage: Number(form.maxMileage) || undefined,
      vehicle_types: form.vehicleTypes,
      premium_makes: form.premiumMakes.split(",").map(s => s.trim()).filter(Boolean),
    },
  };
}

// ── CSV Helpers ──

function generateCSVTemplate(): string {
  const headers = ["name", "type", "group", "deductible", "per_claim", "eligibility", "term", "dealer_cost", "suggested_retail", "vehicle_class"];
  const example = ["Gold Powertrain $1500", "VSC", "Powertrain", "100", "1500", "Any Year, Make, Model or Mileage", "12mo/20000km", "189", "889", "Class 1"];
  return [headers.join(","), example.join(",")].join("\n");
}

function parseCSV(text: string): PricingRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const get = (key: string) => vals[headers.indexOf(key)] || "";
    return {
      term: get("term"),
      mileageBracket: get("mileage_bracket") || get("mileage"),
      vehicleClass: get("vehicle_class") || "Class 1",
      dealerCost: Number(get("dealer_cost")) || 0,
      suggestedRetail: Number(get("suggested_retail")) || 0,
    };
  });
}

// ── Component ──────────────────────────────────────

const ProviderProductEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isNew = !id || id === "new";
  const showAI = searchParams.get("ai") === "true";

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [activeTab, setActiveTab] = useState(showAI ? "ai-assist" : "basic");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [existingGroups, setExistingGroups] = useState<{ group: string; type: string }[]>([]);
  const [newGroupMode, setNewGroupMode] = useState(false);
  // Load provider membership + product data
  useEffect(() => {
    const load = async () => {
      let pid: string | null = null;
      if (user) {
        const { data: membership } = await supabase
          .from("provider_members")
          .select("provider_id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (membership) { pid = membership.provider_id; setProviderId(membership.provider_id); }
      }

      // Fetch existing plan groups for this provider
      if (pid) {
        const { data: prods } = await supabase
          .from("products")
          .select("coverage_details, type")
          .eq("provider_id", pid);
        if (prods) {
          const groups = new Map<string, string>();
          prods.forEach((p: any) => {
            const g = (p.coverage_details as any)?.group;
            if (g) groups.set(g, p.type);
          });
          setExistingGroups(Array.from(groups.entries()).map(([group, type]) => ({ group, type })));
        }
      }

      if (!isNew && id) {
        try {
          const product = await fetchProductById(id);
          if (product) {
            setForm(dbProductToForm(product));
            if (!pid) setProviderId(product.provider_id);
          }
        } catch (err) {
          console.error("Failed to load product:", err);
        }
      }
      setLoading(false);
    };
    load();
  }, [id, isNew, user]);

  const updateForm = (updates: Partial<ProductForm>) => setForm(prev => ({ ...prev, ...updates }));

  // Coverage helpers
  const addCoverageCategory = () => updateForm({ coverageCategories: [...form.coverageCategories, { name: "", parts: [""] }] });
  const removeCoverageCategory = (i: number) => updateForm({ coverageCategories: form.coverageCategories.filter((_, idx) => idx !== i) });
  const updateCategory = (i: number, u: Partial<CoverageCategory>) => {
    const cats = [...form.coverageCategories]; cats[i] = { ...cats[i], ...u }; updateForm({ coverageCategories: cats });
  };
  const addPartToCategory = (ci: number) => { const c = [...form.coverageCategories]; c[ci].parts.push(""); updateForm({ coverageCategories: c }); };
  const updatePart = (ci: number, pi: number, v: string) => { const c = [...form.coverageCategories]; c[ci].parts[pi] = v; updateForm({ coverageCategories: c }); };
  const removePart = (ci: number, pi: number) => { const c = [...form.coverageCategories]; c[ci].parts = c[ci].parts.filter((_, i) => i !== pi); updateForm({ coverageCategories: c }); };

  // Pricing helpers
  const addPricingRow = () => updateForm({ pricingRows: [...form.pricingRows, { term: "", mileageBracket: "", vehicleClass: "Class 1", dealerCost: 0, suggestedRetail: 0 }] });
  const removePricingRow = (i: number) => updateForm({ pricingRows: form.pricingRows.filter((_, idx) => idx !== i) });
  const updatePricingRow = (i: number, u: Partial<PricingRow>) => { const r = [...form.pricingRows]; r[i] = { ...r[i], ...u }; updateForm({ pricingRows: r }); };

  // Benefits
  const toggleBenefit = (i: number) => { const b = [...form.benefits]; b[i] = { ...b[i], included: !b[i].included }; updateForm({ benefits: b }); };

  // Terms
  const addTermsSection = () => updateForm({ termsSections: [...form.termsSections, { title: "", content: "" }] });
  const removeTermsSection = (i: number) => updateForm({ termsSections: form.termsSections.filter((_, idx) => idx !== i) });
  const updateTermsSection = (i: number, u: Partial<TermsSection>) => { const s = [...form.termsSections]; s[i] = { ...s[i], ...u }; updateForm({ termsSections: s }); };

  // AI extract
  const handleAIExtract = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-plan-data`,
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` }, body: JSON.stringify({ text: aiText }) }
      );
      if (!response.ok) { const err = await response.json().catch(() => ({})); throw new Error(err.error || "AI extraction failed"); }
      const data = await response.json();
      if (data.product) {
        const p = data.product;
        updateForm({
          name: p.name || form.name, type: p.type || form.type, description: p.description || form.description,
          group: p.group || form.group, maxAge: p.maxAge || form.maxAge, maxMileage: p.maxMileage || form.maxMileage,
          deductible: p.deductible || form.deductible, perClaim: p.perClaim || form.perClaim,
          coverageCategories: p.coverageCategories?.length ? p.coverageCategories : form.coverageCategories,
          pricingRows: p.pricingRows?.length ? p.pricingRows : form.pricingRows,
          benefits: p.benefits?.length ? p.benefits : form.benefits,
          termsSections: p.termsSections?.length ? p.termsSections : form.termsSections,
          exclusions: p.exclusions || form.exclusions, waitingPeriod: p.waitingPeriod || form.waitingPeriod,
          coverageTerritory: p.coverageTerritory || form.coverageTerritory, importantNotes: p.importantNotes || form.importantNotes,
        });
        toast({ title: "AI Extraction Complete", description: "Plan data populated. Review and adjust." });
        setActiveTab("basic");
      }
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    } finally { setAiLoading(false); }
  };

  // CSV upload
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length > 0) {
        // Also try to extract name/type from first row of full CSV
        const lines = text.trim().split("\n");
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        const firstVals = lines[1]?.split(",").map(v => v.trim()) || [];
        const nameIdx = headers.indexOf("name");
        const typeIdx = headers.indexOf("type");
        const groupIdx = headers.indexOf("group");
        const dedIdx = headers.indexOf("deductible");
        const pcIdx = headers.indexOf("per_claim");
        const eligIdx = headers.indexOf("eligibility");

        updateForm({
          pricingRows: rows,
          ...(nameIdx >= 0 && firstVals[nameIdx] ? { name: firstVals[nameIdx] } : {}),
          ...(typeIdx >= 0 && firstVals[typeIdx] ? { type: firstVals[typeIdx] } : {}),
          ...(groupIdx >= 0 && firstVals[groupIdx] ? { group: firstVals[groupIdx] } : {}),
          ...(dedIdx >= 0 && firstVals[dedIdx] ? { deductible: firstVals[dedIdx] } : {}),
          ...(pcIdx >= 0 && firstVals[pcIdx] ? { perClaim: firstVals[pcIdx] } : {}),
          ...(eligIdx >= 0 && firstVals[eligIdx] ? { eligibilityLabel: firstVals[eligIdx] } : {}),
        });
        toast({ title: "CSV Imported", description: `${rows.length} pricing rows loaded.` });
      } else {
        toast({ title: "CSV Error", description: "No data rows found.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "product-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Save to DB
  const handleSave = async () => {
    if (!form.name) { toast({ title: "Missing Name", description: "Please enter a product name.", variant: "destructive" }); return; }
    if (!providerId) { toast({ title: "No Provider", description: "Provider membership not found.", variant: "destructive" }); return; }

    setSaving(true);
    try {
      const dbFields = formToDbFields(form);
      const productId = await saveProduct({
        ...(isNew ? {} : { id }),
        name: form.name,
        type: form.type,
        description: form.description,
        provider_id: providerId,
        status: "active",
        coverage_details: dbFields.coverage_details,
        pricing: dbFields.pricing,
        eligibility_rules: dbFields.eligibility_rules,
      });
      toast({ title: isNew ? "Product Created" : "Product Saved", description: `${form.name} saved successfully.` });
      navigate("/provider/products");
    } catch (err: any) {
      console.error("Save error:", err);
      toast({ title: "Save Failed", description: err.message || "Could not save product.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const tabs = [
    { value: "ai-assist", label: "AI Assist", icon: Sparkles },
    { value: "csv-upload", label: "CSV Upload", icon: Upload },
    { value: "basic", label: "Basic Info", icon: FileText },
    { value: "eligibility", label: "Eligibility", icon: Shield },
    { value: "coverage", label: "Coverage", icon: Shield },
    { value: "pricing", label: "Pricing & Tiers", icon: DollarSign },
    { value: "benefits", label: "Benefits", icon: Award },
    { value: "terms", label: "Terms & Conditions", icon: Scale },
    { value: "preview", label: "Preview", icon: Eye },
  ];

  if (loading) {
    return (
      <DashboardLayout navItems={providerNavItems} title="Loading...">
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

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
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI-Powered Plan Import</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Paste your plan document or brochure text. AI will extract all details and auto-fill the form.</p>
                <Textarea value={aiText} onChange={(e) => setAiText(e.target.value)} placeholder="Paste your plan document text here..." className="min-h-[300px] font-mono text-sm" />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{aiText.length} characters</p>
                  <Button onClick={handleAIExtract} disabled={aiLoading || !aiText.trim()}>
                    <Sparkles className="w-4 h-4 mr-1" /> {aiLoading ? "Extracting..." : "Extract & Auto-Fill"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CSV Upload */}
          <TabsContent value="csv-upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Spreadsheet Import</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with your product pricing tiers. Download the template first, fill in your data, then upload.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                    <Download className="w-4 h-4 mr-1" /> Download Template
                  </Button>
                  <div className="relative">
                    <input type="file" accept=".csv" onChange={handleCSVUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Button variant="default">
                      <Upload className="w-4 h-4 mr-1" /> Upload CSV
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs font-semibold mb-2">CSV Template Columns:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["name", "type", "group", "deductible", "per_claim", "eligibility", "term", "dealer_cost", "suggested_retail", "vehicle_class"].map(col => (
                      <Badge key={col} variant="outline" className="text-[10px] font-mono">{col}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Each row = one pricing tier. Product info (name, type, group) is taken from the first data row.</p>
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
                    <Input value={form.name} onChange={(e) => updateForm({ name: e.target.value })} placeholder="e.g., Gold Powertrain $1500" />
                  </div>
                  <div>
                    <Label>Product Type *</Label>
                    <Select value={form.type} onValueChange={(v) => updateForm({ type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(TYPE_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Product Group / Family</Label>
                    <Input value={form.group} onChange={(e) => updateForm({ group: e.target.value })} placeholder="e.g., Powertrain" />
                  </div>
                  <div>
                    <Label>Eligibility Label</Label>
                    <Input value={form.eligibilityLabel} onChange={(e) => updateForm({ eligibilityLabel: e.target.value })} placeholder="e.g., Any Year, Make, Model or Mileage" />
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
                  <div><Label>Max Vehicle Age (years)</Label><Input type="number" value={form.maxAge} onChange={(e) => updateForm({ maxAge: e.target.value })} /></div>
                  <div><Label>Max Mileage (km)</Label><Input type="number" value={form.maxMileage} onChange={(e) => updateForm({ maxMileage: e.target.value })} /></div>
                </div>
                <div><Label>Eligible Vehicle Types</Label><Input value={form.vehicleTypes} onChange={(e) => updateForm({ vehicleTypes: e.target.value })} /><p className="text-xs text-muted-foreground mt-1">Comma-separated</p></div>
                <div><Label>Premium Makes (surcharge applies)</Label><Input value={form.premiumMakes} onChange={(e) => updateForm({ premiumMakes: e.target.value })} /><p className="text-xs text-muted-foreground mt-1">Comma-separated</p></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coverage */}
          <TabsContent value="coverage">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Coverage Details</CardTitle>
                  <Button size="sm" variant="outline" onClick={addCoverageCategory}><Plus className="w-3.5 h-3.5 mr-1" /> Add Category</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {form.coverageCategories.map((cat, catIdx) => (
                  <div key={catIdx} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input value={cat.name} onChange={(e) => updateCategory(catIdx, { name: e.target.value })} placeholder="Category name" className="font-semibold max-w-xs" />
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeCoverageCategory(catIdx)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                    <div className="space-y-2">
                      {cat.parts.map((part, partIdx) => (
                        <div key={partIdx} className="flex items-center gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30" />
                          <Input value={part} onChange={(e) => updatePart(catIdx, partIdx, e.target.value)} placeholder="Covered part..." className="flex-1" />
                          <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => removePart(catIdx, partIdx)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" onClick={() => addPartToCategory(catIdx)} className="text-xs"><Plus className="w-3 h-3 mr-1" /> Add Part</Button>
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
                  <Button size="sm" variant="outline" onClick={addPricingRow}><Plus className="w-3.5 h-3.5 mr-1" /> Add Tier</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div><Label>Deductible ($)</Label><Input type="number" value={form.deductible} onChange={(e) => updateForm({ deductible: e.target.value })} /></div>
                  <div><Label>Per-Claim Maximum ($)</Label><Input type="number" value={form.perClaim} onChange={(e) => updateForm({ perClaim: e.target.value })} placeholder="Leave blank for unlimited" /></div>
                  <div><Label>Eligibility Label</Label><Input value={form.eligibilityLabel} onChange={(e) => updateForm({ eligibilityLabel: e.target.value })} placeholder="e.g., Any Year..." /></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium">Term</th>
                        <th className="text-left p-3 font-medium">Mileage</th>
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
                            <td className="p-2"><Input value={row.term} onChange={(e) => updatePricingRow(i, { term: e.target.value })} className="h-9" /></td>
                            <td className="p-2"><Input value={row.mileageBracket} onChange={(e) => updatePricingRow(i, { mileageBracket: e.target.value })} className="h-9" /></td>
                            <td className="p-2"><Input value={row.vehicleClass} onChange={(e) => updatePricingRow(i, { vehicleClass: e.target.value })} className="h-9" /></td>
                            <td className="p-2"><Input type="number" value={row.dealerCost} onChange={(e) => updatePricingRow(i, { dealerCost: Number(e.target.value) })} className="h-9 text-right" /></td>
                            <td className="p-2"><Input type="number" value={row.suggestedRetail} onChange={(e) => updatePricingRow(i, { suggestedRetail: Number(e.target.value) })} className="h-9 text-right" /></td>
                            <td className="p-2 text-right"><Badge variant="secondary" className="text-xs">{margin}%</Badge></td>
                            <td className="p-2"><Button size="sm" variant="ghost" className="text-destructive" onClick={() => removePricingRow(i)}><Trash2 className="w-3 h-3" /></Button></td>
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
                    <div key={i} className={cn("flex items-center justify-between rounded-lg border p-4 transition-colors cursor-pointer", benefit.included ? "bg-primary/5 border-primary/20" : "bg-muted/30")} onClick={() => toggleBenefit(i)}>
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

          {/* Terms */}
          <TabsContent value="terms">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Terms & Conditions</CardTitle>
                    <Button size="sm" variant="outline" onClick={addTermsSection}><Plus className="w-3.5 h-3.5 mr-1" /> Add Section</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.termsSections.map((section, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Input value={section.title} onChange={(e) => updateTermsSection(i, { title: e.target.value })} placeholder="Section Title" className="font-semibold max-w-sm" />
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeTermsSection(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                      <Textarea value={section.content} onChange={(e) => updateTermsSection(i, { content: e.target.value })} placeholder="Section content..." className="min-h-[100px]" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Additional Terms</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>General Exclusions</Label><Textarea value={form.exclusions} onChange={(e) => updateForm({ exclusions: e.target.value })} className="min-h-[120px]" /><p className="text-xs text-muted-foreground mt-1">One per line</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Waiting Period</Label><Input value={form.waitingPeriod} onChange={(e) => updateForm({ waitingPeriod: e.target.value })} /></div>
                    <div><Label>Coverage Territory</Label><Input value={form.coverageTerritory} onChange={(e) => updateForm({ coverageTerritory: e.target.value })} /></div>
                  </div>
                  <div><Label>Dispute Resolution</Label><Textarea value={form.disputeResolution} onChange={(e) => updateForm({ disputeResolution: e.target.value })} className="min-h-[80px]" /></div>
                  <div><Label>Important Notes</Label><Textarea value={form.importantNotes} onChange={(e) => updateForm({ importantNotes: e.target.value })} placeholder="One per line..." className="min-h-[80px]" /></div>
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
                      <Badge variant="outline" className="mb-2">{TYPE_LABELS[form.type] || form.type}</Badge>
                      <CardTitle className="text-2xl">{form.name || "Untitled Product"}</CardTitle>
                      {form.group && <p className="text-sm text-muted-foreground mt-1">{form.group}</p>}
                    </div>
                    <Badge variant="secondary">Preview</Badge>
                  </div>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">{form.description || "No description."}</p></CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Eligibility</p><p className="text-sm">{form.eligibilityLabel || `Up to ${form.maxAge}yr / ${Number(form.maxMileage).toLocaleString()}km`}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Deductible</p><p className="text-sm">${form.deductible}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Per Claim</p><p className="text-sm">{form.perClaim ? `$${Number(form.perClaim).toLocaleString()}` : "Unlimited"}</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Pricing Tiers</p><p className="text-sm">{form.pricingRows.length} tiers</p></CardContent></Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Pricing ({form.pricingRows.length} tiers)</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b bg-muted/50"><th className="text-left p-2">Term</th><th className="text-left p-2">Class</th><th className="text-right p-2">Dealer Cost</th><th className="text-right p-2">Retail</th></tr></thead>
                      <tbody>
                        {form.pricingRows.map((row, i) => (
                          <tr key={i} className="border-b"><td className="p-2">{row.term}</td><td className="p-2">{row.vehicleClass}</td><td className="p-2 text-right">${row.dealerCost.toLocaleString()}</td><td className="p-2 text-right">${row.suggestedRetail.toLocaleString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Benefits</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">{form.benefits.filter(b => b.included).map((b, i) => <Badge key={i} variant="secondary">{b.name}</Badge>)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Coverage Categories</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {form.coverageCategories.map((cat, i) => (
                    <div key={i}><p className="font-semibold text-sm mb-1">{cat.name}</p><div className="flex flex-wrap gap-1">{cat.parts.filter(Boolean).map((p, j) => <Badge key={j} variant="outline" className="text-xs">{p}</Badge>)}</div></div>
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
