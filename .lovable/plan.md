

# Reorganize Configuration as Provider → Plans → Tiers Drilldown

## Problem

Today the page shows one long flat list of all 22 plans across every provider. Hard to scan, and provider context is lost. You want a hierarchical browse experience with quick back/forward navigation.

## Solution

Replace the single plans list with a **3-level breadcrumb-driven drilldown** in the left column. The right panel keeps the existing tier/mileage-band/matrix editor unchanged.

### Navigation levels

```text
Level 1 — Providers
   ┌──────────────────────────────────────────┐
   │ 🏢 A-Protect Warranty Corp.   13 plans › │
   │ 🛡 Infinite Auto Care          6 plans › │
   │ 🏢 [Other provider]            3 plans › │
   └──────────────────────────────────────────┘

Level 2 — Plans for selected provider
   ‹ All Providers / A-Protect Warranty Corp.
   ┌──────────────────────────────────────────┐
   │ Diamond Plus Warranty   VSC   4 tiers ›  │
   │ Essential Warranty      VSC   6 tiers ›  │
   │ Driver Program          VSC   2 tiers ›  │
   │ ...                                      │
   └──────────────────────────────────────────┘

Level 3 — Tiers + matrix for selected plan (already built)
   ‹ A-Protect / Diamond Plus Warranty
   [ $5,000 / claim ] [ $7,500 / claim ] ...
   [ Mileage band selector ]
   [ Pricing matrix with editable cells ]
```

### UX details

- **Breadcrumb bar** at the top of the left column: `‹ Providers / A-Protect / Diamond Plus`. Each crumb is clickable to jump back.
- **Search bar** is context-aware:
  - At Provider level → searches provider names.
  - At Plans level → searches plans within the active provider.
- **Provider cards** show: company name, total plan count, count by type (e.g. "10 VSC · 1 Tire & Rim").
- **Plan cards** keep the current style (name, type, tier count badge) but no longer need a provider badge (context is implied).
- **Back navigation**: a `‹ Back` chip + native browser-style click on the breadcrumb. Selecting a plan slides the right panel into the existing matrix view — no layout shift.
- **Quick provider switch**: a small dropdown next to the breadcrumb lets you jump between providers without going back to Level 1.
- The existing **All Providers** filter dropdown is removed (replaced by the drilldown itself).

### State

Add two view-mode states; no DB changes:
- `view: "providers" | "plans"` — controls the left column.
- `activeProviderId: string | null` — set when entering Level 2.
- Selecting a plan keeps `view = "plans"` so the user can quickly pick another sibling plan from the same provider.

### Files to change

- `src/pages/dealership/settings/Configuration.tsx` — replace the left column (currently one flat list, lines ~580–627) with the 3-level drilldown described above. Keep the right detail panel and matrix logic untouched.

### Verification

1. Open `/dealership/settings/configuration` → see provider cards (A-Protect, Infinite Auto Care, …) with plan counts.
2. Click **A-Protect** → list collapses to A-Protect plans only; breadcrumb shows `‹ Providers / A-Protect`.
3. Click **Diamond Plus Warranty** → right panel shows existing tiers/mileage bands/matrix.
4. Click **‹ A-Protect** in breadcrumb → returns to plan list (still A-Protect).
5. Click **‹ Providers** → returns to provider list.
6. Use the provider switch dropdown next to the breadcrumb to jump from A-Protect plans → Infinite Auto Care plans without going back to Level 1.

